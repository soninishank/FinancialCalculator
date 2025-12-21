const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Create bidding_data table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bidding_data (
                id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                price_label VARCHAR(50),
                price_value NUMERIC(15,2),
                cumulative_quantity BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Created bidding_data table');

        // Add index
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bidding_data_ipo_id ON bidding_data(ipo_id);
        `);
        console.log('✓ Created index on ipo_id');

        console.log('Schema update complete.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
