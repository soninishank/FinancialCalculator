// subscriptionProcessor.js
'use strict';

/**
 * subscriptionProcessor
 * - processPayload(payload, options)
 *
 * options:
 *  - dbClient: optional DB client with query(text, params) async function
 *  - ipoId: optional id to persist
 *  - symbol: optional symbol for logs
 *  - dryRun: boolean (default true) -> if true, don't execute DB writes; return SQL statements instead
 *  - allowedCats: array of allowed canonical categories to persist (default ['QIB','NII','RII'])
 *  - reconciliationTolerance: absolute tolerance in shares (default 1000) or fractional (if <1, treated as percent)
 *
 * Returns:
 *  {
 *    sourceUsed: 'demandGraphALL'|'activeCat'|'bidDetails',
 *    rows: [{ category, srNo, shares_offered, shares_bid, subscription_ratio }],
 *    computedTotals: { offered, bids, ratio },
 *    providerTotals: { offered, bids, ratio } | null,
 *    reconciliation: { ok: boolean, diff: number },
 *    sql: [ { text, params } ] (only in dryRun)
 *  }
 */

function safeStr(v) {
    if (v === null || v === undefined) return '';
    return String(v);
}

function parseNumberAny(raw) {
    if (raw === null || raw === undefined) return NaN;
    const s = String(raw).trim();
    if (s === '') return NaN;
    // remove commas
    const cleaned = s.replace(/,/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
}

function detectCategoryFromText(raw) {
    const txt = safeStr(raw).toLowerCase();
    if (!txt) return null;
    if (txt.includes('qualified institutional') || txt.includes('qib')) return 'QIB';
    if (txt.includes('non institutional') || txt.includes('non-institutional') || txt.includes('nii')) return 'NII';
    if (txt.includes('retail') || txt.includes('rii') || txt.includes('retail individual')) return 'RII';
    if (txt.includes('employee')) return 'Employees';
    if (txt.includes('total') && txt.trim().length < 20) return 'Total';
    if (txt.includes('shareholder')) return 'Shareholders';
    return null;
}

function isHeaderRow(item) {
    // crude detection for header rows like "Sr.No." / "Category"
    const sr = safeStr(item.srNo ?? item.sr_no ?? item.sr ?? '');
    const cat = safeStr(item.category ?? item.categoryName ?? '');
    if (sr.toLowerCase().includes('sr.no') || cat.toLowerCase().includes('category')) return true;
    return false;
}

function canonicalFromSrNo(srNo) {
    const s = safeStr(srNo).trim();
    if (!s) return null;
    if (s.startsWith('1')) return 'QIB';
    if (s.startsWith('2')) return 'NII';
    if (s.startsWith('3')) return 'RII';
    return null;
}

function ensureInteger(n) {
    // round to nearest integer safely
    if (!Number.isFinite(n)) return 0;
    return Math.round(n);
}

async function processPayload(payload, options = {}) {
    const {
        dbClient = null,
        ipoId = null,
        symbol = null,
        dryRun = true,
        allowedCats = ['QIB', 'NII', 'RII'],
        reconciliationTolerance = 0.001, // default 0.1% fractional tolerance
        faceValue = null // face value of the shares
    } = options;

    // Helpers
    const records = [];
    let sourceUsed = null;
    let providerTotals = null; // { offered, bids, ratio } from demandGraphALL or activeCat.Total

    // 1) Prefer demandGraphALL for overall provider totals (ALL exchanges)
    if (payload && payload.demandGraphALL && Object.keys(payload.demandGraphALL).length > 0) {
        const dg = payload.demandGraphALL;
        const offeredP = parseNumberAny(dg.totalIssueSize ?? dg.totalIssueSize ?? payload.totalIssueSize ?? '');
        const bidsP = parseNumberAny(dg.TOTAL_BIDS ?? dg.totalBidRecieved ?? dg.totalBidRecieved ?? dg.totalBidRecieved ?? dg.totalBidAtCutOff ?? '');
        const ratioP = parseNumberAny(dg.noOfTimesIssueSubscribed ?? dg.noOfTimesIssueSubscribed ?? '');
        if (Number.isFinite(offeredP) || Number.isFinite(bidsP)) {
            providerTotals = {
                offered: Number.isFinite(offeredP) ? offeredP : null,
                bids: Number.isFinite(bidsP) ? bidsP : null,
                ratio: Number.isFinite(ratioP) ? ratioP : null
            };
        }
    }

    // 2) For category breakdown prefer activeCat.dataList
    if (payload && payload.activeCat && Array.isArray(payload.activeCat.dataList) && payload.activeCat.dataList.length > 1) {
        sourceUsed = 'activeCat';
        const arr = payload.activeCat.dataList;
        // skip first header-like row(s); iterate rows and pick srNo 1/2/3
        for (const item of arr) {
            if (isHeaderRow(item)) continue;
            const srNo = safeStr(item.srNo ?? item.sr_no ?? '');

            // CRITICAL: Skip child rows (they have dots or parentheses)
            // Examples: "1(a)", "2.1", "2.1(a)", "3(b)"
            const isChild = srNo.includes('.') || srNo.includes('(');
            if (isChild) continue;

            const catFromText = detectCategoryFromText(item.category ?? item.categoryName ?? '');
            const canonical = catFromText ?? canonicalFromSrNo(srNo);
            if (!canonical || !allowedCats.includes(canonical)) continue;
            // fields in activeCat are `noOfShareOffered` and `noOfSharesBid` and `noOfTotalMeant`
            const offered = parseNumberAny(item.noOfShareOffered ?? item.noOfSharesOffered ?? item.noOfShareOffered ?? '');
            const bid = parseNumberAny(item.noOfSharesBid ?? item.noOfShareBid ?? item.noOfSharesBid ?? '');
            const ratio = parseNumberAny(item.noOfTotalMeant ?? item.noOfTime ?? item.noOfTotalMeant ?? '');
            records.push({
                category: canonical,
                srNo: srNo,
                shares_offered: ensureInteger(offered),
                shares_bid: ensureInteger(bid),
                subscription_ratio: Number.isFinite(ratio) ? ratio : (offered > 0 ? (bid / offered) : 0)
            });
        }
    }

    // 3) Fallback to bidDetails if we didn't populate categories
    if ((!records || records.length === 0) && payload && Array.isArray(payload.bidDetails) && payload.bidDetails.length > 0) {
        sourceUsed = 'bidDetails';
        // bucket map for parent/children
        const bucketMap = new Map();
        allowedCats.forEach(k => bucketMap.set(k, { parent: null, children: [] }));

        for (const item of payload.bidDetails) {
            // skip header-like rows
            if (isHeaderRow(item)) continue;

            const rawCat = item.category ?? '';
            let canonical = detectCategoryFromText(rawCat);
            const srRaw = safeStr(item.srNo ?? item.sr_no ?? '');
            if (!canonical) canonical = canonicalFromSrNo(srRaw);

            if (!canonical || !allowedCats.includes(canonical)) continue;

            // prefer parent row values when present
            const offeredRaw = item.noOfSharesOffered ?? item.noOfShareOffered ?? item.noOfSharesReserved ?? '';
            const bidRaw = item.noOfsharesBid ?? item.noOfSharesBid ?? item.noOfSharesApplied ?? '';
            let offered = parseNumberAny(offeredRaw);
            let bid = parseNumberAny(bidRaw);
            offered = Number.isFinite(offered) ? offered : 0;
            bid = Number.isFinite(bid) ? bid : 0;

            const entry = { offered, bid, rawCat, srNo: srRaw };

            // Detect child rows: they have either dots (2.1, 2.2) or parentheses (1(a), 3(b))
            // Examples: "1(a)", "1(b)", "2.1", "2.1(a)", "3(a)", "3(b)"
            const isChild = srRaw.includes('.') || srRaw.includes('(');
            const bucket = bucketMap.get(canonical);

            if (isChild) bucket.children.push(entry);
            else {
                if (!bucket.parent) bucket.parent = entry;
                else {
                    // sum if multiple parent rows appear
                    bucket.parent.offered += offered;
                    bucket.parent.bid += bid;
                }
            }
        }

        // finalize records from buckets (parent-preferred)
        for (const [cat, bucket] of bucketMap.entries()) {
            let finalOffered = 0;
            let finalBid = 0;
            let finalSr = '';

            if (bucket.parent && bucket.parent.offered > 0) {
                finalOffered = bucket.parent.offered;
                finalBid = bucket.parent.bid;
                finalSr = bucket.parent.srNo;
            } else if (bucket.children.length > 0) {
                for (const ch of bucket.children) {
                    finalOffered += ch.offered;
                    finalBid += ch.bid;
                    if (!finalSr && ch.srNo) finalSr = ch.srNo.split('.')[0];
                }
            } else if (bucket.parent) {
                // parent exists but offered==0 and maybe bid>0; optionally persist
                finalOffered = bucket.parent.offered;
                finalBid = bucket.parent.bid;
                finalSr = bucket.parent.srNo;
            }

            if (finalOffered === 0) {
                // skip category with zero offered (policy choice)
                continue;
            }
            records.push({
                category: cat,
                srNo: finalSr,
                shares_offered: ensureInteger(finalOffered),
                shares_bid: ensureInteger(finalBid),
                subscription_ratio: finalOffered > 0 ? (finalBid / finalOffered) : 0
            });
        }
    }

    // If still empty, nothing to do
    if (!records || records.length === 0) {
        return {
            sourceUsed,
            rows: [],
            computedTotals: { offered: 0, bids: 0, ratio: 0 },
            providerTotals,
            reconciliation: { ok: true, diff: 0 },
            sql: []
        };
    }

    // consolidate: ensure canonical order QIB,NII,RII
    const order = { QIB: 1, NII: 2, RII: 3 };
    records.sort((a, b) => (order[a.category] ?? 99) - (order[b.category] ?? 99));

    // compute totals from records (only include allowedCats)
    let computed_offered = 0;
    let computed_bids = 0;
    for (const r of records) {
        computed_offered += Number.isFinite(r.shares_offered) ? r.shares_offered : 0;
        computed_bids += Number.isFinite(r.shares_bid) ? r.shares_bid : 0;
    }
    const computed_ratio = computed_offered > 0 ? (computed_bids / computed_offered) : 0;

    // if providerTotals does not exist yet, try extract from activeCat Total row
    if (!providerTotals && payload && payload.activeCat && Array.isArray(payload.activeCat.dataList)) {
        const totalRow = payload.activeCat.dataList.find(it => safeStr(it.category).toLowerCase().trim() === 'total');
        if (totalRow) {
            const offeredP = parseNumberAny(totalRow.noOfShareOffered ?? totalRow.noOfSharesOffered ?? '');
            const bidsP = parseNumberAny(totalRow.noOfSharesBid ?? totalRow.noOfShareBid ?? '');
            const ratioP = parseNumberAny(totalRow.noOfTotalMeant ?? '');
            if (Number.isFinite(offeredP) || Number.isFinite(bidsP)) {
                providerTotals = {
                    offered: Number.isFinite(offeredP) ? offeredP : null,
                    bids: Number.isFinite(bidsP) ? bidsP : null,
                    ratio: Number.isFinite(ratioP) ? ratioP : null
                };
            }
        }
    }

    // Reconciliation: compare computed_bids with providerTotals.bids if available
    let reconciliation = { ok: true, diff: 0, reason: null };
    if (providerTotals && Number.isFinite(providerTotals.bids)) {
        const prov = providerTotals.bids;
        const diff = Math.abs(prov - computed_bids);
        reconciliation.diff = diff;
        if (reconciliationTolerance < 1) {
            // fractional tolerance (percent)
            const frac = reconciliationTolerance;
            if (diff > (frac * Math.max(1, prov))) {
                reconciliation.ok = false;
                reconciliation.reason = `Computed bids ${computed_bids} differs from provider ${prov} by >${(frac * 100).toFixed(3)}%`;
            }
        } else {
            // absolute tolerance
            if (diff > reconciliationTolerance) {
                reconciliation.ok = false;
                reconciliation.reason = `Computed bids ${computed_bids} differs from provider ${prov} by more than ${reconciliationTolerance}`;
            }
        }
    }

    // Build SQL statements (parameterized) or execute them
    const sqlStatements = [];
    if (dryRun || !dbClient) {
        // produce SQLs for review
        // We will delete prior rows for ipoId if provided, then insert category rows and a computed total row
        if (ipoId) {
            sqlStatements.push({
                text: 'DELETE FROM ipo_bidding_details WHERE ipo_id = $1',
                params: [ipoId]
            });
        }
        for (const r of records) {
            const text = `INSERT INTO ipo_bidding_details (ipo_id, category, sr_no, shares_offered, shares_bid, subscription_ratio, face_value, source, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`;
            const params = [ipoId, r.category, r.srNo || null, r.shares_offered, r.shares_bid, r.subscription_ratio, faceValue, sourceUsed];
            sqlStatements.push({ text, params });
        }
        // Insert computed total (recommended) as a record with category = 'Total' (optional)
        if (ipoId) {
            const textTotal = `INSERT INTO ipo_bidding_details (ipo_id, category, sr_no, shares_offered, shares_bid, subscription_ratio, face_value, source, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`;
            const paramsTotal = [ipoId, 'Total', null, ensureInteger(computed_offered), ensureInteger(computed_bids), computed_ratio, faceValue, sourceUsed];
            sqlStatements.push({ text: textTotal, params: paramsTotal });
        }
    } else {
        // execute DB writes in transaction
        try {
            await dbClient.query('BEGIN');
            if (ipoId) {
                await dbClient.query('DELETE FROM ipo_bidding_details WHERE ipo_id = $1', [ipoId]);
            }
            for (const r of records) {
                await dbClient.query(
                    `INSERT INTO ipo_bidding_details (ipo_id, category, sr_no, shares_offered, shares_bid, subscription_ratio, face_value, source, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
                    [ipoId, r.category, r.srNo || null, r.shares_offered, r.shares_bid, r.subscription_ratio, faceValue, sourceUsed]
                );
            }
            // insert computed total
            if (ipoId) {
                await dbClient.query(
                    `INSERT INTO ipo_bidding_details (ipo_id, category, sr_no, shares_offered, shares_bid, subscription_ratio, face_value, source, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
                    [ipoId, 'Total', null, ensureInteger(computed_offered), ensureInteger(computed_bids), computed_ratio, faceValue, sourceUsed]
                );
            }
            await dbClient.query('COMMIT');
        } catch (err) {
            try { await dbClient.query('ROLLBACK'); } catch (e) { /* ignore rollback error */ }
            throw err;
        }
    }

    const result = {
        sourceUsed,
        rows: records,
        computedTotals: { offered: ensureInteger(computed_offered), bids: ensureInteger(computed_bids), ratio: computed_ratio },
        providerTotals,
        reconciliation,
        sql: sqlStatements
    };

    return result;
}

module.exports = {
    processPayload
};
