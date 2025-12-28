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

/**
 * Computes yearly schedule for SIP, LumpSum, or both.
 * Merges logic from PureSIP and SIPWithLumpSum.
 */
export function computeYearlySchedule({
  monthlySIP = 0,
  lumpSum = 0,
  annualRate,
  totalYears,
  sipYears = totalYears,
}) {
  const r_m = annualRate / 12 / 100;
  // Ensure we cover the full duration if fractional years were passed
  const totalMonths = Math.ceil(totalYears * 12);
  const sipMonths = Math.ceil(sipYears * 12);

  let balance = lumpSum;
  let monthlyInvested = 0;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Contribute only if within SIP period
    if (m <= sipMonths) {
      balance += monthlySIP;
      monthlyInvested += monthlySIP;
    }

    // Compound interest
    balance = balance * (1 + r_m);

    // Snapshot at year end (every 12 months)
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: monthlyInvested + lumpSum,
        sipInvested: monthlyInvested,
        lumpSum: lumpSum,
        growth: balance - (monthlyInvested + lumpSum),
        overallValue: balance,
      });
    }
  }

  // Handle partial last year if needed (though usually we stick to full years)
  // But if totalMonths is not a multiple of 12, we might miss the last chunk.
  // The existing components relied on years being effective integers or just looping.

  return rows;
}

/**
 * Computes yearly schedule for Step-Up SIP.
 */
export function computeStepUpSchedule({ initialSIP, stepUpPercent, annualRate, totalYears, sipYears }) {
  const r_m = annualRate / 12 / 100;
  const totalMonths = Math.ceil(totalYears * 12);
  const sipMonths = Math.ceil(sipYears * 12);

  let balance = 0;
  let totalInvested = 0;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    // 1. Calculate what the SIP *would* be for this year (Step-up logic)
    const yearIndex = Math.floor((m - 1) / 12);
    const currentMonthlySIP = Number(initialSIP) * Math.pow(1 + stepUpPercent / 100, yearIndex);

    // 2. Only contribute if within the SIP Duration
    if (m <= sipMonths) {
      balance += currentMonthlySIP;
      totalInvested += currentMonthlySIP;
    }

    // 3. Apply Interest (Always happens)
    balance = balance * (1 + r_m);

    // 4. Snapshot at year end
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: totalInvested,
        sipInvested: totalInvested,
        stepUpAppliedPercent: stepUpPercent,
        growth: balance - totalInvested,
        overallValue: balance,
      });
    }
  }
  return rows;
}

/**
 * Calculates the Real (Inflation-Adjusted) Value of a future amount.
 * @param {number} nominalValue - The future value in today's terms (without inflation).
 * @param {number} inflationRate - Annual inflation rate in percent.
 * @param {number} years - Number of years.
 * @returns {number} - The real purchasing power.
 */
export function calculateRealValue(nominalValue, inflationRate, years) {
  if (inflationRate === 0 || years === 0) return nominalValue;
  const inflationDecimal = inflationRate / 100;
  return nominalValue / Math.pow(1 + inflationDecimal, years);
}

// --- NEW FIRE & WEALTH CALCULATOR FUNCTIONS ---

/**
 * Calculates Time to FIRE (Financial Independence).
 * Goal: Corpus where (Corpus * SWR) >= Annual Expenses
 */
