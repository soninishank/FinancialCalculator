const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function deduplicate() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Identify duplicates
        const res = await client.query(`
        SELECT symbol, count(*) 
        FROM ipo 
        GROUP BY symbol 
        HAVING count(*) > 1
    `);

        for (const r of res.rows) {
            console.log(`Processing ${r.symbol}...`);

            // Fetch IDs ordered by created_at DESC (keep latest)
            // Or keep the one with most relations data? 
            // Let's assume the latest is the one being updated by verification script.
            const idsRes = await client.query('SELECT ipo_id FROM ipo WHERE symbol=$1 ORDER BY ipo_id DESC', [r.symbol]);
            const ids = idsRes.rows.map(row => row.ipo_id);

            // Keep first (latest id), delete others
            const toKeep = ids[0];
            const toDelete = ids.slice(1);

            console.log(`Keeping ${toKeep}, Deleting ${toDelete.join(', ')}`);

            if (toDelete.length > 0) {
                // Delete dependent data first? 
                // Our schema has CASCADE on some, but not all.
                // ipo tables: ipo_dates, subscription_summary, documents, contacts, gmp, bidding_data

                // Just delete from IPO, if cascades are set it will work. 
                // If not, we might need to delete manually.
                // The `add_bidding_data` script added CASCADE for bidding_data.
                // `create_schema` didn't explicitly specify ON DELETE CASCADE for others. 
                // So we might face FK errors.

                // Let's safe delete
                const tables = ['bidding_data', 'subscription_summary', 'documents', 'contacts', 'gmp', 'ipo_dates'];
                for (const table of tables) {
                    await client.query(`DELETE FROM ${table} WHERE ipo_id = ANY($1)`, [toDelete]);
                }

                // Finally delete IPO
                await client.query('DELETE FROM ipo WHERE ipo_id = ANY($1)', [toDelete]);
                console.log('Deleted duplicates.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

deduplicate();
