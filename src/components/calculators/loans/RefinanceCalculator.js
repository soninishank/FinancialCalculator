import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import { downloadPDF } from '../../../utils/export';
import { FinancialLineChart } from '../../common/FinancialCharts';
import CollapsibleInvestmentTable from '../../common/CollapsibleInvestmentTable';
import {
    CHART_COLORS,
    DEFAULT_REFINANCE_LOAN,
    DEFAULT_REFINANCE_RATE_OLD,
    DEFAULT_REFINANCE_RATE_NEW,
    DEFAULT_REFINANCE_TERM,
    DEFAULT_REFINANCE_COST,
    MAX_LOAN,
    MAX_YEARS,
    MAX_RATE,
    MAX_REFINANCE_COST,
    STEP_REFINANCE_COST
} from '../../../utils/constants';

export default function RefinanceCalculator({ currency }) {
    const [loanAmount, setLoanAmount] = useState(DEFAULT_REFINANCE_LOAN);
    const [oldRate, setOldRate] = useState(DEFAULT_REFINANCE_RATE_OLD);
    const [newRate, setNewRate] = useState(DEFAULT_REFINANCE_RATE_NEW);
    const [term, setTerm] = useState(DEFAULT_REFINANCE_TERM);
    const [cost, setCost] = useState(DEFAULT_REFINANCE_COST);

    const calculateEMI = (p, r, t) => {
        const monthlyRate = r / 12 / 100;
        const months = t * 12;
        if (r === 0) return p / months;
        return (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    };

    const result = useMemo(() => {
        const p = Number(loanAmount);
        const rOld = Number(oldRate);
        const rNew = Number(newRate);
        const t = Number(term);
        const c = Number(cost);
        const months = t * 12;

        const oldEMI = calculateEMI(p, rOld, t);
        const newEMI = calculateEMI(p, rNew, t);

        const monthlySavings = oldEMI - newEMI;
        const totalLifetimeSavings = (monthlySavings * months) - c;

        let breakEvenMonths = 0;
        if (monthlySavings > 0) {
            breakEvenMonths = c / monthlySavings;
        }

        let warning = null;
        if (rNew >= rOld) {
            warning = "New interest rate is higher than or equal to current rate. Refinancing may increase your costs.";
        } else if (breakEvenMonths > months) {
            warning = "Break-even point exceeds the loan term. You may not recover the closing costs.";
        }

        // Generate Yearly Data for Line Chart
        const yearlyData = [];
        for (let i = 0; i <= t; i++) {
            yearlyData.push({
                year: i,
                oldCumulative: oldEMI * 12 * i,
                newCumulative: (newEMI * 12 * i) + c
            });
        }

        return {
            oldEMI,
            newEMI,
            monthlySavings,
            totalLifetimeSavings,
            breakEvenMonths,
            warning,
            yearlyData
        };
    }, [loanAmount, oldRate, newRate, term, cost]);

    // --- CHART DATA ---
    const lineData = {
        labels: result.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            {
                label: 'Current Loan Cost',
                data: result.yearlyData.map(d => d.oldCumulative),
                borderColor: CHART_COLORS.SECONDARY, // Blue
                backgroundColor: CHART_COLORS.BACKGROUND_SECONDARY,
                tension: 0.2,
                fill: false
            },
            {
                label: 'Refinance Loan Cost',
                data: result.yearlyData.map(d => d.newCumulative),
                borderColor: CHART_COLORS.SUCCESS, // Green
                backgroundColor: CHART_COLORS.BACKGROUND_SUCCESS,
                tension: 0.2,
                fill: false
            }
        ]
    };

    // --- UI INPUTS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Loan Balance"
                value={loanAmount}
                onChange={setLoanAmount}
                min={100000}
                max={MAX_LOAN}
                step={100000}
                currency={currency}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithSlider
                    label="Current Interest Rate"
                    value={oldRate}
                    onChange={setOldRate}
                    min={0.1}
                    max={MAX_RATE}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                />
                <InputWithSlider
                    label="New Interest Rate"
                    value={newRate}
                    onChange={setNewRate}
                    min={0.1}
                    max={MAX_RATE}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                />
            </div>

            <InputWithSlider
                label="Loan Term (Years)"
                value={term}
                onChange={setTerm}
                min={1}
                max={MAX_YEARS}
                step={1}
            />

            <InputWithSlider
                label="Refinance / Closing Costs"
                value={cost}
                onChange={setCost}
                min={0}
                max={MAX_REFINANCE_COST} // 5 Lakh
                step={STEP_REFINANCE_COST}
                currency={currency}
            />

            {result.warning && (
                <div className="p-4 mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{result.warning}</span>
                </div>
            )}
        </>
    );

    // --- SUMMARY ---
    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            {/* Monthly Savings */}
            <div className={`p-6 rounded-xl shadow-sm border ${result.monthlySavings >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-gray-500 text-sm font-medium">Monthly Savings</p>
                <p className={`text-2xl font-bold mt-1 ${result.monthlySavings >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {moneyFormat(result.monthlySavings, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {result.monthlySavings >= 0 ? 'Reduced from monthly EMI' : 'Increase in monthly EMI'}
                </p>
            </div>

            {/* Break Even */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Break-Even Point</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                    {result.monthlySavings > 0 ? (
                        result.breakEvenMonths < 12
                            ? `${Math.ceil(result.breakEvenMonths)} Months`
                            : `${(result.breakEvenMonths / 12).toFixed(1)} Years`
                    ) : 'Never'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Time to recover costs</p>
            </div>

            {/* Total Savings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Net Lifetime Savings</p>
                <p className={`text-2xl font-bold mt-1 ${result.totalLifetimeSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {moneyFormat(result.totalLifetimeSavings, currency)}
                </p>
                <p className="text-xs text-gray-400 mt-1">After deducting closing costs</p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="bg-white p-4 rounded-xl border mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Cumulative Total Cost Over Time</h3>
                    <FinancialLineChart data={lineData} currency={currency} height={320} />
                </div>
            }
            pieChart={null}
            table={
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Cumulative Cost Comparison</h3>
                        <button
                            onClick={() => {
                                const data = result.yearlyData.map(r => [
                                    `Year ${r.year}`,
                                    Math.round(r.oldCumulative),
                                    Math.round(r.newCumulative),
                                    Math.round(r.oldCumulative - r.newCumulative)
                                ]);
                                downloadPDF(data, ['Year', 'Old Loan Cost', 'Refinance Cost', 'Savings'], 'refinance_comparison.pdf');
                            }}
                            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Export PDF
                        </button>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={result.yearlyData.map(d => ({
                            year: d.year,
                            totalInvested: d.oldCumulative,
                            interest: d.newCumulative,
                            balance: d.oldCumulative - d.newCumulative // Savings
                        }))}
                        monthlyData={[]}
                        currency={currency}
                        labels={{
                            invested: "Old Loan Cost",
                            interest: "New Loan Cost",
                            balance: "Net Savings"
                        }}
                    />
                </div>
            }
        />
    );
}
