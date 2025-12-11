const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
