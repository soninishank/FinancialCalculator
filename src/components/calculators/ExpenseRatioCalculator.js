import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import InputWithSlider from '../common/InputWithSlider';
import CalculatorLayout from '../common/CalculatorLayout';
import UnifiedSummary from '../common/UnifiedSummary';
import { moneyFormat } from '../../utils/formatting';
import {
    MIN_AMOUNT,
    MAX_AMOUNT,
    STEP_AMOUNT,
    MIN_RATE,
    MAX_RATE,
    MIN_YEARS,
    MAX_YEARS
} from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ExpenseRatioCalculator({ currency, setCurrency }) {
    // --- STATE ---
    const [initialCapital, setInitialCapital] = useState(100000);
    const [recurringInvestment, setRecurringInvestment] = useState(10000);
    const [isYearlyContribution, setIsYearlyContribution] = useState(false); // false = monthly, true = yearly

    // Duration State
    const [duration, setDuration] = useState(20);
    const [isDurationInMonths, setIsDurationInMonths] = useState(false); // false = years, true = months

    const [growthRate, setGrowthRate] = useState(12);
    const [expenseRatio, setExpenseRatio] = useState(1.0); // %

    // --- HANDLERS ---
    const handleExpenseRatioChange = (val) => {
        if (val > 5) {
            setExpenseRatio(5);
        } else {
            setExpenseRatio(val);
        }
    };

    const toggleDurationUnit = () => {
        if (isDurationInMonths) {
            setDuration(Math.ceil(duration / 12));
            setIsDurationInMonths(false);
        } else {
            setDuration(duration * 12);
            setIsDurationInMonths(true);
        }
    };

    // --- CALCULATION ---
    const results = useMemo(() => {
        const totalMonths = isDurationInMonths ? duration : duration * 12;
        const r_m_gross = growthRate / 12 / 100;

        // Effective net monthly rate
        const effectiveAnnualRate = growthRate - expenseRatio;
        const r_m_net = effectiveAnnualRate / 12 / 100;

        let balanceGross = Number(initialCapital);
        let balanceNet = Number(initialCapital);
        let totalInvested = Number(initialCapital);

        const dataPoints = [];
        const stepLabels = [];
        const yearlyData = [];

        // Initial Point
        dataPoints.push({
            month: 0,
            year: 0,
            invested: totalInvested,
            gross: balanceGross,
            net: balanceNet,
            impact: 0
        });
        stepLabels.push("Start");

        for (let m = 1; m <= totalMonths; m++) {
            // Investment Logic
            let investAmount = 0;

            if (recurringInvestment > 0) {
                if (isYearlyContribution) {
                    if ((m - 1) % 12 === 0) {
                        investAmount = Number(recurringInvestment);
                    }
                } else {
                    investAmount = Number(recurringInvestment);
                }
            }

            // Apply Investment 
            balanceGross += investAmount;
            balanceNet += investAmount;
            totalInvested += investAmount;

            // Apply Interest
            balanceGross = balanceGross * (1 + r_m_gross);
            balanceNet = balanceNet * (1 + r_m_net);

            // Snapshot Logic
            const isYearEnd = m % 12 === 0;
            const isLastMonth = m === totalMonths;

            if (isYearEnd || isLastMonth) {
                const lastPoint = dataPoints[dataPoints.length - 1];
                if (lastPoint && lastPoint.month === m) continue;

                const yearLabel = (m / 12).toFixed(1);

                // Format label: remove .0 if whole number
                const displayYear = Number(yearLabel) % 1 === 0 ? Number(yearLabel) : yearLabel;

                dataPoints.push({
                    month: m,
                    year: Number(yearLabel),
                    invested: totalInvested,
                    gross: balanceGross,
                    net: balanceNet,
                    impact: balanceGross - balanceNet
                });
                stepLabels.push(`Year ${displayYear}`);

                if (isYearEnd || (isLastMonth && totalMonths < 12)) {
                    yearlyData.push({
                        year: displayYear,
                        invested: totalInvested,
                        gross: balanceGross,
                        net: balanceNet,
                        impact: balanceGross - balanceNet
                    });
                }
            }
        }

        if (yearlyData.length === 0 && totalMonths > 0) {
            const yearVal = (totalMonths / 12).toFixed(1);
            yearlyData.push({
                year: Number(yearVal) % 1 === 0 ? Number(yearVal) : yearVal,
                invested: totalInvested,
                gross: balanceGross,
                net: balanceNet,
                impact: balanceGross - balanceNet
            });
        }

        return {
            finalGross: balanceGross,
            finalNet: balanceNet,
            totalInvested,
            impact: balanceGross - balanceNet,
            chartData: { labels: stepLabels, points: dataPoints },
            yearlyData
        };

    }, [initialCapital, recurringInvestment, isYearlyContribution, duration, isDurationInMonths, growthRate, expenseRatio]);

    // --- CHART OPTIONS ---

    // 1. Grouped Bar Chart for Comparison
    const barChartData = {
        labels: results.chartData.labels,
        datasets: [
            {
                label: `Without Expense (${growthRate}%)`,
                data: results.chartData.points.map(p => p.gross),
                backgroundColor: '#10b981', // Emerald-500
                borderRadius: 4,
            },
            {
                label: `With Expense (${(growthRate - expenseRatio).toFixed(1)}%)`,
                data: results.chartData.points.map(p => p.net),
                backgroundColor: '#3b82f6', // Blue-500
                borderRadius: 4,
            }
        ]
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += moneyFormat(context.parsed.y, currency);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => moneyFormat(value, currency, true)
                },
                grid: { return: false }
            },
            x: {
                grid: { display: false }
            }
        }
    };




    // --- RENDER ---
    return (
        <CalculatorLayout
            inputs={
                <div className="space-y-6">
                    <InputWithSlider
                        label="Initial Capital (Lump Sum)"
                        value={initialCapital}
                        onChange={setInitialCapital}
                        min={0}
                        max={MAX_AMOUNT}
                        step={STEP_AMOUNT}
                        currency={currency}
                    />

                    {/* Recurring Investment Section */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <InputWithSlider
                            label={isYearlyContribution ? "Yearly Investment" : "Monthly Investment"}
                            value={recurringInvestment}
                            onChange={setRecurringInvestment}
                            min={0}
                            max={isYearlyContribution ? MAX_AMOUNT * 2 : 500000}
                            step={isYearlyContribution ? 5000 : 500}
                            currency={currency}
                        />

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-slate-600">Frequency</span>
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                <button
                                    onClick={() => setIsYearlyContribution(false)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${!isYearlyContribution ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setIsYearlyContribution(true)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${isYearlyContribution ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <InputWithSlider
                            label={`Investment Duration (${isDurationInMonths ? 'Months' : 'Years'})`}
                            value={duration}
                            onChange={setDuration}
                            min={1}
                            max={isDurationInMonths ? 600 : MAX_YEARS}
                            step={1}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={toggleDurationUnit}
                                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                            >
                                Switch to {isDurationInMonths ? 'Years' : 'Months'}
                            </button>
                        </div>
                    </div>

                    <InputWithSlider
                        label="Expected Annual Growth (%)"
                        value={growthRate}
                        onChange={setGrowthRate}
                        min={MIN_RATE}
                        max={MAX_RATE}
                        step={0.1}
                        symbol="%"
                        isDecimal={true}
                    />

                    <div className="border-t border-dashed border-slate-300 pt-4">
                        <InputWithSlider
                            label="MF Expense Ratio (%)"
                            value={expenseRatio}
                            onChange={handleExpenseRatioChange}
                            min={0}
                            max={5}
                            step={0.1}
                            symbol="%"
                            isDecimal={true}
                            rightElement={
                                <span className={`text-xs font-black px-3 py-1 rounded-lg shadow-sm border ${expenseRatio > 2.5 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                    {expenseRatio}%
                                </span>
                            }
                        />
                    </div>



                </div>
            }

            summary={
                <div className="space-y-4">


                    {/* Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1">Without Expense</h4>
                            <div className="text-lg font-black text-emerald-700">
                                {moneyFormat(results.finalGross, currency, "word")}
                            </div>
                            <p className="text-[10px] text-emerald-600/70">{growthRate}% growth</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-orange-800 uppercase mb-1">With Expense</h4>
                            <div className="text-lg font-black text-orange-700">
                                {moneyFormat(results.finalNet, currency, "word")}
                            </div>
                            <p className="text-[10px] text-orange-600/70">{(growthRate - expenseRatio).toFixed(1)}% effective</p>
                        </div>
                    </div>

                    {/* Opportunity Cost - Highlighted */}
                    <div className="bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center py-8">
                        <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-1">Opportunity Cost</h3>
                        <div className="text-4xl font-black text-rose-600 my-2">
                            {moneyFormat(results.impact, currency, "word")}
                        </div>
                        <p className="text-xs text-rose-700/70 font-medium">
                            Potential wealth lost due to {expenseRatio}% fees.
                        </p>
                    </div>

                    <UnifiedSummary
                        invested={results.totalInvested}
                        total={results.finalNet}
                        gain={results.finalNet - results.totalInvested}
                        currency={currency}
                        years={isDurationInMonths ? duration / 12 : duration}
                        color="slate"
                    />
                </div>
            }

            charts={
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Growth Over Time</h3>
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
            }

            table={
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Growth Schedule</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Time (Years)</th>
                                    <th className="px-6 py-3 font-bold">Invested</th>
                                    <th className="px-6 py-3 font-bold text-emerald-600">Without Expense</th>
                                    <th className="px-6 py-3 font-bold text-orange-600">With Expense</th>
                                    <th className="px-6 py-3 font-bold text-red-600">Opportunity Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.yearlyData.map((row) => (
                                    <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{row.year}</td>
                                        <td className="px-6 py-4 text-slate-600">{moneyFormat(row.invested, currency)}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">{moneyFormat(row.gross, currency)}</td>
                                        <td className="px-6 py-4 font-bold text-orange-600">{moneyFormat(row.net, currency)}</td>
                                        <td className="px-6 py-4 font-black text-red-600 bg-red-50/50">
                                            {moneyFormat(row.impact, currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            }

            details={
                <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-xl relative overflow-hidden mt-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full -ml-24 -mb-24 opacity-20"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            About Expense Ratio
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                                <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-indigo-100 italic">01</div>
                                <h4 className="font-black text-slate-900 mb-3 text-lg">Daily Deduction</h4>
                                <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                    Expense Ratio is charged on your <strong>total fund value daily</strong>, not just on your contributions. It reduces your effective NAV (Net Asset Value) every single day, silently eating into your returns.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                                <div className="bg-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-emerald-100 italic">02</div>
                                <h4 className="font-black text-slate-900 mb-3 text-lg">Direct vs Regular</h4>
                                <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                    <strong>Direct Plans</strong> have lower expense ratios as they don't pay distributor commissions. <strong>Regular Plans</strong> charge higher fees (often 1-1.5% more), which goes to the agent/broker.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                                <div className="bg-amber-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-amber-100 italic">03</div>
                                <h4 className="font-black text-slate-900 mb-3 text-lg">Impact of Compounding</h4>
                                <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                    A small 1% fee difference might seem trivial, but over 10-20 years, it can reduce your total wealth by <strong>20-30%</strong> due to the reverse compounding effect of fees.
                                </p>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-blue-100 italic">04</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Active vs Passive</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                <strong>Index Funds (Passive)</strong> typically have very low charges (0.1% - 0.5%). <strong>Active Funds</strong> charge higher (1.5% - 2.5%) to cover fund management expertise and research.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-purple-100 italic">05</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Checking Your Ratio</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                You can find the <strong>Total Expense Ratio (TER)</strong> in your mutual fund's monthly fact sheet or on the AMC website. It is updated periodically based on AUM size.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-teal-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-teal-100 italic">06</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Smart Move</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-medium text-justify">
                                Switching from a <strong>Regular Plan to a Direct Plan</strong> is often the easiest, risk-free way to boost your long-term portfolio returns by 1-1.5% annually.
                            </p>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
