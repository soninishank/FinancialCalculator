export function calcSIPFutureValue(P, r_m, n) {
  if (r_m === 0) return P * n;
  return P * ((Math.pow(1 + r_m, n) - 1) / r_m) * (1 + r_m);
}

export function calcLumpFutureValue(L, r_m, n) {
  return L * Math.pow(1 + r_m, n);
}

// Precise interest functions
export function calculateSimpleInterest({ principal, rate, time, timeUnit = 'years', startDate, endDate, scheduleStartDate = new Date().toISOString().slice(0, 7) }) {
  let t = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    t = diffTime / (1000 * 60 * 60 * 24 * 365.25); // years
  } else {
    if (timeUnit === 'years') t = Number(time);
    else if (timeUnit === 'months') t = Number(time) / 12;
    else if (timeUnit === 'days') t = Number(time) / 365;
  }

  const P = Number(principal);
  const R = Number(rate);
  const interest = (P * R * t) / 100;

  // Generate breakdown data
  const yearlyData = [];
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [startYear, startMonth] = scheduleStartDate.split('-').map(Number);

  const totalMonths = Math.min(Math.ceil(t * 12), 1200); // Cap at 100 years for safety
  if (isNaN(totalMonths) || totalMonths <= 0) return { interest, totalAmount: P + interest, timeInYears: t, yearlyData: [], monthlyData: [] };

  for (let m = 1; m <= totalMonths; m++) {
    const monthsElapsed = m;
    const currentT = monthsElapsed / 12;
    const currentInterest = (P * R * currentT) / 100;

    const actualMonthIndex = (startMonth - 1 + m - 1) % 12;
    const yearsElapsed = Math.floor((startMonth - 1 + m - 1) / 12);
    const actualYear = startYear + yearsElapsed;

    monthlyData.push({
      year: actualYear,
      month: (actualMonthIndex % 12) + 1,
      monthName: monthNames[actualMonthIndex],
      invested: P,
      interest: currentInterest,
      balance: P + currentInterest
    });

    if (actualMonthIndex === 11 || m === totalMonths) {
      yearlyData.push({
        year: actualYear,
        totalInvested: P,
        growth: currentInterest,
        balance: P + currentInterest
      });
    }
  }

  return {
    interest,
    totalAmount: P + interest,
    timeInYears: t,
    yearlyData,
    monthlyData
  };
}

export function calculateCompoundInterest({ principal, rate, time, timeUnit = 'years', frequency = 1, startDate, endDate, scheduleStartDate = new Date().toISOString().slice(0, 7) }) {
  let t = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    t = diffTime / (1000 * 60 * 60 * 24 * 365.25); // years
  } else {
    if (timeUnit === 'years') t = Number(time);
    else if (timeUnit === 'months') t = Number(time) / 12;
    else if (timeUnit === 'days') t = Number(time) / 365;
  }

  const P = Number(principal);
  const r = Number(rate) / 100;
  const n = Number(frequency);
  const amount = P * Math.pow(1 + r / n, n * t);

  // Generate breakdown data
  const yearlyData = [];
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [startYear, startMonth] = scheduleStartDate.split('-').map(Number);

  const totalMonths = Math.min(Math.ceil(t * 12), 1200); // Cap at 100 years for safety
  if (isNaN(totalMonths) || totalMonths <= 0) return { interest: amount - P, totalAmount: amount, timeInYears: t, yearlyData: [], monthlyData: [] };

  for (let m = 1; m <= totalMonths; m++) {
    const currentT = m / 12;
    const currentAmount = P * Math.pow(1 + r / n, n * currentT);

    const actualMonthIndex = (startMonth - 1 + m - 1) % 12;
    const yearsElapsed = Math.floor((startMonth - 1 + m - 1) / 12);
    const actualYear = startYear + yearsElapsed;

    monthlyData.push({
      year: actualYear,
      month: (actualMonthIndex % 12) + 1,
      monthName: monthNames[actualMonthIndex],
      invested: P,
      interest: currentAmount - P,
      balance: currentAmount
    });

    if (actualMonthIndex === 11 || m === totalMonths) {
      yearlyData.push({
        year: actualYear,
        totalInvested: P,
        growth: currentAmount - P,
        balance: currentAmount
      });
    }
  }

  return {
    interest: amount - P,
    totalAmount: amount,
    timeInYears: t,
    yearlyData,
    monthlyData
  };
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


export function computeLoanAmortization({ principal, annualRate, years, emi, startDate }) {
  const R_m = annualRate / 12 / 100;
  const N = years * 12;

  let balance = principal;

  // Start Date Logic
  const start = startDate ? new Date(startDate) : new Date();
  const startMonth = start.getMonth(); // 0-based
  const startYear = start.getFullYear();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // 1. Generate ALL Monthly Rows first
  const allMonthlyRows = [];

  // SAFETY LIMIT: Cap at 100 years (1200 months) to prevent browser freeze on near-infinite loans
  const MAX_MONTHS = 1200;
  const loopLimit = Math.min(N, MAX_MONTHS);

  for (let m = 1; m <= loopLimit; m++) {
    const interestPaidThisMonth = balance * R_m;
    const principalPaidThisMonth = emi - interestPaidThisMonth;

    // CRITICAL SAFETY CHECK: Negative Amortization
    // If interest is more than EMI, balance will grow. Stop immediately.
    if (principalPaidThisMonth < 0) {
      // We can't validly compute a schedule where debt increases forever.
      // Return empty/sanitized data to prevent UI explosion.
      return {
        rows: [],
        monthlyRows: [],
        finalTotalInterest: 0,
        finalTotalPaid: 0,
        error: "Negative Amortization: EMI is too small to cover Interest."
      };
    }

    balance -= principalPaidThisMonth;

    const currentBalance = Math.max(0, balance);

    // Calculate Calendar Date
    // Month index from start: (startMonth + m - 1)
    const currentMonthIndex = startMonth + (m - 1);
    const calendarYear = startYear + Math.floor(currentMonthIndex / 12);
    const calendarMonth = currentMonthIndex % 12; // 0-11

    allMonthlyRows.push({
      id: m, // Logical month index (1, 2, 3...)
      month: calendarMonth + 1, // Calendar month number (1-12)
      monthName: monthNames[calendarMonth],
      year: calendarYear,
      openingBalance: balance + principalPaidThisMonth,
      principalPaid: principalPaidThisMonth,
      interestPaid: interestPaidThisMonth,
      closingBalance: currentBalance,
      totalPaidPercent: ((principal - currentBalance) / principal) * 100,
    });
  }

  // 2. Aggregate into Yearly Rows (Calendar Years)
  const rows = [];
  const yearsSet = new Set(allMonthlyRows.map(r => r.year));
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  sortedYears.forEach(year => {
    const monthsInYear = allMonthlyRows.filter(r => r.year === year);

    const yearPrincipalPaid = monthsInYear.reduce((sum, r) => sum + r.principalPaid, 0);
    const yearInterestPaid = monthsInYear.reduce((sum, r) => sum + r.interestPaid, 0);

    // Opening balance of the FIRST month in this year
    const yearOpeningBalance = monthsInYear[0].openingBalance;
    // Closing balance of the LAST month in this year
    const yearClosingBalance = monthsInYear[monthsInYear.length - 1].closingBalance;
    const yearTotalPaidPercent = monthsInYear[monthsInYear.length - 1].totalPaidPercent;

    rows.push({
      year: year,
      openingBalance: yearOpeningBalance,
      principalPaid: yearPrincipalPaid,
      interestPaid: yearInterestPaid,
      closingBalance: yearClosingBalance,
      totalPaidPercent: yearTotalPaidPercent
    });
  });

  let finalTotalInterest = (emi * N) - principal;
  let finalTotalPaid = emi * N;

  return { rows, monthlyRows: allMonthlyRows, finalTotalInterest, finalTotalPaid };
}

