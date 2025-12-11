const NseService = require('./services/NseService');

async function testFetch() {
    try {
        // Using the user's example
        const url = 'https://www.nseindia.com/api/ipo-detail?symbol=PARKHOSPS&series=EQ';
        // Note: PARKHOSPS might not be active, if it fails I'll try a generic one if I can find one from the list.
        // But let's try this first.

        console.log(`Fetching ${url}...`);
        const data = await NseService.fetchData(url);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testFetch();
