const db = require('../config/db');
const NodeCache = require("node-cache");
const discoveryService = require('../services/DiscoveryService');
const reconciliationService = require('../services/ReconciliationService');
const enrichmentService = require('../services/EnrichmentService');

const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// Helper to get IPO data (refactored from scraper.js)
async function fetchIpoDataFromDb() {
    try {
        // Fetch all IPOs with dates and sort by status-specific criteria
        const query = `
      SELECT 
        i.ipo_id, i.company_name, i.symbol, i.status, i.issue_type, 
        i.price_range_low, i.price_range_high, i.issue_size, i.series, i.min_investment,
        d.issue_start, d.issue_end, d.listing_date
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
      ORDER BY 
        i.status,
        CASE 
          WHEN i.status = 'open' THEN d.issue_end
          WHEN i.status = 'upcoming' THEN d.issue_start
        END ASC NULLS LAST,
        CASE 
          WHEN i.status IN ('closed', 'listed', 'withdrawn') THEN d.listing_date
        END DESC NULLS LAST
    `;
        const res = await db.query(query);
        const rows = res.rows;

        const upcoming = [];
        const open = [];
        const closed = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        rows.forEach(row => {
            // Map to frontend structure
            const low = row.price_range_low;
            const high = row.price_range_high;
            let priceRange = "";
            if (low && high) priceRange = `Rs.${low} to Rs.${high}`;
            else if (low) priceRange = `Rs.${low}`;

            // Dynamic Status Logic
            let status = row.status;
            const issueStart = row.issue_start ? new Date(row.issue_start) : null;
            const issueEnd = row.issue_end ? new Date(row.issue_end) : null;

            if (issueEnd) {
                const issueEndOnly = new Date(issueEnd);
                issueEndOnly.setHours(0, 0, 0, 0);
                if (today > issueEndOnly) status = 'closed';
                else if (issueStart) {
                    const issueStartOnly = new Date(issueStart);
                    issueStartOnly.setHours(0, 0, 0, 0);
                    if (today < issueStartOnly) status = 'upcoming';
                    else status = 'open';
                }
            }

            const ipoObj = {
                id: row.ipo_id.toString(),
                name: row.company_name,
                symbol: row.symbol,
                series: row.series,
                type: row.issue_type === 'Book Building' ? 'Equity' : (row.issue_type || 'Equity'),
                issueStart: row.issue_start ? new Date(row.issue_start).toDateString() : 'TBA',
                issueEnd: row.issue_end ? new Date(row.issue_end).toDateString() : 'TBA',
                listingDate: row.listing_date ? new Date(row.listing_date).toDateString() : '',
                priceRange: priceRange,
                issueSize: row.issue_size ? (row.issue_size / 100).toString() : '-',
                minInvestment: row.min_investment ? row.min_investment.toString() : '-'
            };

            // Categorize based on DYNAMIC status
            if (status === 'upcoming') upcoming.push({ ...ipoObj, _date: issueStart });
            else if (status === 'open') open.push({ ...ipoObj, _date: issueEnd });
            else closed.push({ ...ipoObj, _date: issueEnd || issueStart }); // fallback to start if no end
        });

        // --- SORTING LOGIC ---
        // 1. Upcoming: Opening soonest at top (Asc)
        upcoming.sort((a, b) => (a._date || Infinity) - (b._date || Infinity));

        // 2. Open: Closing soonest at top (Asc)
        open.sort((a, b) => (a._date || Infinity) - (b._date || Infinity));

        // 3. Closed: Most recently closed at top (Desc)
        closed.sort((a, b) => (b._date || 0) - (a._date || 0));

        // Cleanup temporary date fields
        const cleanup = (arr) => arr.map(({ _date, ...rest }) => rest);

        return {
            upcoming: cleanup(upcoming),
            open: cleanup(open),
            closed: cleanup(closed)
        };

    } catch (err) {
        console.error("DB Query Error:", err);
        return { upcoming: [], open: [], closed: [] };
    }
}

const getAllIpos = async (req, res) => {
    const cached = cache.get("ipos_db");
    if (cached) return res.json({ ok: true, data: cached });

    let data = await fetchIpoDataFromDb();

    // Auto-fetch if empty (Safety mechanism for fresh/empty DB)
    const totalCount = data.upcoming.length + data.open.length + data.closed.length;
    if (totalCount === 0) {
        console.log('Database appears empty. Triggering auto-discovery...');
        try {
            await discoveryService.runDiscovery();
            await reconciliationService.runReconciliation();
            // Refetch after sync
            data = await fetchIpoDataFromDb();
        } catch (err) {
            console.error('Auto-discovery failed:', err);
            // Return empty data if sync fails, don't crash the request
        }
    }

    cache.set("ipos_db", data);
    res.json({ ok: true, data });
};