export function calculateTimeToFIRE({
  currentCorpus,
  monthlyExpenses,
  monthlyInvestment,
  annualReturn,
  swr, // Safe Withdrawal Rate (e.g., 4%)
  inflation = 0 // Optional: if we want to target real corpus
}) {
  // Target Corpus = (Monthly Exp * 12) / (SWR / 100)
  const annualExpenses = monthlyExpenses * 12;
  const targetCorpus = annualExpenses / (swr / 100);

  // If already reached
  if (currentCorpus >= targetCorpus) return { years: 0, months: 0, targetCorpus };

  // Calculate Real Rate if inflation is provided
  // Real Rate = ((1 + Nominal) / (1 + Inflation)) - 1
  let effectiveAnnualRate = annualReturn;
  if (inflation > 0) {
    effectiveAnnualRate = ((1 + annualReturn / 100) / (1 + inflation / 100) - 1) * 100;
  }

  // Calculate true monthly rate from effective annual return (proper compounding)
  // (1 + r_annual)^(1/12) - 1 ensures monthly rate compounds to annual rate
  const r_m = Math.pow(1 + effectiveAnnualRate / 100, 1 / 12) - 1;

  // Solving for n in Future Value of Annuity formula mixed with Loop for simplicity
  // FV = CurrentCorpus*(1+r)^n + PMT * ...
  // Since n is unknown and in exponent, we can solve logarithmically or iterate.
  // Iteration is safer to avoid complex log edge cases with negative flows.

  let corpus = currentCorpus;
  let months = 0;
  let cumulativeInvestment = currentCorpus;
  let investedThisYear = 0;
  const rows = [];

  // Add initial state (Year 0)
  rows.push({
    year: 0,
    totalInvested: cumulativeInvestment,
    growth: 0,
    overallValue: corpus,
    targetCorpus,
    annualExpenses,
    annualInvestment: 0, // No investment made at the very start instant
    swr
  });

  // Safety break at 100 years
  while (corpus < targetCorpus && months < 1200) {
    corpus = corpus * (1 + r_m) + monthlyInvestment;
    cumulativeInvestment += monthlyInvestment;
    investedThisYear += monthlyInvestment;
    months++;

    if (months % 12 === 0) {
      rows.push({
        year: months / 12,
        totalInvested: cumulativeInvestment,
        growth: corpus - cumulativeInvestment,
        overallValue: corpus,
        targetCorpus,
        annualExpenses,
        annualInvestment: investedThisYear,
        swr
      });
      investedThisYear = 0;
    }
  }

  // Add final partial year if needed
  if (months % 12 !== 0) {
    const finalYear = +(months / 12).toFixed(1); // One decimal place for partial year
    rows.push({
      year: finalYear,
      totalInvested: cumulativeInvestment,
      growth: corpus - cumulativeInvestment,
      overallValue: corpus,
      targetCorpus,
      annualExpenses,
      annualInvestment: investedThisYear,
      swr
    });
  }

  return {
    years: Math.floor(months / 12),
    months: months % 12,
    targetCorpus,
    rows
  };
}

/**
 * Calculates Coast FIRE.
 * The amount you need TODAY so that it grows to your FI Number by retirement age
 * without any further contributions.
 */
export function calculateCoastFIRE({
  currentAge,
  retirementAge,
  monthlyExpenses,
  swr,
  annualReturn,
  inflation
}) {
  const yearsToGrow = retirementAge - currentAge;
  if (yearsToGrow <= 0) return 0;

  // 1. Calculate FI Number needed at Retirement Age
  // We need to adjust expenses for inflation to get the nominal FI number needed then.
  const inflationDec = inflation / 100;
  const futureAnnualExpenses = (monthlyExpenses * 12) * Math.pow(1 + inflationDec, yearsToGrow);

  const fiNumberAtRetirement = futureAnnualExpenses / (swr / 100);

  // 2. PV of that FI Number
  const r_dec = annualReturn / 100;
  const neededToday = fiNumberAtRetirement / Math.pow(1 + r_dec, yearsToGrow);

  return {
    neededToday,
    fiNumberAtRetirement,
    futureMonthlyExpenses: futureAnnualExpenses / 12
  };
}

/**
 * Calculates Cost of Delay.
 * Compares "Start Now" vs "Start Later".
 */
export function calculateCostOfDelay({
  monthlyInvestment,
  annualReturn,
  delayYears,
  investmentYears
}) {
  const r_m = annualReturn / 12 / 100;

  // Scenario A: Start Now, invest for X years
  // FV = P * ((1+r)^n - 1)/r * (1+r)
  const n_total = investmentYears * 12;
  const fv_now = monthlyInvestment * ((Math.pow(1 + r_m, n_total) - 1) / r_m) * (1 + r_m);

  // Scenario B: Wait D years, then invest for (X - D) years? 
  // OR usually "Cost of Delay" implies you invest for SAME duration but shift start?
  // Common interpretation: You define a goal horizon (e.g. 20 years from now).
  // If you start now, you have 20 years of compounding.
  // If you wait 5 years, you only have 15 years of compounding.

  const n_delayed = (investmentYears - delayYears) * 12;
  const fv_delayed = n_delayed > 0
    ? monthlyInvestment * ((Math.pow(1 + r_m, n_delayed) - 1) / r_m) * (1 + r_m)
    : 0;

  return {
    startedNow: fv_now,
    startedLater: fv_delayed,
    cost: fv_now - fv_delayed
  };
}

/**
 * Rent vs Buy - Simplified NPV approach for 10-20 year horizon.
 * This is complex; we'll provide a yearly ledger builder.
 */
