const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function fixSeries() {
    try {
        await client.connect();
        // Update PARKHOSPS specifically
        await client.query(`UPDATE ipo SET series = 'EQ' WHERE symbol = 'PARKHOSPS'`);
        console.log('Manually set series=EQ for PARKHOSPS');
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

fixSeries();
