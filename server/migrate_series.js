const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to DB');

        await client.query(`
            ALTER TABLE ipo 
            ADD COLUMN IF NOT EXISTS series VARCHAR(10);
        `);
        console.log('Added series column to ipo table');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
