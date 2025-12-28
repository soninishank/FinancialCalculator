const db = require('../config/db');

class SubscriptionService {
    /**
     * Process exchange payload and update subscription details
     * @param {number} ipoId - IPO ID
     * @param {Object} payload - Exchange payload (activeCat, bidDetails, etc.)
     */
    async processExchangeBids(ipoId, payload) {
        const bidirectionalBids = this.extractBids(payload);
        if (Object.keys(bidirectionalBids).length === 0) return;

        await this.updateSubscription(ipoId, bidirectionalBids);
    }

    /**
     * Extract bid counts from exchange payload
     */
    extractBids(payload) {
        const bids = {}; // IND, NII, QIB

        // 1. Try activeCat
        if (payload.activeCat && Array.isArray(payload.activeCat.dataList)) {
            for (const item of payload.activeCat.dataList) {
                const cat = this.detectCategory(item.srNo, item.category || item.categoryName);
                if (cat) {
                    const bidCount = parseInt(String(item.noOfSharesBid || item.noOfShareBid || '0').replace(/,/g, ''));
                    if (!isNaN(bidCount)) {
                        bids[cat] = (bids[cat] || 0) + bidCount;
                    }
                }
            }
        }

        // 2. Try bidDetails if activeCat failed or to supplement
        if (payload.bidDetails && Array.isArray(payload.bidDetails)) {
            for (const item of payload.bidDetails) {
                const cat = this.detectCategory(item.srNo, item.category);
                if (cat && !bids[cat]) { // Only if not already found in activeCat
                    const bidCount = parseInt(String(item.noOfsharesBid || item.noOfSharesBid || item.noOfSharesApplied || '0').replace(/,/g, ''));
                    if (!isNaN(bidCount)) {
                        bids[cat] = (bids[cat] || 0) + bidCount;
                    }
                }
            }
        }

        return bids;
    }

    detectCategory(srNo, name) {
        const txt = String(name || '').toLowerCase();
        const sr = String(srNo || '').trim();

        // Avoid sub-categories (1.1, 2(a), etc.)
        if (sr.includes('.') || sr.includes('(')) return null;

        if (txt.includes('retail') || txt.includes('individual') || sr === '3') return 'IND';
        if (txt.includes('non-institutional') || txt.includes('non institutional') || txt.includes('nii') || sr === '2') return 'NII';
        if (txt.includes('qualified institutional') || txt.includes('qib') || sr === '1') return 'QIB';

        return null;
    }

    /**
     * Update subscription details using RHP metadata and extracted bids
     */
    async updateSubscription(ipoId, bidirectionalBids) {
        const client = await db.pool.connect();
        try {
            // Fetch RHP metadata
            const ipoRes = await client.query(`
                SELECT net_issue_shares, retail_reservation_pct, nii_reservation_pct, qib_reservation_pct
                FROM ipo
                WHERE ipo_id = $1
            `, [ipoId]);

            if (ipoRes.rows.length === 0) return;
            const ipo = ipoRes.rows[0];

            if (!ipo.net_issue_shares) {
                console.warn(`[SubscriptionService] No net_issue_shares for IPO ${ipoId}. Calculation will be inaccurate.`);
                // Fallback to basic ratios if possible? No, user wants RHP-based.
                return;
            }

            const categories = [
                { name: 'IND', dbName: 'Retail', pct: ipo.retail_reservation_pct },
                { name: 'NII', dbName: 'NII', pct: ipo.nii_reservation_pct },
                { name: 'QIB', dbName: 'QIB', pct: ipo.qib_reservation_pct }
            ];

            await client.query('BEGIN');
            await client.query('DELETE FROM ipo_bidding_details WHERE ipo_id = $1', [ipoId]);

            let totalOffered = 0;
            let totalBid = 0;

            for (const cat of categories) {
                const bids = bidirectionalBids[cat.name] || 0;
                // Use percentages from RHP
                const pct = cat.pct || 0;
                const offered = Math.floor((pct / 100) * ipo.net_issue_shares);
                const ratio = offered > 0 ? (bids / offered) : 0;

                if (offered > 0 || bids > 0) {
                    await client.query(`
                        INSERT INTO ipo_bidding_details (ipo_id, category, shares_offered, shares_bid, subscription_ratio)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [ipoId, cat.dbName, offered, bids, ratio]);

                    totalOffered += offered;
                    totalBid += bids;
                }
            }

            // Total Row
            if (totalOffered > 0) {
                const totalRatio = totalBid / totalOffered;
                await client.query(`
                    INSERT INTO ipo_bidding_details (ipo_id, category, shares_offered, shares_bid, subscription_ratio)
                    VALUES ($1, $2, $3, $4, $5)
                `, [ipoId, 'Total', totalOffered, totalBid, totalRatio]);
            }

            await client.query('COMMIT');

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[SubscriptionService] Error:`, error.message);
        } finally {
            client.release();
        }
    }
}

module.exports = new SubscriptionService();
