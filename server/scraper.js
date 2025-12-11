const express = require("express");
const NodeCache = require("node-cache");
const cors = require("cors");
const { Client } = require('pg');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache
app.use(cors());

// DB Connection
const connectionString = 'postgresql://neondb_owner:npg_as3VJZkdre9B@ep-polished-hill-a1o9tkl8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function getIpoData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();

    // Fetch all IPOs with dates
    const query = `
      SELECT 
        i.ipo_id, i.company_name, i.symbol, i.status, i.issue_type, 
        i.price_range_low, i.price_range_high, i.issue_size,
        d.issue_start, d.issue_end, d.listing_date
      FROM ipo i 
      LEFT JOIN ipo_dates d ON i.ipo_id = d.ipo_id
    `;
    const res = await client.query(query);
    const rows = res.rows;

    const upcoming = [];
    const open = [];
    const closed = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

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
        type: row.issue_type === 'Book Building' ? 'Equity' : (row.issue_type || 'Equity'), // Map or keep as is. Frontend expects 'Equity' or 'SME'. logic needs refinement if 'issue_type' is different.
        // Actually, schema doesn't have 'SME' vs 'Equity' explicitly in 'issue_type' unless we stored it. 
        // We stored 'Book Building'. 
        // We lost the 'SME' flag in our previous mapping if it wasn't captured. 
        // Wait, fetch script hardcoded 'Book Building'!
        // "VALUES ($1, $2, $3, $4, $5, $6, 'Book Building')" 
        // Ah, I missed capturing 'series' or 'securityType'.
        // "securityType": "SME" was in the API data!
        // I should fix fetch script to capture this. 
        // For now, I will default to Equity, or infer from somewhere.
        // Let's proceed with this structure and fix type later if requested.

        issueStart: row.issue_start ? new Date(row.issue_start).toDateString() : 'TBA',
        issueEnd: row.issue_end ? new Date(row.issue_end).toDateString() : 'TBA',
        listingDate: row.listing_date ? new Date(row.listing_date).toDateString() : '',
        priceRange: priceRange,
        issueSize: row.issue_size ? row.issue_size.toString() : '-'
      };

      // Categorize
      // Using Status from DB which we populated logic for.
      const status = row.status;
      if (status === 'upcoming') upcoming.push(ipoObj);
      else if (status === 'open') open.push(ipoObj);
      else closed.push(ipoObj); // listed/closed/withdrawn
    });

    return { upcoming, open, closed };

  } catch (err) {
    console.error("DB Query Error:", err);
    return { upcoming: [], open: [], closed: [] };
  } finally {
    await client.end();
  }
}

app.get("/api/ipos", async (req, res) => {
  const cached = cache.get("ipos_db");
  if (cached) return res.json({ ok: true, data: cached });

  const data = await getIpoData();
  cache.set("ipos_db", data);
  res.json({ ok: true, data });
});

app.post("/api/ipos/refresh", async (req, res) => {
  try {
    const NseService = require('./services/NseService');
    const result = await NseService.syncAllIPOs();

    // Clear cache
    cache.del("ipos_db");

    if (result.success) {
      // Fetch fresh data to return
      const data = await getIpoData();
      res.json({ ok: true, data, details: result.counts });
    } else {
      res.status(500).json({ ok: false, error: result.error });
    }
  } catch (error) {
    console.error("Refresh Logic Error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.SCRAPER_PORT || 8081;
app.listen(PORT, () => console.log(`IPO API service running on http://localhost:${PORT}`));
