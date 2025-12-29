
import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
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

        // Limit to 30 years (360 months) to prevent browser hang on edge cases
        while (currentBalance > 0 && months < 360) {
            const interestForMonth = currentBalance * r;
            let principalParams = p - interestForMonth;

            if (currentBalance < p) {
                // Last payment
                principalParams = currentBalance;
            }

            totalInterest += interestForMonth;
            currentBalance -= principalParams;
            months++;

            // Store data for chart (every month or year?)
            // Let's store every month for accuracy but we might want to aggregate for chart if long
            monthlyData.push({
                month: months,
                balance: Math.max(0, currentBalance),
                interestPaid: totalInterest
            });
        }

        return {
            months,
            totalInterest,
            totalPaid: Number(balance) + totalInterest,
            monthlyData
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
            // No pie chart or table needed strictly, but could add table if requested
            pieChart={null}
            table={null}
        />
    );
}