// Helper function (make sure this exists in your utils/finance.js)
export function calculateEMI(principal, monthlyRate, months) {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

/**
 * Advanced Amortization with Prepayments and Expenses.
 */
export function computeAdvancedLoanAmortization({
  principal,
  annualRate,
  years,
  startDate,
  // Prepayments
  monthlyExtra = 0,
  quarterlyExtra = 0,
  yearlyExtra = 0,
  oneTimePrepayments = [], // Current unused but ready for extension: Array of { date: 'YYYY-MM', amount: 10000 }
  // Expenses
  propertyTaxYearly = 0, // Amount
  homeInsuranceYearly = 0, // Amount
  maintenanceMonthly = 0, // Amount
  // Advanced Features
  emiStepUpYearly = 0, // %
  prepaymentStepUpYearly = 0, // %
  prepaymentStrategy = 'reduce_tenure', // 'reduce_tenure' | 'reduce_emi'
  interestRateChanges = [], // Array of { date: 'YYYY-MM', rate: 9.5 }
  loanFees = 0
}) {
  let R_m = annualRate / 12 / 100; // Mutable Rate
  let N = years * 12; // Initial tenure estimate

  // We calculate the Base EMI once based on original tenure
  let baseEMI = calculateEMI(principal, R_m, N);
  let currentBaseEMI = baseEMI;
  let currentMonthlyExtra = monthlyExtra;

  let balance = principal;
  const start = startDate ? new Date(startDate) : new Date();
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const allMonthlyRows = [];

  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalPrepayments = 0;
  let totalTaxes = 0;
  let totalInsurance = 0;
  let totalMaintenance = 0;

  let processingMonth = 1;

  // Loop until balance is cleared or we hit a safety limit (e.g. 50 years)
  // We don't use fixed N loop because prepayments reduce tenure
  while (balance > 1 && processingMonth <= 600) {
    // 0. Step-Up Logic (Annually - Month 13, 25, 37...)
    if (processingMonth > 1 && (processingMonth - 1) % 12 === 0) {
      if (emiStepUpYearly > 0) {
        currentBaseEMI = currentBaseEMI * (1 + emiStepUpYearly / 100);
      }
      if (prepaymentStepUpYearly > 0) {
        currentMonthlyExtra = currentMonthlyExtra * (1 + prepaymentStepUpYearly / 100);
      }
    }



    // 0.5. Variable Rate Check
    if (interestRateChanges && interestRateChanges.length > 0) {
      // Current Date Check (Same as prepayments)
      const currentAbsMonth = startMonth + (processingMonth - 1);
      const curYear = startYear + Math.floor(currentAbsMonth / 12);
      const curMonth = (currentAbsMonth % 12) + 1;
      const dateStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;

      const change = interestRateChanges.find(c => c.date === dateStr);
      if (change) {
        // Update Monthly Rate
        R_m = Number(change.rate) / 12 / 100;
      }
    }

    // 1. Calculate Interest for this month
    const interestPaid = balance * R_m;

    // 2. Base EMI Principal Part
    // If EMI is less than interest (negative amortization support check?), we cap or handle.
    // For now, assume standard.
    let principalPaid = currentBaseEMI - interestPaid;

    // 3. Prepayments
    let prepaymentThisMonth = 0;

    // Monthly Extra
    if (currentMonthlyExtra > 0) prepaymentThisMonth += currentMonthlyExtra;

    // Quarterly Extra (Every 3rd month: 3, 6, 9...)
    if (quarterlyExtra > 0 && processingMonth % 3 === 0) prepaymentThisMonth += quarterlyExtra;

    // Yearly Extra (Every 12th month: 12, 24...)
    if (yearlyExtra > 0 && processingMonth % 12 === 0) prepaymentThisMonth += yearlyExtra;

    // Custom One-Time Prepayments
    if (oneTimePrepayments && oneTimePrepayments.length > 0) {
      // Calculate current date based on processingMonth
      // currentMonthIndex = startMonth + (processingMonth - 1)
      const currentAbsMonth = startMonth + (processingMonth - 1);
      const curYear = startYear + Math.floor(currentAbsMonth / 12);
      const curMonth = (currentAbsMonth % 12) + 1; // 1-12

      // Check for matches
      // Date format is likely 'YYYY-MM'
      const dateStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;

      oneTimePrepayments.forEach(p => {
        if (p.date === dateStr) {
          prepaymentThisMonth += Number(p.amount);
        }
      });
    }

    // Cap Principal Payment to Balance
    // Total Principal to be paid = Normal Principal + Prepayment
    if (principalPaid + prepaymentThisMonth > balance) {
      // Retain structure: Pay off remaining balance
      const remaining = balance;
      // If base EMI part covers it?
      if (remaining <= principalPaid) {
        principalPaid = remaining;
        prepaymentThisMonth = 0;
      } else {
        // principalPaid stays as is (base), extra is diff
        prepaymentThisMonth = remaining - principalPaid;
      }
    }

    // 4. Update Balance
    balance -= (principalPaid + prepaymentThisMonth);
    if (balance < 0) balance = 0; // Floating point safety

    // STRATEGY: Reduce EMI (Recalculate EMI to keep original tenure)
    // Only if we made a prepayment this month and option is selected and we still have balance.
    if (prepaymentStrategy === 'reduce_emi' && prepaymentThisMonth > 0 && balance > 0) {
      const remainingMonths = N - processingMonth;
      // If we are past original tenure? unlikely with prepayments.
      if (remainingMonths > 0) {
        // Recalculate EMI required to clear 'balance' in 'remainingMonths'
        currentBaseEMI = calculateEMI(balance, R_m, remainingMonths);
      }
    }

    // 5. Expenses
    const currentMaintenance = maintenanceMonthly;
    // Apply Yearly Expenses in the 1st month of each year (or spread? User usually pays yearly)
    // Let's apply yearly expenses at month 1 of each year (1, 13, 25...)
    const currentTax = (processingMonth - 1) % 12 === 0 ? propertyTaxYearly : 0;
    const currentInsurance = (processingMonth - 1) % 12 === 0 ? homeInsuranceYearly : 0;

    // 6. Track Data
    // Calculate Calendar Date
    const currentMonthIndex = startMonth + (processingMonth - 1);
    const calendarYear = startYear + Math.floor(currentMonthIndex / 12);
    const calendarMonth = currentMonthIndex % 12;

    allMonthlyRows.push({
      id: processingMonth,
      month: calendarMonth + 1,
      monthName: monthNames[calendarMonth],
      year: calendarYear,

      openingBalance: balance + principalPaid + prepaymentThisMonth,
      interestPaid: interestPaid,
      principalPaid: principalPaid,
      prepayment: prepaymentThisMonth,
      closingBalance: balance,

      // Expenses
      tax: currentTax,
      insurance: currentInsurance,
      maintenance: currentMaintenance,
      totalExpense: currentTax + currentInsurance + currentMaintenance,

      // Cashflows
      totalLoanPayment: interestPaid + principalPaid + prepaymentThisMonth,
      totalOwnershipCost: interestPaid + principalPaid + prepaymentThisMonth + currentTax + currentInsurance + currentMaintenance,

      // FY marker
      fyYear: calendarMonth + 1 >= 4 ? calendarYear : calendarYear - 1,
      totalPaidPercent: ((principal - balance) / principal) * 100
    });

    totalInterest += interestPaid;
    totalPrincipal += principalPaid;
    totalPrepayments += prepaymentThisMonth;
    totalTaxes += currentTax;
    totalInsurance += currentInsurance;
    totalMaintenance += currentMaintenance;

    processingMonth++;
  }

  // Aggregate to Yearly
  const yearlyRows = [];
  const yearsSet = new Set(allMonthlyRows.map(r => r.year));
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  sortedYears.forEach(year => {
    const months = allMonthlyRows.filter(r => r.year === year);
    yearlyRows.push({
      year,
      principalPaid: months.reduce((s, m) => s + m.principalPaid, 0),
      interestPaid: months.reduce((s, m) => s + m.interestPaid, 0),
      prepayment: months.reduce((s, m) => s + m.prepayment, 0),
      tax: months.reduce((s, m) => s + m.tax, 0),
      insurance: months.reduce((s, m) => s + m.insurance, 0),
      maintenance: months.reduce((s, m) => s + m.maintenance, 0),
      totalExpense: months.reduce((s, m) => s + m.totalExpense, 0),
      totalLoanPayment: months.reduce((s, m) => s + m.totalLoanPayment, 0),
      totalOwnershipCost: months.reduce((s, m) => s + m.totalOwnershipCost, 0),
      closingBalance: months[months.length - 1].closingBalance,
      totalPaidPercent: months[months.length - 1].totalPaidPercent
    });
  });

  // 3. Aggregate to Financial Year (April - March)
  // FY 2023-24 starts April 2023, ends March 2024.
  const financialYearlyRows = [];
  const fyMap = new Map(); // Key: "2023", Value: { ...data } representing FY 2023-24

  allMonthlyRows.forEach(m => {
    // Determine Financial Year Start
    // If Month is Jan(1)-Mar(3), it belongs to Previous Year's FY cycle (e.g., Mar 2024 is in FY 23-24)
    // If Month is Apr(4)-Dec(12), it belongs to Current Year's FY cycle (e.g., Apr 2023 is in FY 23-24)

    // m.month is 1-12
    const fyStartYear = m.month >= 4 ? m.year : m.year - 1;
    const fyLabel = `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;

    if (!fyMap.has(fyStartYear)) {
      fyMap.set(fyStartYear, {
        year: fyStartYear, // We use start year as the 'id'
        label: fyLabel,
        principalPaid: 0,
        interestPaid: 0,
        prepayment: 0,
        tax: 0,
        insurance: 0,
        maintenance: 0,
        totalExpense: 0,
        totalLoanPayment: 0,
        totalOwnershipCost: 0,
        openingBalance: m.openingBalance, // First month of FY
        closingBalance: 0
      });
    }

    const fyData = fyMap.get(fyStartYear);
    fyData.principalPaid += m.principalPaid;
    fyData.interestPaid += m.interestPaid;
    fyData.prepayment += m.prepayment;
    fyData.tax += m.tax;
    fyData.insurance += m.insurance;
    fyData.maintenance += m.maintenance;
    fyData.totalExpense += m.totalExpense;
    fyData.totalLoanPayment += m.totalLoanPayment;
    fyData.totalOwnershipCost += m.totalOwnershipCost;
    fyData.closingBalance = m.closingBalance; // Always update to latest
    fyData.totalPaidPercent = m.totalPaidPercent;
  });

  fyMap.forEach(value => financialYearlyRows.push(value));
  financialYearlyRows.sort((a, b) => a.year - b.year);

  return {
    monthlyRows: allMonthlyRows,
    yearlyRows,
    financialYearlyRows,
    summary: {
      baseEMI,
      totalInterest,
      totalPrepayments,
      totalTaxes,
      totalInsurance,
      totalMaintenance,
      loanFees,
      totalAmountPaid: totalPrincipal + totalInterest + totalPrepayments + loanFees,
      totalCostOfOwnership: totalPrincipal + totalInterest + totalPrepayments + totalTaxes + totalInsurance + totalMaintenance + loanFees,
      actualTenureYears: (processingMonth - 1) / 12,
      savedInterest: (baseEMI * years * 12) - (principal) - totalInterest // Approx savings vs original tenure
    }
  };
}

export function calculateLoanAmountFromEMI(emi, monthlyRate, months) {
  if (monthlyRate === 0) return emi * months;
  return (emi * (Math.pow(1 + monthlyRate, months) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, months));
}

export function calculateLoanTenure(principal, emi, annualRate) {
  if (getLoanInterest(principal, emi, annualRate) >= emi) return Infinity; // Interest > EMI, never paid off
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / emi;

  // Formula: n = log(EMI / (EMI - P*r)) / log(1+r)
  const numerator = Math.log(emi / (emi - principal * r));
  const denominator = Math.log(1 + r);
  return numerator / denominator / 12; // Returns Years
}

function getLoanInterest(p, emi, rate) {
  return p * (rate / 12 / 100);
}

export function calculateLoanInterestRate(principal, emi, years) {
  // Wrapper for the binary search solver
  // We already have calculateEffectiveInterestRate which does exactly this (Find R given P, N, EMI)
  return calculateEffectiveInterestRate(principal, years, emi);
}

export function calculateAPR(principal, emi, years, fees) {
  // APR is the effective rate considering the NET loan amount received (Principal - Fees)
  // paying back the same EMI.
  const netPrincipal = principal - fees;
  if (netPrincipal <= 0) return 0;
  return calculateEffectiveInterestRate(netPrincipal, years, emi);
}

/**
 * Calculates Flat Rate EMI.
 * Formula: (P + (P * R * T)) / (T * 12)
 * R is annual rate in decimal, T is years.
 */
export function calculateFlatRateEMI(principal, annualRate, tenureYears) {
  if (tenureYears === 0) return 0;
  const totalInterest = principal * (annualRate / 100) * tenureYears;
  const totalAmount = principal + totalInterest;
  const totalMonths = tenureYears * 12;
  return totalAmount / totalMonths;
}

/**
 * Estimates Effective Interest Rate for Flat Rate Loan.
 * Returns the equivalent Reducing Balance Rate.
 * Uses iterative method (Newton-Raphson typically, or binary search) to find Rate given P, N, EMI.
 * But here we can use a simpler "Rate" solver since we know P, N, EMI.
 */
export function calculateEffectiveInterestRate(principal, tenureYears, flatEMI) {
  if (principal <= 0 || tenureYears <= 0 || flatEMI <= 0) return 0;

  const n = tenureYears * 12;

  // Binary search for Rate (Monthly %)
  let low = 0;
  let high = 500; // Increased upper bound (500% monthly) to handle extreme inputs
  let guessRate = 0;

  for (let i = 0; i < 40; i++) { // Increased iterations for precision
    let mid = (low + high) / 2;
    let r = mid / 100; // monthly rate fraction

    // Calculate EMI with this guess rate
    // Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let calcEMI;
    if (r === 0) {
      calcEMI = principal / n;
    } else {
      const pow = Math.pow(1 + r, n);
      // Safety check for Infinity
      if (!isFinite(pow)) {
        calcEMI = principal * r; // Limit behavior
      } else {
        calcEMI = (principal * r * pow) / (pow - 1);
      }
    }

    if (calcEMI > flatEMI) {
      high = mid;
    } else {
      low = mid;
    }
    guessRate = mid;
  }

  return guessRate * 12; // Annual Rate % (guessRate is already monthly %)
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

export function calculateDetailedCAGR({ beginningValue, endingValue, time, timeUnit = 'years', startDate, endDate, scheduleStartDate = new Date().toISOString().slice(0, 7) }) {
  let t = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    t = diffTime / (1000 * 60 * 60 * 24 * 365.25); // years
  } else {
    if (timeUnit === 'years') t = Number(time);
    else if (timeUnit === 'months') t = Number(time) / 12;
    else if (timeUnit === 'days') t = Number(time) / 365.25;
  }

  const P = Number(beginningValue);
  const FV = Number(endingValue);

  if (t === 0 || P === 0) return { cagr: 0, timeInYears: t, yearlyData: [], monthlyData: [] };

  // Handle case where ending value is less than beginning (negative CAGR)
  let cagr = 0;
  if (FV > 0) {
    // Math guard for ultra-short durations to prevent Infinity/NaN
    if (t < 1 / 365.25) { // Less than 1 day
      cagr = ((FV / P) - 1) * 100; // Just show absolute return for < 1 day
    } else {
      cagr = (Math.pow(FV / P, 1 / t) - 1) * 100;
      // Cap at a massive but displayable number to prevent scientific notation explosion
      if (cagr > 1e15) cagr = 1e15;
    }
  } else {
    cagr = -100; // Total loss
  }

  // Generate breakdown data
  const yearlyData = [];
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [startYear, startMonth] = scheduleStartDate.split('-').map(Number);

  const totalMonths = Math.min(Math.ceil(t * 12), 1200); // Cap at 100 years for safety
  if (isNaN(totalMonths) || totalMonths <= 0) return { cagr, timeInYears: t, yearlyData: [], monthlyData: [] };

  const rate = cagr / 100;

  for (let m = 1; m <= totalMonths; m++) {
    const monthsElapsed = m;
    const currentT = monthsElapsed / 12;
    const currentValue = P * Math.pow(1 + rate, currentT);

    const actualMonthIndex = (startMonth - 1 + m - 1) % 12;
    const yearsElapsed = Math.floor((startMonth - 1 + m - 1) / 12);
    const actualYear = startYear + yearsElapsed;

    monthlyData.push({
      year: actualYear,
      month: (actualMonthIndex % 12) + 1,
      monthName: monthNames[actualMonthIndex],
      invested: P,
      interest: currentValue - P,
      balance: currentValue
    });

    if (actualMonthIndex === 11 || m === totalMonths) {
      yearlyData.push({
        year: actualYear,
        totalInvested: P,
        growth: currentValue - P,
        balance: currentValue
      });
    }
  }

  return {
    cagr,
    timeInYears: t,
    yearlyData,
    monthlyData
  };
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
  const monthlyRows = [];

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

    // Track monthly data
    monthlyRows.push({
      month: m,
      monthName: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m - 1) % 12],
      year: Math.ceil(m / 12),
      openingBalance: balance + principalPaid,
      principalPaid: principalPaid,
      interestPaid: interest,
      closingBalance: Math.max(0, balance),
      totalPaidPercent: ((basePrincipal - Math.max(0, balance)) / basePrincipal) * 100, // Approx percent paid on base
    });

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

    // Track monthly data
    monthlyRows.push({
      month: m,
      monthName: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m - 1) % 12],
      year: Math.ceil(m / 12),
      openingBalance: balance + principalPaid,
      principalPaid: principalPaid,
      interestPaid: interest,
      closingBalance: Math.max(0, balance),
      totalPaidPercent: 0, // Complex to calculate true percent with Top-up, leaving 0 for now
    });

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
    monthlyEMI: newCombinedEMI,
    monthlyRows
  };
}

/**
 * Computes SWP (Systematic Withdrawal Plan) schedule.
 * Supports date-based tenure.
 */
export function computeSWPPlan({
  initialCorpus,
  annualRate,
  years,
  totalYears = years,
  monthlyWithdrawal,
  annualWithdrawalIncrease = 0,
  deferMonths = 0,
  compoundingFrequency = 'monthly', // 'monthly', 'quarterly', 'half-yearly', 'yearly'
  calculationMode = 'duration',
  startDate = new Date().toISOString().slice(0, 10),
  endDate = null
}) {
  const rows = [];
  const monthlyRows = [];
  let currentCorpus = Number(initialCorpus);
  let totalWithdrawn = 0;
  let totalInterest = 0;
  let depletionYear = 0;
  let depletionMonth = 0;

  const baseMonthlyWithdrawal = Number(monthlyWithdrawal);
  let currentMonthlyWithdrawal = baseMonthlyWithdrawal;

  // Rate Conversion based on Frequency
  // Input annualRate is nominal or effective? 
  // Standard in India/Banking: 'annualRate' usually implies nominal per annum if monthly compounding (Rate/12).
  // But if frequency is 'Yearly', it implies the compounding happens once a year.
  // However, SWP balances update monthly.
  // If 'compoundingFrequency' is 'yearly', we should use (1+R)^(1/12) - 1 for monthly rate?
  // Or does it just mean the interest is credited yearly? SWP usually credits monthly or assumes monthly growth.
  // Let's assume 'Yearly' frequency means the given rate is the Effective Annual Rate (EAR).
  // So monthly rate = (1 + R/100)^(1/12) - 1.
  // If frequency is 'Monthly', monthly rate = (R/100)/12.

  let monthlyRate;
  const R = Number(annualRate) / 100;

  if (compoundingFrequency === 'yearly') {
    monthlyRate = Math.pow(1 + R, 1 / 12) - 1;
  } else if (compoundingFrequency === 'half-yearly') {
    monthlyRate = Math.pow(1 + R / 2, 1 / 6) - 1;
  } else if (compoundingFrequency === 'quarterly') {
    monthlyRate = Math.pow(1 + R / 4, 1 / 3) - 1;
  } else {
    // Default Monthly
    monthlyRate = R / 12;
  }

  const annualIncreaseFactor = 1 + (Number(annualWithdrawalIncrease) || 0) / 100;

  let effectiveYears = 0;
  if (calculationMode === 'date' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    effectiveYears = Math.max(0, months / 12);
  } else {
    effectiveYears = Number(totalYears);
  }

  // Safety caps
  const MAX_YEARS_SWP = 100;
  effectiveYears = Math.min(effectiveYears, MAX_YEARS_SWP);
  const totalMonthsRequested = Math.ceil(effectiveYears * 12);

  const startObj = new Date(startDate);
  const startMonth = startObj.getMonth();
  const startYear = startObj.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Process Year by Year
  const numYearsToLoop = Math.ceil(effectiveYears);

  for (let yearNum = 1; yearNum <= numYearsToLoop; yearNum++) {
    const openingBalanceYear = currentCorpus;
    let yearlyWithdrawal = 0;
    let yearlyInterest = 0;
    let corpusDepleted = false;

    // Process up to 12 months for this year
    for (let mInYear = 1; mInYear <= 12; mInYear++) {
      const globalMonthIdx = (yearNum - 1) * 12 + mInYear;
      if (globalMonthIdx > totalMonthsRequested) break;

      const openingBalanceMonth = currentCorpus;

      if (currentCorpus <= 0) {
        corpusDepleted = true;
        currentCorpus = 0;
        break;
      }

      // Step 1: Interest
      const monthlyInterest = currentCorpus * monthlyRate;
      yearlyInterest += monthlyInterest;
      currentCorpus += monthlyInterest;

      // Step 2: Withdrawal (Check Deferment)
      let actualWithdrawal = 0;
      let inflationComponent = 0;
      let baseComponent = 0;

      if (globalMonthIdx > parseInt(deferMonths || 0)) {
        actualWithdrawal = Math.min(currentMonthlyWithdrawal, currentCorpus);

        // Calculate components for display
        if (actualWithdrawal > 0) {
          // We try to attribute proportional parts? 
          // Or just: Base is min(baseInput, actual). Inflation is remainder.
          // However, if corpus is depleting, actual might be < currentMonthlyWithdrawal.
          // Let's keep it simple: proportion.
          const ratio = actualWithdrawal / currentMonthlyWithdrawal;
          baseComponent = baseMonthlyWithdrawal * ratio;
          inflationComponent = actualWithdrawal - baseComponent;
        }
      }

      currentCorpus -= actualWithdrawal;
      yearlyWithdrawal += actualWithdrawal;

      // Calendar date
      const currentMonthTotal = startMonth + (globalMonthIdx - 1);
      const calendarYear = startYear + Math.floor(currentMonthTotal / 12);
      const calendarMonth = currentMonthTotal % 12;

      monthlyRows.push({
        id: globalMonthIdx,
        month: calendarMonth + 1,
        monthName: monthNames[calendarMonth],
        year: calendarYear,
        yearNumber: yearNum,
        openingBalance: openingBalanceMonth,
        withdrawal: actualWithdrawal,
        baseWithdrawal: baseComponent,
        inflationAdjustment: inflationComponent,
        interestEarned: monthlyInterest,
        closingBalance: Math.max(0, currentCorpus),
      });

      if (currentCorpus <= 0) {
        currentCorpus = 0;
        corpusDepleted = true;
        if (depletionYear === 0) {
          depletionYear = calendarYear;
          depletionMonth = calendarMonth + 1;
        }
        break;
      }
    }

    rows.push({
      year: startYear + yearNum - 1, // Calendar year approx logic
      yearNumber: yearNum,
      openingBalance: openingBalanceYear,
      totalWithdrawal: yearlyWithdrawal,
      interestEarned: yearlyInterest,
      closingBalance: Math.max(0, currentCorpus),
    });

    totalWithdrawn += yearlyWithdrawal;
    totalInterest += yearlyInterest;

    if (corpusDepleted) break;
    if (corpusDepleted) break;

    // Only increase withdrawal if we have started withdrawing (passed deferment) ??
    // Standard Inflation adjustment usually happens annually regardless of payment start date?
    // User Guide: "Defer for 5 years". Value at Y5 is adjusted for 5 years of inflation?
    // If I want 1L today, in 5 years I need 1.2L.
    // YES. Usually Step-Up implies keeping purchasing power constant relative to START of PLAN.
    // So we continue to increase it every year.
    currentMonthlyWithdrawal *= annualIncreaseFactor;
  }

  return {
    rows,
    monthlyRows,
    finalCorpus: Math.max(0, currentCorpus),
    totalWithdrawn,
    totalInterest,
    depletionYear,
    depletionMonth,
    depletionTotalMonths: depletionYear > 0 ? (depletionYear - startYear) * 12 + (depletionMonth - startMonth - 1) : 0,
  };
}

/**
 * Computes yearly schedule for SIP, LumpSum, or both.
 * Supports Step-Up SIP and Date-based tenure.
 */
export function computeYearlySchedule({
  monthlySIP = 0,
  lumpSum = 0,
  annualRate,
  totalYears,
  sipYears = totalYears,
  stepUpPercent = 0,
  calculationMode = 'duration',
  startDate = new Date().toISOString().slice(0, 10),
  endDate = null
}) {
  const r_m = Number(annualRate) / 12 / 100;

  let totalMonths = 0;
  let sipMonths = 0;

  if (calculationMode === 'date' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // Since we usually treat "end of month" for calculations, if end date is same month as start, it's 0 or 1.
    // Let's ensure at least 1 month if they are different days? 
    // Actually, simple month diff is standard for these calculators.
    totalMonths = Math.max(0, totalMonths);
    sipMonths = totalMonths; // Default SIP duration to full tenure in date mode
  } else {
    totalMonths = Math.ceil(totalYears * 12);
    sipMonths = Math.ceil(sipYears * 12);
  }

  // Safety caps
  const MAX_MONTHS = 1200; // 100 years
  totalMonths = Math.min(totalMonths, MAX_MONTHS);
  sipMonths = Math.min(sipMonths, totalMonths);

  let balance = Number(lumpSum);
  let cumulativeInvested = Number(lumpSum);
  let sipInvested = 0;
  const rows = [];
  const monthlyRows = [];

  const startObj = new Date(startDate);
  const startMonth = startObj.getMonth();
  const startYear = startObj.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const currentSIP = Number(monthlySIP) * Math.pow(1 + Number(stepUpPercent) / 100, yearIndex);

    const monthInYear = ((m - 1) % 12) + 1;

    // Calendar date
    const currentMonthTotal = startMonth + (m - 1);
    const calendarYear = startYear + Math.floor(currentMonthTotal / 12);
    const calendarMonth = currentMonthTotal % 12;

    if (m <= sipMonths) {
      balance += currentSIP;
      cumulativeInvested += currentSIP;
      sipInvested += currentSIP;
    }

    balance = balance * (1 + r_m);

    monthlyRows.push({
      id: m,
      month: calendarMonth + 1,
      monthInYear,
      monthName: monthNames[calendarMonth],
      year: calendarYear,
      invested: cumulativeInvested,
      sipInvested: sipInvested,
      lumpSum: Number(lumpSum),
      growth: balance - cumulativeInvested,
      balance: balance
    });

  }

  // Aggregate into Yearly Rows (Calendar Years)
  // We use the same robust grouping strategy as in Loan Amortization
  const yearsSet = new Set(monthlyRows.map(r => r.year));
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  sortedYears.forEach(year => {
    const monthsInYear = monthlyRows.filter(r => r.year === year);
    const lastMonth = monthsInYear[monthsInYear.length - 1];

    rows.push({
      year: year,
      yearNumber: Math.ceil(lastMonth.id / 12),
      totalInvested: lastMonth.invested,
      sipInvested: lastMonth.sipInvested,
      lumpSum: lastMonth.lumpSum,
      stepUpAppliedPercent: Number(stepUpPercent),
      growth: lastMonth.growth,
      overallValue: lastMonth.balance,
      investment: lastMonth.invested
    });
  });

  return { rows, monthlyRows };
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

/**
 * Determines FIRE Level based on "Needs vs SWR" capability.
 * LeanFIRE: Essentials > 80% of SWR capacity
 * FIRE: Essentials 40-80%
 * ChubbyFIRE: Essentials 20-40%
 * FatFIRE: Essentials < 20%
 */
export function calculateFIRELevel(annualEssentialExpenses, annualTotalSWRIncome) {
  if (annualTotalSWRIncome <= 0) return 'N/A';

  const needsRatio = (annualEssentialExpenses / annualTotalSWRIncome) * 100;

  if (needsRatio > 80) return 'LeanFIRE';
  if (needsRatio > 40) return 'FIRE';
  if (needsRatio > 20) return 'ChubbyFIRE';
  return 'FatFIRE';
}

/**
 * FIXED DEPOSIT CALCULATOR
 * Supports: Cumulative, Quarterly Payout, Monthly Payout, Short Term (Simple Interest)
 */
export function computeFixedDeposit({
  principal,
  rate, // Annual %
  tenureValue,
  tenureMode, // 'Years', 'Months', 'Days'
  payoutType, // 'cumulative', 'monthly', 'quarterly'
}) {
  const P = Number(principal);
  const R = Number(rate);

  // Normalize tenure to Year fraction for Rate use, or Quarters for Compounding
  let years = 0;
  if (tenureMode === 'Years') years = tenureValue;
  else if (tenureMode === 'Months') years = tenureValue / 12;
  else if (tenureMode === 'Days') years = tenureValue / 365;

  let maturityValue = 0;
  let totalInterest = 0;
  let payoutAmount = 0; // Periodic payout

  // Short Term (< 180 days usually) or 'Days' mode often implies Simple Interest 
  // unless specified otherwise. Banks differ. 
  // Usually < 6 months = Simple Interest. >= 6 months = Quarterly Compounding.
  // However, for a generic calculator, we try to follow standard rules.
  // If Mode is Days, use Simple Interest.

  // 1. SHORT TERM / SIMPLE INTEREST (Days)
  if (tenureMode === 'Days') {
    // Simple Interest = P * R * (Days/365) / 100
    totalInterest = (P * R * tenureValue) / (365 * 100);
    maturityValue = P + totalInterest;
    return {
      maturityValue,
      totalInterest,
      payoutAmount: 0,
      isSimple: true
    };
  }

  // 2. PAYOUT SCHEMES (Monthly/Quarterly/Half-Yearly/Yearly) -> Non-Cumulative
  // Principal is returned at end. Interest is paid out periodically.
  if (payoutType === 'monthly') {
    // Monthly Payout = P * R / 1200
    payoutAmount = (P * R) / 1200;
    totalInterest = payoutAmount * (years * 12);
    maturityValue = P; // Returns Principal only
  }
  else if (payoutType === 'quarterly') {
    // Quarterly Payout = P * R / 400
    payoutAmount = (P * R) / 400;
    totalInterest = payoutAmount * (years * 4);
    maturityValue = P; // Returns Principal only
  }
  else if (payoutType === 'half-yearly') {
    // Half-Yearly Payout = P * R / 200
    payoutAmount = (P * R) / 200;
    totalInterest = payoutAmount * (years * 2);
    maturityValue = P; // Returns Principal only
  }
  else if (payoutType === 'yearly') {
    // Yearly Payout = P * R / 100
    payoutAmount = (P * R) / 100;
    totalInterest = payoutAmount * years;
    maturityValue = P; // Returns Principal only
  }
  // 3. CUMULATIVE (Standard FD) -> Quarterly Compounding
  else {
    // Formula: A = P * (1 + R/400)^(4n)
    const n = years; // years
    const amount = P * Math.pow(1 + R / 400, 4 * n);
    maturityValue = amount;
    totalInterest = amount - P;
  }

  return {
    maturityValue,
    totalInterest,
    payoutAmount,
    totalInvestment: P
  };
}

/**
 * Step-Up Loan Amortization
 * Supports:
 * 1. Annual Step-Up of EMI (by % or fixed amount)
 * 2. Interest Rate Change (Simulating Refinance/Floating Rate Drop)
 */
export function computeStepUpLoanAmortization({
  principal,
  annualRate,
  years,
  stepUpType, // 'percent' | 'amount'
  stepUpValue, // e.g. 5 (5%) or 2000 (₹2000)
  rateChangeYear = null,
  newRate = null,
  startDate
}) {
  const R_m_Initial = annualRate / 12 / 100;
  let currentRate = annualRate;
  let currentR_m = R_m_Initial;

  let N = years * 12;

  // Base EMI (Standard)
  const baseEMI = calculateEMI(principal, R_m_Initial, N);
  let currentEMI = baseEMI;

  let balance = principal;

  const monthlyRows = [];

  let totalInterest = 0;
  let totalPaid = 0;

  let processingMonth = 1;
  const LIMIT_MONTHS = 600; // 50 years cap

  while (balance > 1 && processingMonth <= LIMIT_MONTHS) {
    // 1. Handle Rate Change
    if (rateChangeYear && processingMonth === ((rateChangeYear - 1) * 12) + 1) {
      if (newRate && newRate !== currentRate) {
        currentRate = newRate;
        currentR_m = currentRate / 12 / 100;
      }
    }

    // 2. Handle Step-Up (Annually)
    // Apply step up at start of each year (Month 13, 25...)
    if (processingMonth > 1 && (processingMonth - 1) % 12 === 0) {
      if (stepUpType === 'percent') {
        currentEMI = currentEMI * (1 + (stepUpValue / 100));
      } else {
        currentEMI = currentEMI + stepUpValue;
      }
    }

    // 3. Payment
    const interestPart = balance * currentR_m;
    let principalPart = currentEMI - interestPart;

    // Last Month Adjustment
    if (principalPart > balance) {
      principalPart = balance;
      // Adjust EMI for last month
      currentEMI = principalPart + interestPart;
    }

    balance -= principalPart;
    totalInterest += interestPart;
    totalPaid += currentEMI;

    // Rows
    monthlyRows.push({
      month: processingMonth,
      emi: currentEMI,
      interest: interestPart,
      principal: principalPart,
      balance: Math.max(0, balance)
    });


    processingMonth++;
  }

  // Aggregate Yearly Data
  const yearlyData = [];
  if (monthlyRows.length > 0) {
    const distinctYears = Math.ceil(monthlyRows.length / 12);
    for (let y = 1; y <= distinctYears; y++) {
      const startIdx = (y - 1) * 12;
      const endIdx = Math.min(startIdx + 12, monthlyRows.length);
      const yearChunk = monthlyRows.slice(startIdx, endIdx);

      if (yearChunk.length === 0) continue;

      const yearPrincipal = yearChunk.reduce((acc, r) => acc + r.principal, 0);
      const yearInterest = yearChunk.reduce((acc, r) => acc + r.interest, 0);
      const yearTotalPaid = yearChunk.reduce((acc, r) => acc + r.emi, 0);
      const closingBalance = yearChunk[yearChunk.length - 1].balance;

      yearlyData.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        totalPaid: yearTotalPaid,
        balance: closingBalance,
        closingBalance: closingBalance,
        label: `Year ${y}`
      });
    }
  }

  return {
    monthlyRows,
    yearlyRows: yearlyData,
    finalTotalInterest: totalInterest,
    finalTotalPaid: totalPaid,
    monthsTaken: processingMonth - 1,
    baseEMI
  };
}

/**
 * Moratorium Loan Amortization
 * @param {Object} params
 */
export function computeMoratoriumLoanAmortization({
  principal,
  annualRate,
  totalTenureYears,
  moratoriumMonths,
  payInterestDuringMoratorium = false
}) {
  const R_m = annualRate / 12 / 100;

  let currentPrincipal = principal;

  const monthlyRows = [];

  // Phase 1: Moratorium
  for (let m = 1; m <= moratoriumMonths; m++) {
    const interest = currentPrincipal * R_m;
    let payment = 0;

    if (payInterestDuringMoratorium) {
      payment = interest; // Pay off interest
      // Principal remains same
    } else {
      // Capitalize Interest
      currentPrincipal += interest;
      // No payment made
      // Interest is added to principal, so it counts as "Principal" growth, 
      // but cost-wise it IS interest cost incurred.
    }

    monthlyRows.push({
      month: m,
      emi: payment,
      interest: interest,
      principal: 0,
      balance: currentPrincipal,
      isMoratorium: true
    });
  }

  // Phase 2: Repayment
  const repaymentMonths = (totalTenureYears * 12);
  // Wait, does tenure stay same (extension) or reduce? 
  // User input "Tenure" usually means "Repayment Tenure" in loose terms, 
  // OR "Total Tenure" (10y loan). 
  // If 10y loan and 6m moratorium -> Remainder = 9.5y? 
  // Usually moratorium EXTENDS tenure. So Repayment = Original Tenure.
  // Let's assume Repayment Tenure = totalTenureYears (so Total Life = Tenure + Moratorium)

  let emi = 0;
  if (repaymentMonths > 0) {
    emi = calculateEMI(currentPrincipal, R_m, repaymentMonths);
  }

  let balance = currentPrincipal;

  for (let m = 1; m <= repaymentMonths; m++) {
    const interest = balance * R_m;
    const principalPart = emi - interest;
    balance -= principalPart;

    if (balance < 0) balance = 0;

    monthlyRows.push({
      month: moratoriumMonths + m,
      emi: emi,
      interest: interest,
      principal: principalPart,
      balance: balance,
      isMoratorium: false
    });
  }

  // Recalculate strict Total Interest derived from Cashflow
  const realTotalPaid = monthlyRows.reduce((sum, row) => sum + row.emi, 0);
  const realTotalInterest = realTotalPaid - principal; // Only deduct original principal

  // Generate Year-wise Data
  const yearlyData = [];
  const totalMonths = monthlyRows.length;
  // Determine start year (assuming relative year 1 if no date provided, but other calcs use current year)
  // Here we just use relative years 1, 2, 3...

  if (totalMonths > 0) {
    const totalYears = Math.ceil(totalMonths / 12);
    for (let y = 1; y <= totalYears; y++) {
      const startIdx = (y - 1) * 12;
      const endIdx = Math.min(startIdx + 12, totalMonths);
      const yearMonths = monthlyRows.slice(startIdx, endIdx);

      if (yearMonths.length === 0) continue;

      const yearPrincipal = yearMonths.reduce((sum, m) => sum + (m.principal || 0), 0);
      const yearInterest = yearMonths.reduce((sum, m) => sum + (m.interest || 0), 0);
      const yearPayment = yearMonths.reduce((sum, m) => sum + (m.emi || 0), 0);
      const closingBalance = yearMonths[yearMonths.length - 1].balance;

      yearlyData.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        totalPaid: yearPayment,
        balance: closingBalance
      });
    }
  }

  return {
    monthlyRows,
    yearlyData,
    finalTotalInterest: realTotalInterest,
    finalTotalPaid: realTotalPaid,
    emiBefore: calculateEMI(principal, R_m, totalTenureYears * 12),
    emiAfter: emi
  };
}
// PPF Calculator Function
export function computePPF({ investmentAmount, frequency, interestRate, years, startDate = new Date().toISOString().slice(0, 7) }) {
  const R = Number(interestRate) / 100;
  const N = Number(years);
  const P = Number(investmentAmount);

  const [startYear, startMonth] = startDate.split('-').map(Number);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const yearlyData = [];
  const monthlyData = [];

  let balance = 0;
  let annualAccruedInterest = 0;
  let cumulativeInvestment = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= N * 12; month++) {
    // Determine if we should invest this month based on frequency
    let shouldInvest = false;
    if (frequency === 'monthly') {
      shouldInvest = true;
    } else if (frequency === 'quarterly') {
      shouldInvest = (month - 1) % 3 === 0;
    } else if (frequency === 'half-yearly') {
      shouldInvest = (month - 1) % 6 === 0;
    } else if (frequency === 'yearly' || frequency === 'annually') {
      shouldInvest = (month - 1) % 12 === 0;
    }

    let monthlyInvested = 0;
    if (shouldInvest) {
      monthlyInvested = P;
      balance += P;
      cumulativeInvestment += P;
    }

    // PPF Interest Calculation:
    // Interest is simple throughout the year and credited (compounded) at year-end.
    const monthlyAccrued = balance * (R / 12);
    annualAccruedInterest += monthlyAccrued;
    cumulativeInterest += monthlyAccrued;

    const monthsElapsed = month - 1;
    const yearsElapsed = Math.floor((startMonth - 1 + monthsElapsed) / 12);
    const actualYear = startYear + yearsElapsed;
    const monthInYear = ((month - 1) % 12) + 1;
    const isYearEnd = (month % 12 === 0);

    if (isYearEnd) {
      balance += annualAccruedInterest;
      // Reset annual counter
      annualAccruedInterest = 0;
    }

    const actualMonthIndex = (startMonth - 1 + month - 1) % 12;
    const actualMonthName = monthNames[actualMonthIndex];

    monthlyData.push({
      year: actualYear,
      month: monthInYear,
      monthName: actualMonthName,
      invested: cumulativeInvestment,
      annualInvested: monthlyInvested,
      interest: cumulativeInterest,
      annualInterest: monthlyAccrued,
      balance: balance + (isYearEnd ? 0 : annualAccruedInterest)
    });
  }

  // Aggregate Yearly Data by Calendar Year
  const yearsSet = new Set(monthlyData.map(r => r.year));
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  sortedYears.forEach(year => {
    const monthsInYear = monthlyData.filter(r => r.year === year);
    const lastMonth = monthsInYear[monthsInYear.length - 1];

    yearlyData.push({
      year: year,
      totalInvested: lastMonth.invested,
      growth: lastMonth.interest,
      balance: lastMonth.balance,
      investment: lastMonth.invested
    });
  });

  const maturityValue = balance;
  const totalInterest = maturityValue - cumulativeInvestment;

  return {
    totalInvestment: cumulativeInvestment,
    totalInterest,
    maturityValue,
    yearlyData,
    monthlyData
  };
}
