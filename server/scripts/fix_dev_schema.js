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
            // Column Name, Type
            ['min_investment', 'NUMERIC(15,2)'],
            ['bse_scrip_code', 'VARCHAR(50)'],
            ['bse_ipo_no', 'VARCHAR(50)'],
            ['issue_size_raw', 'TEXT'],
            ['fresh_issue_amount', 'BIGINT'],
            ['fresh_issue_shares', 'BIGINT'],
            ['ofs_amount', 'BIGINT'],
            ['ofs_shares', 'BIGINT'],
            ['issue_size_confidence', 'VARCHAR(20)'],
            ['issue_size_extraction_model', 'VARCHAR(50)'],
            ['issue_size_reasoning', 'TEXT']
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
