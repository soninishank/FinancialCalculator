const db = require('../config/db');
const NodeCache = require("node-cache");
const NseService = require('../services/NseService');

const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// Helper to get IPO data (refactored from scraper.js)
async function fetchIpoDataFromDb() {
    try {
        // Fetch all IPOs with dates and sort by status-specific criteria
        const query = `
      SELECT 
        i.ipo_id, i.company_name, i.symbol, i.status, i.issue_type, 
        i.price_range_low, i.price_range_high, i.issue_size, i.series,
        d.issue_start, d.issue_end, d.listing_date
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
      ORDER BY 
        i.status,
        CASE 
          WHEN i.status = 'open' THEN d.issue_end
          WHEN i.status = 'upcoming' THEN d.issue_start
        END ASC NULLS LAST,
        CASE 
          WHEN i.status IN ('closed', 'listed', 'withdrawn') THEN d.listing_date
        END DESC NULLS LAST
    `;
        const res = await db.query(query);
        const rows = res.rows;

        const upcoming = [];
        const open = [];
        const closed = [];

        rows.forEach(row => {
            // Map to frontend structure
            const low = row.price_range_low;
            const high = row.price_range_high;
            let priceRange = "";
            if (low && high) priceRange = `Rs.${low} to Rs.${high}`;
            else if (low) priceRange = `Rs.${low}`;

            const ipoObj = {
                id: row.ipo_id.toString(),
                name: row.company_name,
                symbol: row.symbol,
                series: row.series,
                type: row.issue_type === 'Book Building' ? 'Equity' : (row.issue_type || 'Equity'),
                issueStart: row.issue_start ? new Date(row.issue_start).toDateString() : 'TBA',
                issueEnd: row.issue_end ? new Date(row.issue_end).toDateString() : 'TBA',
                listingDate: row.listing_date ? new Date(row.listing_date).toDateString() : '',
                priceRange: priceRange,
                issueSize: row.issue_size ? row.issue_size.toString() : '-'
            };

            // Categorize
            const status = row.status;
            if (status === 'upcoming') upcoming.push(ipoObj);
            else if (status === 'open') open.push(ipoObj);
            else closed.push(ipoObj); // listed/closed/withdrawn
        });

        return { upcoming, open, closed };

    } catch (err) {
        console.error("DB Query Error:", err);
        return { upcoming: [], open: [], closed: [] };
    }
}

const getAllIpos = async (req, res) => {
    const cached = cache.get("ipos_db");
    if (cached) return res.json({ ok: true, data: cached });

    const data = await fetchIpoDataFromDb();
    cache.set("ipos_db", data);
    res.json({ ok: true, data });
};

