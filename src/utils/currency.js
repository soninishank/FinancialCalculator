// src/utils/currency.js

export const currencyOptions = [
  { code: "USD", name: "US Dollar", locale: "en-US" },
  { code: "EUR", name: "Euro", locale: "de-DE" },
  { code: "JPY", name: "Japanese Yen", locale: "ja-JP" },
  { code: "GBP", name: "British Pound", locale: "en-GB" },
  { code: "AUD", name: "Australian Dollar", locale: "en-AU" },
  { code: "CAD", name: "Canadian Dollar", locale: "en-CA" },
  { code: "CHF", name: "Swiss Franc", locale: "de-CH" },
  { code: "CNY", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "HKD", name: "Hong Kong Dollar", locale: "zh-HK" },
  { code: "INR", name: "Indian Rupee", locale: "en-IN" },
  { code: "SGD", name: "Singapore Dollar", locale: "en-SG" },
  { code: "AED", name: "UAE Dirham", locale: "ar-AE" },
  { code: "NZD", name: "NZ Dollar", locale: "en-NZ" },
  { code: "SAR", name: "Saudi Riyal", locale: "ar-SA" },
  { code: "MXN", name: "Mexican Peso", locale: "es-MX" },
  { code: "BRL", name: "Brazilian Real", locale: "pt-BR" },
  { code: "ZAR", name: "SA Rand", locale: "en-ZA" },
];

// Use compact notation above 1 million
export const COMPACT_THRESHOLD = 1_000_000;

export function moneyFormat(value, currencyCode = "INR", compactAuto = true) {
  if (value == null || isNaN(value)) return "-";
  const num = Number(value);

  const opt =
    currencyOptions.find((c) => c.code === currencyCode) ||
    currencyOptions[currencyOptions.length - 1]; // fallback INR

  // auto-compact for large numbers
  if (compactAuto && Math.abs(num) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat(opt.locale, {
      style: "currency",
      currency: currencyCode,
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat(opt.locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(num);
}