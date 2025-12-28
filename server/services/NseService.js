const puppeteer = require('puppeteer');
const { Client } = require('pg');
const subscriptionService = require('./SubscriptionService');
const documentProcessingService = require('./DocumentProcessingService');
const issueSizeExtractor = require('./IssueSizeExtractor');
const ipoUtils = require('../utils/ipoUtils');

require('dotenv').config({ quiet: true });

const CONNECTION_STRING = process.env.DATABASE_URL;

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
            // Fetch attempt

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
                const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
        // Strip time for date-only comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let status = 'closed';

        if (listingDate) {
            status = 'listed';
        } else if (issueEnd) {
            const endDate = new Date(issueEnd);
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            // IPO is closed AFTER issue_end date (not ON the date)
            if (today > endDateOnly) {
                status = 'closed';
            } else if (issueStart) {
                const startDate = new Date(issueStart);
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

                if (today < startDateOnly) {
                    status = 'upcoming';
                } else {
                    // Between start and end date (inclusive)
                    status = 'open';
                }
            } else if (category === 'current') {
                status = 'open';
            }
        } else if (issueStart && now < issueStart) {
            status = 'upcoming';
        } else if (category === 'current') {
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

    async discover() {
        try {
            // 1. Current
            const current = await this.fetchData('https://www.nseindia.com/api/ipo-current-issue');
            const currentList = (current || []).map(item => ({
                exchange: 'NSE',
                symbol: item.symbol,
                company_name: item.companyName,
                status: 'open',
                raw_payload: item
            }));

            // 2. Upcoming
            const upcoming = await this.fetchData('https://www.nseindia.com/api/all-upcoming-issues?category=ipo');
            const upcomingList = (upcoming || []).map(item => ({
                exchange: 'NSE',
                symbol: item.symbol,
                company_name: item.companyName,
                status: 'upcoming',
                raw_payload: item
            }));

            // 3. Past
            const past = await this.fetchData('https://www.nseindia.com/api/public-past-issues');
            const pastList = (past || []).map(item => ({
                exchange: 'NSE',
                symbol: item.symbol,
                company_name: item.companyName || item.company,
                status: 'closed',
                raw_payload: item
            }));

            const allDiscovered = [...currentList, ...upcomingList, ...pastList];
            return allDiscovered;

        } catch (err) {
            console.error('NSE Discovery failed:', err);
            return [];
        }
    }

    async syncAllIPOs() {
        const client = new Client({ connectionString: CONNECTION_STRING });
        try {
            await client.connect();

            const discovered = await this.discover();

            for (const item of discovered) {
                // Determine category for legacy upsert
                let category = 'past';
                if (item.status === 'open') category = 'current';
                if (item.status === 'upcoming') category = 'upcoming';

                await this.upsertIpo(client, item.raw_payload, category);
            }

            return { success: true, counts: { total: discovered.length } };

        } catch (err) {
            console.error('Sync failed:', err);
            return { success: false, error: err.message };
        } finally {
            await client.end();
        }
    }

    async fetchAndStoreIpoDetails(symbol, series, ipoId, client) {
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

            // Parse Issue Size using LLM extractor
            const issueSizeStr = findVal("Issue Size") || "";
            const priceBandStr = findVal("Price Band") || findVal("Price Range") || "";

            // Helper to parse Price Band (get highest price)
            const parseHighPrice = (str) => {
                if (!str) return 0;
                const regex = /Rs\.?\s*([\d,]+\.?\d*)/gi;
                let match;
                let lastVal = 0;
                while ((match = regex.exec(str)) !== null) {
                    lastVal = parseFloat(match[1].replace(/,/g, ''));
                }
                return lastVal;
            };

            // Helper to parse Price Band (get lowest price)
            const parseLowPrice = (str) => {
                if (!str) return 0;
                const regex = /Rs\.?\s*([\d,]+\.?\d*)/gi;
                const match = regex.exec(str);
                if (match) {
                    return parseFloat(match[1].replace(/,/g, ''));
                }
                return 0;
            };

            const priceHigh = parseHighPrice(priceBandStr);
            const priceLow = parseLowPrice(priceBandStr);

            // Use LLM-based extractor
            const parsed = await issueSizeExtractor.extractIssueSize(issueSizeStr, priceHigh);

            // Log extraction info
            if (parsed.warnings.length > 0) {
                // parsed.warnings handling?
            }

            // Parse Other Fields
            const fvStr = findVal("Face Value");
            const faceValue = parsePrice(fvStr);

            const tickStr = findVal("Tick Size");
            const tickSize = parsePrice(tickStr) || 1; // Default to 1 if missing

            const bidLotStr = findVal("Bid Lot") || findVal("Lot Size");
            const bidLotMatch = bidLotStr ? bidLotStr.match(/^(\d+)/) : null;
            const bidLot = bidLotMatch ? parseInt(bidLotMatch[1]) : null;

            const minQtyStr = findVal("Minimum Order Quantity");
            const minQtyMatch = minQtyStr ? minQtyStr.match(/^(\d+)/) : null;
            const minOrderQty = minQtyMatch ? parseInt(minQtyMatch[1]) : null;

            const maxRetStr = findVal("Maximum Subscription Amount for Retail Investor");
            const maxRetailAmount = parsePrice(maxRetStr);

            const brlm = findVal("Book Running Lead Managers");

            // Calculate Minimum Investment using refined common utility
            // For DB storage, we use priceLow to avoid overstating the minimum.
            const minLots = ipoUtils.calculateMinLots(bidLot, priceLow, series);
            const minInvestment = ipoUtils.calculateInvestment(minLots, bidLot, priceLow);

            // Update IPO Table with parsed issue size data
            if (parsed.totalAmount > 0) {
                await client.query(`
                    UPDATE ipo SET
                        face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                        max_retail_amount = $5, book_running_lead_managers = $6,
                        issue_size_raw = $7,
                        fresh_issue_amount = $8,
                        fresh_issue_shares = $9,
                        ofs_amount = $10,
                        ofs_shares = $11,
                        issue_size = $12,
                        issue_size_confidence = $13,
                        issue_size_extraction_model = $14,
                        issue_size_reasoning = $15,
                        min_investment = $16,
                        updated_at = NOW()
                    WHERE ipo_id = $17
                `, [
                    faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm,
                    parsed.raw,
                    parsed.freshIssue.amount,
                    parsed.freshIssue.shares,
                    parsed.offerForSale.amount,
                    parsed.offerForSale.shares,
                    parsed.totalAmount,
                    parsed.confidence,
                    parsed.method,
                    parsed.reasoning,
                    minInvestment,
                    ipoId
                ]);
            } else {
                // Keep existing issue_size but update others
                await client.query(`
                    UPDATE ipo SET
                        face_value = $1, tick_size = $2, bid_lot = $3, min_order_qty = $4, 
                        max_retail_amount = $5, book_running_lead_managers = $6,
                        issue_size_raw = $7,
                        issue_size_confidence = $8,
                        issue_size_extraction_model = $9,
                        issue_size_reasoning = $10,
                        min_investment = $11,
                        updated_at = NOW()
                    WHERE ipo_id = $12
                `, [
                    faceValue, tickSize, bidLot, minOrderQty, maxRetailAmount, brlm,
                    parsed.raw,
                    parsed.confidence,
                    parsed.method,
                    parsed.reasoning,
                    minInvestment,
                    ipoId
                ]);
            }


            // 2. Registrar
            const regName = findVal("Name of the Registrar");
            const regAddress = findVal("Address of the Registrar");
            const regContactRaw = findVal("Contact person name number and Email id");

            let regPerson = null, regEmail = null, regPhone = null;
            if (regContactRaw) {
                // Better email extraction (looks for standard email pattern, with or without E-mail label)
                const emailMatch = regContactRaw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch) regEmail = emailMatch[0];

                // Better phone extraction (look for standard phone number patterns with + and spaces)
                const phoneMatch = regContactRaw.match(/(\+?\d[\d\s\-]{8,20})/);
                if (phoneMatch) regPhone = phoneMatch[0].trim();

                const parts = regContactRaw.split(',');
                if (parts.length > 0) {
                    // Only take the first part if it doesn't look like phone or email
                    const first = parts[0].trim();
                    if (!first.includes('@') && !first.match(/\d/)) {
                        regPerson = first;
                    }
                }
            }

            // Normalization of Registrar Name to avoid duplicates (e.g. from BSE vs NSE or name changes)
            const normalizeRegistrarName = (name) => {
                if (!name) return name;
                // Remove "(Formerly ...)", "(formerly known as ...)", etc.
                let clean = name.replace(/\(formerly.*?\)/i, '').trim();
                // Standardize "Pvt Ltd" vs "Private Limited"
                clean = clean.replace(/Pvt Ltd/gi, 'Private Limited').replace(/Pvt\. Ltd/gi, 'Private Limited');
                // Remove extra spaces
                clean = clean.replace(/\s+/g, ' ').trim();
                return clean;
            };

            const normalizedRegName = normalizeRegistrarName(regName);

            let registrarId = null;
            if (normalizedRegName) {
                const regRes = await client.query('SELECT registrar_id FROM registrar WHERE name = $1', [normalizedRegName]);
                if (regRes.rows.length > 0) {
                    registrarId = regRes.rows[0].registrar_id;
                    // Update only if missing or if we have new substantial info? For now, update always to keep fresh.
                    await client.query(`
                        UPDATE registrar 
                        SET address=COALESCE($1, address), 
                            contact_person=COALESCE($2, contact_person), 
                            phone=COALESCE($3, phone), 
                            email=COALESCE($4, email) 
                        WHERE registrar_id=$5
                    `, [regAddress, regPerson, regPhone, regEmail, registrarId]);
                } else {
                    const insReg = await client.query(`
                        INSERT INTO registrar (name, address, contact_person, phone, email) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING registrar_id
                    `, [normalizedRegName, regAddress, regPerson, regPhone, regEmail]);
                    registrarId = insReg.rows[0].registrar_id;
                }
                await client.query('UPDATE ipo SET primary_registrar_id = $1 WHERE ipo_id = $2', [registrarId, ipoId]);
            }

            // 3. Subscription (Detailed)
            // 3. Subscription (Detailed) - New Table
            const payload = {
                activeCat: data.activeCat,
                bidDetails: data.bidDetails,
                demandGraphALL: data.demandGraphALL,
                totalIssueSize: parsed.totalAmount / 100  // Convert paise to INR
            };
            try {
                await subscriptionService.processExchangeBids(ipoId, payload);
            } catch (err) {
                console.warn(`[NSE Service] Subscription extraction failed for ${symbol}:`, err.message);
            }

            // 4. Documents
            const docMap = {
                'Red Herring Prospectus': 'RHP'
                // Removed technical documents: Sample Forms, Bidding Centers, Security Parameters, Anchor Allocation Report
            };

            const unwantedTitles = [
                "Video link",
                "List of mobile applications",
                "Processing of ASBA",
                "e-form link",
                "Branches of Self Certified Syndicate Banks",
                "Ratios / Basis of Issue Price",
                "Bidding Centers",
                "Sample Application Forms",
                "Security Parameters",
                "Anchor Allocation Report"
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
                    if (docType === 'RHP') {
                        // Deduplication: Only one RHP per IPO. Prefer direct PDF/ZIP over redirect pages.
                        const existingRhp = await client.query('SELECT doc_id, url FROM documents WHERE ipo_id=$1 AND doc_type=$2', [ipoId, 'RHP']);
                        const isDirect = url.toLowerCase().endsWith('.pdf') || url.toLowerCase().endsWith('.zip');

                        if (existingRhp.rows.length > 0) {
                            const existingUrl = existingRhp.rows[0].url || '';
                            const wasDirect = existingUrl.toLowerCase().endsWith('.pdf') || existingUrl.toLowerCase().endsWith('.zip');

                            // Only update if current is direct and previous wasn't, or if previous didn't exist
                            if (isDirect || !wasDirect) {
                                await client.query('UPDATE documents SET title=$1, url=$2, uploaded_at=NOW() WHERE doc_id=$3', ['Red Herring Prospectus', url, existingRhp.rows[0].doc_id]);
                            }
                        } else {
                            await client.query('INSERT INTO documents (ipo_id, doc_type, title, url) VALUES ($1, $2, $3, $4)', [ipoId, 'RHP', 'Red Herring Prospectus', url]);
                        }

                        // Trigger async RHP processing for documents
                        if (url.endsWith('.zip') || url.endsWith('.pdf')) {
                            documentProcessingService.processRhpDocument(url, ipoId)
                                .catch(err => {
                                    console.error(`[NSE Service] RHP processing failed for ${symbol}:`, err.message);
                                });
                        }
                    } else {
                        // For other (non-RHP) documents that passed filtering
                        const checkDoc = await client.query('SELECT doc_id FROM documents WHERE ipo_id=$1 AND title=$2', [ipoId, d.title]);
                        if (checkDoc.rows.length === 0) {
                            await client.query(`
                                INSERT INTO documents (ipo_id, doc_type, title, url) VALUES ($1, $2, $3, $4)
                            `, [ipoId, docType, d.title, url]);
                        }
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
