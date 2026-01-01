require('dotenv').config();
const { Pool } = require('pg');

async function testWrite() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Inserting test comment...');
        const insertRes = await pool.query(`
            INSERT INTO comments (calc_slug, name, email, content, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `, ['pure-sip', 'System Test', 'test@example.com', 'Database verification comment.', 'approved']);

        console.log('✓ Success! Inserted ID:', insertRes.rows[0].id);

        const countRes = await pool.query('SELECT COUNT(*) FROM comments;');
        console.log('Total comments in table:', countRes.rows[0].count);

        // Optional: delete the test comment
        // await pool.query('DELETE FROM comments WHERE id = $1', [insertRes.rows[0].id]);
        // console.log('Cleaned up test comment.');

    } catch (err) {
        console.error('Error during test:', err.message);
    } finally {
        await pool.end();
    }
}

testWrite();
