const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const { tableDefinitions, requiredColumns, constraints } = require('./schema_definitions');

// Uses DATABASE_URL from environment
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
    try {
        console.log(`Connecting to database...`);
        // Basic check to ensure ENV is set
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set in environment variables.');
        }

        await client.connect();

        console.log('--- Starting Database Setup / Migration ---');

        // 1. Pre-requisites (Types, Extensions)
        await client.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ipo_category_type') THEN
                CREATE TYPE ipo_category_type AS ENUM ('QIB', 'NII', 'RII', 'Employees', 'Shareholders', 'Total');
              END IF;
            END$$;
        `);
        console.log('✓ Types checked');

        // 2. Tables
        for (const def of tableDefinitions) {
            try {
                await client.query(def.query);
                if (def.postQueries) {
                    for (const pq of def.postQueries) {
                        await client.query(pq);
                    }
                }
                console.log(`✓ Table '${def.name}' checked`);
            } catch (error) {
                console.error(`✗ Error creating table '${def.name}':`, error.message);
                throw error;
            }
        }

        // 3. Columns (Safe Additions)
        for (const item of requiredColumns) {
            try {
                // Check if table exists first prevents error spam if table failed above
                await client.query(`
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${item.table}') THEN
                            ALTER TABLE ${item.table} ADD COLUMN IF NOT EXISTS ${item.col} ${item.type};
                        END IF;
                    END $$;
                `);
            } catch (e) {
                console.warn(`  ! Warning checking column ${item.table}.${item.col}:`, e.message);
            }
        }
        console.log('✓ Columns checked');

        // 4. Constraints
        for (const c of constraints) {
            try {
                await client.query(`
               DO $$
               BEGIN
                   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${c.table}') THEN
                       IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${c.name}') THEN
                           ALTER TABLE ${c.table} ADD CONSTRAINT ${c.name} ${c.def};
                       END IF;
                   END IF;
               END $$;
               `);
            } catch (e) {
                console.log(`  ! Note: Could not add constraint ${c.name}`, e.message);
            }
        }
        console.log('✓ Constraints checked');

        console.log('\n✅ SUCCESS: Database is fully set up and ready for use.');

    } catch (err) {
        console.error('\n❌ FAIL: Database setup failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
