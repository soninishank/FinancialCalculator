const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const NseService = require('./services/NseService');

// Mock data
const mockDataPath = path.join(__dirname, '../temp_detail.json');
let fileContent = fs.readFileSync(mockDataPath, 'utf8');
const jsonStartIndex = fileContent.indexOf('{');
if (jsonStartIndex !== -1) {
    fileContent = fileContent.substring(jsonStartIndex);
}
const mockData = JSON.parse(fileContent);

// Mock fetchData
NseService.fetchData = async (url) => {
    console.log('Mock Fetch called for:', url);
    return mockData;
};

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function runVerify() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Ensure IPO exists
        console.log('Upserting IPO...');
        // We need an object that looks like the list item for upsertIpo, 
        // OR we just manually insert.
        // Let's manually insert to be sure.
        const symbol = 'PARKHOSPS';
        await client.query(`
            INSERT INTO ipo (symbol, company_name, status) VALUES ($1, $2, 'open')
            ON CONFLICT (ipo_id) DO NOTHING -- wait, conflict is on PK, not symbol?
            -- Schema has index on symbol, but no unique constraint explicitly defined in CREATE TABLE snippet?
            -- Wait, typically symbol should be unique.
            -- Let's check if exists
        `, [symbol, 'Park Medi World Limited']);

        // Check if exists first
        let ipoIdRes = await client.query('SELECT ipo_id FROM ipo WHERE symbol=$1', [symbol]);
        let ipoId;
        if (ipoIdRes.rows.length === 0) {
            const ins = await client.query("INSERT INTO ipo (symbol, company_name, status) VALUES ($1, $2, 'open') RETURNING ipo_id", [symbol, 'Park Medi World Limited']);
            ipoId = ins.rows[0].ipo_id;
            console.log('Inserted new IPO for test.');
        } else {
            ipoId = ipoIdRes.rows[0].ipo_id;
            console.log('Using existing IPO for test.');
        }
        console.log('IPO ID:', ipoId);

        // Run Logic
        console.log('Running fetchAndStoreIpoDetails...');
        await NseService.fetchAndStoreIpoDetails(symbol, 'EQ', ipoId, client);

        // Verify Bidding Data
        const biddingRes = await client.query('SELECT * FROM bidding_data WHERE ipo_id=$1', [ipoId]);
        console.log(`Bidding Rows: ${biddingRes.rows.length}`);
        if (biddingRes.rows.length > 0) {
            console.log('Sample Row:', biddingRes.rows[0]);
        } else {
            console.error('FAILED: No bidding data stored.');
        }

        // Verify Subscription Data
        const subRes = await client.query('SELECT * FROM subscription_summary WHERE ipo_id=$1', [ipoId]);
        console.log(`Subscription Rows: ${subRes.rows.length}`);
        if (subRes.rows.length > 0) {
            console.log('Sample Subscription:', subRes.rows[0]);
            // Check for specific category
            const qib = subRes.rows.find(r => r.category && r.category.includes('Qualified Institutional Buyers'));
            if (qib) console.log('Found QIB:', qib);
            else console.log('Warning: QIB category not found (might be different name or empty in mock)');
        } else {
            console.error('FAILED: No subscription data stored.');
        }

        // Verify Document Filtering
        const docRes = await client.query('SELECT title FROM documents WHERE ipo_id=$1', [ipoId]);
        const titles = docRes.rows.map(r => r.title);
        console.log('Documents stored:', titles);

        const unwanted = [
            "Video link for UPI based ASBA process",
            "Video link for BHIM UPI Registration",
            "List of mobile applications accepting UPI as Payment Option",
            "Processing of ASBA Applications"
        ];

        const foundUnwanted = titles.filter(t => unwanted.some(u => t.includes(u)));
        if (foundUnwanted.length > 0) {
            console.error('FAILED: Unwanted documents found:', foundUnwanted);
        } else {
            console.log('SUCCESS: Unwanted documents filtered out.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

runVerify();
