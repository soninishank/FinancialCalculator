// src/utils/formatting.js

export function moneyFormat(x, currency = "INR", compact = false) {
  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "en-IE",
    GBP: "en-GB",
  };

  const locale = localeMap[currency] || "en-US";
  const num = Number(x);

  // 1. Compact Mode (e.g. 1.25 Cr)
  // Fix: Increased significant digits to prevent 99.99 rounding to 100
  if (compact && Math.abs(num) >= 10000) {
    return num.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      notation: "compact", 
      compactDisplay: "short",
      maximumFractionDigits: 2, // Shows 99.99 Cr instead of 100 Cr
    });
  }

  // 2. Standard formatting (e.g. 99,99,99,999)
  return num.toLocaleString(locale, {
    style: "currency",
    currency: currency,
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