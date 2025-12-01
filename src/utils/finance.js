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
export function calculateEMI(P, R_m, N) {
  if (R_m === 0) return P / N; // Simple division if interest is 0
  
  const factor = Math.pow(1 + R_m, N);
  return P * R_m * (factor / (factor - 1));
}


export function computeLoanAmortization({ principal, annualRate, years, emi }) {
  const R_m = annualRate / 12 / 100;
  const N = years * 12;

  let balance = principal;
  const rows = [];
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  for (let m = 1; m <= N; m++) {
    const interestPaidThisMonth = balance * R_m;
    const principalPaidThisMonth = emi - interestPaidThisMonth;
    balance -= principalPaidThisMonth;

    totalInterestPaid += interestPaidThisMonth;
    totalPrincipalPaid += principalPaidThisMonth;

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        openingBalance: principal, // Constant for summary table clarity
        principalPaid: totalPrincipalPaid,
        interestPaid: totalInterestPaid,
        closingBalance: Math.max(0, balance), // Ensure balance doesn't go negative due to rounding
      });
      
      // Reset yearly totals for next year's row creation (optional, but cleaner for a yearly summary)
      totalInterestPaid = 0;
      totalPrincipalPaid = 0;
    }
  }

  // The last entry needs to be created even if it's not exactly month 12, but since we are computing full years, the logic above is fine.
  // The 'total' logic below is what matters most for the summary.
  
  // NOTE: For the final summary, we'll need to re-run the loop for total amounts
  let finalTotalInterest = (emi * N) - principal;
  let finalTotalPaid = emi * N;
  
  return { rows, finalTotalInterest: finalTotalInterest, finalTotalPaid: finalTotalPaid };
}