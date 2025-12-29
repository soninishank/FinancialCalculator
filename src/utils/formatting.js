// src/utils/formatting.js

export function moneyFormat(x, currency = "INR", compact = false) {
  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "en-IE",
    GBP: "en-GB",
  };

  const locale = (currency === 'INR') ? 'en-IN' : (localeMap[currency] || "en-US");
  const num = Number(x);
  if (isNaN(num)) return "0";

  // 1. Word/Human Readable Mode (e.g. "1.5 Lakh", "5.2 Cr")
  // Use compact="word" to trigger this specific verbose style
  if (compact === true || compact === "word") {
    // For INR, use Indian conventions (Lakh, Crore)
    if (currency === "INR") {
      const absNum = Math.abs(num);
      const sign = num < 0 ? "-" : "";
      const symbol = "₹";

      if (absNum >= 10000000) {
        // Crores (1 Cr = 1,00,00,000)
        const cr = absNum / 10000000;
        return `${sign}${symbol}${cr.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} Cr`;
      } else if (absNum >= 100000) {
        // Lakhs (1L = 1,00,000)
        const lakh = absNum / 100000;
        return `${sign}${symbol}${lakh.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} Lakh`;
      } else {
        // Thousands or less - fallback to standard numeric with 0 decimals for cleanliness if > 1000
        // unless it's very small
        return num.toLocaleString(locale, {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0
        });
      }
    }

    // For other currencies, use standard compact notation
    return num.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      compactDisplay: "short",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // 2. Standard formatting (e.g. 99,99,99,999)
  return num.toLocaleString(locale, {
    style: "currency",
    currency: currency,
    // Keep this at 0 for clean, large number displays
    maximumFractionDigits: 0,
  });
}

export function getCurrencySymbol(currency) {
  return (0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, "")
    .trim();
}