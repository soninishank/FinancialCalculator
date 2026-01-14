import React, { useState, useMemo } from 'react';
import { calculatorDetails } from '../../data/calculatorDetails';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialLineChart } from '../common/FinancialCharts';
import {
    CHART_COLORS,
    DEFAULT_RULE72_RATE,
    DEFAULT_RULE72_AMOUNT,
    MAX_RATE,
    MIN_RULE72_RATE,
    MAX_RULE72_AMOUNT,
    MIN_RULE72_AMOUNT,
    STEP_AMOUNT,
    STEP_PERCENT
} from '../../utils/constants';

import ResultsTable from '../common/ResultsTable';
import { downloadPDF } from '../../utils/export';

export default function RuleOf72({ currency }) {
    const [rate, setRate] = useState(DEFAULT_RULE72_RATE);
    const [principal, setPrincipal] = useState(DEFAULT_RULE72_AMOUNT);

    const result = useMemo(() => {
        const r = Number(rate);
        const p = Number(principal);

        // Prevent divide by zero
        if (r <= 0) return { years: 0, exactYears: 0, yearlyData: [] };

        // Rule of 72 calculation
        const yearsToDouble = 72 / r;

        // Generate chart data until it doubles
        const yearlyData = [];
        const maxYears = Math.ceil(yearsToDouble * 1.5); // Show a bit past doubling

        let currentAmount = p;
        for (let i = 0; i <= maxYears; i++) {
            // Compound interest formula: P * (1 + r/100)^t
            currentAmount = p * Math.pow((1 + r / 100), i);
            yearlyData.push({
                year: i,
                amount: currentAmount,
                invested: p,
                growth: currentAmount - p,
            });
        }

        return {
            years: yearsToDouble,
            yearlyData
        };

    }, [rate, principal]);

    // --- CHART DATA ---
    const lineData = {
        labels: result.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            {
                label: 'Investment Value',
                data: result.yearlyData.map(d => d.amount),
                borderColor: CHART_COLORS.PRIMARY,
                backgroundColor: CHART_COLORS.BACKGROUND_LIGHT,
                fill: true,
                tension: 0.3
            },
            {
                label: 'Target (Double)',
                data: result.yearlyData.map(() => principal * 2),
                borderColor: CHART_COLORS.SECONDARY, // Blue
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            }
        ]
    };

    // --- UI INPUTS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Interest Rate (Annual %)"
                value={rate}
                onChange={setRate}
                min={MIN_RULE72_RATE}
                max={MAX_RATE}
                step={STEP_PERCENT}
                symbol="%"
                isDecimal={true}
            />

            {/* Optional: Let them change the example amount */}
            <InputWithSlider
                label="Example Investment Amount"
                value={principal}
                onChange={setPrincipal}
                min={MIN_RULE72_AMOUNT}
                max={MAX_RULE72_AMOUNT}
                step={STEP_AMOUNT}
                currency={currency}
            />
        </>
    );

    // --- TABLE EXPORT ---
    const handleExport = () => {
        const headers = ["Year", "Invested", "Growth", "Total Value"];
        const rows = result.yearlyData.map(row => [
            `Year ${row.year}`,
            row.invested,
            row.growth,
            row.amount
        ]);
        downloadPDF(rows, headers, "Rule_of_72_Report.pdf");
    };

    // --- DETAILS ---
    const details = calculatorDetails['rule-of-72'].render({
        rate,
        yearsToDouble: result.years.toFixed(1)
    });

    const tableColumns = [
        { key: 'year', label: 'Year', align: 'left' },
        { key: 'invested', label: 'Invested', align: 'right', format: 'money' },
        { key: 'growth', label: 'Growth', align: 'right', format: 'money', color: 'green' },
        { key: 'amount', label: 'Total Value', align: 'right', format: 'money', highlight: true }
    ];

    // --- SUMMARY ---
    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Time to Double</p>
                <p className="text-4xl font-extrabold text-teal-600 mt-2">
                    {result.years.toFixed(1)} Years
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    Based on Rule of 72
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Future Value</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                    {moneyFormat(principal * 2, currency)}
                    <span className="text-lg text-gray-500 font-normal ml-2">
                        ({moneyFormat(principal * 2, currency, true)})
                    </span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    Your money doubles to this amount
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="bg-white p-4 rounded-xl border mt-6">
                    <FinancialLineChart data={lineData} currency={currency} height={320} />
                </div>
            }
            pieChart={null}
            table={
                <ResultsTable
                    data={result.yearlyData}
                    columns={tableColumns}
                    onExport={handleExport}
                    currency={currency}
                />
            }
            details={details}
        />
    );
}
