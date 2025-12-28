import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { FinancialLineChart } from '../common/FinancialCharts';
import ResultsTable from '../common/ResultsTable';
import { calculateTimeToFIRE } from '../../utils/finance';
import { downloadPDF } from '../../utils/export';
import { moneyFormat } from '../../utils/formatting';
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
const LOC_DEFAULT_INFLATION = 6;

export default function TimeToFIRE({ currency }) {
    const [currentCorpus, setCurrentCorpus] = useState(1000000); // 10 Lakh
    const [monthlyExpenses, setMonthlyExpenses] = useState(DEFAULT_EXPENSE);
    const [monthlyInvestment, setMonthlyInvestment] = useState(20000); // 20k
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);
    const [inflation, setInflation] = useState(LOC_DEFAULT_INFLATION);
    const [swr, setSwr] = useState(DEFAULT_SWR);

    const result = useMemo(() => calculateTimeToFIRE({
        currentCorpus: Number(currentCorpus),
        monthlyExpenses: Number(monthlyExpenses),
        monthlyInvestment: Number(monthlyInvestment),
        annualReturn: Number(annualReturn),
        swr: Number(swr),
        inflation: Number(inflation)
    }), [currentCorpus, monthlyExpenses, monthlyInvestment, annualReturn, swr, inflation]);

    const getSWRDescription = (rate) => {
        if (rate <= 3) return "Conservative: Targeted to last indefinitely (preserves real capital).";
        if (rate <= 4.0) return "Standard (The 4% Rule): Targeted to last ~30+ years.";
        if (rate <= 5.0) return "Aggressive: Targeted to last ~20-25 years. Risk of depletion.";
        return "Very Aggressive: High risk of depleting corpus in roughly 10-15 years.";
    };

    const inputs = (
        <>
            <div className="mb-6">
                <InputWithSlider
                    label="Current Portfolio Value"
                    value={currentCorpus}
                    onChange={setCurrentCorpus}
                    min={MIN_AMOUNT}
                    max={MAX_CORPUS}
                    step={STEP_LARGE}
                    currency={currency}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Your existing assets that are allocated for this goal (e.g., Stocks, Mutual Funds, PF).
                </p>
            </div>

            <div className="mb-6">
                <InputWithSlider
                    label="Monthly Expenses (Current)"
                    value={monthlyExpenses}
                    onChange={setMonthlyExpenses}
                    min={LOC_MIN_EXPENSE}
                    max={MAX_EXPENSE}
                    step={STEP_AMOUNT}
                    currency={currency}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Your <b>current</b> monthly spending. We use this to calculate your target in real terms (purchasing power).
                </p>
            </div>

            <div className="mb-6">
                <InputWithSlider
                    label="Monthly Investment"
                    value={monthlyInvestment}
                    onChange={setMonthlyInvestment}
                    min={MIN_AMOUNT}
                    max={MAX_SIP}
                    step={STEP_AMOUNT}
                    currency={currency}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Amount you can invest monthly. We assume this amount increases with inflation (keeping "real" investment constant).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <div>
                    <InputWithSlider
                        label="Expected Annual Return (%)"
                        value={annualReturn}
                        onChange={setAnnualReturn}
                        min={MIN_RATE}
                        max={MAX_RATE}
                        step={0.1}
                        symbol="%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Nominal annual return. We adjust this by inflation to get the <b>Real Rate</b> ({Math.max(0, (1 + annualReturn / 100) / (1 + inflation / 100) - 1).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}).
                    </p>
                </div>
                <div>
                    <InputWithSlider
                        label="Expected Inflation (%)"
                        value={inflation}
                        onChange={setInflation}
                        min={0}
                        max={15}
                        step={0.1}
                        symbol="%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Average inflation rate. This reduces your effective return.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <InputWithSlider
                        label="Withdrawal Rate (SWR %)"
                        value={swr}
                        onChange={setSwr}
                        min={MIN_SWR}
                        max={MAX_SWR}
                        step={0.1}
                        symbol="%"
                    />
                    <div className="mt-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                        <p className={`text-sm font-medium ${swr > 5 ? 'text-orange-600' : 'text-teal-800'}`}>
                            {getSWRDescription(swr)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Withdrawals start after <b>{result.years >= 100 ? "reaching goal" : `${result.years} Years ${result.months} Months`}</b>
                        </p>
                    </div>
                </div>
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

    const details = (
        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-lg font-bold text-blue-900 mb-3">About this Calculator</h4>
            <div className="text-sm text-blue-800/80 space-y-3 leading-relaxed">
                <p>
                    This calculator estimates how long it will take for your portfolio to grow large enough to sustain your lifestyle indefinitely, often referred to as <b>Financial Independence, Retire Early (FIRE)</b>.
                </p>

                <h5 className="font-semibold text-blue-900 mt-4">Key Concepts:</h5>
                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        <b>Target Corpus:</b> The "Finish Line". Calculated as <code>Annual Expenses / (SWR / 100)</code>. For example, if you spend ₹6L/year and use a 4% SWR, you need ₹1.5 Cr.
                    </li>
                    <li>
                        <b>Safe Withdrawal Rate (SWR):</b> The standard advice is 4%, derived from the "Trinity Study". It suggests that with a balanced portfolio, withdrawing 4% initially and adjusting for inflation gives a very high probability of your money lasting 30 years.
                    </li>
                    <li>
                        <b>Assumptions:</b> This simplified model assumes a constant annual return and constant expense purchasing power (inflation is implicitly handled if you consider these Real Returns and Real Expenses).
                    </li>
                </ul>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
                        {/* Time to FIRE */}
                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${result.years >= 100 ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 ${result.years >= 100 ? 'text-red-800' : 'text-teal-800'}`}>Time to FIRE</h3>
                            <div className={`text-4xl font-extrabold ${result.years >= 100 ? 'text-red-600' : 'text-teal-600'}`}>
                                {result.years >= 100 ? (
                                    <span>Never <span className="text-sm font-normal text-gray-500 block mt-1">(Metrics Unsustainable)</span></span>
                                ) : (
                                    <>{result.years}<span className="text-lg font-medium ml-1">Y</span> {result.months}<span className="text-lg font-medium ml-1">M</span></>
                                )}
                            </div>
                            {result.years < 100 && <p className="text-xs opacity-70 mt-2 font-medium">Until Financial Independence</p>}
                        </div>

                        {/* Target Corpus */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Target Corpus Needed</h3>
                            <div className="text-3xl font-extrabold text-gray-900">
                                {moneyFormat(result.targetCorpus, currency, true)}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Annual Exp. ÷ {swr}% (SWR) (Real Terms)</span>
                            </div>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block">
                        <h3 className="text-gray-800 font-bold text-lg mb-4">Path to FIRE (Real Value)</h3>
                        <FinancialLineChart
                            data={{
                                labels: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, (_, i) => `Year ${i}`),
                                datasets: [
                                    {
                                        label: 'Projected Portfolio (Real)',
                                        data: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, (_, i) => {
                                            // Calculate Real Rate for Chart Consistency
                                            let effectiveAnnualRate = annualReturn;
                                            if (inflation > 0) {
                                                effectiveAnnualRate = ((1 + annualReturn / 100) / (1 + inflation / 100) - 1) * 100;
                                            }

                                            // Simple yearly projection for chart using REAL RATE
                                            const r = effectiveAnnualRate / 100;
                                            const months = i * 12;
                                            const r_m_chart = Math.pow(1 + r, 1 / 12) - 1;

                                            // FV of Corpus
                                            const valCorpus = currentCorpus * Math.pow(1 + r_m_chart, months);

                                            // FV of SIP (Real SIP remains constant in Real Terms)
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
                                        label: 'FIRE Target (Constant Real)',
                                        data: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, () => result.targetCorpus),
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
            details={details}
        />
    );
}
