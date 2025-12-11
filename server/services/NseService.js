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

        let series = 'EQ';
        if (item.series) series = item.series;
        else if (rawType === 'SME' || rawType === 'SM') series = 'SME';

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
                        issue_size = $5, issue_type = $6, series = $7, updated_at = NOW()
                    WHERE ipo_id = $8
                `, [companyName, status, priceRange.low, priceRange.high, issueSizeShares || 0, finalType, series, ipoId]);
            } else {
                // Insert
                const insertRes = await client.query(`
                    INSERT INTO ipo (symbol, company_name, status, price_range_low, price_range_high, issue_size, issue_type, series)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING ipo_id
                `, [symbol, companyName, status, priceRange.low, priceRange.high, issueSizeShares || 0, finalType, series]);
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

    async fetchAndStoreIpoDetails(symbol, series, ipoId, client) {
        console.log(`Fetching details for ${symbol} (${series})`);
        const url = `https://www.nseindia.com/api/ipo-detail?symbol=${encodeURIComponent(symbol)}&series=${encodeURIComponent(series)}`;

        try {
            const data = await this.fetchData(url);
            if (!data) return null;

            // Extract useful info from "issueInfo.dataList"
            const dataList = data.issueInfo?.dataList || [];

            // Helper to find value by title
            const findVal = (titleFragment) => {
                const item = dataList.find(d => d.title && d.title.toLowerCase().includes(titleFragment.toLowerCase()));
                return item ? item.value : null;
            };

            // 1. Parse fields for IPO table
            // Face Value
            const fvStr = findVal("Face Value"); // "Rs.2 per Equity Share"
            const faceValue = parsePrice(fvStr);

            // Tick Size
            const tickStr = findVal("Tick Size"); // "Re.1"
            const tickSize = parsePrice(tickStr);

            // Bid Lot
            const bidLotStr = findVal("Bid Lot"); // "92 Equity shares..."
            const bidLotMatch = bidLotStr ? bidLotStr.match(/^(\d+)/) : null;
            const bidLot = bidLotMatch ? parseInt(bidLotMatch[1]) : null;

            // Min Order Qty
            const minQtyStr = findVal("Minimum Order Quantity");
            const minQtyMatch = minQtyStr ? minQtyStr.match(/^(\d+)/) : null;
            const minOrderQty = minQtyMatch ? parseInt(minQtyMatch[1]) : null;

            // Max Retail Amount
            const maxRetStr = findVal("Maximum Subscription Amount for Retail Investor"); // "\"Rs. 2,00,000\""
            const maxRetailAmount = parsePrice(maxRetStr);

            // BRLM
            const brlm = findVal("Book Running Lead Managers");

            // Update IPO Table
            await client.query(`
                UPDATE ipo SET
                    face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                    max_retail_amount = $5, book_running_lead_managers = $6, updated_at = NOW()
                WHERE ipo_id = $7
            `, [faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm, ipoId]);


            // 2. Registrar
            const regName = findVal("Name of the Registrar");
            const regAddress = findVal("Address of the Registrar");
            const regContactRaw = findVal("Contact person name number and Email id");

            // Basic parsing for registrar contact
            let regPerson = null, regEmail = null, regPhone = null;
            if (regContactRaw) {
                // "M. Murali Krishna, + 91 40 6716 2222 , E-mail: parkmedi.ipo@kfintech.com"

                // Extract Email
                const emailMatch = regContactRaw.match(/E-mail:\s*([^\s,]+)/i);
                if (emailMatch) regEmail = emailMatch[1];

                // Extract Phone (simple heuristic)
                const phoneMatch = regContactRaw.match(/\+[\d\s\-]+/);
                if (phoneMatch) regPhone = phoneMatch[0].trim();

                // Name (start of string)
                const parts = regContactRaw.split(',');
                if (parts.length > 0) regPerson = parts[0].trim();
            }

            // Upsert Registrar
            // We use Name as unique key for simplicity here, or we can just always insert. 
            // Better to check if exists by name.
            let registrarId = null;
            if (regName) {
                const regRes = await client.query('SELECT registrar_id FROM registrar WHERE name = $1', [regName]);
                if (regRes.rows.length > 0) {
                    registrarId = regRes.rows[0].registrar_id;
                    // Update contact info if missing? Let's just update.
                    await client.query(`
                        UPDATE registrar SET address=$1, contact_person=$2, phone=$3, email=$4 WHERE registrar_id=$5
                    `, [regAddress, regPerson, regPhone, regEmail, registrarId]);
                } else {
                    const insReg = await client.query(`
                        INSERT INTO registrar (name, address, contact_person, phone, email) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING registrar_id
                    `, [regName, regAddress, regPerson, regPhone, regEmail]);
                    registrarId = insReg.rows[0].registrar_id;
                }

                // Link to IPO
                await client.query('UPDATE ipo SET primary_registrar_id = $1 WHERE ipo_id = $2', [registrarId, ipoId]);
            }

            // 3. Documents
            // Map known documents from dataList
            const docMap = {
                'Red Herring Prospectus': 'RHP',
                'Sample Application Forms': 'Sample_Form',
                'Bidding Centers': 'Bidding_Centres',
                'Security Parameters': 'Security_Parameters', // partial match
                'Anchor Allocation Report': 'Anchor_Report'
            };

            for (const d of dataList) {
                if (!d.title || !d.value) continue;
                let url = d.value;
                if (url.includes('<a href=')) {
                    const match = url.match(/href=([^ >]+)/);
                    if (match) url = match[1];
                }

                // Determine Type
                let docType = 'Other';
                for (const [key, val] of Object.entries(docMap)) {
                    if (d.title.includes(key)) docType = val;
                }

                // Should we save every link? Maybe just the important ones.
                // If it's a URL, save it.
                if (url.startsWith('http') || (url.endsWith('.zip') || url.endsWith('.pdf'))) {
                    // Check existing
                    const checkDoc = await client.query('SELECT doc_id FROM documents WHERE ipo_id=$1 AND title=$2', [ipoId, d.title]);
                    if (checkDoc.rows.length === 0) {
                        await client.query(`
                            INSERT INTO documents (ipo_id, doc_type, title, url) VALUES ($1, $2, $3, $4)
                        `, [ipoId, docType, d.title, url]);
                    }
                }
            }

            return { ipoId, detailsFetched: true };

        } catch (err) {
            console.error(`Error fetching details for ${symbol}:`, err);
            return null;
        }
    }
}

module.exports = new NseService();
