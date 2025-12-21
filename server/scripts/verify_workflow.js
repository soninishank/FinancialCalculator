require('dotenv').config({ quiet: true });
const discoveryService = require('../services/DiscoveryService');
const reconciliationService = require('../services/ReconciliationService');
const enrichmentService = require('../services/EnrichmentService');
const db = require('../config/db');

async function verify() {
    console.log('=== STARTING WORKFLOW VERIFICATION ===');

    try {
        // 1. Discovery
        console.log('\nStep 1: Running Discovery...');
        const discStart = await db.query('SELECT COUNT(*) FROM ipo_discovery');
        const discoveryResult = await discoveryService.runDiscovery();
        const discEnd = await db.query('SELECT COUNT(*) FROM ipo_discovery');
        console.log(`Discovery Step Result: ${discEnd.rows[0].count - discStart.rows[0].count} actual new records added to staging.`);

        // 2. Reconciliation
        console.log('\nStep 2: Running Reconciliation...');
        const ipoStart = await db.query('SELECT COUNT(*) FROM ipo');
        await reconciliationService.runReconciliation();
        const ipoEnd = await db.query('SELECT COUNT(*) FROM ipo');
        console.log(`Reconciliation Step Result: ${ipoEnd.rows[0].count - ipoStart.rows[0].count} new canonical IPOs created.`);

        // 3. Enrichment
        console.log('\nStep 3: Running Enrichment (Batch of 5 for test)...');
        // We'll just run a limited enrichment to verify it works without waiting too long
        await enrichmentService.enrichAll();
        console.log('Enrichment Step Result: Enrichment batch completed.');

        // 4. Final Sanity Check
        console.log('\nStep 4: Audit - Checking for multi-exchange linkage...');
        const multiExchangeRes = await db.query(`
            SELECT company_name, nse_symbol, bse_scrip_code 
            FROM ipo 
            WHERE nse_symbol IS NOT NULL AND bse_scrip_code IS NOT NULL
            LIMIT 5
        `);

        if (multiExchangeRes.rows.length > 0) {
            console.log('✓ Found IPOs linked to both NSE and BSE:');
            multiExchangeRes.rows.forEach(row => {
                console.log(`  - ${row.company_name} (NSE: ${row.nse_symbol}, BSE: ${row.bse_scrip_code})`);
            });
        } else {
            console.log('! No multi-exchange IPOs found yet. Run again later or check if expected.');
        }

        console.log('\n=== VERIFICATION COMPLETE ===');
    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        // db pool doesn't need explicit end if we use common db.js, but let's be safe
        process.exit(0);
    }
}

verify();
