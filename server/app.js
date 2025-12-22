require('dotenv').config({ quiet: true });
const express = require("express");
const cors = require("cors");
const ipoRoutes = require('./routes/ipoRoutes');
const db = require('./config/db');
const NseService = require('./services/NseService');
const discoveryService = require('./services/DiscoveryService');
const reconciliationService = require('./services/ReconciliationService');
const enrichmentService = require('./services/EnrichmentService');
const cronJobs = require('./config/cronJobs');

const app = express();
app.use(cors());
app.use(express.json());

// Content Security Policy for Render
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
    next();
});

// Root route for health check
app.get("/", (req, res) => {
    res.json({ status: "alive", message: "IPO API Service is running. Use /api/ipos to fetch data." });
});

app.use("/api/ipos", ipoRoutes);

const PORT = process.env.SCRAPER_PORT || 8081;
const ENABLE_CRON = process.env.ENABLE_CRON === 'true';

// Start server
const server = app.listen(PORT, () => {
    // console.log(`IPO API service running on http://localhost:${PORT}`);

    // Cron jobs - Automatically refresh data
    cronJobs.startCronJobs();
    cronJobs.enableCronJobs();

    // Check if database is empty and fetch initial data
    checkAndFetchInitialData();
});

// Function to check if database has data and fetch if empty
async function checkAndFetchInitialData() {
    try {
        // Check if we have any IPO records
        const result = await db.query('SELECT COUNT(*) as count FROM ipo');
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log('Database is empty. Starting initial discovery and reconciliation...');
            console.log('This may take 1-2 minutes. Server is ready to accept requests.');

            // Run full sync workflow in background
            (async () => {
                try {
                    await discoveryService.runDiscovery();
                    await reconciliationService.runReconciliation();
                    console.log('✓ Initial Discovery & Reconciliation completed.');

                    console.log('Starting background enrichment...');
                    await enrichmentService.enrichAll();
                    console.log('✓ Initial setup workflow complete.');
                } catch (err) {
                    console.error('✗ Initial setup failed:', err.message);
                }
            })();
        } else {
            // console.log(`✓ Database already contains ${count} IPO records.`);
        }
    } catch (err) {
        console.error('Error checking database:', err.message);

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

