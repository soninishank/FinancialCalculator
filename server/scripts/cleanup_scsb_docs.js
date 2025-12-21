const { Client } = require('pg');
require('dotenv').config({ quiet: true });

const CONNECTION_STRING = process.env.DATABASE_URL;

async function cleanupSCSBDocuments() {
    const client = new Client({ connectionString: CONNECTION_STRING });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Check for SCSB documents
        const checkResult = await client.query(
            "SELECT doc_id, ipo_id, title FROM documents WHERE LOWER(title) LIKE '%branches of self certified syndicate banks%' OR LOWER(title) LIKE '%scsb%'"
        );

        console.log(`\nFound ${checkResult.rows.length} SCSB document(s):`);
        checkResult.rows.forEach((row, idx) => {
            console.log(`  ${idx + 1}. [${row.doc_id}] ${row.title}`);
        });

        if (checkResult.rows.length === 0) {
            console.log('\n✓ No SCSB documents found in database. Nothing to clean up.');
            return;
        }

        // Delete them
        console.log('\nDeleting SCSB documents...');
        const deleteResult = await client.query(
            "DELETE FROM documents WHERE LOWER(title) LIKE '%branches of self certified syndicate banks%' OR LOWER(title) LIKE '%scsb%'"
        );

        console.log(`\n✓ Successfully deleted ${deleteResult.rowCount} SCSB document(s).\n`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

cleanupSCSBDocuments();
