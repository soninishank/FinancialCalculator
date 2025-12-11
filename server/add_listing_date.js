const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrate() {
    try {
        await client.connect();
        // Check if column exists, if not add it
        await client.query(`
      ALTER TABLE ipo_dates ADD COLUMN IF NOT EXISTS listing_date DATE;
    `);
        console.log('Added listing_date to ipo_dates');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
