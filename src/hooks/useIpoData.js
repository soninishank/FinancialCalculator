// src/hooks/useIpoData.js
import { useState, useEffect } from "react";
import { fetchIpos } from "../api/ipo";

/**
 * Parse indian-formatted numbers like "3,63,53,276" -> Number
 */
function parseIndianNumber(s) {
  if (s === null || s === undefined) return null;
  const cleaned = String(s).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize rows returned by the scraper to the fields used by the table:
 * - id, name, type, openDate, closeDate, issuePrice, issueSize, gmp, estimatedPrice, gainPercentage
 */
function normalize(scraped) {
  if (!Array.isArray(scraped)) return [];
  return scraped.map((r = {}) => {
    // r.raw came in like: "Active | 45,71,882 | 93,23,118 | 2.04"
    let issueSize = null;
    let rawParts = [];
    if (r.raw) rawParts = r.raw.split("|").map(p => p.trim());

    if (rawParts.length >= 2) {
      issueSize = parseIndianNumber(rawParts[1]);
    }

    // attempt to infer a gain/ratio from last piece if it looks numeric
    let maybeRatio = null;
    if (rawParts.length >= 4) {
      const v = Number(rawParts[3].replace(/,/g, ""));
      maybeRatio = Number.isFinite(v) ? v : null;
    }

    return {
      id: r.id || `${r.name || 'unknown'}-${r.issueStart || ''}`,
      name: r.name || r.company || "Unknown",
      type: r.type || "EQ",
      openDate: r.issueStart || r.openDate || "",
      closeDate: r.issueEnd || r.closeDate || "",
      listingDate: r.listingDate || "",
      priceRange: r.priceRange || "",
      issuePrice: r.issuePrice ?? null,
      issueSize: r.issueSize || issueSize, // Use provided issueSize if available
      gmp: r.gmp ?? null,
      estimatedPrice: r.estimatedPrice ?? null,
      gainPercentage: maybeRatio !== null ? maybeRatio : null,
      raw: r.raw || "",
    };
  });
}

export function useIpoData({ live = true } = {}) {
  const [categorizedData, setCategorizedData] = useState({ upcoming: [], open: [], closed: [] });
  const [isLoading, setIsLoading] = useState(live);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        // fetchIpos now returns { upcoming: [], open: [], closed: [] }
        const source = live ? await fetchIpos() : { upcoming: [], open: [], closed: [] };

        if (mounted) {
          setCategorizedData({
            upcoming: normalize(source.upcoming || []),
            open: normalize(source.open || []),
            closed: normalize(source.closed || [])
          });
          setLastUpdated(new Date().toISOString());
        }
      } catch (err) {
        console.error("useIpoData error:", err);
        if (mounted) {
          setError(err);
          // Fallback to empty if error
          setCategorizedData({ upcoming: [], open: [], closed: [] });
          setLastUpdated(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [live]);

  return { categorizedData, isLoading, error, lastUpdated };
}
