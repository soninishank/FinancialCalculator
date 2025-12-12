const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrateDatabase() {
    try {
        await client.connect();
        console.log('Connected to Neon DB');

        // Add new columns to ipo_dates table if they don't exist
        console.log('Adding new columns to ipo_dates table...');

        // Check and add allotment_finalization_date
        try {
            await client.query(`
        ALTER TABLE ipo_dates 
        ADD COLUMN IF NOT EXISTS allotment_finalization_date DATE;
      `);
            console.log('✓ allotment_finalization_date column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Check and add refund_initiation_date
        try {
            await client.query(`
        ALTER TABLE ipo_dates 
        ADD COLUMN IF NOT EXISTS refund_initiation_date DATE;
      `);
            console.log('✓ refund_initiation_date column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Check and add demat_credit_date
        try {
            await client.query(`
        ALTER TABLE ipo_dates 
        ADD COLUMN IF NOT EXISTS demat_credit_date DATE;
      `);
            console.log('✓ demat_credit_date column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Check and add listing_date if it doesn't exist
        try {
            await client.query(`
        ALTER TABLE ipo_dates 
        ADD COLUMN IF NOT EXISTS listing_date DATE;
      `);
            console.log('✓ listing_date column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        console.log('\n✅ ipo_dates migration completed!');

        // Also check ipo_bidding_details for face_value column
        console.log('\nChecking ipo_bidding_details table...');
        try {
            await client.query(`
        ALTER TABLE ipo_bidding_details 
        ADD COLUMN IF NOT EXISTS face_value NUMERIC(12,2);
      `);
            console.log('✓ face_value column in ipo_bidding_details added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        console.log('\n✅ All migrations completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrateDatabase();
