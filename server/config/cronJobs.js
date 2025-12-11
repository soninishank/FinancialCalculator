const cron = require('node-cron');
const NseService = require('../services/NseService');

// Schedule data refresh every hour at minute 0
// Cron format: minute hour day month weekday
// '0 * * * *' = At minute 0 of every hour
const REFRESH_SCHEDULE = '0 * * * *';

let cronJob = null;

function startCronJobs() {
    console.log('Setting up cron jobs...');

    // Hourly IPO data refresh
    cronJob = cron.schedule(REFRESH_SCHEDULE, async () => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Running scheduled IPO data refresh...`);

        try {
            const result = await NseService.syncAllIPOs();

            if (result.success) {
                console.log(`[${timestamp}] ✓ Scheduled refresh completed successfully`);
                console.log(`  - Current: ${result.counts.current}, Upcoming: ${result.counts.upcoming}, Past: ${result.counts.past}`);
            } else {
                console.error(`[${timestamp}] ✗ Scheduled refresh failed:`, result.error);
            }
        } catch (err) {
            console.error(`[${timestamp}] ✗ Error during scheduled refresh:`, err.message);
        }
    }, {
        scheduled: false // Don't start immediately, we'll start it manually
    });

    console.log(`✓ Cron job configured (schedule: ${REFRESH_SCHEDULE})`);
    console.log('  To enable automatic hourly refresh, set ENABLE_CRON=true in environment');
}

function enableCronJobs() {
    if (cronJob) {
        cronJob.start();
        console.log('✓ Automatic hourly IPO data refresh enabled');
        return true;
    }
    return false;
}

function disableCronJobs() {
    if (cronJob) {
        cronJob.stop();
        console.log('✓ Automatic hourly IPO data refresh disabled');
        return true;
    }
    return false;
}

module.exports = {
    startCronJobs,
    enableCronJobs,
    disableCronJobs
};