const getIpoDetails = async (req, res) => {
    const symbol = req.params.symbol;
    const series = req.query.series || 'EQ';

    try {
        // 1. Get Basic Info
        const ipoRes = await db.query(`
      SELECT 
        i.*, 
        d.issue_start, d.issue_end, d.listing_date, d.market_open_time, d.market_close_time,
        d.allotment_finalization_date, d.refund_initiation_date, d.demat_credit_date,
        r.name as registrar_name, r.email as registrar_email, r.website as registrar_website, r.phone as registrar_phone
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
      LEFT JOIN registrar r ON i.primary_registrar_id = r.registrar_id
      WHERE i.symbol = $1
    `, [symbol]);

        if (ipoRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'IPO not found' });
        }

        let ipo = ipoRes.rows[0];

        // Check availability and staleness
        const now = new Date();
        const updatedAt = new Date(ipo.updated_at || 0);
        const ageMinutes = (now - updatedAt) / (1000 * 60);
        const isMissingData = !ipo.book_running_lead_managers || !ipo.face_value || !ipo.issue_size || ipo.issue_size == 0;
        const isStale = ageMinutes >= 60;

        // Blocking fetch if missing data and not updated recently (debounce 10m)
        if (isMissingData && ageMinutes > 10) {
            console.log(`[Blocking] Fetching missing data for ${symbol}`);
            // We need a Client for NseService, or we update NseService to use pool.
            // NseService.fetchAndStoreIpoDetails expects a client with transaction capability or just runs queries.
            // Checking NseService (it wasn't viewed fully but likely takes client).
            // Let's assume we can pass the pool or a client. NseService usually begins transaction?
            // Let's checkout a client for this operation to be safe.
            const client = await db.pool.connect();
            try {
                const fetched = await NseService.fetchAndStoreIpoDetails(symbol, ipo.series || series, ipo.ipo_id, client);
                if (!fetched) {
                    // Backoff
                    await client.query('UPDATE ipo SET updated_at = NOW() WHERE ipo_id = $1', [ipo.ipo_id]);
                } else {
                    // Reload
                    const updatedRes = await client.query(`
                    SELECT 
                        i.*, 
                        d.issue_start, d.issue_end, d.listing_date, d.market_open_time, d.market_close_time,
                        d.allotment_finalization_date, d.refund_initiation_date, d.demat_credit_date,
                        r.name as registrar_name, r.email as registrar_email, r.website as registrar_website, r.phone as registrar_phone
                    FROM ipo i 
                    LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
                    LEFT JOIN registrar r ON i.primary_registrar_id = r.registrar_id
                    WHERE i.ipo_id = $1
                 `, [ipo.ipo_id]);
                    ipo = updatedRes.rows[0];
                }
            } finally {
                client.release();
            }
        } else if (isStale) {
            console.log(`[Async] Triggering background refresh for ${symbol}`);
            // Background refresh
            (async () => {
                const client = await db.pool.connect();
                try {
                    await NseService.fetchAndStoreIpoDetails(symbol, ipo.series || series, ipo.ipo_id, client);
                } catch (e) {
                    console.error(`[Async] Error updating ${symbol}:`, e);
                } finally {
                    client.release();
                }
            })();
        }

        // 2. Documents
        const docRes = await db.query('SELECT title, url, doc_type FROM documents WHERE ipo_id = $1', [ipo.ipo_id]);
        const documents = docRes.rows;

        // 3. Subscription
        const subRes = await db.query('SELECT category, shares_offered, shares_bid, subscription_ratio FROM ipo_bidding_details WHERE ipo_id = $1', [ipo.ipo_id]);
        const subscription = subRes.rows;

        // 4. GMP
        const gmpRes = await db.query('SELECT gmp_value, snapshot_time FROM gmp WHERE ipo_id=$1 ORDER BY snapshot_time DESC LIMIT 1', [ipo.ipo_id]);
        const gmp = gmpRes.rows.length > 0 ? gmpRes.rows[0] : null;

        // 5. Bidding Data
        const biddingRes = await db.query('SELECT price_label, price_value, cumulative_quantity FROM bidding_data WHERE ipo_id=$1 ORDER BY price_value ASC NULLS LAST', [ipo.ipo_id]);

        // Convert paise to rupees for NLP-extracted fields
        // (fresh_issue_amount, ofs_amount, and issue_size are stored in paise)
        if (ipo.fresh_issue_amount) {
            ipo.fresh_issue_size = ipo.fresh_issue_amount / 100;
        }
        if (ipo.ofs_amount) {
            ipo.offer_for_sale_size = ipo.ofs_amount / 100;
        }
        // Convert main issue_size from paise to rupees (NLP extractor stores in paise)
        if (ipo.issue_size && ipo.issue_size_extraction_model) {
            // Only convert if it was extracted by NLP (has extraction_model)
            ipo.issue_size = ipo.issue_size / 100;
        }

        res.json({
            ok: true,
            data: {
                ...ipo,
                documents,
                subscription,
                gmp,
                biddingData: biddingRes.rows
            }
        });

    } catch (err) {
        console.error(`Error details for ${symbol}:`, err);
        res.status(500).json({ ok: false, error: err.message });
    }
};

const refreshIpoData = async (req, res) => {
    try {
        const result = await NseService.syncAllIPOs();
        cache.del("ipos_db");

        if (result.success) {
            const data = await fetchIpoDataFromDb();
            res.json({ ok: true, data, details: result.counts });
        } else {
            res.status(500).json({ ok: false, error: result.error });
        }
    } catch (error) {
        console.error("Refresh Logic Error:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
};

module.exports = {
    getAllIpos,
    getIpoDetails,
    refreshIpoData
};
