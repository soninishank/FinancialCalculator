const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');
const { PDFParse } = require('pdf-parse');
const db = require('../config/db');

class DocumentProcessingService {
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'rhp-processing');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async processRhpDocument(url, ipoId) {
        const processingId = `${ipoId}-${Date.now()}`;
        const zipPath = path.join(this.tempDir, `${processingId}.zip`);
        const extractPath = path.join(this.tempDir, processingId);

        try {
            // Step 1: Download zip file
            await this.downloadFile(url, zipPath);

            // Step 2: Extract zip
            const extractedFiles = await this.extractZipFile(zipPath, extractPath);

            // Step 3: Find RHP PDF
            const rhpPdfPath = this.findRhpPdf(extractedFiles);

            if (!rhpPdfPath) {
                return;
            }

            // Step 4: Parse indicative timetable from PDF
            const dates = await this.parseIndicativeTimetable(rhpPdfPath);

            if (!dates || Object.keys(dates).length === 0) {
                return;
            }

            // Step 5: Persist to database (Get FRESH client, don't use shared/closed one)
            const client = await db.pool.connect();
            try {
                await this.persistIndicativeDates(client, ipoId, dates);
                console.log(`[RHP] Processed indicative timetable for IPO ${ipoId}: ${Object.keys(dates).length} dates extracted`);

                // Step 6: Parse Issue Structure
                const issueStructure = await this.parseIssueStructure(rhpPdfPath);
                if (issueStructure && Object.keys(issueStructure).length > 0) {
                    await this.persistIssueStructure(client, ipoId, issueStructure);
                    console.log(`[RHP] Processed issue structure for IPO ${ipoId}: ${Object.keys(issueStructure).length} fields extracted`);
                }
            } finally {
                client.release();
            }

        } catch (error) {
            console.error(`[RHP] Error processing IPO ${ipoId}:`, error.message);
            // Don't throw - async processing should be fire-and-forget
        } finally {
            // Cleanup temp files
            this.cleanupFiles(zipPath, extractPath);
        }
    }

    /**
     * Download file from URL to local path
     */
    downloadFile(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            const protocol = url.startsWith('https') ? https : http;

            protocol.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Handle redirect
                    file.close();
                    fs.unlinkSync(filepath);
                    return this.downloadFile(response.headers.location, filepath)
                        .then(resolve)
                        .catch(reject);
                }

                if (response.statusCode !== 200) {
                    file.close();
                    fs.unlinkSync(filepath);
                    return reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve();
                });

                file.on('error', (err) => {
                    file.close();
                    fs.unlinkSync(filepath);
                    reject(err);
                });

            }).on('error', (err) => {
                file.close();
                fs.unlinkSync(filepath);
                reject(err);
            });
        });
    }

    /**
     * Extract zip file contents
     * @returns {Array<string>} Array of extracted file paths
     */
    async extractZipFile(zipPath, extractPath) {
        try {
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);

            // Get all extracted files
            const files = [];
            const walkDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        walkDir(fullPath);
                    } else {
                        files.push(fullPath);
                    }
                }
            };

            walkDir(extractPath);
            return files;

        } catch (error) {
            throw new Error(`Failed to extract zip: ${error.message}`);
        }
    }

    /**
     * Find RHP PDF file from extracted files
     * Looks for files with "RHP" in the filename
     * @returns {string|null} Path to RHP PDF or null
     */
    findRhpPdf(files) {
        const rhpFile = files.find(file => {
            const filename = path.basename(file).toLowerCase();
            return filename.includes('rhp') && filename.endsWith('.pdf');
        });

        return rhpFile || null;
    }

    /**
     * Parse indicative timetable from RHP PDF
     * @returns {Object} Object with extracted dates
     */
    async parseIndicativeTimetable(pdfPath) {
        try {
            // Use pdf-parse v2 API with file:// URL for local files
            const fileUrl = `file://${pdfPath}`;
            const parser = new PDFParse({
                url: fileUrl,
                verbosity: 0  // Suppress warnings
            });

            const result = await parser.getText();
            const text = result.text;

            console.log(`[RHP Processing] PDF parsed successfully, text length: ${text.length}`);

            // Find the indicative timetable section
            const timetableMatch = text.match(/indicative\s+timetable/i);
            if (!timetableMatch) {
                console.log(`[RHP Processing] No "Indicative Timetable" section found in PDF`);
                console.log(`[RHP Processing] First 500 chars: ${text.substring(0, 500)}`);
                return {};
            }

            console.log(`[RHP Processing] Found "Indicative Timetable" at index ${timetableMatch.index}`);

            // Extract relevant portion of text (next ~2000 characters after "Indicative Timetable")
            const startIndex = timetableMatch.index;
            const timetableText = text.substring(startIndex, startIndex + 2000);

            console.log(`[RHP Processing] Timetable section: ${timetableText.substring(0, 500)}`);

            const dates = {};

            // Extract dates using flexible patterns that handle multiple formats
            // Supports: "17-Dec-2025", "December 17, 2025", "Wednesday, December 17, 2025"
            const patterns = [
                {
                    key: 'allotment_finalization_date',
                    // Matches: "Finalisation/Finalization of Basis of Allotment" followed by date anywhere in next ~200 chars
                    regex: /(?:finalisation|finalization)\s+of\s+basis\s+of\s+allotment.{0,200}?(?:on\s+or\s+about\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?[,\s]*([a-z]+\s+\d{1,2}[,\s]+\d{4}|\d{1,2}[-\/\s][a-z]{3,}[-\/\s]?\d{2,4})/i
                },
                {
                    key: 'refund_initiation_date',
                    // Matches: "Initiation of refund" OR "unblocking of funds" followed by date
                    regex: /(?:initiation\s+of\s+refunds?|unblocking\s+of\s+funds).{0,200}?(?:on\s+or\s+about\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?[,\s]*([a-z]+\s+\d{1,2}[,\s]+\d{4}|\d{1,2}[-\/\s][a-z]{3,}[-\/\s]?\d{2,4})/i
                },
                {
                    key: 'demat_credit_date',
                    // Matches: "Credit of Equity Shares to demat" followed by date
                    regex: /credit\s+of\s+(?:equity\s+)?shares\s+to\s+(?:dematerialized|demat).{0,200}?(?:on\s+or\s+about\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?[,\s]*([a-z]+\s+\d{1,2}[,\s]+\d{4}|\d{1,2}[-\/\s][a-z]{3,}[-\/\s]?\d{2,4})/i
                },
                {
                    key: 'listing_date',
                    // Matches: "Commencement of trading" OR "listing" followed by date
                    regex: /(?:commencement\s+of\s+trading|listing).{0,200}?(?:on\s+or\s+about\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?[,\s]*([a-z]+\s+\d{1,2}[,\s]+\d{4}|\d{1,2}[-\/\s][a-z]{3,}[-\/\s]?\d{2,4})/i
                }
            ];

            for (const pattern of patterns) {
                const match = timetableText.match(pattern.regex);
                if (match && match[1]) {
                    const normalizedDate = this.normalizeDate(match[1]);
                    if (normalizedDate) {
                        dates[pattern.key] = normalizedDate;
                        console.log(`[RHP Processing] Extracted ${pattern.key}: ${normalizedDate} (from: "${match[1]}")`);
                    } else {
                        console.log(`[RHP Processing] Failed to normalize date for ${pattern.key}: ${match[1]}`);
                    }
                } else {
                    console.log(`[RHP Processing] No match for ${pattern.key}`);
                }
            }

            console.log(`[RHP Processing] Total dates extracted: ${Object.keys(dates).length}`);
            return dates;

        } catch (error) {
            console.error('[RHP Processing] Error parsing PDF:', error.message);
            console.error('[RHP Processing] Stack:', error.stack);
            return {};
        }
    }

    /**
     * Normalize date string to PostgreSQL DATE format (YYYY-MM-DD)
     * Handles formats like: "10-Dec-2025", "10/12/2025", "10 Dec 2025"
     */
    normalizeDate(dateStr) {
        try {
            const cleanStr = dateStr.trim();

            // Parse date
            const date = new Date(cleanStr);

            if (isNaN(date.getTime())) {
                return null;
            }

            // Format as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;

        } catch (error) {
            console.error('[RHP Processing] Error normalizing date:', dateStr, error.message);
            return null;
        }
    }

    /**
     * Parse issue structure/allocation from RHP PDF
     * @returns {Object} Object with extracted proportions
     */
    async parseIssueStructure(pdfPath) {
        try {
            const fileUrl = `file://${pdfPath}`;
            const parser = new PDFParse({
                url: fileUrl,
                verbosity: 0
            });

            const result = await parser.getText();
            const text = result.text;

            // 1. Look for Issue Structure keywords
            const sectionKeywords = ["ISSUE STRUCTURE", "ALLOCATION", "THE ISSUE"];
            let sectionText = "";
            for (const kw of sectionKeywords) {
                const match = text.match(new RegExp(kw, 'i'));
                if (match) {
                    sectionText = text.substring(match.index, match.index + 5000);
                    break;
                }
            }

            if (!sectionText) return {};

            const data = {};

            // 2. Parse Total Issue Size and Market Maker
            const totalMatch = sectionText.match(/Total\s+Issue\s+Size\s*(?::|of)?\s*([\d,]+)/i);
            const marketMakerMatch = sectionText.match(/Market\s+Maker\s+Reservation\s*(?:Portion)?\s*(?::|of)?\s*([\d,]+)/i);
            const netIssueMatch = sectionText.match(/Net\s+Issue\s*(?:to\s+the\s+Public)?\s*(?::|of)?\s*([\d,]+)/i);

            if (totalMatch) data.total_issue_shares = parseInt(totalMatch[1].replace(/,/g, ''));
            if (marketMakerMatch) data.market_maker_shares = parseInt(marketMakerMatch[1].replace(/,/g, ''));
            if (netIssueMatch) data.net_issue_shares = parseInt(netIssueMatch[1].replace(/,/g, ''));

            // 3. Parse Percentages (Retail, NII, QIB)
            // Support two main styles:
            // Style A (Direct): "Category: 35%" or "Category ... 35%"
            // Style B (Legalese): "35% ... available for allocation to Category"
            const categories = [
                { key: 'retail_reservation_pct', names: ["\\bIndividual\\s+(?:Investors|Bidders)\\b", "\\bRetail\\b"] },
                { key: 'nii_reservation_pct', names: ["\\bNon\\s*-?\\s*Institutional\\b", "\\bNII\\b"] },
                { key: 'qib_reservation_pct', names: ["\\bQualified\\s+Institutional\\b", "\\bQIB\\b"] }
            ];

            for (const cat of categories) {
                for (const nameStr of cat.names) {
                    // Style A: Same-line mapping (Table/List)
                    const p1 = new RegExp(`${nameStr}[^%\\n\\r]{1,60}?\\s*(\\d+(?:\\.\\d+)?)\\s*%`, 'i');
                    const match1 = sectionText.match(p1);
                    if (match1) {
                        data[cat.key] = parseFloat(match1[1]);
                        break;
                    }

                    // Style B: Legalese mapping (must have bridge words) - allows newlines
                    const p2 = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%[^%]{1,150}?(?:available|allocated)[^%]{1,50}?to\\s+[^%]{1,30}?${nameStr}`, 'i');
                    const match2 = sectionText.match(p2);
                    if (match2) {
                        data[cat.key] = parseFloat(match2[1]);
                        break;
                    }

                    // Style C: Simple reverse mapping (Percentage followed by Name) - no newlines
                    const p3 = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%[^%\\n\\r]{1,100}?\\s*${nameStr}`, 'i');
                    const match3 = sectionText.match(p3);
                    if (match3) {
                        data[cat.key] = parseFloat(match3[1]);
                        break;
                    }
                }
            }

            return data;
        } catch (error) {
            console.error('[RHP Processing] Error parsing issue structure:', error.message);
            return {};
        }
    }

    /**
     * Persist extracted issue structure to database
     */
    async persistIssueStructure(client, ipoId, data) {
        try {
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (data.net_issue_shares) {
                updateFields.push(`net_issue_shares = $${paramIndex++}`);
                values.push(data.net_issue_shares);
            }
            if (data.market_maker_shares) {
                updateFields.push(`market_maker_shares = $${paramIndex++}`);
                values.push(data.market_maker_shares);
            }
            if (data.retail_reservation_pct) {
                updateFields.push(`retail_reservation_pct = $${paramIndex++}`);
                values.push(data.retail_reservation_pct);
            }
            if (data.nii_reservation_pct) {
                updateFields.push(`nii_reservation_pct = $${paramIndex++}`);
                values.push(data.nii_reservation_pct);
            }
            if (data.qib_reservation_pct) {
                updateFields.push(`qib_reservation_pct = $${paramIndex++}`);
                values.push(data.qib_reservation_pct);
            }

            if (updateFields.length === 0) return;

            values.push(ipoId);
            const query = `
                UPDATE ipo 
                SET ${updateFields.join(', ')}
                WHERE ipo_id = $${paramIndex}
            `;

            await client.query(query, values);
        } catch (error) {
            console.error('[RHP] Error persisting issue structure:', error.message);
            throw error;
        }
    }

    /**
     * Persist extracted dates to database
     */
    async persistIndicativeDates(client, ipoId, dates) {
        try {
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (dates.allotment_finalization_date) {
                updateFields.push(`allotment_finalization_date = $${paramIndex++}`);
                values.push(dates.allotment_finalization_date);
            }

            if (dates.refund_initiation_date) {
                updateFields.push(`refund_initiation_date = $${paramIndex++}`);
                values.push(dates.refund_initiation_date);
            }

            if (dates.demat_credit_date) {
                updateFields.push(`demat_credit_date = $${paramIndex++}`);
                values.push(dates.demat_credit_date);
            }

            if (dates.listing_date) {
                updateFields.push(`listing_date = $${paramIndex++}`);
                values.push(dates.listing_date);
            }

            if (updateFields.length === 0) {
                console.log('[RHP Processing] No dates to update');
                return;
            }

            values.push(ipoId);
            const query = `
                UPDATE ipo_dates 
                SET ${updateFields.join(', ')}
                WHERE ipo_id = $${paramIndex}
            `;

            await client.query(query, values);

        } catch (error) {
            console.error('[RHP] Error persisting dates:', error.message);
            throw error;
        }
    }

    /**
     * Clean up temporary files
     */
    cleanupFiles(zipPath, extractPath) {
        try {
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }

            if (fs.existsSync(extractPath)) {
                fs.rmSync(extractPath, { recursive: true, force: true });
            }
        } catch (error) {
            // Silent cleanup failure
        }
    }
}

module.exports = new DocumentProcessingService();
