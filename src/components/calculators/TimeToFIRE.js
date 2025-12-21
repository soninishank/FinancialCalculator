import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { FinancialLineChart } from '../common/FinancialCharts';
import ResultsTable from '../common/ResultsTable';
import { calculateTimeToFIRE } from '../../utils/finance';
import { downloadPDF } from '../../utils/export';
import {
    DEFAULT_SWR,
    DEFAULT_EXPENSE,
    DEFAULT_RATE,
    MAX_CORPUS,
    STEP_LARGE,
    MAX_EXPENSE,
    STEP_AMOUNT,
    MAX_SIP,
    MIN_AMOUNT,
    MAX_RATE,
    MIN_SWR,
    MAX_SWR,
    MIN_RATE
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MIN_EXPENSE = 5000;

export default function TimeToFIRE({ currency }) {
    const [currentCorpus, setCurrentCorpus] = useState(1000000); // 10 Lakh
    const [monthlyExpenses, setMonthlyExpenses] = useState(DEFAULT_EXPENSE);
    const [monthlyInvestment, setMonthlyInvestment] = useState(20000); // 20k
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);
    const [swr, setSwr] = useState(DEFAULT_SWR);

    const result = useMemo(() => calculateTimeToFIRE({
        currentCorpus: Number(currentCorpus),
        monthlyExpenses: Number(monthlyExpenses),
        monthlyInvestment: Number(monthlyInvestment),
        annualReturn: Number(annualReturn),
        swr: Number(swr)
    }), [currentCorpus, monthlyExpenses, monthlyInvestment, annualReturn, swr]);

    const inputs = (
        <>
            <InputWithSlider
                label="Current Portfolio Value"
                value={currentCorpus}
                onChange={setCurrentCorpus}
                min={MIN_AMOUNT}
                max={MAX_CORPUS}
                step={STEP_LARGE}
                currency={currency}
            />
            <InputWithSlider
                label="Monthly Expenses"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                min={LOC_MIN_EXPENSE}
                max={MAX_EXPENSE}
                step={STEP_AMOUNT}
                currency={currency}
            />
            <InputWithSlider
                label="Monthly Investment"
                value={monthlyInvestment}
                onChange={setMonthlyInvestment}
                min={MIN_AMOUNT}
                max={MAX_SIP}
                step={STEP_AMOUNT}
                currency={currency}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <InputWithSlider
                    label="Expected Annual Return (%)"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    min={MIN_RATE}
                    max={MAX_RATE}
                    step={0.1}
                    symbol="%"
                />
                <InputWithSlider
                    label="Withdrawal Rate (SWR %)"
                    value={swr}
                    onChange={setSwr}
                    min={MIN_SWR}
                    max={MAX_SWR}
                    step={0.1}
                    symbol="%"
                />
            </div>
        </>
    );

    const handleExport = () => {
        if (!result.rows) return;
        const headers = ["Year", "Annual Inv.", "Total Invested", "Growth", "Portfolio Value", "Annual Expenses", "SWR", "Target Corpus"];
        const data = result.rows.map(r => [
            `Year ${r.year}`,
            Math.round(r.annualInvestment),
            Math.round(r.totalInvested),
            Math.round(r.growth),
            Math.round(r.overallValue),
            Math.round(r.annualExpenses),
            r.swr + '%',
            Math.round(r.targetCorpus)
        ]);
        downloadPDF(data, headers, "time_to_fire_report.pdf");
    };

    const tableColumns = [
        { key: 'year', label: 'Year', align: 'left' },
        { key: 'annualInvestment', label: 'Annual Inv.', align: 'right', format: 'money' },
        { key: 'totalInvested', label: 'Total Inv.', align: 'right', format: 'money' },
        { key: 'growth', label: 'Growth', align: 'right', format: 'money', color: 'green' },
        { key: 'overallValue', label: 'Portfolio Value', align: 'right', format: 'money', highlight: true },
        { key: 'annualExpenses', label: 'Annual Exp.', align: 'right', format: 'money' },
        { key: 'swr', label: 'SWR', align: 'right', format: 'percent' },
        { key: 'targetCorpus', label: 'Target', align: 'right', format: 'money' }
    ];

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
                        {/* Time to FIRE */}
                        <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wide mb-1">Time to FIRE</h3>
                            <div className="text-4xl font-extrabold text-teal-600">
                                {result.years}<span className="text-lg font-medium text-teal-500 ml-1">Y</span> {result.months}<span className="text-lg font-medium text-teal-500 ml-1">M</span>
                            </div>
                            <p className="text-xs text-teal-600/70 mt-2 font-medium">Until Financial Independence</p>
                        </div>

                        {/* Target Corpus */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Target Corpus Needed</h3>
                            <div className="text-3xl font-extrabold text-gray-900">
                                {currency} {Math.round(result.targetCorpus).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Annual Exp. ÷ {swr}% (SWR)</span>
                            </div>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block">
                        <h3 className="text-gray-800 font-bold text-lg mb-4">Path to FIRE</h3>
                        <FinancialLineChart
                            data={{
                                labels: Array.from({ length: Math.ceil(result.years + 2) }, (_, i) => `Year ${i}`),
                                datasets: [
                                    {
                                        label: 'Portfolio Value',
                                        data: Array.from({ length: Math.ceil(result.years + 2) }, (_, i) => {
                                            // Simple yearly projection for chart
                                            // FV = PV*(1+r)^n + PMT * ...
                                            const r = annualReturn / 100;
                                            const months = i * 12;
                                            // Use correct monthly rate for chart consistency with main logic
                                            const r_m_chart = Math.pow(1 + r, 1 / 12) - 1;

                                            // We need to re-calculate here or just use result.rows if available?
                                            // result.rows might not align perfectly with this chart logic if we want smooth yearly points
                                            // But for now let's stick to the existing chart logic but fix the rate if needed
                                            // Actually, let's keep the chart logic simple or updated.
                                            // To ensure consistency, let's just use the same formula

                                            // FV of Corpus
                                            const valCorpus = currentCorpus * Math.pow(1 + r_m_chart, months);

                                            // FV of SIP
                                            let valSIP;
                                            if (r_m_chart === 0) {
                                                valSIP = monthlyInvestment * months;
                                            } else {
                                                valSIP = monthlyInvestment * ((Math.pow(1 + r_m_chart, months) - 1) / r_m_chart);
                                            }

                                            return Math.round(valCorpus + valSIP);
                                        }),
                                        borderColor: '#0D9488', // Teal-600
                                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                                        fill: true,
                                        tension: 0.4
                                    },
                                    {
                                        label: 'FIRE Target',
                                        data: Array.from({ length: Math.ceil(result.years + 2) }, () => result.targetCorpus),
                                        borderColor: '#EF4444', // Red-500
                                        borderDash: [5, 5],
                                        fill: false,
                                        pointRadius: 0
                                    }
                                ]
                            }}
                            currency={currency}
                            height={300}
                        />
                    </div>
                </>
            }
            table={
                <ResultsTable
                    data={result.rows}
                    currency={currency}
                    onExport={handleExport}
                    columns={tableColumns}
                />
            }
        />
    );
}
