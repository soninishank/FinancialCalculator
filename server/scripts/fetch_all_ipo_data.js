const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const NseService = require('../services/NseService');

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const logFilePath = path.join(__dirname, '../logs/issue_size_analysis.log');
const logDir = path.dirname(logFilePath);

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Initialize log file
fs.writeFileSync(logFilePath, '=== ISSUE SIZE ANALYSIS LOG ===\n');
fs.appendFileSync(logFilePath, `Generated at: ${new Date().toISOString()}\n\n`);

function logIssueSize(symbol, series, issueSizeValue) {
    const logEntry = `
${'='.repeat(80)}
Symbol: ${symbol} (${series})
Issue Size Value:
${issueSizeValue}
${'='.repeat(80)}
`;
    fs.appendFileSync(logFilePath, logEntry);
    console.log(`Logged Issue Size for ${symbol}`);
}

async function fetchAllIpoData() {
    const client = new Client({ connectionString: CONNECTION_STRING });

    try {
        await client.connect();
        console.log('Connected to database');

        // Get all IPO symbols from database
        const result = await client.query(`
            SELECT symbol, series, ipo_id 
            FROM ipo 
            ORDER BY created_at DESC
            LIMIT 50
        `);

        const ipos = result.rows;
        console.log(`\nFound ${ipos.length} IPOs to process\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < ipos.length; i++) {
            const { symbol, series, ipo_id } = ipos[i];
            console.log(`\n[${i + 1}/${ipos.length}] Processing ${symbol} (${series})...`);

            try {
                // Fetch details using NseService
                const url = `https://www.nseindia.com/api/ipo-detail?symbol=${encodeURIComponent(symbol)}&series=${encodeURIComponent(series || 'EQ')}`;
                const data = await NseService.fetchData(url);

                if (!data) {
                    console.log(`  ⚠ No data returned for ${symbol}`);
                    errorCount++;
                    continue;
                }

                // Extract Issue Size from dataList
                const dataList = data.issueInfo?.dataList || [];
                const issueSizeItem = dataList.find(d => d.title && d.title.toLowerCase().includes('issue size'));

                if (issueSizeItem) {
                    logIssueSize(symbol, series, issueSizeItem.value);
                    console.log(`  ✓ Logged Issue Size`);
                } else {
                    console.log(`  ⚠ No Issue Size field found`);
                    fs.appendFileSync(logFilePath, `\n${symbol} (${series}): NO ISSUE SIZE FIELD FOUND\n\n`);
                }

                // Persist full data to database
                await NseService.fetchAndStoreIpoDetails(symbol, series, ipo_id, client);
                console.log(`  ✓ Data persisted to database`);

                successCount++;

                // Add delay to avoid rate limiting
                if (i < ipos.length - 1) {
                    console.log('  Waiting 3 seconds before next request...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error(`  ✗ Error processing ${symbol}:`, error.message);
                fs.appendFileSync(logFilePath, `\n${symbol} (${series}): ERROR - ${error.message}\n\n`);
                errorCount++;
            }
        }

        // Write summary
        const summary = `
${'='.repeat(80)}
SUMMARY
${'='.repeat(80)}
Total IPOs processed: ${ipos.length}
Successfully processed: ${successCount}
Errors: ${errorCount}
Log file: ${logFilePath}
${'='.repeat(80)}
`;

        fs.appendFileSync(logFilePath, summary);
        console.log(summary);

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await client.end();
        console.log('\nDatabase connection closed');
        console.log(`\n📊 Issue Size analysis log saved to: ${logFilePath}`);
    }
}

// Run the script
console.log('Starting IPO data collection and Issue Size analysis...\n');
fetchAllIpoData();
