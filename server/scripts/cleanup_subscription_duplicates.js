// Clean up duplicate subscription entries from database
// Run this script to remove child rows that were incorrectly stored as parent entries

const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

const connectionString = process.env.DATABASE_URL;

async function cleanupDuplicates() {
    const pool = new Pool({ connectionString });

    try {
        console.log('Connecting to database...');

        // Delete all rows where sr_no contains dots or parentheses (child rows)
        // Keep only parent rows: "1", "2", "3", and "Total"
        const result = await pool.query(`
            DELETE FROM ipo_bidding_details 
            WHERE sr_no IS NOT NULL 
            AND (sr_no LIKE '%.%' OR sr_no LIKE '%(%')
        `);

        console.log(`✓ Cleaned up ${result.rowCount} duplicate/child subscription entries`);

        // Show remaining entries
        const remaining = await pool.query(`
            SELECT ipo_id, category, sr_no, shares_offered, shares_bid 
            FROM ipo_bidding_details 
            ORDER BY ipo_id, sr_no
        `);

        console.log(`\nRemaining entries: ${remaining.rowCount}`);
        console.log('Sample:');
        remaining.rows.slice(0, 10).forEach(row => {
            console.log(`  IPO ${row.ipo_id}: ${row.category} (${row.sr_no}) - ${row.shares_offered} offered, ${row.shares_bid} bid`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

cleanupDuplicates();
