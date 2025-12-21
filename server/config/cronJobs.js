const cron = require('node-cron');
const discoveryService = require('../services/DiscoveryService');
const reconciliationService = require('../services/ReconciliationService');
const enrichmentService = require('../services/EnrichmentService');

// Discovery & Reconciliation: Every 30 minutes
const DISCOVERY_SCHEDULE = '*/30 * * * *';

// Enrichment: Every hour at minute 0 (processes a batch)
const ENRICHMENT_SCHEDULE = '0 * * * *';

let discoveryJob = null;
let enrichmentJob = null;

function startCronJobs() {
    console.log('Setting up refactored cron jobs...');

    // 1. Discovery & Reconciliation Workflow
    discoveryJob = cron.schedule(DISCOVERY_SCHEDULE, async () => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Running scheduled Discovery & Reconciliation...`);

        try {
            await discoveryService.runDiscovery();
            await reconciliationService.runReconciliation();
            console.log(`[${timestamp}] ✓ Discovery & Reconciliation completed successfully`);
        } catch (err) {
            console.error(`[${timestamp}] ✗ Discovery workflow failed:`, err.message);
        }
    }, {
        scheduled: false
    });

    // 2. Enrichment Workflow
    enrichmentJob = cron.schedule(ENRICHMENT_SCHEDULE, async () => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Running scheduled Enrichment batch...`);

        try {
            await enrichmentService.enrichAll();
            console.log(`[${timestamp}] ✓ Enrichment batch completed successfully`);
        } catch (err) {
            console.error(`[${timestamp}] ✗ Enrichment workflow failed:`, err.message);
        }
    }, {
        scheduled: false
    });

    console.log(`✓ Cron jobs configured (Discovery: ${DISCOVERY_SCHEDULE}, Enrichment: ${ENRICHMENT_SCHEDULE})`);
}

function enableCronJobs() {
    if (discoveryJob && enrichmentJob) {
        discoveryJob.start();
        enrichmentJob.start();
        console.log('✓ Automatic IPO sync workflows enabled');
        return true;
    }
    return false;
}

function disableCronJobs() {
    if (discoveryJob && enrichmentJob) {
        discoveryJob.stop();
        enrichmentJob.stop();
        console.log('✓ Automatic IPO sync workflows disabled');
        return true;
    }
    return false;
}

module.exports = {
    startCronJobs,
    enableCronJobs,
    disableCronJobs
};
