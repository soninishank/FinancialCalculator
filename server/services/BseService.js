const axios = require('axios');
const { Client } = require('pg');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ quiet: true });
const CONNECTION_STRING = process.env.DATABASE_URL;

// Helper to normalize strings for comparison
const cleanString = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

class BseService {
    async discover() {
        try {
            const data = await this.fetchData();

            return data.map(item => ({
                exchange: 'BSE',
                symbol: null, // BSE list API doesn't usually provide NSE symbol
                company_name: item.Scrip_Name,
                status: this.inferStatus(item),
                raw_payload: item
            }));
        } catch (err) {
            console.error('BSE Discovery failed:', err);
            return [];
        }
    }

    inferStatus(item) {
        const issueStart = item.Start_Dt ? new Date(item.Start_Dt) : null;
        const issueEnd = item.End_Dt ? new Date(item.End_Dt) : null;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (issueEnd) {
            const endDate = new Date(issueEnd);
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (today > endDateOnly) return 'closed';
            if (issueStart) {
                const startDate = new Date(issueStart);
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                if (today < startDateOnly) return 'upcoming';
                return 'open';
            }
        }
        return 'closed';
    }

    async fetchData() {

        const url = 'https://api.bseindia.com/BseIndiaAPI/api/GetPublicIssue_par/w';
        const config = {
            headers: {
                'Referer': 'https://www.bseindia.com/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
            }
        };

        try {
            const response = await axios.get(url, config);
            // API returns { Table: [...] } based on user provided sample
            const data = response.data;

            // Log response to file (disabled for production)
            /*
            try {
                const logDir = path.join(__dirname, '../logs');
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                const logFile = path.join(logDir, 'bse_api_response.json');
                fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
                console.log(`Saved BSE API response to ${logFile}`);
            } catch (logErr) {
                console.error("Failed to log BSE API response:", logErr);
            }
            */

            if (data && data.Table) {
                // Filter only IPOs as per user request
                return data.Table.filter(item => item.IR_flag === 'IPO');
            }
            return [];
        } catch (err) {
            console.error('Error fetching BSE data:', err.message);
            return [];
        }
    }

