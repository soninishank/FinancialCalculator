const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function cleanUpDocuments() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const unwantedPatterns = [
            '%Video link%',
            '%List of mobile applications%',
            '%Processing of ASBA%'
        ];

        for (const pattern of unwantedPatterns) {
            const res = await client.query('DELETE FROM documents WHERE title LIKE $1 RETURNING title', [pattern]);
            console.log(`Deleted ${res.rowCount} rows matching '${pattern}':`);
            res.rows.forEach(r => console.log(` - ${r.title}`));
        }

    } catch (err) {
        console.error('Error cleaning up:', err);
    } finally {
        await client.end();
    }
}

cleanUpDocuments();
