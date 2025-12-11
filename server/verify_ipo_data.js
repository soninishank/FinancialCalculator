const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function verify() {
    try {
        await client.connect();
        const countRes = await client.query('SELECT count(*) FROM ipo');
        console.log(`Total IPOs: ${countRes.rows[0].count}`);

        const sample = await client.query('SELECT symbol, status, issue_size, price_range_low, price_range_high FROM ipo ORDER BY updated_at DESC LIMIT 5');
        console.log('Recent IPOs:', sample.rows);

        const subs = await client.query('SELECT * FROM subscription_summary LIMIT 5');
        console.log('Subscription Samples:', subs.rows);

    } catch (e) { console.error(e); }
    finally { await client.end(); }
}

verify();