export function computeRentVsBuyLedger({
  homePrice,
  downPayment,
  loanRate,
  loanTenureYears,
  monthlyRent,
  investReturnRate,
  propertyAppreciationRate,
  rentInflationRate,
  maintenanceRate = 1 // % of property value per year
}) {
  // 1. Setup Data
  const loanAmount = homePrice - downPayment;
  const totalLoanMonths = loanTenureYears * 12;
  const emi = calculateEMI(loanAmount, loanRate / 12 / 100, totalLoanMonths);

  let currentPropertyVal = homePrice;
  let currentMonthlyRent = monthlyRent;
  let investmentCorpus = downPayment; // Starts with DP equivalent
  let loanBalance = loanAmount;

  const ledger = [];
  const maxYears = Math.max(loanTenureYears, 30); // Show up to 30 years to see long term impact
  const totalMonths = maxYears * 12;

  // Monthly Rates
  const monthlyLoanRate = loanRate / 12 / 100;
  const monthlyInvestRate = investReturnRate / 12 / 100;



  for (let m = 1; m <= totalMonths; m++) {

    // --- BUY SCENARIO (Monthly) ---
    // A. Loan Payment
    let monthlyEMI = 0;
    let interestComponent = 0;

    if (loanBalance > 0) {
      if (m <= totalLoanMonths) {
        monthlyEMI = emi;
        interestComponent = loanBalance * monthlyLoanRate;
        let principalComponent = monthlyEMI - interestComponent;

        // Handle last month rounding or tiny balance
        if (loanBalance - principalComponent < 0) {
          principalComponent = loanBalance;
          monthlyEMI = principalComponent + interestComponent;
        }

        loanBalance -= principalComponent;
        if (loanBalance < 0) loanBalance = 0; // Floating point safety
      } else {
        // Loan finished but potentially tiny balance left due to math? 
        // Should be handled above.
        loanBalance = 0;
      }
    }

    // B. Maintenance (Monthly share of annual maintenance)
    // Maintenance is based on property value at start of year
    const annualMaintenance = currentPropertyVal * (maintenanceRate / 100);
    const monthlyMaintenance = annualMaintenance / 12;

    const totalMonthlyBuyCost = monthlyEMI + monthlyMaintenance;


    // --- RENT SCENARIO (Monthly) ---
    // A. Pay Rent
    const totalMonthlyRentCost = currentMonthlyRent;


    // --- INVESTMENT (Monthly) ---
    // Surplus = Cost of Buying - Cost of Renting
    // If Buy > Rent, we "save" less (actually negative savings relative to baseline? No.)
    // Logic: We have X amount of cash flow.
    // Scenario Buy: We spend EMI + Maint.
    // Scenario Rent: We spend Rent. Remainder = (EMI + Maint) - Rent.
    // NOTE: This assumes we *have* the cashflow to afford Buying.
    // If Surplus is negative (Rent > Buy), we withdraw from corpus to pay Rent.

    const monthlySurplus = totalMonthlyBuyCost - totalMonthlyRentCost;

    // 1. Apply Growth to existing corpus (Start of month or end? Monthly compounding usually applies to balance)
    investmentCorpus = investmentCorpus * (1 + monthlyInvestRate);

    // 2. Add Surplus (End of month contribution)
    investmentCorpus += monthlySurplus;

    // --- END OF YEAR UPDATES ---
    if (m % 12 === 0) {
      const currentYear = m / 12;

      // 1. Appreciate Property
      // Value at END of year = Value * (1 + rate)
      currentPropertyVal = currentPropertyVal * (1 + propertyAppreciationRate / 100);

      // 2. Increase Rent for NEXT year
      const nextYearRent = currentMonthlyRent * (1 + rentInflationRate / 100);

      // 3. Push to Ledger
      ledger.push({
        year: currentYear,
        propertyValue: currentPropertyVal,
        loanBalance: Math.max(0, loanBalance),
        homeEquity: currentPropertyVal - Math.max(0, loanBalance),

        rentPortfolioValue: investmentCorpus,

        netWorthBuy: currentPropertyVal - Math.max(0, loanBalance),
        netWorthRent: investmentCorpus,

        difference: Math.abs((currentPropertyVal - Math.max(0, loanBalance)) - investmentCorpus)
      });

      // Update Rent for next loop
      currentMonthlyRent = nextYearRent;

      // Reset annual trackers (not currently used in ledger output)
      // yearlyBuyOutflow = 0;
      // yearlyRentPaid = 0;
    }
  }

  return ledger;
}

/**
 * Calculates Inflation Impact.
 */
export function calculateInflationImpact(amount, inflation, years) {
  // Future Value of Amount if it sat in cash (0 growth) in real terms?
  // No, usually means: "How much will X buy in future?" -> Real Value
  return calculateRealValue(amount, inflation, years);
}

/**
 * Asset Allocation Rebalance
 */
export function calculateRebalancing({
  equity,
  debt,
  targetEquityPercent
}) {
  const total = equity + debt;
  const targetEquity = total * (targetEquityPercent / 100);
  const targetDebt = total - targetEquity;

  const equityAction = targetEquity - equity; // +Buy / -Sell
  const debtAction = targetDebt - debt;       // +Buy / -Sell

  return {
    equityAction,
    debtAction,
    targetEquity,
    targetDebt,
    currentEquityPercent: (equity / total) * 100
  };
}