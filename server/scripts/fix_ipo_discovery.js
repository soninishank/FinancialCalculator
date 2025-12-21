const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
    try {
        await client.connect();
        console.log('Connected to Neon DB');

        // 1. Create ipo_discovery table
        await client.query(`
      CREATE TABLE IF NOT EXISTS ipo_discovery (
        discovery_id BIGSERIAL PRIMARY KEY,
        exchange VARCHAR(10) NOT NULL, -- 'NSE' or 'BSE'
        symbol VARCHAR(32),
        company_name VARCHAR(255),
        status VARCHAR(20),
        raw_payload JSONB,
        reconciled_ipo_id BIGINT REFERENCES ipo(ipo_id),
        last_discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_discovery_unq 
      ON ipo_discovery (exchange, (COALESCE(symbol, '')), company_name);
    `);
        console.log('✓ Created ipo_discovery table and unique index');

        // 2. Add nse_symbol column if missing
        try {
            await client.query(`
            ALTER TABLE ipo 
            ADD COLUMN IF NOT EXISTS nse_symbol VARCHAR(32);
        `);
            console.log('✓ nse_symbol column added/verified');
        } catch (e) {
            console.log('Error adding nse_symbol:', e.message);
        }

        console.log('Schema update complete.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
