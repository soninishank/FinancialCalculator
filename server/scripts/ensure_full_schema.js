const { Client } = require('pg');
require('dotenv').config({ quiet: true });

// Uses DATABASE_URL from environment
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function ensureFullSchema() {
    try {
        console.log(`Connecting to database...`);
        await client.connect();

        console.log('--- Starting Safe Unified Schema Migration ---');

        // --- 1. Base Tables Creation (Idempotent) ---

        // IPO Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ipo (
                ipo_id BIGSERIAL PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                symbol VARCHAR(32) NOT NULL,
                series VARCHAR(10),
                status VARCHAR(20) CHECK (status IN ('upcoming','open','closed','listed','withdrawn')),
                issue_type VARCHAR(64),
                issue_size BIGINT, -- total issue size in paise
                offer_for_sale_amount BIGINT, -- in paise
                price_range_low NUMERIC(12,2),
                price_range_high NUMERIC(12,2),
                face_value NUMERIC(12,2),
                tick_size NUMERIC(12,2),
                bid_lot INT,
                min_order_qty INT,
                max_retail_amount NUMERIC(15,2),
                max_bid_qib BIGINT,
                max_bid_nii BIGINT,
                book_running_lead_managers VARCHAR(1000),
                primary_registrar_id BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ipo_symbol ON ipo(symbol);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ipo_status ON ipo(status);`);
        console.log('✓ ipo table checked');

        // Registrar Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS registrar (
                registrar_id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255),
                address TEXT,
                contact_person VARCHAR(255),
                phone VARCHAR(64),
                email VARCHAR(255),
                website VARCHAR(255)
            );
        `);
        console.log('✓ registrar table checked');

        // IPO Dates Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ipo_dates (
                ipo_date_id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                issue_start DATE,
                issue_end DATE,
                market_open_time TIME,
                market_close_time TIME,
                listing_date DATE,
                allotment_finalization_date DATE, -- Added recently
                refund_initiation_date DATE,      -- Added recently
                demat_credit_date DATE            -- Added recently
            );
        `);
        console.log('✓ ipo_dates table checked');

        // Subscription Summary Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS subscription_summary (
                summary_id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                category VARCHAR(20),
                shares_offered BIGINT,
                shares_bid BIGINT,
                subscription_ratio NUMERIC(8,3),
                face_value NUMERIC(12,2),
                cutoff_bids BIGINT,
                price_bids BIGINT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ subscription_summary table checked');

        // Documents Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS documents (
                doc_id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                doc_type VARCHAR(50),
                title VARCHAR(255),
                url VARCHAR(2000),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ documents table checked');

        // Contacts Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                contact_id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                role VARCHAR(50),
                name VARCHAR(255),
                phone VARCHAR(64),
                email VARCHAR(255),
                notes TEXT
            );
        `);
        console.log('✓ contacts table checked');

        // GMP Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS gmp (
                gmp_id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                snapshot_time TIMESTAMP,
                gmp_value NUMERIC(10,2),
                source VARCHAR(255)
            );
        `);
        console.log('✓ gmp table checked');

        // IPO Bidding Details (Requires ENUM Type)
        await client.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ipo_category_type') THEN
                CREATE TYPE ipo_category_type AS ENUM ('QIB', 'NII', 'RII', 'Employees', 'Shareholders', 'Total');
              END IF;
            END$$;
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS ipo_bidding_details (
                id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT REFERENCES ipo(ipo_id),
                category ipo_category_type,
                sr_no VARCHAR(16),
                shares_offered BIGINT,
                shares_bid BIGINT,
                subscription_ratio NUMERIC(12,8),
                face_value NUMERIC(12,2),
                source VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bidding_ipo_id ON ipo_bidding_details(ipo_id);`);
        console.log('✓ ipo_bidding_details table checked');


        // IPO Discovery Table (New)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ipo_discovery (
                discovery_id BIGSERIAL PRIMARY KEY,
                exchange VARCHAR(10) NOT NULL,
                symbol VARCHAR(32),
                company_name VARCHAR(255),
                status VARCHAR(20),
                raw_payload JSONB,
                reconciled_ipo_id BIGINT, 
                last_discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_discovery_unq 
            ON ipo_discovery (exchange, (COALESCE(symbol, '')), company_name);
        `);
        console.log('✓ ipo_discovery table checked');


        // Bidding Data Table (Recent Fix)
        await client.query(`
            CREATE TABLE IF NOT EXISTS bidding_data (
                id BIGSERIAL PRIMARY KEY,
                ipo_id BIGINT,
                price_label VARCHAR(50),
                price_value NUMERIC(15,2),
                cumulative_quantity BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bidding_data_ipo_id ON bidding_data(ipo_id);`);
        console.log('✓ bidding_data table checked');


        // --- 2. Add Missing Columns (Safe ALTER) ---
        // A list of all potential columns added in recent iterations
        const allColumns = [
            // Table: ipo
            { table: 'ipo', col: 'min_investment', type: 'NUMERIC(15,2)' },
            { table: 'ipo', col: 'bse_scrip_code', type: 'VARCHAR(50)' },
            { table: 'ipo', col: 'bse_ipo_no', type: 'VARCHAR(50)' },
            { table: 'ipo', col: 'issue_size_raw', type: 'TEXT' },
            { table: 'ipo', col: 'fresh_issue_amount', type: 'BIGINT' },
            { table: 'ipo', col: 'fresh_issue_shares', type: 'BIGINT' },
            { table: 'ipo', col: 'ofs_amount', type: 'BIGINT' },
            { table: 'ipo', col: 'ofs_shares', type: 'BIGINT' },
            { table: 'ipo', col: 'issue_size_confidence', type: 'VARCHAR(20)' },
            { table: 'ipo', col: 'issue_size_extraction_model', type: 'VARCHAR(50)' },
            { table: 'ipo', col: 'issue_size_reasoning', type: 'TEXT' },
            { table: 'ipo', col: 'nse_symbol', type: 'VARCHAR(32)' },
            { table: 'ipo', col: 'fresh_issue_size', type: 'BIGINT' },
            { table: 'ipo', col: 'offer_for_sale_size', type: 'BIGINT' },
            { table: 'ipo', col: 'issue_type', type: 'VARCHAR(64)' },
            { table: 'ipo', col: 'series', type: 'VARCHAR(10)' },

            // Table: ipo_dates
            { table: 'ipo_dates', col: 'allotment_finalization_date', type: 'DATE' },
            { table: 'ipo_dates', col: 'refund_initiation_date', type: 'DATE' },
            { table: 'ipo_dates', col: 'demat_credit_date', type: 'DATE' },
            { table: 'ipo_dates', col: 'listing_date', type: 'DATE' },

            // Table: ipo_bidding_details
            { table: 'ipo_bidding_details', col: 'face_value', type: 'NUMERIC(12,2)' }
        ];

        for (const item of allColumns) {
            try {
                await client.query(`
                    ALTER TABLE ${item.table} 
                    ADD COLUMN IF NOT EXISTS ${item.col} ${item.type};
                `);
            } catch (e) {
                console.warn(`  ! Warning checking column ${item.table}.${item.col}:`, e.message);
            }
        }
        console.log('✓ All specific columns checked/added');


        // --- 3. Constraints & Foreign Keys ---
        // Best effort to link tables if they aren't linked
        const constraints = [
            {
                table: 'ipo',
                name: 'fk_ipo_registrar',
                def: 'FOREIGN KEY (primary_registrar_id) REFERENCES registrar(registrar_id)'
            },
            {
                table: 'ipo_discovery',
                name: 'fk_ipo_discovery_ipo',
                def: 'FOREIGN KEY (reconciled_ipo_id) REFERENCES ipo(ipo_id)'
            },
            {
                table: 'bidding_data',
                name: 'fk_bidding_data_ipo',
                def: 'FOREIGN KEY (ipo_id) REFERENCES ipo(ipo_id)'
            }
        ];

        for (const c of constraints) {
            try {
                // Check if table exists first (simplified check via query result)
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
                // Ignore constraint errors (e.g. data violation)
                console.log(`  ! Note: Could not add constraint ${c.name}`, e.message);
            }
        }
        console.log('✓ Constraints checked');

        console.log('\nSUCCESS: Database schema is fully synced for Production.');

    } catch (err) {
        console.error('\nFAIL: Schema migration failed:', err);
    } finally {
        await client.end();
    }
}

ensureFullSchema();
