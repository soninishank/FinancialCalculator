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
        // Randomize user agent slightly to look unique if needed, but standard modern is safer.
        const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

        const MAX_RETRIES = 3;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
            attempt++;
            console.log(`Fetching ${url} (Attempt ${attempt}/${MAX_RETRIES})...`);

            const browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                headless: "new"
            });

            try {
                const page = await browser.newPage();
                await page.setUserAgent(USER_AGENT);

                // Add extra headers
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Referer': 'https://www.nseindia.com/'
                });

                // 1. Visit Homepage first to set cookies
                await page.goto('https://www.nseindia.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

                // 2. Random Delay (1s - 3s)
                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(r => setTimeout(r, delay));

                // 3. Navigate to API URL directly
                console.log(`Navigating to ${url}...`);
                const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                console.log(`Navigation complete. Status: ${response.status()}`);
                const status = response.status();

                if (status === 200) {
                    // Success: Extract JSON from body
                    // Sometimes API returns HTML error page even with 200, but usually 503/403 for blocks.
                    const text = await response.text();
                    try {
                        const data = JSON.parse(text);
                        return data;
                    } catch (e) {
                        // Check if HTML
                        if (text.includes('<!DOCTYPE html>')) {
                            throw new Error('Received HTML instead of JSON (Soft Block)');
                        }
                        throw e;
                    }
                } else if (status === 503 || status === 403) {
                    console.warn(`Attempt ${attempt} blocked: Status ${status}`);
                    // Exponential backoff or just continue to retry
                    if (attempt < MAX_RETRIES) {
                        // Wait longer before retry
                        await new Promise(r => setTimeout(r, 2000 * attempt));
                        continue;
                    } else {
                        throw new Error(`HTTP error! status: ${status}`);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${status}`);
                }

            } catch (err) {
                console.error(`Error fetching ${url} (Attempt ${attempt}):`, err.message);
                if (attempt >= MAX_RETRIES) throw err;
                // Wait before retry
                await new Promise(r => setTimeout(r, 2000));
            } finally {
                await browser.close();
            }
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
                        issue_size = CASE WHEN fresh_issue_size IS NOT NULL THEN (fresh_issue_size + COALESCE(offer_for_sale_size, 0)) ELSE $5 END, 
                        issue_type = $6, series = $7, updated_at = NOW()
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

            // 3. Subscription (Legacy/Brief) - REMOVED
            // The list API does not provide detailed breakdown reliably.
            // Detailed subscription logic is handled in fetchAndStoreIpoDetails (using 'bidDetails').
            // We just clear the old summary table if needed, or leave it be.
            // Actually, best to do nothing here regarding subscription to avoid conflicts/errors.

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

            // Helper to parse Price Band
            const priceBandStr = findVal("Price Band") || findVal("Price Range") || "";
            // We want the HIGHER price for calculation safety
            const parseHighPrice = (str) => {
                if (!str) return 0;
                // Use exec loop to capture groups correctly
                const regex = /Rs\.?\s*([\d,]+\.?\d*)/gi;
                let match;
                let lastVal = 0;
                while ((match = regex.exec(str)) !== null) {
                    lastVal = parseFloat(match[1].replace(/,/g, ''));
                }
                return lastVal;
            };
            const priceHigh = parseHighPrice(priceBandStr);

            const extractAmount = (text, key) => {
                // Regex: Find 'key' then search ahead for 'Rs.' or 'Re.' 
                // Enhanced to handle "upto" case-insensitive and spacing
                const regex = new RegExp(`${key}.*?(?:Rs\\.|Re\\.|Rs|Re)\\.?\\s*([\\d,]+\\.?\\d*)\\s*(million|crore|lakhs?|Lakhs?)?`, 'i');
                const match = text.match(regex);
                if (match) {
                    // Safety: Check if followed by "Shares"
                    // If text is "Rs. 24,48,649 Equity Shares" -> It is NOT Amount.
                    const fullMatch = match[0];
                    const remaining = text.substring(match.index + fullMatch.length).trim();
                    if (remaining.match(/^(Equity\s*)?Shares/i)) {
                        return 0;
                    }

                    let amount = parseFloat(match[1].replace(/,/g, ''));
                    let unit = match[2] ? match[2].toLowerCase() : '';
                    if (unit.startsWith('lakh')) unit = 'lakh';

                    // Convert to absolute INR using unit
                    if (unit === 'million') amount *= 1000000;
                    else if (unit === 'crore') amount *= 10000000;
                    else if (unit === 'lakh') amount *= 100000;

                    return amount;
                }
                return 0;
            };

            const extractShares = (text, key) => {
                // Enhanced to handle "upto" and loose spacing
                const regex = new RegExp(`${key}.*?(?:upto|up to)?\\s*([\\d,]+)\\s*(?:Equity\\s*)?Shares`, 'i');
                const match = text.match(regex);
                if (match) {
                    return parseInt(match[1].replace(/,/g, ''), 10);
                }
                return 0;
            };

            let freshIssueSize = extractAmount(issueSizeStr, "Fresh Issue");
            if (freshIssueSize === 0 && priceHigh > 0) {
                const shares = extractShares(issueSizeStr, "Fresh Issue");
                if (shares > 0) freshIssueSize = shares * priceHigh;
            }

            let ofsSize = extractAmount(issueSizeStr, "Offer for Sale");
            if (ofsSize === 0 && priceHigh > 0) {
                const shares = extractShares(issueSizeStr, "Offer for Sale");
                if (shares > 0) ofsSize = shares * priceHigh;
            }

            // Calculate Total Issue Size
            let totalIssueSize = freshIssueSize + ofsSize;

            // Fallback: If still 0, try parsing broad "aggregating" amount
            if (totalIssueSize === 0) {
                const aggRegex = /(?:aggregating|aggregating up to|aggregating to)\s*(?:Rs\.|Re\.|Rs|Re)\.?\s*([\d,]+\.?\d*)\s*(million|crore|lakhs?|Lakhs?)?/i;
                const match = issueSizeStr.match(aggRegex);
                if (match) {
                    let amount = parseFloat(match[1].replace(/,/g, ''));
                    let unit = match[2] ? match[2].toLowerCase() : '';
                    if (unit.startsWith('lakh')) unit = 'lakh';
                    if (unit === 'million') amount *= 1000000;
                    else if (unit === 'crore') amount *= 10000000;
                    else if (unit === 'lakh') amount *= 100000;
                    totalIssueSize = amount;
                }
            }

            // Fallback: If still 0 and we have price, try parsing broad "aggregating ... Shares"
            // Handles "Initial Public Offer of upto 47,71,200 Equity Shares"
            if (totalIssueSize === 0 && priceHigh > 0) {
                // 1. Broad aggregating shares
                const aggSharesRegex = /(?:aggregating|aggregating up to|aggregating to).*?([\d,]+)\s*(?:Equity\s*)?Shares/i;
                const match = issueSizeStr.match(aggSharesRegex);
                if (match) {
                    const shares = parseInt(match[1].replace(/,/g, ''), 10);
                    totalIssueSize = shares * priceHigh;
                }

                // 2. Direct "Offer of upto X Shares" (Common in SME)
                // "Initial Public Offer of upto 47,71,200 Equity Shares"
                if (totalIssueSize === 0) {
                    const directOfferRegex = /Offer\s+of\s+(?:upto|up\s*to)?\s*([\d,]+)\s*(?:Equity\s*)?Shares/i;
                    const directMatch = issueSizeStr.match(directOfferRegex);
                    if (directMatch) {
                        const shares = parseInt(directMatch[1].replace(/,/g, ''), 10);
                        totalIssueSize = shares * priceHigh;
                    }
                }
            }

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
            // Update issue_size if our calculated total is > 0
            if (totalIssueSize > 0) {
                await client.query(`
                    UPDATE ipo SET
                        face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                        max_retail_amount = $5, book_running_lead_managers = $6, 
                        fresh_issue_size = $7, offer_for_sale_size = $8,
                        issue_size = $9,
                        updated_at = NOW()
                    WHERE ipo_id = $10
                `, [faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm, freshIssueSize, ofsSize, totalIssueSize, ipoId]);
            } else {
                // Keep existing issue_size but update others
                await client.query(`
                    UPDATE ipo SET
                        face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                        max_retail_amount = $5, book_running_lead_managers = $6, 
                        fresh_issue_size = $7, offer_for_sale_size = $8,
                        updated_at = NOW()
                    WHERE ipo_id = $9
                `, [faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm, freshIssueSize, ofsSize, ipoId]);
            }


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
            // 3. Subscription (Detailed) - New Table
            const subData = data.activeCat?.dataList || data.bidDetails;
            if (subData && Array.isArray(subData)) {

                try {
                    await client.query('BEGIN');
                    await client.query('DELETE FROM ipo_bidding_details WHERE ipo_id = $1', [ipoId]);

                    // Buckets for Hierarchy Handling
                    // key: 'QIB' | 'NII' | 'RII' | ... -> { parent: null, children: [] }
                    // We will determine 'Parent' vs 'Child' based on sr_no
                    const bucketMap = new Map();
                    const allowed = ['QIB', 'NII', 'RII', 'Employees', 'Total', 'Shareholders'];
                    allowed.forEach(c => bucketMap.set(c, { parent: null, children: [] }));

                    for (const item of subData) {
                        const getVal = (k1, k2, k3) => item[k1] || item[k2] || item[k3];

                        let rawCategory = item.category || "";
                        let srNo = item.srNo || item.sr_no || ""; // Get Serial Number
                        let cleanCategory = null;

                        // Identification
                        if (rawCategory.includes("Qualified Institutional")) cleanCategory = "QIB";
                        else if (rawCategory.includes("Non Institutional")) cleanCategory = "NII";
                        else if (rawCategory.includes("Retail Individual")) cleanCategory = "RII";
                        else if (rawCategory.includes("Employee")) cleanCategory = "Employees";
                        else if (rawCategory.includes("Total")) cleanCategory = "Total";
                        else if (rawCategory.includes("Shareholder")) cleanCategory = "Shareholders";

                        // Fallback: If cleanCategory is null, try to map based on other clues or skip.
                        // Strict whitelist requested.
                        if (!cleanCategory) continue;

                        const sharesOfferedStr = getVal('noOfSharesOffered', 'noOfShareOffered', 'noOfSharesReserved');
                        const sharesBidStr = getVal('noOfsharesBid', 'noOfSharesBid', 'noOfSharesApplied');

                        // Parse values safely
                        const sharesOffered = sharesOfferedStr ? (parseFloat(sharesOfferedStr.toString().replace(/,/g, '')) || 0) : 0;
                        const sharesBid = sharesBidStr ? (parseFloat(sharesBidStr.toString().replace(/,/g, '')) || 0) : 0;

                        const entry = { offered: sharesOffered, bid: sharesBid, raw: rawCategory, srNo: srNo };
                        const bucket = bucketMap.get(cleanCategory);

                        // Hierarchy logic using srNo
                        // Example: Parent "2", Children "2.1", "2.2"
                        // Rule: If srNo contains '.', it's a child.
                        const isChild = srNo.includes('.');

                        if (isChild) {
                            bucket.children.push(entry);
                        } else {
                            // It is a parent (or top-level)
                            // If we already have a parent, we might be seeing duplicate rows or split batches. 
                            // But usually unique per category.
                            if (!bucket.parent) {
                                bucket.parent = entry;
                            } else {
                                // If multiple parents found (rare), sum them? Or assume error. 
                                // Let's sum for safety.
                                bucket.parent.offered += sharesOffered;
                                bucket.parent.bid += sharesBid;
                            }
                        }
                    }

                    // Process Buckets
                    for (const [cat, bucket] of bucketMap.entries()) {
                        let finalOffered = 0;
                        let finalBid = 0;
                        let finalSrNo = "";

                        // Rule: Use Parent if exists (and has data), else sum Children.
                        if (bucket.parent && bucket.parent.offered > 0) {
                            finalOffered = bucket.parent.offered;
                            finalBid = bucket.parent.bid;
                            finalSrNo = bucket.parent.srNo;
                        } else if (bucket.children.length > 0) {
                            // Sum children
                            for (const child of bucket.children) {
                                finalOffered += child.offered;
                                finalBid += child.bid;
                                // For srNo, take the integer part of first child? e.g. "2.1" -> "2"
                                if (!finalSrNo && child.srNo) finalSrNo = child.srNo.split('.')[0];
                            }
                        }

                        if (finalOffered === 0) continue; // Skip empty/zero offered

                        const ratio = finalOffered > 0 ? (finalBid / finalOffered) : 0;

                        await client.query(`
                            INSERT INTO ipo_bidding_details (ipo_id, category, sr_no, shares_offered, shares_bid, subscription_ratio, created_at)
                            VALUES ($1, $2, $3, $4, $5, $6, NOW())
                        `, [ipoId, cat, finalSrNo, finalOffered, finalBid, ratio]);
                    }

                    await client.query('COMMIT');
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`Error saving bidding details for ${symbol}:`, err);
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
