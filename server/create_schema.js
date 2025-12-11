const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function createSchema() {
  try {
    await client.connect();
    console.log('Connected to Neon DB');

    // 1) ipo — master record for each IPO
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
        primary_registrar_id BIGINT, -- FK will be added after registrar table creation or we can add later. Let's add simple field first.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ipo_symbol ON ipo(symbol);
      CREATE INDEX IF NOT EXISTS idx_ipo_status ON ipo(status);
    `);
    console.log('Created ipo table');

    // 4) registrar — contact & address (Creating before ipo_dates/contacts to handle potential FKs if needed strictly, though user said FK -> registrar.registrar_id for ipo table)
    // Note: Creating registrar second so we can alter IPO table if we wanted strict FK, but for now just creating the table.
    // Actually, user defined FK in IPO table: "primary_registrar_id — BIGINT NULLABLE — FK → registrar.registrar_id"
    // So I should probably create registrar FIRST or convert to FK later. PostgreSQL allows creating table with FK if target exists.
    // Let's create registrar first to be safe, or just create it now and assume user will handle data integrity or I can add ALTER TABLE.
    // For simplicity/robustness in one script, I will create referenced tables first or use atomic transaction.
    // Let's just create them in order and add constraints at the end or just create registrar first.
    // Re-ordering for FK dependencies: registrar -> ipo -> ipo_dates, subscription_summary, documents, contacts, gmp

    // Let's drop and recreate or just create if not exists.
    // Since this is a setup script, let's just create tables.

    // 4) registrar
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
    console.log('Created registrar table');

    // Add FK to IPO table if it doesn't exist (or we can just define it in CREATE TABLE if we are starting fresh).
    // Beause I already ran CREATE TABLE ipo above (in code flow), I should probably do registrar first.
    // I'll wrap this in a transaction or just rearrange. 
    // Let's rearrange the execution order in this function for correctness, but I'll write the queries sequentially here.
    // Actually, to ensure FK works, I will simple add the constraint ALTER TABLE after table creations.

    // 2) ipo_dates
    await client.query(`
      CREATE TABLE IF NOT EXISTS ipo_dates (
        ipo_date_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id),
        issue_start DATE,
        issue_end DATE,
        upi_cutoff_datetime TIMESTAMP,
        market_open_time TIME,
        market_close_time TIME
      );
    `);
    console.log('Created ipo_dates table');

    // 3) subscription_summary
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_summary (
        summary_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id),
        category VARCHAR(20) CHECK (category IN ('QIB','FII','MF','NII','RII','Anchor','Others')),
        shares_offered BIGINT,
        shares_bid BIGINT,
        subscription_ratio NUMERIC(8,3),
        cutoff_bids BIGINT,
        price_bids BIGINT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created subscription_summary table');

    // 5) documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        doc_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id),
        doc_type VARCHAR(50) CHECK (doc_type IN ('RHP','RHP_attachment','Sample_Form','ASBA_Circular','Bidding_Centres','Security_Parameters','Anchor_Report','Other')),
        title VARCHAR(255),
        url VARCHAR(2000),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created documents table');

    // 6) contacts
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        contact_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id),
        role VARCHAR(50) CHECK (role IN ('SCSB','Sponsor Bank','Lead Manager','Escrow','Registrar')),
        name VARCHAR(255),
        phone VARCHAR(64),
        email VARCHAR(255),
        notes TEXT
      );
    `);
    console.log('Created contacts table');

    // 7) gmp
    await client.query(`
      CREATE TABLE IF NOT EXISTS gmp (
        gmp_id BIGSERIAL PRIMARY KEY,
        ipo_id BIGINT REFERENCES ipo(ipo_id),
        snapshot_time TIMESTAMP,
        gmp_value NUMERIC(10,2),
        source VARCHAR(255)
      );
    `);
    console.log('Created gmp table');

    // Now add the FK from ipo to registrar
    try {
      await client.query(`
            ALTER TABLE ipo 
            ADD CONSTRAINT fk_ipo_registrar 
            FOREIGN KEY (primary_registrar_id) 
            REFERENCES registrar(registrar_id);
        `);
      console.log('Added FK from ipo to registrar');
    } catch (e) {
      // Ignore if constraint already exists or if data violates it (if tables already existed)
      console.log('FK constraint might already exist or failed:', e.message);
    }


    console.log('Schema created successfully');
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    await client.end();
  }
}

createSchema();
