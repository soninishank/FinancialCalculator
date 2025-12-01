export function calcSIPFutureValue(P, r_m, n) {
  if (r_m === 0) return P * n;
  return P * ((Math.pow(1 + r_m, n) - 1) / r_m) * (1 + r_m);
}

export function calcLumpFutureValue(L, r_m, n) {
  return L * Math.pow(1 + r_m, n);
}

export function getRequiredSIP(target, annualRate, years) {
  const r_m = annualRate / 12 / 100;
  const n = years * 12;
  if (r_m === 0) return target / n;
  
  const numerator = target * r_m;
  const denominator = (1 + r_m) * (Math.pow(1 + r_m, n) - 1);
  return numerator / denominator;
}

export function getRequiredLumpSum(target, annualRate, years) {
  const r_m = annualRate / 12 / 100;
  const n = years * 12;
  // PV = FV / (1 + r)^n
  return target / Math.pow(1 + r_m, n);
}

export function getRequiredStepUpSIP(target, annualRate, years, stepUpPercent) {
  const r_m = annualRate / 12 / 100;
  const months = years * 12;
  
  let balance = 0;
  let monthly = 1; // Start with 1 unit currency

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    monthly = 1 * Math.pow(1 + stepUpPercent / 100, yearIndex);
    balance = (balance + monthly) * (1 + r_m);
  }
  return target / balance;
}

export function calculateRealRate(nominalRate, inflationRate) {
  if (inflationRate === 0) return nominalRate; // No change if no inflation
  if (nominalRate <= inflationRate) return 0; // If return <= inflation, real rate is zero or negative

  const R = nominalRate / 100;
  const I = inflationRate / 100;
  
  // Real Rate in decimal form
  const realRate = ((1 + R) / (1 + I)) - 1;
  
  return realRate * 100; // Convert back to percentage
}