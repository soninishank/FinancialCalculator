export const LT_BRACKETS_2025 = {
  single: { zero: 48350, fifteen: 533400 },
  married: { zero: 96700, fifteen: 600050 },
  head: { zero: 64750, fifteen: 566700 },
};

export const NIIT_THRESHOLDS = {
  single: 200000,
  married: 250000,
  head: 200000,
};

function clampNonNegative(value) {
  return Math.max(0, Number(value) || 0);
}

function calculateProgressiveLongTermTax(gain, ordinaryIncome, filingStatus) {
  const brackets = LT_BRACKETS_2025[filingStatus] || LT_BRACKETS_2025.single;
  let remainingGain = clampNonNegative(gain);
  let stackedIncome = clampNonNegative(ordinaryIncome);
  let taxAmount = 0;

  const zeroBandRoom = Math.max(0, brackets.zero - stackedIncome);
  const zeroBandGain = Math.min(remainingGain, zeroBandRoom);
  remainingGain -= zeroBandGain;
  stackedIncome += zeroBandGain;

  const fifteenBandRoom = Math.max(0, brackets.fifteen - stackedIncome);
  const fifteenBandGain = Math.min(remainingGain, fifteenBandRoom);
  taxAmount += fifteenBandGain * 0.15;
  remainingGain -= fifteenBandGain;

  taxAmount += remainingGain * 0.20;
  return taxAmount;
}

function calculateNiit(gain, ordinaryIncome, filingStatus) {
  const threshold = NIIT_THRESHOLDS[filingStatus] || NIIT_THRESHOLDS.single;
  const totalIncome = clampNonNegative(ordinaryIncome) + clampNonNegative(gain);
  const excessOverThreshold = Math.max(0, totalIncome - threshold);
  const niitBase = Math.min(clampNonNegative(gain), excessOverThreshold);
  return niitBase * 0.038;
}

export function calculateUSCapitalGainsTax({
  purchasePrice = 0,
  salePrice = 0,
  isLongTerm = true,
  filingStatus = 'single',
  annualIncome = 0,
  shortTermRate = 24,
}) {
  const basis = clampNonNegative(purchasePrice);
  const proceeds = clampNonNegative(salePrice);
  const gain = proceeds - basis;

  if (gain <= 0) {
    return {
      gain,
      taxRate: 0,
      taxAmount: 0,
      niitAmount: 0,
      netProfit: gain,
      roi: basis > 0 ? (gain / basis) * 100 : 0,
    };
  }

  let taxAmount = 0;
  let niitAmount = 0;

  if (isLongTerm) {
    taxAmount = calculateProgressiveLongTermTax(gain, annualIncome, filingStatus);
    niitAmount = calculateNiit(gain, annualIncome, filingStatus);
  } else {
    taxAmount = gain * ((Number(shortTermRate) || 0) / 100);
  }

  const totalTax = taxAmount + niitAmount;
  const netProfit = gain - totalTax;

  return {
    gain,
    taxRate: gain > 0 ? (totalTax / gain) * 100 : 0,
    taxAmount: totalTax,
    niitAmount,
    netProfit,
    roi: basis > 0 ? (netProfit / basis) * 100 : 0,
  };
}
