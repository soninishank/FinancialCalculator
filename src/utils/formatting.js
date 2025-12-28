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

  // 1. Compact Mode with proper Indian formatting
  if (compact && Math.abs(num) >= 10000) {
    // For INR, use Indian conventions (Lakh, Crore)
    if (currency === "INR") {
      const absNum = Math.abs(num);
      const sign = num < 0 ? "-" : "";
      const symbol = "₹";

      if (absNum >= 10000000) {
        // Crores (1 Cr = 1,00,00,000)
        const cr = absNum / 10000000;
        // Always show 2 decimals for precision: ₹10,602.65 cr
        return `${sign}${symbol}${cr.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} cr`;
      } else if (absNum >= 100000) {
        // Lakhs (1L = 1,00,000)
        const lakh = absNum / 100000;
        return `${sign}${symbol}${lakh.toFixed(2)} L`;
      } else {
        // Thousands
        const k = absNum / 1000;
        return `${sign}${symbol}${k.toFixed(2)}K`;
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