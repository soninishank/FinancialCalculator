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

  // If compact mode is on and number is large enough to matter
  if (compact && num > 10000) {
    return num.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      notation: "compact", // This creates "1M", "10Cr" etc automatically
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
  }

  // Standard formatting
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