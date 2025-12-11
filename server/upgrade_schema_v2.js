const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function upgradeSchema() {
    try {
        await client.connect();
        console.log('Connected to DB for Upgrade');

        // 1. IPO Table Updates
        // Add columns for Fresh Issue and OFS
        await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS fresh_issue_size NUMERIC(25, 2),
        ADD COLUMN IF NOT EXISTS offer_for_sale_size NUMERIC(25, 2);
    `);
        console.log('Added fresh_issue_size, offer_for_sale_size to ipo');

        // Ensure max_retail_amount is sufficient (15,2 might be small if 200,000 but fine. Let's keep existing if present).
        // The requirement is "Store Face Value". existing schema has `face_value NUMERIC(12,2)`.

        // 2. IPO Dates Updates
        // Remove upi_cutoff_datetime
        await client.query(`
        ALTER TABLE ipo_dates 
        DROP COLUMN IF EXISTS upi_cutoff_datetime;
    `);
        console.log('Dropped upi_cutoff_datetime from ipo_dates');

        // 3. Subscription Summary Updates
        // Remove category check constraint
        await client.query(`
        ALTER TABLE subscription_summary 
        DROP CONSTRAINT IF EXISTS subscription_summary_category_check;
    `);
        console.log('Dropped category check constraint from subscription_summary');

        // Increase precision for subscription_ratio
        await client.query(`
        ALTER TABLE subscription_summary 
        ALTER COLUMN subscription_ratio TYPE NUMERIC(20, 8);
    `);
        console.log('Updated subscription_ratio precision');

        console.log('Schema upgrade complete.');

    } catch (err) {
        console.error('Error upgrading schema:', err);
    } finally {
        await client.end();
    }
}

upgradeSchema();
