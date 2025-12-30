
import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { downloadPDF } from '../../utils/export';
import CollapsibleAmortizationTable from '../common/CollapsibleAmortizationTable';
import { FinancialLineChart } from '../common/FinancialCharts';
import {
    CHART_COLORS,
    DEFAULT_CC_BALANCE,
    DEFAULT_CC_RATE,
    DEFAULT_CC_PAYMENT,
    MAX_CC_BALANCE,
    MAX_CC_RATE,
    MIN_CC_PAYMENT,
    STEP_CC_PAYMENT
} from '../../utils/constants';

export default function CreditCardPayoff({ currency }) {
    const [balance, setBalance] = useState(DEFAULT_CC_BALANCE); // Default 50k
    const [interestRate, setInterestRate] = useState(DEFAULT_CC_RATE); // Default 18% APR
    const [monthlyPayment, setMonthlyPayment] = useState(DEFAULT_CC_PAYMENT); // Default payment

    const result = useMemo(() => {
        let currentBalance = Number(balance);
        const r = Number(interestRate) / 100 / 12; // Monthly rate
        const p = Number(monthlyPayment);

        // Safety check: if interest > payment, infinite loop
        const firstMonthInterest = currentBalance * r;
        if (p <= firstMonthInterest) {
            return {
                error: "Monthly payment is too low to cover interest. Balance will increase.",
                months: 0,
                totalInterest: 0,
                totalPaid: 0,
                yearlyData: [],
                monthlyData: []
            };
        }

        let months = 0;
        let totalInterest = 0;
        const monthlyData = [];
        const yearlyData = [];

        // Track yearly aggregates
        let currentYearPrincipal = 0;
        let currentYearInterest = 0;
        let currentYearPayment = 0;

        // Limit to 30 years (360 months) to prevent browser hang on edge cases
        while (currentBalance > 0 && months < 360) {
            months++;
            const interestForMonth = currentBalance * r;
            let principalForMonth = p - interestForMonth;

            // Handle last payment or negative amortization (though check at top prevents negative)
            if (currentBalance < p) {
                principalForMonth = currentBalance;
            }

            const paymentForMonth = principalForMonth + interestForMonth;

            totalInterest += interestForMonth;
            currentBalance -= principalForMonth;

            // Add to Yearly Aggregates
            currentYearPrincipal += principalForMonth;
            currentYearInterest += interestForMonth;
            currentYearPayment += paymentForMonth;

            const bal = Math.max(0, currentBalance);

            monthlyData.push({
                month: months,
                balance: bal,
                interestPaid: interestForMonth, // Store MONTHLY interest
                principalPaid: principalForMonth,
                totalPaid: paymentForMonth,
                cumulativeInterest: totalInterest
            });

            // End of Year Check (every 12 months OR if balance is 0)
            if (months % 12 === 0 || bal === 0) {
                const yearNum = Math.ceil(months / 12);

                // If it's the very last partial year, we only push if we haven't already pushed this year
                // (e.g. if loan ends at m=24, it pushes at m=24 via %12. If m=25, it pushes at m=25 via bal=0)

                // Simple logic: If it's the end of a 12-month block OR the end of the loan
                // logic:
                // if loan ends at month 13. 
                // m=12: push year 1. reset.
                // m=13: bal=0. push year 2.

                // Check if we already have a row for this year?
                // No, standard loop.

                yearlyData.push({
                    year: yearNum,
                    principalPaid: currentYearPrincipal,
                    interestPaid: currentYearInterest,
                    totalPaid: currentYearPayment,
                    balance: bal
                });

                // Reset for next year
                currentYearPrincipal = 0;
                currentYearInterest = 0;
                currentYearPayment = 0;
            }
        }

        return {
            months,
            totalInterest,
            totalPaid: Number(balance) + totalInterest,
            monthlyData,
            yearlyData
        };

    }, [balance, interestRate, monthlyPayment]);

    // --- CHART DATA ---
    const lineData = {
        // Showlabels e.g. "Month 1, Month 5..." or "Year 1"
        labels: result.monthlyData
            .filter((_, i) => i % 6 === 0 || i === result.monthlyData.length - 1) // Downsample for display
            .map(d => `Month ${d.month}`),
        datasets: [
            {
                label: 'Remaining Balance',
                data: result.monthlyData
                    .filter((_, i) => i % 6 === 0 || i === result.monthlyData.length - 1)
                    .map(d => d.balance),
                borderColor: CHART_COLORS.ToFirePath || '#e11d48', // Red-ish for debt
                backgroundColor: 'rgba(225, 29, 72, 0.1)',
                fill: true,
                tension: 0.3
            }
        ]
    };

    // --- UI INPUTS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Credit Card Balance"
                value={balance}
                onChange={setBalance}
                min={1000}
                max={MAX_CC_BALANCE} // 10 Lakh or 1M
                step={1000}
                currency={currency}
            />
            <InputWithSlider
                label="Interest Rate (APR %)"
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={MAX_CC_RATE}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />
            <InputWithSlider
                label="Monthly Payment"
                value={monthlyPayment}
                onChange={setMonthlyPayment}
                min={MIN_CC_PAYMENT}
                max={balance} // Can't pay more than balance really, but slider flexibility
                step={STEP_CC_PAYMENT}
                currency={currency}
            />

            {result.error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    <span className="font-medium">Warning!</span> {result.error}
                </div>
            )}
        </>
    );

    // --- SUMMARY CARDS ---
    // Custom summary because the standard "Investment Value" ones don't fit "Debt" 
    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Time to Payoff</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                    {Math.floor(result.months / 12)} Years {result.months % 12} Months
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Total Interest</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">
                    {moneyFormat(result.totalInterest, currency)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Extra money paid
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Total Amount Payable</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                    {moneyFormat(result.totalPaid, currency)}
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                !result.error ? (
                    <div className="h-80 bg-white p-4 rounded-xl border mt-6">
                        <FinancialLineChart data={lineData} currency={currency} height={320} />
                    </div>
                ) : null
            }
            // No pie chart
            pieChart={null}
            table={
                !result.error ? (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Payoff Schedule</h3>
                            <button
                                onClick={() => {
                                    const data = result.monthlyData.map(r => [
                                        `Month ${r.month}`,
                                        Math.round(r.principalPaid),
                                        Math.round(r.interestPaid),
                                        Math.round(r.balance)
                                    ]);
                                    downloadPDF(data, ['Month', 'Principal', 'Interest', 'Balance'], 'cc_payoff_schedule.pdf');
                                }}
                                className="text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Export PDF
                            </button>
                        </div>
                        <CollapsibleAmortizationTable
                            yearlyData={result.yearlyData}
                            monthlyData={result.monthlyData}
                            currency={currency}
                        />
                    </div>
                ) : null
            }
        />
    );
}
