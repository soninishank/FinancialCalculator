const { Client } = require('pg');
const CONNECTION_STRING = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function fixMinInvestment() {
    const client = new Client({ connectionString: CONNECTION_STRING });
    try {
        await client.connect();

        // Find IPOs where min_investment is calculated using high price instead of low
        // We look for IPOs where min_investment approx equals bid_lot * price_range_high
        // AND price_range_high != price_range_low (to avoid fixed price issues where it doesn't matter)

        // Actually, let's just recalculate for ALL IPOs where we have bid_lot and price_range_low
        // This is safer and cleaner as a global fix.

        const res = await client.query(`
            SELECT ipo_id, symbol, company_name, bid_lot, price_range_low, price_range_high, min_investment
            FROM ipo
            WHERE bid_lot IS NOT NULL 
              AND price_range_low IS NOT NULL
              AND price_range_low > 0
        `);

        console.log(`Checking ${res.rows.length} IPOs...`);

        let updateCount = 0;

        for (const row of res.rows) {
            const low = parseFloat(row.price_range_low);
            const lot = parseInt(row.bid_lot);
            const currentMin = parseFloat(row.min_investment || 0);

            // Expected min investment based on low price
            const expectedMin = low * lot;

            // Allow for small floating point differences
            if (Math.abs(currentMin - expectedMin) > 1.0) {
                console.log(`Updating ${row.symbol || row.company_name}: Current ${currentMin} -> New ${expectedMin} (Low: ${low}, Lot: ${lot})`);

                await client.query(`
                    UPDATE ipo SET min_investment = $1 WHERE ipo_id = $2
                `, [expectedMin, row.ipo_id]);

                updateCount++;
            }
        }

        console.log(`Updated ${updateCount} IPOs.`);

    } catch (err) {
        console.error('Error fixing data:', err);
    } finally {
        await client.end();
    }
}

fixMinInvestment();
