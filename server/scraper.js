// server/scraper.js
const express = require("express");
const NodeCache = require("node-cache");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
app.use(cors());

const NSE_IPO_URL = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo";

async function fetchNseHtmlWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 900 });
    // go to the page and wait for networkidle (page finished loading)
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // optionally wait for a common selector to appear (if known)
    // await page.waitForSelector("table", { timeout: 5000 }).catch(() => {});

    const html = await page.content();

    // save a debug snapshot to disk so you can inspect the exact HTML the scraper saw
    try {
      const outPath = path.resolve(process.cwd(), "last_nse.html");
      fs.writeFileSync(outPath, html, "utf8");
      console.log("Wrote debug snapshot to", outPath);
    } catch (err) {
      console.warn("Failed to write debug snapshot:", err && err.message);
    }

    await browser.close();
    return html;
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

/**
 * Try to parse the HTML for IPO rows.
 * This tries multiple heuristics — adjust selectors if NSE changes layout.
 */
function parseIpoTable(html) {
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);
  const rows = [];

  // Heuristic A: table rows in a normal table
  $("table tbody tr").each((i, el) => {
    const cols = $(el).find("td");
    if (cols.length >= 4) {
      const name = $(cols[0]).text().trim();
      const type = $(cols[1]).text().trim();
      const issueStart = $(cols[2]).text().trim();
      const issueEnd = $(cols[3]).text().trim();
      // optional additional columns
      const other = [];
      for (let j = 4; j < cols.length; j++) other.push($(cols[j]).text().trim());
      rows.push({
        id: `${name}-${issueStart}-${i}`,
        name,
        type,
        issueStart,
        issueEnd,
        raw: other.join(" | "),
      });
    }
  });

  if (rows.length > 0) return rows;

  // Heuristic B: look for card/list style items (NSE sometimes uses divs)
  // Try to find elements that look like IPO items
  const itemSelectors = [
    ".ipo-list .ipo-item",
    ".upcoming-issues .issue",
    ".market-data-card", // fallback guesses
  ];
  for (const sel of itemSelectors) {
    $(sel).each((i, el) => {
      const name = $(el).find(".company-name").text().trim() || $(el).find("h3").text().trim();
      const dates = $(el).find(".dates").text().trim() || $(el).text().trim();
      if (name) {
        rows.push({
          id: `${name}-${i}`,
          name,
          type: $(el).find(".type").text().trim() || "",
          issueStart: dates,
          issueEnd: "",
          raw: $(el).text().trim().slice(0, 200),
        });
      }
    });
    if (rows.length) break;
  }

  // Heuristic C: fallback — look for any element that contains 'Open:' and parse lines
  if (rows.length === 0) {
    $("*:contains('Open')").each((i, el) => {
      const txt = $(el).text();
      if (txt && txt.length > 30) {
        rows.push({
          id: `fallback-${i}`,
          name: txt.trim().split("\n")[0].slice(0, 80),
          type: "",
          issueStart: "",
          issueEnd: "",
          raw: txt.trim().slice(0, 400),
        });
      }
    });
  }

  return rows;
}

app.get("/api/ipos", async (req, res) => {
  try {
    const cached = cache.get("ipos_full");
    if (cached) return res.json({ ok: true, data: cached });

    const html = await fetchNseHtmlWithPuppeteer(NSE_IPO_URL);
    const data = parseIpoTable(html);

    cache.set("ipos_full", data);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("scrape error:", err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: "Failed to fetch IPOs" });
  }
});

// Debug endpoint to return the raw HTML the scraper fetched
app.get("/api/debug-html", async (req, res) => {
  try {
    const html = await fetchNseHtmlWithPuppeteer(NSE_IPO_URL);
    res.set("Content-Type", "text/html");
    return res.send(html);
  } catch (err) {
    console.error("debug-html error", err && err.message);
    return res.status(500).send("Failed to fetch debug HTML: " + (err.message || err));
  }
});

const PORT = process.env.SCRAPER_PORT || 8081;
app.listen(PORT, () => console.log(`IPO scraper (puppeteer) running on http://localhost:${PORT}`));
