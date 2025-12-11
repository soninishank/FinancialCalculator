const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function checkDuplicates() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const res = await client.query(`
        SELECT symbol, count(*) 
        FROM ipo 
        GROUP BY symbol 
        HAVING count(*) > 1
    `);

        if (res.rows.length > 0) {
            console.log('Duplicates found:', res.rows);

            // List detailed rows for duplicates
            for (const r of res.rows) {
                const details = await client.query('SELECT ipo_id, symbol, company_name, created_at FROM ipo WHERE symbol=$1', [r.symbol]);
                console.log(`Details for ${r.symbol}:`);
                console.table(details.rows);
            }
        } else {
            console.log('No duplicates found in IPO table based on symbol.');
        }

        // Checking if getIpoData query produces duplicates via joins
        // Query from scraper.js
        const query = `
      SELECT 
        i.ipo_id, i.company_name, i.symbol
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
    `;
        const joinRes = await client.query(query);
        console.log(`Total rows in join query: ${joinRes.rowCount}`);

        // Check for duplicates in result
        const symbolCounts = {};
        joinRes.rows.forEach(r => {
            symbolCounts[r.symbol] = (symbolCounts[r.symbol] || 0) + 1;
        });

        const queryPower = Object.entries(symbolCounts).filter(([k, v]) => v > 1);
        if (queryPower.length > 0) {
            console.log('Duplicates found in JOIN query result:', queryPower);
        } else {
            console.log('No duplicates in JOIN query result.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkDuplicates();
