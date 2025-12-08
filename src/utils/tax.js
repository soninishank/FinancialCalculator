// src/utils/tax.js

// Default values (decimal for rates)
export const DEFAULT_LTCG_TAX_RATE_DECIMAL = 0.10; // 10%
export const DEFAULT_LTCG_EXEMPTION = 100000; // ₹1,00,000 fallback

// Hard limits (change if product rules differ)
export const MAX_LTCG_TAX_RATE_DECIMAL = 0.35; // 35% maximum enforced
export const MAX_LTCG_EXEMPTION_FALLBACK = 200000; // ₹2,00,000 maximum exemption by default

// Per-currency default exemptions (used as FALLBACKS and as max per currency if not overridden)
export const LTCG_EXEMPTION_BY_CURRENCY = {
  INR: 200000, // ₹2,00,000
  USD: 100000,
  EUR: 100000,
  GBP: 100000
};

// Helper: get configured/currency exemption fallback
export function getLTCGExemption(currency) {
  if (!currency) return DEFAULT_LTCG_EXEMPTION;
  const upper = String(currency).toUpperCase();
  return LTCG_EXEMPTION_BY_CURRENCY[upper] ?? DEFAULT_LTCG_EXEMPTION;
}

// Helper: clamp number to min/max
function clamp(value, min, max) {
  if (Number.isNaN(value) || value === undefined || value === null) return min;
  return Math.max(min, Math.min(max, value));
}

export function calculateLTCG(
  totalGain,
  investedAmount,
  isTaxApplied,
  options = {}
) {
  // Basic guards & cast
  const gain = Number(totalGain) || 0;
  const invested = Number(investedAmount) || 0;
  
  if (!isTaxApplied || gain <= 0) {
    const netGain = gain;
    const netFutureValue = invested + netGain;
    return {
      taxAmount: 0,
      netGain: Math.round(netGain),
      netFutureValue: Math.round(netFutureValue),
      taxableGain: 0,
      exemptionUsed: 0,
      taxRateUsed: 0,
    };
  }

  const {
    taxRate: rawTaxRate = DEFAULT_LTCG_TAX_RATE_DECIMAL,
    currency,
    exemptionApplied = false,
    exemptionLimit: rawExemptionLimit = 0,
    maxExemption: optMaxExemption,
    maxTaxRateDecimal: optMaxTaxRate,
  } = options;

  // Determine the maximum allowed tax rate (decimal)
  const maxTaxRateDecimal = typeof optMaxTaxRate === 'number'
    ? optMaxTaxRate
    : MAX_LTCG_TAX_RATE_DECIMAL;

  // Normalize tax rate:
  // - if user passes > 1.0, assume percent (e.g., 30 -> 0.30)
  // - else assume decimal (0.10)
  let taxRateDecimal = Number(rawTaxRate);
  if (Number.isNaN(taxRateDecimal) || taxRateDecimal === undefined || taxRateDecimal === null) {
    taxRateDecimal = DEFAULT_LTCG_TAX_RATE_DECIMAL;
  } else if (taxRateDecimal > 1) {
    taxRateDecimal = taxRateDecimal / 100; // percent -> decimal
  }

  // Clamp tax rate to [0, maxTaxRateDecimal]
  taxRateDecimal = clamp(taxRateDecimal, 0, maxTaxRateDecimal);

  // Determine maximum allowed exemption (per-currency or override)
  const perCurrencyExemption = getLTCGExemption(currency);
  const maxExemptionAllowed = typeof optMaxExemption === 'number'
    ? optMaxExemption
    : perCurrencyExemption ?? MAX_LTCG_EXEMPTION_FALLBACK;

  // Exemption used only if exemptionApplied is true
  let exemptionUsed = 0;
  if (exemptionApplied) {
    let candidate = Number(rawExemptionLimit) || 0;
    // Enforce non-negative
    candidate = Math.max(0, candidate);
    // Clamp to maximum allowed
    exemptionUsed = clamp(candidate, 0, maxExemptionAllowed);
  }

  // Taxable gain after exemption
  const taxableGain = Math.max(0, gain - exemptionUsed);

  // Tax amount - calculate on raw values, round at the end
  const taxAmountRaw = taxableGain * taxRateDecimal;

  // Net gain and future value - calculate with rounded tax
  const taxAmount = Math.round(taxAmountRaw);
  const netGain = gain - taxAmount;
  const netFutureValue = invested + netGain;

  return {
    taxAmount,
    netGain: Math.round(netGain),
    netFutureValue: Math.round(netFutureValue),
    taxableGain: Math.round(taxableGain),
    exemptionUsed: Math.round(exemptionUsed),
    taxRateUsed: taxRateDecimal,
  };
}