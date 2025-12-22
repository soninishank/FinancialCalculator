const nseService = require('./NseService');
const bseService = require('./BseService');
const db = require('../config/db');
const sebiDateService = require('./SEBIDateService');

class EnrichmentService {
    constructor() {
        // Track active enrichment promises to prevent duplicate jobs (Request Coalescing)
        this.activeEnrichmentConfigs = new Map();
    }

    async enrichAll() {
        // Find IPOs that need enrichment (missing details or stale)
        const iposRes = await db.query(`
            SELECT i.ipo_id, i.symbol, i.series, i.nse_symbol, i.bse_scrip_code, d.issue_end
            FROM ipo i
            LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
            WHERE (i.updated_at < NOW() - INTERVAL '1 hour'
            OR i.face_value IS NULL
            OR i.book_running_lead_managers IS NULL
            OR d.listing_date IS NULL)
            ORDER BY 
              CASE 
                WHEN i.status = 'open' THEN 1
                WHEN i.status = 'upcoming' THEN 2
                ELSE 3
              END ASC,
              i.updated_at ASC
            LIMIT 20
        `);

        if (iposRes.rows.length === 0) return;

        for (const ipo of iposRes.rows) {
            try {
                // Check if already running via request coalescing
                if (this.activeEnrichmentConfigs.has(ipo.ipo_id)) {
                    await this.activeEnrichmentConfigs.get(ipo.ipo_id);
                    continue;
                }

                // We don't necessarily coalesce the entire batch process, but we reuse enrichSingle logic
                // However, enrichAll is serial with delays, so we can just call enrichSingle if we refactor,
                // or keep it separate. For safety, let's just keep the original logic but adding a check.

                const client = await db.pool.connect();
                try {
                    // ... (Original logic for batch)
                    // 1. NSE Enrichment
                    const nseSymbol = ipo.nse_symbol || ipo.symbol;
                    if (nseSymbol && !nseSymbol.startsWith('TBA-')) {
                        await nseService.fetchAndStoreIpoDetails(nseSymbol, ipo.series || 'EQ', ipo.ipo_id, client);
                    }
                    if (ipo.bse_scrip_code) {
                        await bseService.updateDetails(ipo.ipo_id, client);
                    }
                    if (ipo.issue_end) {
                        await sebiDateService.applyFallbackIfMissing(client, ipo.ipo_id, ipo.issue_end);
                    }
                } finally {
                    client.release();
                }

                await new Promise(r => setTimeout(r, 3000));
            } catch (err) {
                console.error(`[Enrichment] Failed for IPO ID ${ipo.ipo_id}:`, err.message);
            }
        }
        console.log(`✓ Enrichment: Batch of ${iposRes.rows.length} processed.`);
    }

    async enrichSingle(ipoId) {
        // Check if enrichment is already running for this IPO
        if (this.activeEnrichmentConfigs.has(ipoId)) {
            console.log(`[Enrichment] Job already active for IPO ${ipoId}, joining existing promise.`);
            return this.activeEnrichmentConfigs.get(ipoId);
        }

        const enrichmentPromise = (async () => {
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
                const dateRes = await client.query('SELECT issue_end FROM ipo_dates WHERE ipo_id = $1', [ipoId]);
                if (dateRes.rows.length > 0 && dateRes.rows[0].issue_end) {
                    await sebiDateService.applyFallbackIfMissing(client, ipo.ipo_id, dateRes.rows[0].issue_end);
                }
            } finally {
                client.release();
            }
        })();

        // Store and handle cleanup
        this.activeEnrichmentConfigs.set(ipoId, enrichmentPromise);
        try {
            await enrichmentPromise;
        } finally {
            this.activeEnrichmentConfigs.delete(ipoId);
        }
    }
}

module.exports = new EnrichmentService();
