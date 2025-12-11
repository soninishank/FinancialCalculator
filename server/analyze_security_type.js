const puppeteer = require('puppeteer');

async function analyze() {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"], headless: "new" });
    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Safari/537.36");
        await page.goto('https://www.nseindia.com', { waitUntil: 'networkidle2' });
        const data = await page.evaluate(async () => {
            const r = await fetch('https://www.nseindia.com/api/public-past-issues');
            const j = await r.json();
            const counts = {};
            j.forEach(i => {
                const s = i.securityType || 'NULL';
                counts[s] = (counts[s] || 0) + 1;
            });
            return counts;
        });
        console.log('SecurityType Counts:', data);
    } catch (e) { console.error(e); } finally { await browser.close(); }
}
analyze();
