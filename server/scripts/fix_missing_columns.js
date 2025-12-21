const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
    try {
        await client.connect();
        console.log('Connected to Neon DB');

        const columnsToAdd = [
            ['fresh_issue_size', 'BIGINT'],
            ['offer_for_sale_size', 'BIGINT'],
            ['issue_type', 'VARCHAR(64)'],
            ['series', 'VARCHAR(10)']
        ];

        for (const [colName, colType] of columnsToAdd) {
            try {
                await client.query(`
                ALTER TABLE ipo 
                ADD COLUMN IF NOT EXISTS ${colName} ${colType};
            `);
                console.log(`✓ ${colName} column added/verified`);
            } catch (e) {
                console.log(`Error adding ${colName}:`, e.message);
            }
        }

        console.log('Schema update complete.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
