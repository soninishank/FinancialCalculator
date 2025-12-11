const express = require("express");
const NodeCache = require("node-cache");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache for API responses (memory)
app.use(cors());

const NSE_IPO_URL = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo";
const DATA_FILE_PATH = path.resolve(__dirname, "data", "ipos.json");

// --- Helper: Date Parsing ---
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Expected format: "DD-MMM-YYYY" e.g., "12-Dec-2025"
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(`${parts[1]} ${parts[0]} ${parts[2]}`); // "Dec 12 2025"
}

// --- Scraper Logic ---
async function fetchNseHtmlWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new"
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 900 });

    // Go to page
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const html = await page.content();
    await browser.close();
    return html;
  } catch (err) {
    await browser.close().catch(() => { });
    throw err;
  }
}

function parseIpoTable(html) {
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);
  const rows = [];

  // Try standard table parsing
  $("table tbody tr").each((i, el) => {
    const cols = $(el).find("td");
    if (cols.length >= 4) {
      const name = $(cols[0]).text().trim();
      // Sometimes the name might have a link, handled by .text()
      const type = $(cols[1]).text().trim(); // "Book Building" etc
      const issueStart = $(cols[2]).text().trim();
      const issueEnd = $(cols[3]).text().trim();

      // Basic validation
      if (name && (issueStart || issueEnd)) {
        rows.push({
          id: `${name}-${i}`,
          name,
          type,
          issueStart,
          issueEnd,
          raw: $(el).text().trim().slice(0, 200)
        });
      }
    }
  });

  return rows;
}

function categorizeIPOs(rawIpos) {
  const now = new Date();
  // Reset time part to ensure fair comparison
  now.setHours(0, 0, 0, 0);

  const upcoming = [];
  const open = [];
  const closed = [];

  rawIpos.forEach(ipo => {
    const start = parseDate(ipo.issueStart);
    const end = parseDate(ipo.issueEnd);

    // If dates are invalid, maybe push to "upcoming" or "closed" based on context? 
    // For safety, if we can't parse dates, we might skip or put in closed.
    // Let's check "Open" first: Start <= Now <= End

    if (start && end) {
      if (now < start) {
        upcoming.push(ipo);
      } else if (now >= start && now <= end) {
        open.push(ipo);
      } else {
        closed.push(ipo);
      }
    } else if (start && !end) {
      // If only start is known and it's future
      if (now < start) upcoming.push(ipo);
      else open.push(ipo); // Assume open if started and no end date known yet
    } else {
      // Fallback or just 'Recently Closed' if mostly likely listing is past
      closed.push(ipo);
    }
  });

  return { upcoming, open, closed };
}

// --- Core Fetch Function ---
async function fetchAndCacheIPOs() {
  console.log("Starting scheduled IPO fetch...");
  try {
    const html = await fetchNseHtmlWithPuppeteer(NSE_IPO_URL);
    const rawData = parseIpoTable(html);
    const categorized = categorizeIPOs(rawData);

    const payload = {
      lastUpdated: new Date().toISOString(),
      count: rawData.length,
      data: categorized
    };

    // Save to file
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(payload, null, 2), "utf8");
    console.log(`IPO fetch successful. Saved ${rawData.length} items.`);

    // Update memory cache
    cache.set("ipos_full", payload);
    return payload;
  } catch (err) {
    console.error("Error in fetchAndCacheIPOs:", err);
    return null;
  }
}

// --- Initialization & Cron ---

// Load initial data if exists
if (fs.existsSync(DATA_FILE_PATH)) {
  try {
    const fileData = fs.readFileSync(DATA_FILE_PATH, "utf8");
    cache.set("ipos_full", JSON.parse(fileData));
    console.log("Loaded initial IPO data from disk.");
  } catch (err) {
    console.error("Failed to load existing data file:", err);
  }
}

// Check if we need a fresh fetch immediately (if no data)
if (!cache.get("ipos_full")) {
  fetchAndCacheIPOs();
}

// Schedule Cron: Run every hour at minute 0
cron.schedule("0 * * * *", () => {
  fetchAndCacheIPOs();
});

// --- API Endpoints ---
app.get("/api/ipos", async (req, res) => {
  const cached = cache.get("ipos_full");
  if (cached) {
    return res.json({ ok: true, ...cached });
  }

  // If not in cache (and scraping failed or in progress), try triggering one, but return empty for now or wait?
  // Let's try to fetch if missing
  const data = await fetchAndCacheIPOs();
  if (data) return res.json({ ok: true, ...data });

  return res.status(500).json({ ok: false, error: "Data unavailable" });
});

// Force refresh endpoint
app.post("/api/ipos/refresh", async (req, res) => {
  const data = await fetchAndCacheIPOs();
  if (data) return res.json({ ok: true, ...data });
  return res.status(500).json({ ok: false, error: "Refresh failed" });
});

const PORT = process.env.SCRAPER_PORT || 8081;
app.listen(PORT, () => console.log(`IPO scraper service running on http://localhost:${PORT}`));

