const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Drop the check constraint on category if it exists
        // We need to find the constraint name. Usually it's 'subscription_summary_category_check'.
        // Or we can just Alter column type to VARCHAR(255) which might not drop check automatically but let's try dropping constraint first.

        // Attempt to drop standard named constraint
        try {
            await client.query('ALTER TABLE subscription_summary DROP CONSTRAINT IF EXISTS subscription_summary_category_check');
            console.log('Dropped constraint subscription_summary_category_check');
        } catch (e) {
            console.log('Constraint might not exist or diff name:', e.message);
        }

        // 2. Modify column to be longer just in case
        await client.query('ALTER TABLE subscription_summary ALTER COLUMN category TYPE VARCHAR(255)');
        console.log('Altered category column to VARCHAR(255)');

        // 3. Add explicit index if useful
        await client.query('CREATE INDEX IF NOT EXISTS idx_sub_ipo ON subscription_summary(ipo_id)');

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
