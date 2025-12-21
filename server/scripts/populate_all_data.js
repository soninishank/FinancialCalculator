const { Client } = require('pg');
const NseService = require('../services/NseService');

require('dotenv').config({ quiet: true });

const CONNECTION_STRING = process.env.DATABASE_URL;

async function populateAllData() {
    const client = new Client({ connectionString: CONNECTION_STRING });

    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // Step 1: Sync all IPOs (basic data)
        console.log('━'.repeat(80));
        console.log('STEP 1: Fetching all IPO listings from NSE');
        console.log('━'.repeat(80));

        const syncResult = await NseService.syncAllIPOs();

        if (!syncResult.success) {
            throw new Error(`Sync failed: ${syncResult.error}`);
        }

        console.log(`\n✓ Successfully synced IPOs:`);
        console.log(`  • Current (Open): ${syncResult.counts.current}`);
        console.log(`  • Upcoming: ${syncResult.counts.upcoming}`);
        console.log(`  • Past (Closed): ${syncResult.counts.past}`);
        console.log(`  • Total: ${syncResult.counts.current + syncResult.counts.upcoming + syncResult.counts.past}`);

        // Step 2: Fetch detailed data for all IPOs
        console.log('\n' + '━'.repeat(80));
        console.log('STEP 2: Fetching detailed data for each IPO');
        console.log('━'.repeat(80));
        console.log('This includes: dates, documents, subscription data, GMP, bidding details');
        console.log('Note: This will take several minutes due to rate limiting...\n');

        // Get all IPOs
        const iposResult = await client.query(`
            SELECT ipo_id, symbol, series, company_name 
            FROM ipo 
            ORDER BY created_at DESC
        `);

        const ipos = iposResult.rows;
        console.log(`Found ${ipos.length} IPOs to process\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < ipos.length; i++) {
            const { ipo_id, symbol, series, company_name } = ipos[i];

            console.log(`[${i + 1}/${ipos.length}] Processing: ${symbol} (${series}) - ${company_name}`);

            try {
                // Fetch and store detailed data
                await NseService.fetchAndStoreIpoDetails(symbol, series, ipo_id, client);
                console.log(`  ✓ Success`);
                successCount++;

                // Add delay to avoid rate limiting (3 seconds between requests)
                if (i < ipos.length - 1) {
                    console.log(`  ⏱  Waiting 3 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error(`  ✗ Error: ${error.message}`);
                errorCount++;
            }
        }

        // Final summary
        console.log('\n' + '━'.repeat(80));
        console.log('POPULATION COMPLETE');
        console.log('━'.repeat(80));
        console.log(`✓ Successfully processed: ${successCount}/${ipos.length}`);
        console.log(`✗ Errors: ${errorCount}/${ipos.length}`);

        if (errorCount > 0) {
            console.log('\n⚠️  Some IPOs failed to fetch. This is normal for:');
            console.log('   - Very old IPOs with no data available');
            console.log('   - Network timeouts');
            console.log('   - Rate limiting from NSE');
        }

        console.log('\n🎉 Database is now fully populated!');
        console.log('   You can now use the application with complete data.');

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✓ Database connection closed');
    }
}

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    IPO DATA POPULATION SCRIPT                              ║
║                                                                            ║
║  This script will:                                                         ║
║  1. Fetch all IPO listings (current, upcoming, past)                       ║
║  2. Fetch detailed data for each IPO (dates, documents, etc.)              ║
║  3. Extract Issue Size using NLP                                           ║
║  4. Process RHP documents in background                                    ║
║                                                                            ║
║  Estimated time: 3-5 minutes for ~50 IPOs                                  ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

populateAllData();
