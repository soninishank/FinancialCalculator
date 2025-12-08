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

// Helper function (make sure this exists in your utils/finance.js)
export function calculateEMI(principal, monthlyRate, months) {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1);
}

export function calculateCAGR(beginningValue, endingValue, years) {
  if (years === 0 || beginningValue === 0) return 0;
  if (beginningValue < 0 || endingValue < 0) return 0; // Prevent complex math/errors

  const ratio = endingValue / beginningValue;
  const exponent = 1 / years;
  
  // CAGR in decimal form
  const cagrDecimal = Math.pow(ratio, exponent) - 1;
  
  return cagrDecimal * 100; // Convert to percentage
}

export function computeDualAmortization({
  basePrincipal, baseRate, baseYears,
  topUpPrincipal, topUpRate, topUpYear
}) {
  const R_base_m = baseRate / 12 / 100;
  const R_topUp_m = topUpRate / 12 / 100;
  const totalMonths = baseYears * 12;
  const topUpMonth = topUpYear * 12;
  
  let balance = basePrincipal;
  let totalInterest = 0;
  const rows = [];

  // Calculate Base Loan EMI
  const baseEMI = calculateEMI(basePrincipal, R_base_m, totalMonths);
  
  let monthlyInterestAccumulator = 0;
  let monthlyPrincipalAccumulator = 0;
  let yearOpeningBalance = basePrincipal;
  
  // --- Stage 1: Base Loan Only ---
  for (let m = 1; m <= topUpMonth; m++) {
    const interest = balance * R_base_m;
    const principalPaid = baseEMI - interest;
    balance -= principalPaid;
    
    totalInterest += interest;
    
    monthlyInterestAccumulator += interest;
    monthlyPrincipalAccumulator += principalPaid;

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        openingBalance: yearOpeningBalance,
        principalPaid: monthlyPrincipalAccumulator,
        interestPaid: monthlyInterestAccumulator,
        closingBalance: Math.max(0, balance),
      });
      yearOpeningBalance = balance; // This will be updated after top-up if needed
      monthlyInterestAccumulator = 0;
      monthlyPrincipalAccumulator = 0;
    }
  }
  
  // --- Top-Up Occurs ---
  balance += topUpPrincipal;
  
  // CRITICAL FIX: Update the opening balance for the next year to include top-up
  yearOpeningBalance = balance;
  
  const N_remaining = totalMonths - topUpMonth;
  const newCombinedEMI = calculateEMI(balance, R_topUp_m, N_remaining);
  
  // --- Stage 2: Combined Loan ---
  for (let m = topUpMonth + 1; m <= totalMonths; m++) {
    const interest = balance * R_topUp_m;
    const principalPaid = newCombinedEMI - interest;
    balance -= principalPaid;

    totalInterest += interest;
    
    monthlyInterestAccumulator += interest;
    monthlyPrincipalAccumulator += principalPaid;

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        openingBalance: yearOpeningBalance,
        principalPaid: monthlyPrincipalAccumulator,
        interestPaid: monthlyInterestAccumulator,
        closingBalance: Math.max(0, balance),
      });
      yearOpeningBalance = balance;
      monthlyInterestAccumulator = 0;
      monthlyPrincipalAccumulator = 0;
    }
  }

  // Handle partial final year if needed
  if (totalMonths % 12 !== 0) {
    rows.push({
      year: Math.ceil(totalMonths / 12),
      openingBalance: yearOpeningBalance,
      principalPaid: monthlyPrincipalAccumulator,
      interestPaid: monthlyInterestAccumulator,
      closingBalance: Math.max(0, balance),
    });
  }

  const finalTotalPaid = baseEMI * topUpMonth + newCombinedEMI * N_remaining;
  
  return { 
    rows, 
    finalTotalInterest: totalInterest, 
    finalTotalPaid, 
    monthlyEMI: newCombinedEMI 
  };
}

export function computeSWPPlan({ 
  initialCorpus, 
  annualRate, 
  years, 
  monthlyWithdrawal, 
  annualWithdrawalIncrease 
}) {
  const rows = [];
  let currentCorpus = initialCorpus;
  let totalWithdrawn = 0;
  let totalInterest = 0;
  let depletionYear = 0;
  let depletionMonth = 0;
  let currentMonthlyWithdrawal = monthlyWithdrawal;

  const monthlyRate = annualRate / 12 / 100;
  const annualIncreaseFactor = 1 + annualWithdrawalIncrease / 100;

  for (let year = 1; year <= years; year++) {
    const openingBalance = currentCorpus;
    let yearlyWithdrawal = 0;
    let yearlyInterest = 0;
    let corpusDepleted = false;

    // Process 12 months for this year
    for (let month = 1; month <= 12; month++) {
      // Stop if corpus is already depleted
      if (currentCorpus <= 0) {
        corpusDepleted = true;
        currentCorpus = 0;
        break;
      }

      // Step 1: Calculate and add monthly interest on current balance FIRST
      // This is how SWP actually works - corpus grows first, then you withdraw
      const monthlyInterest = currentCorpus * monthlyRate;
      yearlyInterest += monthlyInterest;
      currentCorpus += monthlyInterest;

      // Step 2: Withdraw money (full amount if available)
      const actualWithdrawal = Math.min(currentMonthlyWithdrawal, currentCorpus);
      currentCorpus -= actualWithdrawal;
      yearlyWithdrawal += actualWithdrawal;

      // Step 3: Check if corpus depleted this month
      if (currentCorpus <= 0) {
        currentCorpus = 0;
        corpusDepleted = true;
        
        // Record the year and month of depletion (only once)
        if (depletionYear === 0) {
          depletionYear = year;
          depletionMonth = month;
        }
        break;
      }
    }

    // Record this year's data
    rows.push({
      year,
      openingBalance,
      totalWithdrawal: yearlyWithdrawal,
      interestEarned: yearlyInterest,
      closingBalance: Math.max(0, currentCorpus),
    });

    // Update totals
    totalWithdrawn += yearlyWithdrawal;
    totalInterest += yearlyInterest;

    // If corpus depleted, stop processing future years
    if (corpusDepleted) {
      break;
    }

    // Apply annual withdrawal increase for next year
    currentMonthlyWithdrawal *= annualIncreaseFactor;
  }

  return {
    rows,
    finalCorpus: Math.max(0, currentCorpus),
    totalWithdrawn,
    totalInterest,
    depletionYear,
    depletionMonth,
    depletionTotalMonths: depletionYear > 0 ? (depletionYear - 1) * 12 + depletionMonth : 0,
  };
}