require('dotenv').config();
const { Pool } = require('pg');

async function setupDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    const createTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      calc_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      content TEXT NOT NULL,
      parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'approved',
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_comments_calc_slug ON comments(calc_slug);
    CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
    CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
  `;

    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Creating comments table...');
        await client.query(createTableQuery);
        console.log('✓ Comments table and indexes created successfully.');
        client.release();
    } catch (err) {
        console.error('✗ Error setting up database:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
