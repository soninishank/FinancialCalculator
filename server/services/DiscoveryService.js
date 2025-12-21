const nseService = require('./NseService');
const bseService = require('./BseService');
const db = require('../config/db');

class DiscoveryService {
    async runDiscovery() {

        const [nseFindings, bseFindings] = await Promise.all([
            nseService.discover(),
            bseService.discover()
        ]);

        const allFindings = [...nseFindings, ...bseFindings];
        let newRecords = 0;
        let updatedRecords = 0;

        for (const finding of allFindings) {
            try {
                // Upsert into discovery table
                // Note: unique constraint is on (exchange, symbol, company_name)
                const res = await db.query(`
                    INSERT INTO ipo_discovery (exchange, symbol, company_name, status, raw_payload)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (exchange, COALESCE(symbol, ''), company_name)
                    DO UPDATE SET 
                        status = EXCLUDED.status,
                        raw_payload = EXCLUDED.raw_payload,
                        last_discovered_at = NOW()
                    RETURNING (xmax = 0) AS is_insert
                `, [finding.exchange, finding.symbol, finding.company_name, finding.status, finding.raw_payload]);

                if (res.rows[0].is_insert) newRecords++;
                else updatedRecords++;

            } catch (err) {
                console.error(`Failed to persist discovery for ${finding.company_name}:`, err.message);
            }
        }

        if (newRecords > 0) console.log(`✓ Discovery: ${newRecords} new records found.`);

        return {
            nseCount: nseFindings.length,
            bseCount: bseFindings.length,
            newRecords,
            updatedRecords
        };
    }
}

module.exports = new DiscoveryService();
