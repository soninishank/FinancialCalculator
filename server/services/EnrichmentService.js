const nseService = require('./NseService');
const bseService = require('./BseService');
const db = require('../config/db');
const sebiDateService = require('./SEBIDateService');

class EnrichmentService {
    async enrichAll() {
        // Find IPOs that need enrichment (missing details or stale)
        const iposRes = await db.query(`
            SELECT i.ipo_id, i.symbol, i.series, i.nse_symbol, i.bse_scrip_code, d.issue_end
            FROM ipo i
            LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
            WHERE i.updated_at < NOW() - INTERVAL '1 hour'
            OR i.face_value IS NULL
            OR i.book_running_lead_managers IS NULL
            OR d.listing_date IS NULL
            ORDER BY i.updated_at ASC
            LIMIT 20
        `);

        if (iposRes.rows.length === 0) return;

        for (const ipo of iposRes.rows) {
            try {
                const client = await db.pool.connect();
                try {
                    // 1. NSE Enrichment
                    const nseSymbol = ipo.nse_symbol || ipo.symbol;
                    // Skip if it looks like a temporary symbol
                    if (nseSymbol && !nseSymbol.startsWith('TBA-')) {
                        await nseService.fetchAndStoreIpoDetails(nseSymbol, ipo.series || 'EQ', ipo.ipo_id, client);
                    }

                    // 2. BSE Enrichment
                    if (ipo.bse_scrip_code) {
                        await bseService.updateDetails(ipo.ipo_id, client);
                    }
                    // 3. SEBI Fallback (if dates still missing after scraping)
                    if (ipo.issue_end) {
                        await sebiDateService.applyFallbackIfMissing(client, ipo.ipo_id, ipo.issue_end);
                    }
                } finally {
                    client.release();
                }

                // Add delay to avoid rate limiting
                await new Promise(r => setTimeout(r, 3000));
            } catch (err) {
                console.error(`[Enrichment] Failed for IPO ID ${ipo.ipo_id}:`, err.message);
            }
        }

        console.log(`✓ Enrichment: Batch of ${iposRes.rows.length} processed.`);
    }

    async enrichSingle(ipoId) {
        const ipoRes = await db.query('SELECT * FROM ipo WHERE ipo_id = $1', [ipoId]);
        if (ipoRes.rows.length === 0) return;
        const ipo = ipoRes.rows[0];

        const client = await db.pool.connect();
        try {
            const nseSymbol = ipo.nse_symbol || ipo.symbol;
            if (nseSymbol && !nseSymbol.startsWith('TBA-')) {
                await nseService.fetchAndStoreIpoDetails(nseSymbol, ipo.series || 'EQ', ipo.ipo_id, client);
            }
            if (ipo.bse_scrip_code) {
                await bseService.updateDetails(ipo.ipo_id, client);
            }

            // 3. SEBI Fallback
            const dateRes = await client.query('SELECT issue_end FROM ipo_dates WHERE ipo_id = $1', [ipoId]);
            if (dateRes.rows.length > 0 && dateRes.rows[0].issue_end) {
                await sebiDateService.applyFallbackIfMissing(client, ipo.ipo_id, dateRes.rows[0].issue_end);
            }
        } finally {
            client.release();
        }
    }
}

module.exports = new EnrichmentService();
