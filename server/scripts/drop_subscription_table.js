const db = require('../config/db');

async function dropTable() {
    try {
        console.log('Dropping table ipo_bidding_details...');
        await db.query('DROP TABLE IF EXISTS ipo_bidding_details CASCADE');
        console.log('Table dropped successfully.');
    } catch (err) {
        console.error('Error dropping table:', err);
    } finally {
        process.exit(0);
    }
}

dropTable();
