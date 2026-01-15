const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupNewsCache() {
    const client = await pool.connect();

    try {
        console.log('Creating news_cache table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS news_cache (
                id SERIAL PRIMARY KEY,
                cache_key VARCHAR(100) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            );
        `);

        console.log('Creating indexes...');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_news_cache_key 
            ON news_cache(cache_key);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_news_cache_expires 
            ON news_cache(expires_at);
        `);

        console.log('✓ News cache table setup complete!');
        console.log('✓ Indexes created successfully!');

    } catch (error) {
        console.error('Error setting up news cache:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

setupNewsCache()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
