# Using a real browser to debug the NSE IPO page structure
# We want to confirm the column indices.

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Safari/537.36");
        await page.goto('https://www.nseindia.com/market-data/all-upcoming-issues-ipo', { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract headers
        const headers = await page.$$eval('table thead th', ths => ths.map(th => th.innerText.trim()));
        console.log('Headers:', headers);

        // Extract first row
        const firstRow = await page.$$eval('table tbody tr:first-child td', tds => tds.map(td => td.innerText.trim()));
        console.log('First Row:', firstRow);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
