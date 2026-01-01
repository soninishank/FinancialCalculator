require('dotenv').config();
const { Pool } = require('pg');

async function checkTables() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]); // Log host part for verification
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables found in public schema:');
        if (res.rows.length === 0) {
            console.log('(No tables found)');
        } else {
            res.rows.forEach(row => console.log(' - ' + row.table_name));
        }
    } catch (err) {
        console.error('Error checking tables:', err.message);
    } finally {
        await pool.end();
    }
}

checkTables();
