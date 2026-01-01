import { Pool } from 'pg';

console.log('[DB] Initializing connection pool...');
if (!process.env.DATABASE_URL) {
    console.error('[DB] CRITICAL: DATABASE_URL is missing!');
} else {
    const url = process.env.DATABASE_URL;
    const hiddenUrl = url.replace(/:([^@]+)@/, ':****@');
    console.log('[DB] DATABASE_URL info:', {
        length: url.length,
        prefix: url.substring(0, 15),
        isPlaceholder: url.includes('your_') || url === 'base',
        hostPart: url.split('@')[1]?.split('/')[0]
    });
    console.log('[DB] Connection String:', hiddenUrl.split('?')[0]);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
});

export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('[DB] Query executed successfully', { duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('[DB] Query execution failed', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint
        });
        throw err;
    }
};

export default pool;