    async scrapeDetails(item) {
        try {
            // Construct URL
            if (!item.Start_Dt) return null;

            const dateObj = new Date(item.Start_Dt);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = dateObj.getDate();
            const month = months[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            const startDtParam = `${day}/${month}/${year}`;

            const id = item.Scrip_cd;
            const ipoNo = item.IPO_NO;
            const status = item.Status === 'F' ? 'F' : 'L';
            const urlStatus = item.Status;

            const url = `https://www.bseindia.com/markets/publicIssues/DisplayIPO.aspx?id=${id}&type=IPO&idtype=1&status=${urlStatus}&IPONo=${ipoNo}&startdt=${startDtParam}`;

            const config = {
                headers: {
                    'Referer': 'https://www.bseindia.com/',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                }
            };

            const res = await axios.get(url, config);
            const $ = cheerio.load(res.data);

            let symbol = null;
            let registrarName = null;
            let faceValue = null;
            let shares = null;
            let bidLot = null;
            let priceLow = null;
            let priceHigh = null;

            let rhpLink = null;
            let rhpTitle = null;

            const scrapedRawTable = {};

            $('td.TTRow_left').each((i, el) => {
                const text = $(el).text().trim();
                const nextTd = $(el).next('td');
                if (nextTd.length > 0) {
                    const val = nextTd.text().trim();

                    // Capture all raw data
                    if (text) {
                        scrapedRawTable[text] = val;
                    }

                    if (text === 'Symbol') {
                        symbol = val;
                    } else if (text === 'Face Value') {
                        faceValue = parseFloat(val);
                    } else if (text.includes('Registrar') && !text.includes('Share Transfer Agents')) {
                        registrarName = val;
                        if (registrarName.includes('#@#')) {
                            registrarName = registrarName.split('#@#')[0];
                        }
                    } else if (text.includes('Registrars to an Issue') || text.includes('Share Transfer Agents')) {
                        const a = nextTd.find('a');
                        if (a.length > 0) {
                            const href = a.attr('href');
                            if (href && !href.includes('javascript')) {
                                scrapedRawTable['Registrar Website'] = href;
                            }
                        }
                    } else if (text.includes('Issue Size') && text.includes('Shares')) {
                        shares = parseInt(val.replace(/,/g, ''), 10);
                    } else if (text.includes('Bid Lot') || text.includes('Market Lot') || text.includes('Minimum Order Quantity')) {
                        bidLot = parseInt(val.replace(/,/g, ''), 10);
                    } else if (text.includes('Issue Price') || text.includes('Price Band')) {
                        const parts = val.match(/[\d,.]+/g);
                        if (parts && parts.length > 0) {
                            priceLow = parseFloat(parts[0].replace(/,/g, ''));
                            priceHigh = parseFloat(parts[parts.length - 1].replace(/,/g, ''));
                        }
                    } else if (text.includes('Prospectus')) {
                        const a = nextTd.find('a');
                        if (a.length > 0) {
                            const href = a.attr('href');
                            if (href && (href.toLowerCase().endsWith('.pdf') || href.toLowerCase().endsWith('.zip'))) {
                                rhpLink = href;
                                rhpTitle = 'Red Herring Prospectus';
                            } else if (href && !href.includes('javascript')) {
                                // If it's a page link, still keep it but label it as Source
                                rhpLink = href;
                                rhpTitle = 'Red Herring Prospectus';
                            } else {
                                rhpLink = url;
                                rhpTitle = 'Red Herring Prospectus';
                            }
                        }
                    }
                }
            });

            // Log raw detail scraping (disabled for production)
            /*
            try {
                const logDir = path.join(__dirname, '../logs');
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                const logFile = path.join(logDir, `bse_detail_${item.Scrip_cd}.json`);
                fs.writeFileSync(logFile, JSON.stringify(scrapedRawTable, null, 2));
                console.log(`Saved BSE Detail dump for ${item.Scrip_cd} to ${logFile}`);
            } catch (logErr) {
                console.error(`Failed to log BSE Detail for ${item.Scrip_cd}:`, logErr);
            }
            */

            return {
                symbol,
                registrarName,
                registrarWebsite: scrapedRawTable['Registrar Website'],
                faceValue,
                shares,
                bidLot,
                rhpLink,
                rhpTitle,
                priceLow,
                priceHigh
            };

        } catch (err) {
            console.warn(`Scraping failed for ${item.Scrip_Name}: ${err.message}`);
            return null;
        }
    }

    async upsertIpo(client, item, scrapedData) {
        const bseCode = item.Scrip_cd.toString();
        const bseIpoNo = item.IPO_NO ? item.IPO_NO.toString() : null;
        const companyName = item.Scrip_Name;
        const issueStart = item.Start_Dt ? new Date(item.Start_Dt) : null;
        const issueEnd = item.End_Dt ? new Date(item.End_Dt) : null;

        const priceBand = item.Price_Band;
        let priceLow = null, priceHigh = null;

        if (priceBand) {
            const parts = priceBand.split('-').map(p => parseFloat(p.trim()));
            if (parts.length === 2) {
                priceLow = parts[0];
                priceHigh = parts[1];
            } else if (parts.length === 1 && !isNaN(parts[0])) {
                priceLow = parts[0];
                priceHigh = parts[0];
            }
        }

        let status = 'closed';
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (issueEnd) {
            const endDate = new Date(issueEnd);
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (today > endDateOnly) {
                status = 'closed';
            } else if (issueStart) {
                const startDate = new Date(issueStart);
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                if (today < startDateOnly) {
                    status = 'upcoming';
                } else {
                    status = 'open';
                }
            }
        }

        const exchangePlatform = item.eXCHANGE_PLATFORM || 'MainBoard';
        const series = (exchangePlatform === 'SME') ? 'SME' : 'EQ';
        const issueType = (exchangePlatform === 'SME') ? 'SME' : 'Equity';

        try {
            let ipoId = null;
            const resCode = await client.query('SELECT ipo_id FROM ipo WHERE bse_scrip_code = $1', [bseCode]);

            if (resCode.rows.length > 0) {
                ipoId = resCode.rows[0].ipo_id;
            } else {
                const candidates = await client.query(`
                    SELECT ipo_id, company_name, symbol, status FROM ipo
                    WHERE bse_scrip_code IS NULL
                    AND (status = 'open' OR status = 'upcoming')
                `);

                const normalize = (s) => s.replace(/limited|ltd|private|pvt|[.,\s]/gi, '').toLowerCase();
                const targetName = normalize(companyName);

                for (const row of candidates.rows) {
                    const dbName = normalize(row.company_name);
                    if (dbName === targetName || dbName.includes(targetName) || targetName.includes(dbName)) {
                        ipoId = row.ipo_id;
                        break;
                    }
                }
            }

            let finalSymbol = scrapedData?.symbol;

            const generateSymbol = (name) => {
                if (!name) return `BSE-${bseCode}`;
                let clean = name.replace(/\(.*\)/g, '')
                    .replace(/limited|ltd|private|pvt|india|ind/gi, '')
                    .replace(/[^a-zA-Z\s]/g, '')
                    .trim();

                const words = clean.split(/\s+/);
                if (words.length > 0 && words[0].length >= 3) {
                    return words[0].toUpperCase();
                }
                if (clean.length > 0) {
                    return clean.substring(0, 10).toUpperCase().replace(/\s/g, '');
                }
                return `BSE-${bseCode}`;
            };

            if (!finalSymbol) {
                finalSymbol = generateSymbol(companyName);
            }

            // Upsert Registrar if found
            let registrarId = null;

            const normalizeRegistrarName = (name) => {
                if (!name) return name;
                let clean = name.replace(/\(formerly.*?\)/i, '').trim();
                clean = clean.replace(/Pvt Ltd/gi, 'Private Limited').replace(/Pvt\. Ltd/gi, 'Private Limited');
                clean = clean.replace(/\s+/g, ' ').trim();
                return clean;
            };

            const normalizedRegName = normalizeRegistrarName(scrapedData?.registrarName);

            if (normalizedRegName) {
                const regRes = await client.query(`
                    INSERT INTO registrar (name, website) VALUES ($1, $2)
                    ON CONFLICT (name) DO UPDATE SET website = COALESCE(EXCLUDED.website, registrar.website)
                    RETURNING registrar_id
                `, [normalizedRegName, scrapedData.registrarWebsite]);

                if (regRes.rows.length > 0) {
                    registrarId = regRes.rows[0].registrar_id;
                } else {
                    const regFetch = await client.query('SELECT registrar_id FROM registrar WHERE name = $1', [normalizedRegName]);
                    if (regFetch.rows.length > 0) registrarId = regFetch.rows[0].registrar_id;
                }
            }

            // Calculate Issue Size in Paise if possible
            let issueSizePaise = null;
            if (scrapedData?.shares && priceHigh) {
                issueSizePaise = BigInt(scrapedData.shares) * BigInt(Math.round(priceHigh * 100)); // Price to paise
            }

            if (ipoId) {
                const queryUpdates = ['bse_scrip_code = $1', 'bse_ipo_no = $2', 'updated_at = NOW()'];
                const queryParams = [bseCode, bseIpoNo];
                let paramIndex = 3;

                if (scrapedData?.symbol) {
                    queryUpdates.push(`symbol = $${paramIndex}`);
                    queryParams.push(scrapedData.symbol);
                    paramIndex++;
                }

                if (registrarId) {
                    queryUpdates.push(`primary_registrar_id = $${paramIndex}`);
                    queryParams.push(registrarId);
                    paramIndex++;
                }

                if (scrapedData?.faceValue) {
                    queryUpdates.push(`face_value = $${paramIndex}`);
                    queryParams.push(scrapedData.faceValue);
                    paramIndex++;
                }

                if (scrapedData?.bidLot) {
                    queryUpdates.push(`bid_lot = $${paramIndex}`);
                    queryParams.push(scrapedData.bidLot);
                    paramIndex++;
                }

                if (issueSizePaise) {
                    queryUpdates.push(`issue_size = $${paramIndex}`);
                    queryParams.push(issueSizePaise.toString());
                    paramIndex++;
                }

                queryParams.push(ipoId);

                await client.query(`
                    UPDATE ipo SET
                        ${queryUpdates.join(', ')}
                    WHERE ipo_id = $${paramIndex}
                `, queryParams);

            } else {
                const symbol = finalSymbol;

                // We can insert registrar, face_value etc now
                const insertRes = await client.query(`
                    INSERT INTO ipo (
                        symbol, company_name, status, price_range_low, price_range_high,
                        issue_type, series, bse_scrip_code, bse_ipo_no,
                        primary_registrar_id, face_value, bid_lot, issue_size
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING ipo_id
                `, [
                    symbol, companyName, status, priceLow, priceHigh,
                    issueType, series, bseCode, bseIpoNo,
                    registrarId, scrapedData?.faceValue, scrapedData?.bidLot, issueSizePaise?.toString()
                ]);

                ipoId = insertRes.rows[0].ipo_id;
                console.log(`Inserted NEW from BSE: ${companyName} -> ${symbol}`);

                await client.query(`
                    INSERT INTO ipo_dates (ipo_id, issue_start, issue_end) VALUES ($1, $2, $3)
                    `, [ipoId, issueStart, issueEnd]);
            }


        } catch (err) {
            console.error(`Error upserting BSE IPO ${companyName}: `, err);
        }
    }

    async updateDetails(ipoId, client) {
        try {
            // Fetch required info from DB to construct scraping URL
            const res = await client.query(`
                SELECT i.bse_scrip_code, i.bse_ipo_no, i.status, d.issue_start, i.price_range_high, i.bid_lot 
                FROM ipo i
                LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
                WHERE i.ipo_id = $1
                    `, [ipoId]);

            if (res.rows.length === 0) return false;
            const row = res.rows[0];

            if (!row.bse_scrip_code || !row.issue_start) {
                console.log(`Cannot scrape BSE details for IPO ${ipoId}: Missing Scrip Code or Start Date`);
                return false;
            }

            // Construct mock item for scrapeDetails
            // Start_Dt needs to be parsable by Date()
            const item = {
                Scrip_cd: row.bse_scrip_code,
                IPO_NO: row.bse_ipo_no || '', // fallbacks?
                Status: row.status === 'upcoming' ? 'F' : 'L', // Infer status
                Start_Dt: row.issue_start,
                Scrip_Name: 'ID-' + ipoId
            };

            const scrapedData = await this.scrapeDetails(item);
            if (!scrapedData) return false;

            // Update Logic (Specific to on-demand update)
            const queryUpdates = ['updated_at = NOW()'];
            const queryParams = [];
            let paramIndex = 1;

            if (scrapedData.symbol) {
                queryUpdates.push(`symbol = $${paramIndex} `);
                queryParams.push(scrapedData.symbol);
                paramIndex++;
            }
            if (scrapedData.faceValue) {
                queryUpdates.push(`face_value = $${paramIndex} `);
                queryParams.push(scrapedData.faceValue);
                paramIndex++;
            }
            if (scrapedData.bidLot) {
                queryUpdates.push(`bid_lot = $${paramIndex} `);
                queryParams.push(scrapedData.bidLot);
                paramIndex++;
            }

            // Issue Size
            if (scrapedData.shares) {
                const priceHigh = scrapedData.priceHigh || row.price_range_high;
                if (priceHigh) {
                    const issueSizePaise = BigInt(scrapedData.shares) * BigInt(Math.round(priceHigh * 100));
                    queryUpdates.push(`issue_size = $${paramIndex} `);
                    queryParams.push(issueSizePaise.toString());
                    paramIndex++;

                    queryUpdates.push(`issue_size_extraction_model = $${paramIndex} `);
                    queryParams.push('BSE');
                    paramIndex++;
                }
            }

            // Price Fields
            if (scrapedData.priceLow) {
                queryUpdates.push(`price_range_low = $${paramIndex} `);
                queryParams.push(scrapedData.priceLow);
                paramIndex++;
            }
            if (scrapedData.priceHigh) {
                queryUpdates.push(`price_range_high = $${paramIndex} `);
                queryParams.push(scrapedData.priceHigh);
                paramIndex++;
            }

            // Minimum Investment
            const pHigh = scrapedData.priceHigh || row.price_range_high;
            const bLot = scrapedData.bidLot || row.bid_lot;
            if (pHigh && bLot) {
                const minInvestment = pHigh * bLot;
                queryUpdates.push(`min_investment = $${paramIndex} `);
                queryParams.push(minInvestment);
                paramIndex++;
            }

            // Registrar
            if (scrapedData.registrarName) {
                const normalizeRegistrarName = (name) => {
                    if (!name) return name;
                    let clean = name.replace(/\(formerly.*?\)/i, '').trim();
                    clean = clean.replace(/Pvt Ltd/gi, 'Private Limited').replace(/Pvt\. Ltd/gi, 'Private Limited');
                    clean = clean.replace(/\s+/g, ' ').trim();
                    return clean;
                };

                const normalizedRegName = normalizeRegistrarName(scrapedData.registrarName);

                const regRes = await client.query(`
                    INSERT INTO registrar(name, website) VALUES($1, $2)
                    ON CONFLICT(name) DO UPDATE SET website = COALESCE(EXCLUDED.website, registrar.website)
                    RETURNING registrar_id
                `, [normalizedRegName, scrapedData.registrarWebsite]);

                let registrarId = null;
                if (regRes.rows.length > 0) {
                    registrarId = regRes.rows[0].registrar_id;
                } else {
                    const regFetch = await client.query('SELECT registrar_id FROM registrar WHERE name = $1', [scrapedData.registrarName]);
                    if (regFetch.rows.length > 0) registrarId = regFetch.rows[0].registrar_id;
                }

                if (registrarId) {
                    queryUpdates.push(`primary_registrar_id = $${paramIndex} `);
                    queryParams.push(registrarId);
                    paramIndex++;
                }
            }

            queryParams.push(ipoId);
            await client.query(`
                UPDATE ipo SET ${queryUpdates.join(', ')} WHERE ipo_id = $${paramIndex}
                `, queryParams);



            // Persist RHP Document
            if (scrapedData.rhpLink) {
                const docCheck = await client.query('SELECT doc_id, url FROM documents WHERE ipo_id = $1 AND doc_type = $2', [ipoId, 'RHP']);
                const isDirect = scrapedData.rhpLink.toLowerCase().endsWith('.pdf') || scrapedData.rhpLink.toLowerCase().endsWith('.zip');

                if (docCheck.rows.length === 0) {
                    await client.query(`
                        INSERT INTO documents(ipo_id, doc_type, title, url)
                        VALUES($1, 'RHP', $2, $3)
                    `, [ipoId, 'Red Herring Prospectus', scrapedData.rhpLink]);
                } else {
                    const existingUrl = docCheck.rows[0].url || '';
                    const wasDirect = existingUrl.toLowerCase().endsWith('.pdf') || existingUrl.toLowerCase().endsWith('.zip');

                    if (isDirect || !wasDirect) {
                        await client.query(`
                            UPDATE documents SET url = $3, title = $2, uploaded_at = NOW()
                            WHERE doc_id = $1
                        `, [docCheck.rows[0].doc_id, 'Red Herring Prospectus', scrapedData.rhpLink]);
                    }
                }
            }

            return true;

        } catch (err) {
            console.error(`Error updating BSE details for IPO ${ipoId}: `, err);
            return false;
        }
    }

    async syncAllIPOs() {
        const client = new Client({ connectionString: CONNECTION_STRING });
        try {
            await client.connect();

            const discovered = await this.discover();

            for (const item of discovered) {
                const scraped = await this.scrapeDetails(item.raw_payload);
                await this.upsertIpo(client, item.raw_payload, scraped);
                await new Promise(r => setTimeout(r, 1000));
            }

            return { success: true, count: discovered.length };

        } catch (err) {
            console.error('BSE Sync failed:', err);
            return { success: false, error: err.message };
        } finally {
            await client.end();
        }
    }
}

module.exports = new BseService();
