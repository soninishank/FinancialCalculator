const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function addIssueSizeColumns() {
    try {
        await client.connect();
        console.log('Connected to Neon DB');

        console.log('Adding Issue Size extraction columns to ipo table...\n');

        // Add issue_size_raw column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS issue_size_raw TEXT;
      `);
            console.log('✓ issue_size_raw column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add fresh_issue_amount column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS fresh_issue_amount BIGINT;
      `);
            console.log('✓ fresh_issue_amount column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add fresh_issue_shares column  
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS fresh_issue_shares BIGINT;
      `);
            console.log('✓ fresh_issue_shares column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add ofs_amount column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS ofs_amount BIGINT;
      `);
            console.log('✓ ofs_amount column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add ofs_shares column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS ofs_shares BIGINT;
      `);
            console.log('✓ ofs_shares column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add issue_size_confidence column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS issue_size_confidence VARCHAR(20);
      `);
            console.log('✓ issue_size_confidence column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add issue_size_extraction_model column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS issue_size_extraction_model VARCHAR(50);
      `);
            console.log('✓ issue_size_extraction_model column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        // Add issue_size_reasoning column
        try {
            await client.query(`
        ALTER TABLE ipo 
        ADD COLUMN IF NOT EXISTS issue_size_reasoning TEXT;
      `);
            console.log('✓ issue_size_reasoning column added/verified');
        } catch (e) {
            console.log('Note:', e.message);
        }

        console.log('\n✅ All Issue Size columns added/verified successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

addIssueSizeColumns();
