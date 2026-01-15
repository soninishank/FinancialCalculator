import { Pool } from 'pg';

const rawUrl = process.env.DATABASE_URL || '';
let connectionString = rawUrl;

// [FIX] Automatically clean the URL if it was copied as a full 'psql' command
if (rawUrl.includes('psql') || rawUrl.includes("'")) {
    const postgresMatch = rawUrl.match(/postgresql:\/\/[^\s']+/);
    if (postgresMatch) {
        connectionString = postgresMatch[0];
        console.log('[DB] Sanitized DATABASE_URL (removed psql prefix/quotes)');
    }
}

if (!connectionString) {
    console.error('[DB] CRITICAL: DATABASE_URL is missing!');
} else {
    const hiddenUrl = connectionString.replace(/:([^@]+)@/, ':****@');
    console.log('[DB] DATABASE_URL info:', {
        length: connectionString.length,
        prefix: connectionString.substring(0, 15),
        isPlaceholder: connectionString.includes('your_') || connectionString === 'base',
        hostPart: connectionString.split('@')[1]?.split('/')[0]
    });
    console.log('[DB] Connection String:', hiddenUrl.split('?')[0]);
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
});

export const query = async (text, params) => {
    let retries = 3;
    while (retries > 0) {
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('[DB] Query executed successfully', { duration, rows: res.rowCount });
            return res;
        } catch (err) {
            retries--;
            const isRetryable = err.message.includes('Connection terminated unexpectedly') ||
                err.message.includes('ECONNRESET') ||
                err.message.includes('ETIMEDOUT');

            if (retries > 0 && isRetryable) {
                console.warn(`[DB] Query failed, retrying... (${retries} attempts left)`, { message: err.message });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                continue;
            }

            console.error('[DB] Query execution failed', {
                message: err.message,
                code: err.code,
                detail: err.detail,
                hint: err.hint,
                finalAttempt: true
            });
            throw err;
        }
    }
};

export default pool;
