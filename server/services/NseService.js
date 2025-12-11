const puppeteer = require('puppeteer');
const { Client } = require('pg');

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Helper to parse dates like "10-Dec-2025" or "10-DEC-2025"
function parseDate(dateStr) {
    if (!dateStr || dateStr === '-') return null;
    const cleanStr = dateStr.trim();
    const date = new Date(cleanStr);
    return isNaN(date.getTime()) ? null : date;
}

// Helper to clean number strings "Rs.154" -> 154
function parsePrice(priceStr) {
    if (!priceStr || priceStr === '-') return null;
    const clean = priceStr.replace(/Rs\.|,|\s/gi, '');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
}

// Helper to parse "Rs.154 to Rs.162" -> { low, high }
function parsePriceRange(rangeStr) {
    if (!rangeStr || rangeStr === '-') return { low: null, high: null };
    if (!rangeStr.toLowerCase().includes('to')) {
        const p = parsePrice(rangeStr);
        return { low: p, high: p };
    }
    const parts = rangeStr.toLowerCase().split('to');
    return {
        low: parsePrice(parts[0]),
        high: parsePrice(parts[1])
    };
}

class NseService {
    async fetchData(url) {
        console.log(`Fetching ${url}...`);
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: "new"
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Safari/537.36"
            );

            // Navigate to home to set cookies/headers
            await page.goto('https://www.nseindia.com', { waitUntil: 'networkidle2' });

            const data = await page.evaluate(async (apiUrl) => {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            }, url);

            return data;
        } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            throw err;
        } finally {
            await browser.close();
        }
    }

    async upsertIpo(client, item, category) {
        // Normalization Logic
        let symbol = item.symbol;
        let companyName = item.companyName || item.company; // 'company' in past issues

        // Dates
        let issueStart, issueEnd, listingDate;

        if (category === 'current' || category === 'upcoming') {
            issueStart = parseDate(item.issueStartDate);
            issueEnd = parseDate(item.issueEndDate);
            listingDate = null; // Usually null for current/upcoming
        } else if (category === 'past') {
            issueStart = parseDate(item.ipoStartDate);
            issueEnd = parseDate(item.ipoEndDate);
            listingDate = parseDate(item.listingDate);
        }

        // Type
        const rawType = item.series || item.securityType || item.issueType || 'EQ';
        const finalType = (rawType === 'SME' || rawType === 'SM') ? 'SME' : 'Equity';

        // Price
        let priceRangeStr = item.issuePrice || item.priceBand || item.priceRange;
        const priceRange = parsePriceRange(priceRangeStr);

        // Size
        const issueSizeShares = parseFloat(item.issueSize); // Might be NaN if missing

        // Determine Status based on dates if category is not definitive or needs refinement
        const now = new Date();
        let status = 'closed';

        if (listingDate) {
            status = 'listed';
        } else if (issueEnd && now > issueEnd) {
            status = 'closed';
        } else if (issueStart && now < issueStart) {
            status = 'upcoming';
        } else if (category === 'current' || (issueStart && issueEnd && now >= issueStart && now <= issueEnd)) {
            status = 'open';
        }

        // Override if NSE explicitly says something useful, but date logic is usually safer for "open/closed".
        // NSE 'status' field: 'Active', 'Forthcoming', 'Closed', 'Withdraw'
        if (item.status === 'Forthcoming') status = 'upcoming';


        try {
            // 1. Check if IPO exists
            const checkRes = await client.query('SELECT ipo_id FROM ipo WHERE symbol = $1', [symbol]);
            let ipoId;

            if (checkRes.rows.length > 0) {
                ipoId = checkRes.rows[0].ipo_id;
                // Update
                await client.query(`
                    UPDATE ipo SET 
                        company_name = $1, status = $2, price_range_low = $3, price_range_high = $4, 
                        issue_size = $5, issue_type = $6, updated_at = NOW()
                    WHERE ipo_id = $7
                `, [companyName, status, priceRange.low, priceRange.high, issueSizeShares || 0, finalType, ipoId]);
            } else {
                // Insert
                const insertRes = await client.query(`
                    INSERT INTO ipo (symbol, company_name, status, price_range_low, price_range_high, issue_size, issue_type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING ipo_id
                `, [symbol, companyName, status, priceRange.low, priceRange.high, issueSizeShares || 0, finalType]);
                ipoId = insertRes.rows[0].ipo_id;
            }

            // 2. Update Dates
            const dateCheck = await client.query('SELECT ipo_date_id FROM ipo_dates WHERE ipo_id = $1', [ipoId]);
            if (dateCheck.rows.length > 0) {
                await client.query(`
                    UPDATE ipo_dates SET issue_start = $1, issue_end = $2, listing_date = $3 WHERE ipo_id = $4
                `, [issueStart, issueEnd, listingDate, ipoId]);
            } else {
                await client.query(`
                    INSERT INTO ipo_dates (ipo_id, issue_start, issue_end, listing_date) VALUES ($1, $2, $3, $4)
                `, [ipoId, issueStart, issueEnd, listingDate]);
            }

            // 3. Subscription (Optional, if exists in item)
            // item.noOfSharesOffered, item.noOfsharesBid, item.noOfTime
            if (item.noOfTime) {
                const sharesOffered = parseFloat(item.noOfSharesOffered) || 0;
                const sharesBid = parseFloat(item.noOfsharesBid) || 0;
                const ratio = parseFloat(item.noOfTime) || 0;
                const subCategory = 'Others'; // Defaulting as we don't have breakdown here usually

                await client.query('DELETE FROM subscription_summary WHERE ipo_id = $1 AND category = $2', [ipoId, subCategory]);
                await client.query(`
                    INSERT INTO subscription_summary (ipo_id, category, shares_offered, shares_bid, subscription_ratio, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                 `, [ipoId, subCategory, sharesOffered, sharesBid, ratio]);
            }

        } catch (err) {
            console.error(`Error upserting ${symbol}:`, err);
        }
    }

    async syncAllIPOs() {
        const client = new Client({ connectionString: CONNECTION_STRING });
        try {
            await client.connect();
            console.log('Connected to DB for Sync');

            // 1. Current
            const current = await this.fetchData('https://www.nseindia.com/api/ipo-current-issue');
            console.log(`Processing ${current.length} current issues...`);
            for (const item of current) await this.upsertIpo(client, item, 'current');

            // 2. Upcoming
            const upcoming = await this.fetchData('https://www.nseindia.com/api/all-upcoming-issues?category=ipo');
            console.log(`Processing ${upcoming.length} upcoming issues...`);
            for (const item of upcoming) await this.upsertIpo(client, item, 'upcoming');

            // 3. Past
            const past = await this.fetchData('https://www.nseindia.com/api/public-past-issues');
            console.log(`Processing ${past.length} past issues...`);
            for (const item of past) await this.upsertIpo(client, item, 'past');

            console.log('Sync Complete.');
            return { success: true, counts: { current: current.length, upcoming: upcoming.length, past: past.length } };

        } catch (err) {
            console.error('Sync failed:', err);
            return { success: false, error: err.message };
        } finally {
            await client.end();
        }
    }
}

module.exports = new NseService();