const getIpoDetails = async (req, res) => {
    const symbol = req.params.symbol;
    const series = req.query.series || 'EQ';

    try {
        // 1. Get Basic Info
        const ipoRes = await db.query(`
      SELECT 
        i.*, 
        d.issue_start, d.issue_end, d.listing_date, d.market_open_time, d.market_close_time,
        d.allotment_finalization_date, d.refund_initiation_date, d.demat_credit_date,
        r.name as registrar_name, r.email as registrar_email, r.website as registrar_website, r.phone as registrar_phone
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
      LEFT JOIN registrar r ON i.primary_registrar_id = r.registrar_id
      WHERE i.symbol = $1
    `, [symbol]);

        if (ipoRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'IPO not found' });
        }

        let ipo = ipoRes.rows[0];

        // Check availability and staleness
        const now = new Date();
        const updatedAt = new Date(ipo.updated_at || 0);
        const ageMinutes = (now - updatedAt) / (1000 * 60);
        const isMissingData = !ipo.book_running_lead_managers || !ipo.face_value || !ipo.issue_size || ipo.issue_size == 0;
        const isStale = ageMinutes >= 60;

        // Trigger background enrichment if needed (non-blocking)
        if (isMissingData || isStale) {
            enrichmentService.enrichSingle(ipo.ipo_id)
                .catch(e => console.error(`[Async] Error updating ${symbol}:`, e));
        }

        // 2. Documents
        const docRes = await db.query('SELECT title, url, doc_type FROM documents WHERE ipo_id = $1', [ipo.ipo_id]);
        const documents = docRes.rows;

        // 3. Subscription
        const subRes = await db.query('SELECT category, shares_offered, shares_bid, subscription_ratio FROM ipo_bidding_details WHERE ipo_id = $1', [ipo.ipo_id]);
        const subscription = subRes.rows;

        // 4. GMP
        const gmpRes = await db.query('SELECT gmp_value, snapshot_time FROM gmp WHERE ipo_id=$1 ORDER BY snapshot_time DESC LIMIT 1', [ipo.ipo_id]);
        const gmp = gmpRes.rows.length > 0 ? gmpRes.rows[0] : null;

        // 5. Bidding Data
        const biddingRes = await db.query('SELECT price_label, price_value, cumulative_quantity FROM bidding_data WHERE ipo_id=$1 ORDER BY price_value ASC NULLS LAST', [ipo.ipo_id]);

        // Convert paise to rupees for NLP-extracted fields
        // (fresh_issue_amount, ofs_amount, and issue_size are stored in paise)
        if (ipo.fresh_issue_amount) {
            ipo.fresh_issue_size = ipo.fresh_issue_amount / 100;
        }
        if (ipo.ofs_amount) {
            ipo.offer_for_sale_size = ipo.ofs_amount / 100;
        }
        // Convert main issue_size from paise to rupees (NLP extractor stores in paise)
        if (ipo.issue_size && ipo.issue_size_extraction_model) {
            // Only convert if it was extracted by NLP (has extraction_model)
            ipo.issue_size = ipo.issue_size / 100;
        }

        res.json({
            ok: true,
            data: {
                ...ipo,
                documents,
                subscription,
                gmp,
                biddingData: biddingRes.rows
            }
        });

    } catch (err) {
        console.error(`Error details for ${symbol}:`, err);
        res.status(500).json({ ok: false, error: err.message });
    }
};

const refreshIpoData = async (req, res) => {
    try {
        console.log('Manual refresh triggered');

        // Run discovery and reconciliation sync
        await discoveryService.runDiscovery();
        await reconciliationService.runReconciliation();

        // Trigger enrichment batch in background
        enrichmentService.enrichAll().catch(e => console.error("Background enrichment error:", e));

        cache.del("ipos_db");
        res.json({ ok: true, message: "Sync and Reconciliation completed. Enrichment triggered in background." });

    } catch (error) {
        console.error("Refresh Logic Error:", error);
        res.status(500).json({ ok: true, error: error.message });
    }
};

module.exports = {
    getAllIpos,
    getIpoDetails,
    refreshIpoData
};
