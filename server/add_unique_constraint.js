const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function addUniqueConstraint() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Add unique constraint. This will fail if duplicates still exist, but we ran deduplicate.
        await client.query('ALTER TABLE ipo ADD CONSTRAINT ipo_symbol_unique UNIQUE (symbol)');
        console.log('Added UNIQUE constraint on ipo(symbol)');

    } catch (err) {
        // If it fails, maybe duplicates returned?
        console.error('Error adding constraint:', err);
    } finally {
        await client.end();
    }
}

addUniqueConstraint();
