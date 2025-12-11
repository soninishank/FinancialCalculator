const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function addBiddingTable() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Create bidding_data table
        await client.query(`
      CREATE TABLE IF NOT EXISTS bidding_data (
        bid_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id) ON DELETE CASCADE,
        price_label VARCHAR(50), -- e.g., "154", "Cut-Off"
        price_value NUMERIC(12,2), -- Numeric value for sorting if needed, can be NULL for 'Cut-Off' if not mapped
        cumulative_quantity BIGINT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_bidding_ipo ON bidding_data(ipo_id);
    `);
        console.log('Created bidding_data table');

    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

addBiddingTable();
