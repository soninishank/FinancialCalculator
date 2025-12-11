const express = require("express");
const cors = require("cors");
const ipoRoutes = require('./routes/ipoRoutes');
const db = require('./config/db');
const NseService = require('./services/NseService');
const cronJobs = require('./config/cronJobs');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/ipos", ipoRoutes);

const PORT = process.env.SCRAPER_PORT || 8081;
const ENABLE_CRON = process.env.ENABLE_CRON === 'true';

// Start server
const server = app.listen(PORT, () => {
    console.log(`IPO API service running on http://localhost:${PORT}`);

    // Cron jobs are available but disabled by default to prevent database connection issues
    // To enable automatic hourly refresh, uncomment the lines below and set ENABLE_CRON=true
    // cronJobs.startCronJobs();
    // if (ENABLE_CRON) {
    //     cronJobs.enableCronJobs();
    // }

    // Check if database is empty and fetch initial data
    checkAndFetchInitialData();
});

// Function to check if database has data and fetch if empty
async function checkAndFetchInitialData() {
    try {
        console.log('Checking database for existing IPO data...');

        // Check if we have any IPO records
        const result = await db.query('SELECT COUNT(*) as count FROM ipo');
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log('Database is empty. Fetching initial IPO data from NSE...');
            console.log('This may take 1-2 minutes. Server is ready to accept requests.');

            // Fetch data in background (non-blocking)
            NseService.syncAllIPOs()
                .then(result => {
                    if (result.success) {
                        console.log('✓ Initial data fetch completed successfully!');
                        console.log(`  - Current IPOs: ${result.counts.current}`);
                        console.log(`  - Upcoming IPOs: ${result.counts.upcoming}`);
                        console.log(`  - Past IPOs: ${result.counts.past}`);
                    } else {
                        console.error('✗ Initial data fetch failed:', result.error);
                    }
                })
                .catch(err => {
                    console.error('✗ Error during initial data fetch:', err.message);
                });
        } else {
            console.log(`✓ Database already contains ${count} IPO records.`);
        }
    } catch (err) {
        console.error('Error checking database:', err.message);
        console.log('Server will continue running. You can manually trigger data fetch via POST /api/ipos/refresh');
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.pool.end();
    });
});

