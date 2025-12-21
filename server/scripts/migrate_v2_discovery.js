const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to DB');

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

    // 2. Add columns to ipo table
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ipo' AND COLUMN_NAME='nse_symbol') THEN
          ALTER TABLE ipo ADD COLUMN nse_symbol VARCHAR(32);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ipo' AND COLUMN_NAME='bse_scrip_code') THEN
          ALTER TABLE ipo ADD COLUMN bse_scrip_code VARCHAR(32);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ipo' AND COLUMN_NAME='bse_ipo_no') THEN
          ALTER TABLE ipo ADD COLUMN bse_ipo_no VARCHAR(32);
        END IF;
      END$$;
    `);
    console.log('✓ Updated ipo table columns');

  } catch (err) {
    console.error('✗ Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
