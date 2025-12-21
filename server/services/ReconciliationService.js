const db = require('../config/db');

class ReconciliationService {
    async runReconciliation() {
        // Fetch unreconciled findings
        const findingsRes = await db.query(`
            SELECT * FROM ipo_discovery 
            WHERE reconciled_ipo_id IS NULL
            ORDER BY discovery_id ASC
        `);

        if (findingsRes.rows.length === 0) return;

        // Pre-load candidates for fuzzy matching
        const candidatesRes = await db.query('SELECT ipo_id, company_name, symbol, nse_symbol, bse_scrip_code FROM ipo');
        let candidates = candidatesRes.rows.map(c => ({
            ...c,
            normalized: this.normalizeName(c.company_name)
        }));

        let matches = 0;
        let creations = 0;

        for (const finding of findingsRes.rows) {
            try {
                const ipoId = await this.findOrMatch(finding, candidates);

                if (ipoId) {
                    // Update discovery record with linked ipo_id
                    await db.query('UPDATE ipo_discovery SET reconciled_ipo_id = $1 WHERE discovery_id = $2', [ipoId, finding.discovery_id]);

                    // Update exchange metadata on ipo table
                    await this.updateExchangeMetadata(ipoId, finding);
                    matches++;
                } else {
                    // Create new canonical IPO
                    const newIpo = await this.createNewIpo(finding);
                    const newIpoId = newIpo.ipo_id;
                    await db.query('UPDATE ipo_discovery SET reconciled_ipo_id = $1 WHERE discovery_id = $2', [newIpoId, finding.discovery_id]);

                    // Add to local candidates for subsequent matches
                    candidates.push({
                        ipo_id: newIpoId,
                        company_name: finding.company_name,
                        symbol: newIpo.symbol,
                        normalized: this.normalizeName(finding.company_name)
                    });
                    creations++;
                }
            } catch (err) {
                console.error(`Reconciliation failed for ${finding.company_name}:`, err.message);
            }
        }

        if (matches > 0 || creations > 0) {
            console.log(`✓ Reconciliation: ${matches} matched, ${creations} created.`);
        }
    }

    async findOrMatch(finding, candidates) {
        // 1. Direct match by exchange-specific ID
        if (finding.exchange === 'NSE' && finding.symbol) {
            const match = candidates.find(c => c.nse_symbol === finding.symbol || c.symbol === finding.symbol);
            if (match) return match.ipo_id;
        } else if (finding.exchange === 'BSE') {
            const scripCode = finding.raw_payload.Scrip_cd?.toString();
            if (scripCode) {
                const match = candidates.find(c => c.bse_scrip_code === scripCode);
                if (match) return match.ipo_id;
            }
        }

        // 2. Fuzzy match by company name
        const targetName = this.normalizeName(finding.company_name);
        if (!targetName) return null;

        for (const cand of candidates) {
            if (cand.normalized === targetName || cand.normalized.includes(targetName) || targetName.includes(cand.normalized)) {
                return cand.ipo_id;
            }
        }

        return null;
    }

    async updateExchangeMetadata(ipoId, finding) {
        if (finding.exchange === 'NSE') {
            await db.query('UPDATE ipo SET nse_symbol = $1 WHERE ipo_id = $2 AND nse_symbol IS NULL', [finding.symbol, ipoId]);
        } else if (finding.exchange === 'BSE') {
            const scripCode = finding.raw_payload.Scrip_cd?.toString();
            const ipoNo = finding.raw_payload.IPO_NO?.toString();
            await db.query(`
                UPDATE ipo SET 
                    bse_scrip_code = COALESCE(bse_scrip_code, $1),
                    bse_ipo_no = COALESCE(bse_ipo_no, $2)
                WHERE ipo_id = $3
            `, [scripCode, ipoNo, ipoId]);
        }
    }

    async createNewIpo(finding) {
        // Initial insert with basic data from discovery
        const symbol = finding.symbol || `TBA-${finding.exchange}-${Math.floor(Math.random() * 1000)}`;

        const res = await db.query(`
            INSERT INTO ipo (company_name, symbol, status, nse_symbol, bse_scrip_code, bse_ipo_no)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ipo_id
        `, [
            finding.company_name,
            symbol,
            finding.status,
            finding.exchange === 'NSE' ? finding.symbol : null,
            finding.exchange === 'BSE' ? finding.raw_payload.Scrip_cd?.toString() : null,
            finding.exchange === 'BSE' ? finding.raw_payload.IPO_NO?.toString() : null
        ]);

        const ipoId = res.rows[0].ipo_id;

        // Add basic dates if available in discovery raw payload
        if (finding.exchange === 'NSE') {
            const startStr = finding.raw_payload.issueStartDate;
            const endStr = finding.raw_payload.issueEndDate;
            if (startStr || endStr) {
                await db.query('INSERT INTO ipo_dates (ipo_id, issue_start, issue_end) VALUES ($1, $2, $3)',
                    [ipoId, startStr ? new Date(startStr) : null, endStr ? new Date(endStr) : null]);
            }
        } else if (finding.exchange === 'BSE') {
            const startStr = finding.raw_payload.Start_Dt;
            const endStr = finding.raw_payload.End_Dt;
            if (startStr || endStr) {
                await db.query('INSERT INTO ipo_dates (ipo_id, issue_start, issue_end) VALUES ($1, $2, $3)',
                    [ipoId, startStr ? new Date(startStr) : null, endStr ? new Date(endStr) : null]);
            }
        }

        return { ipo_id: ipoId, symbol: symbol };
    }

    normalizeName(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/limited|ltd|private|pvt|india|ind|[.,\s]/gi, '')
            .trim();
    }
}

module.exports = new ReconciliationService();
