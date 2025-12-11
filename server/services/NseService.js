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

            // 3. Subscription
            // Use 'activeCat' or 'bidDetails'
            const subData = data.activeCat?.dataList || data.bidDetails;

            if (subData && Array.isArray(subData)) {
                // Clear old
                await client.query('DELETE FROM subscription_summary WHERE ipo_id = $1', [ipoId]);

                for (const item of subData) {
                    // Filter out headers/totals if needed, though they might be useful.
                    // Headers usually don't have 'noOfSharesBid'.
                    if (!item.noOfSharesBid) continue;

                    let category = item.category;
                    const sharesOffered = item.noOfSharesOffered ? (parseFloat(item.noOfSharesOffered) || 0) : 0; // offered can be empty string
                    const sharesBid = parseFloat(item.noOfSharesBid) || 0;
                    const ratio = item.noOfTime ? (parseFloat(item.noOfTime) || 0) : 0; // noOfTime might be empty or "0.0"

                    // Use category name directly (schema constraint removed)
                    // or map if we want standardization. Let's keep verbose for now as requested ("QIBs", etc).
                    // NSE data: "Qualified Institutional Buyers(QIBs)", "Retail Individual Investors(RIIs)"

                    // Some items are sub-totals like "Total". We can include them or flag them.
                    // Let's store everything that looks like data.

                    await client.query(`
                        INSERT INTO subscription_summary (ipo_id, category, shares_offered, shares_bid, subscription_ratio, updated_at)
                        VALUES ($1, $2, $3, $4, $5, NOW())
                    `, [ipoId, category, sharesOffered, sharesBid, ratio]);
                }
            } else if (item.noOfTime) {
                // Fallback to the brief summary found in list api if detailed not available
                const sharesOffered = parseFloat(item.noOfSharesOffered) || 0;
                const sharesBid = parseFloat(item.noOfsharesBid) || 0;
                const ratio = parseFloat(item.noOfTime) || 0;
                const subCategory = 'Others';

                // Check if we already inserted detailed data above? 
                // Wait, 'item' here is from the list loop (upsertIpo arguments).
                // 'subData' is from fetchAndStoreIpoDetails (data variable).
                // Ah, this block is inside upsertIpo? 
                // NO, wait.
                // The REPLACE block I am targeting is inside `upsertIpo`.
                // BUT `fetchAndStoreIpoDetails` also needs this logic. 
                // `upsertIpo` handles the LIST api response. 
                // `fetchAndStoreIpoDetails` handles the DETAIL api response.

                // Detailed sub data is ONLY available in `fetchAndStoreIpoDetails` (detail API).
                // The block I selected (lines 156-169) is inside `upsertIpo`.
                // The user wants detailed data. `upsertIpo` only sees brief data.

                // So I should keep `upsertIpo` as is (or basic), and put the extensive logic in `fetchAndStoreIpoDetails`.
                // The instructions said "Replace generic subscription parsing...".
                // I will add the logic to `fetchAndStoreIpoDetails` instad.
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

            // 1. Parsing Logic
            // Parse Issue Size for breakdown
            const issueSizeStr = findVal("Issue Size") || "";
            // Example: "Initial Public Offer comprising Fresh Issue up to Rs. 7700 million and Offer for Sale up to Rs. 1500 million..."

            const extractAmount = (text, key) => {
                // Look for "Key... Rs. <Amount> <Unit>?"
                // Regex: Find 'key' then search ahead for 'Rs.' then digits
                const regex = new RegExp(`${key}.*?Rs\\.\\s*([\\d,]+\\.?\\d*)\\s*(million|crore|lakh)?`, 'i');
                const match = text.match(regex);
                if (match) {
                    let amount = parseFloat(match[1].replace(/,/g, ''));
                    const unit = match[2] ? match[2].toLowerCase() : '';

                    // Convert to absolute INR using unit
                    if (unit === 'million') amount *= 1000000;
                    else if (unit === 'crore') amount *= 10000000;
                    else if (unit === 'lakh') amount *= 100000;

                    return amount;
                }
                return 0;
            };

            const freshIssueSize = extractAmount(issueSizeStr, "Fresh Issue");
            const ofsSize = extractAmount(issueSizeStr, "Offer for Sale");

            // Parse Other Fields
            const fvStr = findVal("Face Value");
            const faceValue = parsePrice(fvStr);

            const tickStr = findVal("Tick Size");
            const tickSize = parsePrice(tickStr);

            const bidLotStr = findVal("Bid Lot");
            const bidLotMatch = bidLotStr ? bidLotStr.match(/^(\d+)/) : null;
            const bidLot = bidLotMatch ? parseInt(bidLotMatch[1]) : null;

            const minQtyStr = findVal("Minimum Order Quantity");
            const minQtyMatch = minQtyStr ? minQtyStr.match(/^(\d+)/) : null;
            const minOrderQty = minQtyMatch ? parseInt(minQtyMatch[1]) : null;

            const maxRetStr = findVal("Maximum Subscription Amount for Retail Investor");
            const maxRetailAmount = parsePrice(maxRetStr);

            const brlm = findVal("Book Running Lead Managers");

            // Update IPO Table
            await client.query(`
                UPDATE ipo SET
                    face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                    max_retail_amount = $5, book_running_lead_managers = $6, 
                    fresh_issue_size = $7, offer_for_sale_size = $8,
                    updated_at = NOW()
                WHERE ipo_id = $9
            `, [faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm, freshIssueSize, ofsSize, ipoId]);


            // 2. Registrar
            const regName = findVal("Name of the Registrar");
            const regAddress = findVal("Address of the Registrar");
            const regContactRaw = findVal("Contact person name number and Email id");

            let regPerson = null, regEmail = null, regPhone = null;
            if (regContactRaw) {
                const emailMatch = regContactRaw.match(/E-mail:\s*([^\s,]+)/i);
                if (emailMatch) regEmail = emailMatch[1];

                const phoneMatch = regContactRaw.match(/\+[\d\s\-]+/);
                if (phoneMatch) regPhone = phoneMatch[0].trim();

                const parts = regContactRaw.split(',');
                if (parts.length > 0) regPerson = parts[0].trim();
            }

            let registrarId = null;
            if (regName) {
                const regRes = await client.query('SELECT registrar_id FROM registrar WHERE name = $1', [regName]);
                if (regRes.rows.length > 0) {
                    registrarId = regRes.rows[0].registrar_id;
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
                await client.query('UPDATE ipo SET primary_registrar_id = $1 WHERE ipo_id = $2', [registrarId, ipoId]);
            }

            // 3. Subscription (Detailed)
            const subData = data.activeCat?.dataList || data.bidDetails;
            if (subData && Array.isArray(subData)) {

                await client.query('DELETE FROM subscription_summary WHERE ipo_id = $1', [ipoId]);

                for (const item of subData) {
                    const getVal = (k1, k2, k3) => item[k1] || item[k2] || item[k3];

                    let category = item.category;

                    const sharesOfferedStr = getVal('noOfSharesOffered', 'noOfShareOffered', 'noOfSharesReserved');
                    const sharesBidStr = getVal('noOfsharesBid', 'noOfSharesBid', 'noOfSharesApplied');
                    const ratioStr = getVal('noOfTime', 'noOfTotalMeant', 'timesSubscribed');

                    const sharesOffered = sharesOfferedStr ? (parseFloat(sharesOfferedStr.toString().replace(/,/g, '')) || 0) : 0;
                    const sharesBid = sharesBidStr ? (parseFloat(sharesBidStr.toString().replace(/,/g, '')) || 0) : 0;
                    const ratio = ratioStr ? (parseFloat(ratioStr.toString().replace(/,/g, '')) || 0) : 0;

                    // Ensure we capture all categories
                    await client.query(`
                        INSERT INTO subscription_summary (ipo_id, category, shares_offered, shares_bid, subscription_ratio, updated_at)
                        VALUES ($1, $2, $3, $4, $5, NOW())
                    `, [ipoId, category, sharesOffered, sharesBid, ratio]);
                }
            }

            // 4. Documents
            const docMap = {
                'Red Herring Prospectus': 'RHP',
                'Sample Application Forms': 'Sample_Form',
                'Bidding Centers': 'Bidding_Centres',
                'Security Parameters': 'Security_Parameters',
                'Anchor Allocation Report': 'Anchor_Report'
            };

            const unwantedTitles = [
                "Video link",
                "List of mobile applications",
                "Processing of ASBA"
            ];

            for (const d of dataList) {
                if (!d.title || !d.value) continue;
                if (unwantedTitles.some(u => d.title.includes(u))) continue;

                let url = d.value;
                if (url.includes('<a href=')) {
                    const match = url.match(/href=([^ >]+)/);
                    if (match) url = match[1];
                }

                let docType = 'Other';
                for (const [key, val] of Object.entries(docMap)) {
                    if (d.title.includes(key)) docType = val;
                }

                if (url.startsWith('http') || (url.endsWith('.zip') || url.endsWith('.pdf'))) {
                    const checkDoc = await client.query('SELECT doc_id FROM documents WHERE ipo_id=$1 AND title=$2', [ipoId, d.title]);
                    if (checkDoc.rows.length === 0) {
                        await client.query(`
                            INSERT INTO documents (ipo_id, doc_type, title, url) VALUES ($1, $2, $3, $4)
                        `, [ipoId, docType, d.title, url]);
                    }
                }
            }

            // 4. Bidding Data (Demand Graph)
            const graphData = data.demandGraphALL || data.demandGraph;
            const plotData = graphData ? graphData.plotData : null;

            if (plotData) {
                await client.query('DELETE FROM bidding_data WHERE ipo_id=$1', [ipoId]);

                for (const [priceKey, qtyStr] of Object.entries(plotData)) {
                    const cleanQty = qtyStr.replace(/,/g, '');
                    const qty = parseInt(cleanQty, 10);

                    if (!isNaN(qty)) {
                        let priceVal = null;
                        const priceNum = parseFloat(priceKey);
                        if (!isNaN(priceNum)) priceVal = priceNum;

                        await client.query(`
                            INSERT INTO bidding_data (ipo_id, price_label, price_value, cumulative_quantity)
                            VALUES ($1, $2, $3, $4)
                        `, [ipoId, priceKey, priceVal, qty]);
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
