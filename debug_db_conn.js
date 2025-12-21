const { Client } = require('pg');

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
    console.log('Testing connection to Neon DB...');
    const client = new Client({
        connectionString: CONNECTION_STRING,
        connectionTimeoutMillis: 10000,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Connection Successful!');
        console.log('Server Time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('Connection Failed:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.error('Hint: Check your credentials.');
        } else if (err.message.includes('timeout')) {
            console.error('Hint: The database might be sleeping (cold start). Try again in a few seconds.');
        }
    }
}

testConnection();
