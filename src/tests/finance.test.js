
import {
    calcSIPFutureValue, calcLumpFutureValue, calculateSimpleInterest, calculateCompoundInterest,
    getRequiredSIP, getRequiredLumpSum, getRequiredStepUpSIP, calculateRealRate,
    computeLoanAmortization, calculateEMI, computeAdvancedLoanAmortization,
    calculateLoanAmountFromEMI, calculateLoanTenure,
    calculateAPR, calculateFlatRateEMI, calculateEffectiveInterestRate,
    calculateCAGR, computeDualAmortization,
    computeSWPPlan, computeYearlySchedule, computeStepUpSchedule, calculateRealValue,
    calculateTimeToFIRE, calculateCoastFIRE, calculateCostOfDelay, computeRentVsBuyLedger,
    calculateInflationImpact, calculateRebalancing, calculateFIRELevel, computeFixedDeposit,
    computeStepUpLoanAmortization, computeMoratoriumLoanAmortization, computePPF,
    calculateInvestmentDuration
} from '../utils/finance';

describe('Finance Utility Functions - 100% Coverage Suite', () => {

    // --- 1. Investment Calculators ---
    describe('SIP Future Value', () => {
        test('Calculates approx return correctly', () => {
            const result = calcSIPFutureValue(5000, 0.01, 12);
            expect(result).toBeCloseTo(64047, 0);
        });
        test('Zero interest returns pure principal sum', () => {
            const result = calcSIPFutureValue(5000, 0, 12);
            expect(result).toBe(60000);
        });
    });

    describe('Lump Sum Future Value', () => {
        test('Calculates standard compound interest', () => {
            const result = calcLumpFutureValue(10000, 0.1, 2);
            expect(result).toBeCloseTo(12100, 0);
        });
    });

    // --- 2. Interest Calculators ---
    describe('Simple Interest', () => {
        test('Yearly simple interest', () => {
            const res = calculateSimpleInterest({ principal: 1000, rate: 10, time: 2, timeUnit: 'years' });
            expect(res.interest).toBe(200);
            expect(res.totalAmount).toBe(1200);
        });
        test('Monthly simple interest', () => {
            const res = calculateSimpleInterest({ principal: 1200, rate: 10, time: 6, timeUnit: 'months' });
            expect(res.interest).toBe(60);
        });
        test('Breakdown Data Generation', () => {
            const res = calculateSimpleInterest({
                principal: 1000, rate: 12, time: 1,
                scheduleStartDate: '2024-01'
            });
            expect(res.monthlyData.length).toBe(12);
            expect(res.yearlyData.length).toBe(1);
        });
    });

    describe('Compound Interest', () => {
        test('Annual Compounding', () => {
            const res = calculateCompoundInterest({ principal: 1000, rate: 10, time: 2, frequency: 1 });
            expect(res.totalAmount).toBeCloseTo(1210, 0);
        });
        test('Monthly Compounding', () => {
            const res = calculateCompoundInterest({ principal: 1000, rate: 12, time: 1, frequency: 12 });
            expect(res.totalAmount).toBeCloseTo(1000 * Math.pow(1.01, 12), 1);
        });
    });

    // --- 3. Goal Planners (Required SIP/Lump) ---
    describe('Goal Planning', () => {
        test('Required SIP to reach 1L in 1 yr @ 12%', () => {
            const sip = getRequiredSIP(100000, 12, 1);
            expect(sip).toBeGreaterThan(7000);
            expect(sip).toBeLessThan(8000);
        });
        test('Required LumpSum', () => {
            const lump = getRequiredLumpSum(12100, 10, 2);
            expect(lump).toBeCloseTo(9915, 0);
        });
        test('Required Step-Up SIP', () => {
            const sip = getRequiredStepUpSIP(100000, 12, 5, 10);
            const normalSip = getRequiredSIP(100000, 12, 5);
            expect(sip).toBeLessThan(normalSip);
        });
    });

    // --- 4. Utilities ---
    describe('Real Rate & CAGR', () => {
        test('Real Rate of Return', () => {
            const real = calculateRealRate(10, 5);
            expect(real).toBeCloseTo(4.76, 2);
        });
        test('CAGR Calculation', () => {
            const cagr = calculateCAGR(100, 200, 5);
            expect(cagr).toBeCloseTo(14.87, 2);
        });
        test('CAGR Zero/Negative Handling', () => {
            expect(calculateCAGR(100, 50, 5)).toBeLessThan(0);
            expect(calculateCAGR(100, 100, 5)).toBe(0);
            expect(calculateCAGR(0, 100, 5)).toBe(0);
        });
        test('Calculate Inflation Impact', () => {
            const realVal = calculateInflationImpact(100, 5, 1);
            expect(realVal).toBeCloseTo(95.24, 2);
        });
        test('Calculate Real Value', () => {
            const val = calculateRealValue(1000, 0, 10);
            expect(val).toBe(1000);
        });
    });

    // --- 5. Basic Amortization ---
    describe('Basic Loan Amortization', () => {
        test('Generates rows correctly', () => {
            const res = computeLoanAmortization({
                principal: 100000, annualRate: 10, years: 1, emi: 8791.59,
                startDate: '2024-01'
            });
            expect(res.monthlyRows.length).toBe(12);
            expect(res.rows.length).toBe(1);
            expect(res.monthlyRows[11].closingBalance).toBeCloseTo(0, 0);
        });
        test('Negative Amortization Protection', () => {
            const res = computeLoanAmortization({ principal: 100000, annualRate: 12, years: 1, emi: 500 });
            expect(res.error).toBeDefined();
            expect(res.monthlyRows.length).toBe(0);
        });
    });

    // --- 6. Advanced Amortization ---
    describe('Advanced Loan Amortization', () => {
        const baseParams = {
            principal: 5000000,
            annualRate: 9,
            years: 20,
            startDate: '2024-04'
        };

        test('Standard Calculation', () => {
            const res = computeAdvancedLoanAmortization(baseParams);
            expect(res.summary.actualTenureYears).toBe(20);
        });
        test('Step Up EMI (Yearly)', () => {
            const res = computeAdvancedLoanAmortization({ ...baseParams, emiStepUpYearly: 10 });
            expect(res.summary.actualTenureYears).toBeLessThan(12);
        });
        test('Yearly Prepayments', () => {
            const res = computeAdvancedLoanAmortization({ ...baseParams, yearlyExtra: 100000 });
            expect(res.monthlyRows[11].prepayment).toBe(100000);
        });
        test('Financial Year Data correctness', () => {
            const res = computeAdvancedLoanAmortization({ ...baseParams, startDate: '2024-02' });
            const fyRows = res.financialYearlyRows;
            expect(fyRows[0].year).toBe(2023);
            expect(fyRows[1].year).toBe(2024);
        });
        test('Variable Interest Rate', () => {
            const res = computeAdvancedLoanAmortization({
                ...baseParams,
                interestRateChanges: [{ date: '2024-05', rate: 10 }]
            });
            expect(res.monthlyRows[1].interestPaid).toBeGreaterThan(res.monthlyRows[0].interestPaid);
        });
        test('Prepayment Exceeding Balance', () => {
            const res = computeAdvancedLoanAmortization({
                ...baseParams,
                oneTimePrepayments: [{ date: '2024-05', amount: 10000000 }]
            });
            const m2 = res.monthlyRows[1];
            expect(m2.closingBalance).toBe(0);
        });
        test('Reduce EMI Strategy', () => {
            const res = computeAdvancedLoanAmortization({
                ...baseParams,
                oneTimePrepayments: [{ date: '2024-05', amount: 2000000 }],
                prepaymentStrategy: 'reduce_emi'
            });
            const emi1 = res.monthlyRows[0].interestPaid + res.monthlyRows[0].principalPaid;
            const emi3 = res.monthlyRows[2].interestPaid + res.monthlyRows[2].principalPaid;
            expect(emi3).toBeLessThan(emi1);
        });
    });

    // --- 7. Other Loan Helpers ---
    describe('Loan Helpers', () => {
        test('Calculate EMI', () => {
            const emi = calculateEMI(100000, 0.01, 12);
            expect(emi).toBeCloseTo(8884.88, 2);
        });
        test('Calculate Loan Amount from EMI', () => {
            const loan = calculateLoanAmountFromEMI(8884.88, 0.01, 12);
            expect(loan).toBeCloseTo(100000, 0);
        });
        test('Calculate Tenure', () => {
            const years = calculateLoanTenure(100000, 8884.88, 12);
            expect(years).toBeCloseTo(1, 1);
        });
        test('Apr Calculation', () => {
            const apr = calculateAPR(100000, 1000, 1, 10000);
            expect(apr).toBeGreaterThan(0);
        });
    });

    // --- 8. Flat Rate & Effective Rate ---
    describe('Flat Rate Conversion', () => {
        test('Flat Rate EMI', () => {
            const emi = calculateFlatRateEMI(100000, 10, 1);
            expect(emi).toBeCloseTo(9166.67, 1);
        });
        test('Effective Interest Rate from Flat', () => {
            const effRate = calculateEffectiveInterestRate(100000, 1, 9166.66);
            expect(effRate).toBeGreaterThan(17);
            expect(effRate).toBeLessThan(19);
        });
    });

    // --- 9. Special Calculators ---
    describe('SWP Calculator', () => {
        test('SWP Depletion Logic', () => {
            const res = computeSWPPlan({
                initialCorpus: 100000, monthlyWithdrawal: 10000, annualRate: 0,
                years: 1, startDate: '2024-01'
            });
            expect(res.depletionYear).toBe(2024);
            expect(res.depletionMonth).toBe(10);
        });
        test('SWP Growth', () => {
            const res = computeSWPPlan({
                initialCorpus: 100000, monthlyWithdrawal: 0, annualRate: 10, years: 1
            });
            expect(res.finalCorpus).toBeGreaterThan(100000);
        });
    });

    describe('Yearly Schedule Logic', () => {
        test('Generates rows for SIP', () => {
            const res = computeYearlySchedule({
                monthlySIP: 1000, totalYears: 1, annualRate: 10, startDate: '2024-01-01'
            });
            expect(res.rows.length).toBe(1);
        });
        test('Date Mode', () => {
            const res = computeYearlySchedule({
                monthlySIP: 1000, startDate: '2024-01-01', endDate: '2025-01-01',
                calculationMode: 'date', annualRate: 10
            });
            expect(res.monthlyRows.length).toBe(12);
        });
    });

    describe('Step Up Schedule', () => {
        test('Step Up Increases Investment', () => {
            const res = computeStepUpSchedule({
                initialSIP: 1000, stepUpPercent: 10, annualRate: 0,
                totalYears: 2, sipYears: 2
            });
            expect(res[0].totalInvested).toBe(12000);
            expect(res[1].totalInvested).toBe(12000 + 13200);
        });
    });

    describe('FIRE Calculators', () => {
        test('Time To FIRE', () => {
            const res = calculateTimeToFIRE({
                currentCorpus: 0, monthlyExpenses: 1000, swr: 4,
                monthlyInvestment: 10000, annualReturn: 0
            });
            expect(res.years).toBe(2);
            expect(res.months).toBe(6);
        });
        test('Time To FIRE with Inflation', () => {
            const res = calculateTimeToFIRE({
                currentCorpus: 0, monthlyExpenses: 1000, swr: 4,
                monthlyInvestment: 10000, annualReturn: 10, inflation: 6
            });
            expect(res.years).toBeGreaterThan(0);
        });
        test('FIRE Level', () => {
            expect(calculateFIRELevel(41000, 100000)).toBe('FIRE');
            expect(calculateFIRELevel(40000, 100000)).toBe('ChubbyFIRE');
            expect(calculateFIRELevel(10000, 100000)).toBe('FatFIRE');
        });
        test('Coast FIRE', () => {
            const res = calculateCoastFIRE({
                currentAge: 30, retirementAge: 60, monthlyExpenses: 50000,
                swr: 4, annualReturn: 10, inflation: 6
            });
            expect(res.neededToday).toBeGreaterThan(0);
        });
    });

    describe('Cost of Delay', () => {
        test('Delay reduces corpus', () => {
            const res = calculateCostOfDelay({
                monthlyInvestment: 1000, annualReturn: 10,
                delayYears: 1, investmentYears: 10
            });
            expect(res.cost).toBeGreaterThan(0);
        });
    });

    describe('Rent Vs Buy', () => {
        test('Generates Ledger', () => {
            const res = computeRentVsBuyLedger({
                homePrice: 5000000, downPayment: 1000000, loanRate: 9,
                loanTenureYears: 20, monthlyRent: 15000, investReturnRate: 10,
                propertyAppreciationRate: 5, rentInflationRate: 5
            });
            expect(res.yearlyLedger.length).toBeGreaterThan(0);
        });
    });

    describe('Rebalancing', () => {
        test('Calculates Action', () => {
            const res = calculateRebalancing({ equity: 50, debt: 50, targetEquityPercent: 60 });
            expect(res.equityAction).toBe(10);
            expect(res.debtAction).toBe(-10);
        });
    });

    describe('Fixed Deposit', () => {
        test('Simple Interest for Days', () => {
            const res = computeFixedDeposit({
                principal: 1000, rate: 10, tenureValue: 365, tenureMode: 'Days'
            });
            expect(res.totalInterest).toBe(100);
        });
        test('Cumulative Quarterly', () => {
            const res = computeFixedDeposit({
                principal: 1000, rate: 10, tenureValue: 1, tenureMode: 'Years',
                payoutType: 'cumulative'
            });
            expect(res.maturityValue).toBeCloseTo(1103.8, 1);
        });
        test('Monthly Payout', () => {
            const res = computeFixedDeposit({
                principal: 1000, rate: 12, tenureValue: 1, tenureMode: 'Years',
                payoutType: 'monthly'
            });
            expect(res.payoutAmount).toBe(10);
            expect(res.totalInterest).toBe(120);
        });
        test('FD Payouts (Yearly/Half-Yearly)', () => {
            const y = computeFixedDeposit({
                principal: 1000, rate: 10, tenureValue: 1, tenureMode: 'Years',
                payoutType: 'yearly'
            });
            expect(y.payoutAmount).toBe(100);

            const h = computeFixedDeposit({
                principal: 1000, rate: 10, tenureValue: 1, tenureMode: 'Years',
                payoutType: 'half-yearly'
            });
            expect(h.payoutAmount).toBe(50);
        });
        test('FD Payouts (Quarterly)', () => {
            const q = computeFixedDeposit({
                principal: 1000, rate: 10, tenureValue: 1, tenureMode: 'Years',
                payoutType: 'quarterly'
            });
            expect(q.payoutAmount).toBe(25);
        });
    });

    describe('PPF Calculator', () => {
        test('Generates Yearly Data', () => {
            const res = computePPF({
                investmentAmount: 100000, frequency: 'yearly', interestRate: 7.1, years: 15, startDate: '2024-01-01'
            });
            expect(res.yearlyData.length).toBe(15);
            expect(res.maturityValue).toBeGreaterThan(1500000);
        });
        test('PPF Frequencies', () => {
            const m = computePPF({ investmentAmount: 1000, frequency: 'monthly', interestRate: 7.1, years: 1 });
            expect(m.totalInvestment).toBe(12000);
            const q = computePPF({ investmentAmount: 1000, frequency: 'quarterly', interestRate: 7.1, years: 1 });
            expect(q.totalInvestment).toBe(4000);
            const h = computePPF({ investmentAmount: 1000, frequency: 'half-yearly', interestRate: 7.1, years: 1 });
            expect(h.totalInvestment).toBe(2000);
        });
    });

    describe('Advanced Loan Types', () => {
        test('Step Up Loan Amortization (Percent)', () => {
            const res = computeStepUpLoanAmortization({
                principal: 100000, annualRate: 10, years: 5,
                stepUpType: 'percent', stepUpValue: 10
            });
            expect(res.monthsTaken).toBeLessThan(60);
        });
        test('Step Up Amount (Fixed) & Rate Change', () => {
            const res = computeStepUpLoanAmortization({
                principal: 100000, annualRate: 10, years: 5,
                stepUpType: 'amount', stepUpValue: 2000,
                rateChangeYear: 2, newRate: 12
            });
            // Month 13 should be > Month 1
            expect(res.monthlyRows[12].emi).toBeGreaterThan(res.monthlyRows[0].emi);
        });
        test('Moratorium Loan', () => {
            const res = computeMoratoriumLoanAmortization({
                principal: 100000, annualRate: 12, totalTenureYears: 1,
                moratoriumMonths: 6, payInterestDuringMoratorium: false
            });
            expect(res.monthlyRows[5].balance).toBeGreaterThan(100000);
            expect(res.monthlyRows[6].emi).toBeGreaterThan(0);
        });
        test('Moratorium Loan (Pay Interest)', () => {
            const res = computeMoratoriumLoanAmortization({
                principal: 100000, annualRate: 12, totalTenureYears: 1,
                moratoriumMonths: 6, payInterestDuringMoratorium: true
            });
            expect(res.monthlyRows[0].emi).toBeCloseTo(1000, 0); // 1% of 1L
            expect(res.monthlyRows[5].balance).toBeCloseTo(100000, 0);
        });
    });

    describe('Dual Amortization', () => {
        test('Combines Base + TopUp correctly', () => {
            const res = computeDualAmortization({
                basePrincipal: 100000, baseRate: 10, baseYears: 1,
                topUpPrincipal: 50000, topUpRate: 12, topUpYear: 0.5
            });
            expect(res.rows).toBeDefined();
            expect(res.finalTotalPaid).toBeGreaterThan(150000);
        });
    });

    describe('Edge Cases & Branch Cleanup', () => {
        test('Coast FIRE - zero years', () => {
            expect(calculateCoastFIRE({ currentAge: 60, retirementAge: 60 })).toBe(0);
        });
        test('Cost of Delay - delayed beyond investment period', () => {
            const res = calculateCostOfDelay({
                monthlyInvestment: 1000, annualReturn: 10,
                delayYears: 10, investmentYears: 5
            });
            expect(res.startedLater).toBe(0);
        });
        test('Rent Vs Buy - Loan Closure Exactness', () => {
            const res = computeRentVsBuyLedger({
                homePrice: 100000, downPayment: 0, loanRate: 10,
                loanTenureYears: 1, monthlyRent: 0, investReturnRate: 0,
                propertyAppreciationRate: 0, rentInflationRate: 0
            });
            expect(res.yearlyLedger.length).toBeGreaterThan(0);
        });
    });

    // --- 10. Investment Duration (Time to Goal) ---
    describe('calculateInvestmentDuration', () => {
        const target = 1000000; // 10 Lakhs

        test('Goal reached immediately if principal >= target', () => {
            expect(calculateInvestmentDuration({
                principal: 1500000,
                target: 1000000,
                annualRate: 12
            })).toBe(0);
        });

        test('Lumpsum only: 5L @ 12% to reach 10L (Monthly Compounding)', () => {
            const years = calculateInvestmentDuration({
                principal: 500000,
                contribution: 0,
                target: 1000000,
                annualRate: 12
            });
            // 2 = (1 + 0.12/12)^n => n = ln(2)/ln(1.01) ~= 69.66 months ~= 5.805 years
            expect(years).toBeCloseTo(5.805, 3);
        });

        test('SIP only: 10k monthly @ 12% to reach 10L (Annuity Due)', () => {
            const years = calculateInvestmentDuration({
                principal: 0,
                contribution: 10000,
                target: 1000000,
                annualRate: 12,
                frequency: 'monthly'
            });
            // Result is approx 69 months / 12 ~= 5.76 yrs
            expect(years).toBeCloseTo(5.763, 3);
        });

        test('Edge Case: 0 Investment for positive target (Unreachable)', () => {
            const years = calculateInvestmentDuration({
                principal: 0,
                contribution: 0,
                target: 1000000,
                annualRate: 12
            });
            expect(years).toBe(999);
        });

        test('Edge Case: 0 Return Rate (Linear Growth)', () => {
            const years = calculateInvestmentDuration({
                principal: 200000,
                contribution: 10000,
                target: 1000000,
                annualRate: 0,
                frequency: 'monthly'
            });
            expect(years).toBeCloseTo(6.667, 2);
        });

        test('Edge Case: Both principal and SIP are 0', () => {
            const years = calculateInvestmentDuration({
                principal: 0,
                contribution: 0,
                target: 1000000,
                annualRate: 10
            });
            expect(years).toBe(999);
        });
    });

    describe('Audit Stress Tests - Boundary Conditions', () => {
        test('getRequiredSIP with 0 years', () => {
            // target 1L, 10% rate, 0 years
            expect(getRequiredSIP(100000, 10, 0)).toBe(Infinity);
        });

        test('calculateLoanTenure with EMI too small', () => {
            // principal 1L, rate 12% => monthly interest 1000. 
            // If EMI is 1000, it never pays off principal.
            expect(calculateLoanTenure(100000, 1000, 12)).toBe(Infinity);
            // If EMI is 500, it never pays off interest even.
            expect(calculateLoanTenure(100000, 500, 12)).toBe(Infinity);
        });

        test('calculateTimeToFIRE with 0 investment and negative growth', () => {
            const res = calculateTimeToFIRE({
                currentCorpus: 100,
                monthlyExpenses: 1000,
                monthlyInvestment: 0,
                annualReturn: 0,
                inflation: 5 // effectively negative growth
            });
            expect(res.years).toBe(100); // capped at 1200 months
        });

        test('calculateRealRate with return < inflation', () => {
            // Return 4%, Inflation 5%
            expect(calculateRealRate(4, 5)).toBe(0); // App standard currently
        });
    });
});
