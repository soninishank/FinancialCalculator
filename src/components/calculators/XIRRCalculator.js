
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Calendar, List, TrendingUp, TrendingDown } from 'lucide-react';
import CalculatorLayout from '../common/CalculatorLayout';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import { calculateXIRR, generateSimpleFlows } from '../../utils/xirr';
import { downloadPDF } from '../../utils/export';
import { calculatorDetails } from '../../data/calculatorDetails';
import InputWithSlider from '../common/InputWithSlider';
import FormattedInput from '../common/FormattedInput';
import MetricCard from '../common/MetricCard';
import BenchmarkComparison from '../common/BenchmarkComparison';
import DateInput from '../common/DateInput';
import { getCurrencySymbol } from '../../utils/formatting';

const DEFAULT_FLOWS = [
    { date: new Date().getFullYear() + '-01-01', amount: 10000, type: 'investment' },
    { date: new Date().getFullYear() + '-06-01', amount: 5000, type: 'investment' },
    { date: (new Date().getFullYear() + 1) + '-01-01', amount: 18000, type: 'return' },
];


const getPerformanceBadge = (xirr) => {
    const percent = xirr * 100;
    if (percent >= 15) return { label: 'Excellent', color: 'emerald', emoji: '🎉' };
    if (percent >= 10) return { label: 'Good', color: 'green', emoji: '👍' };
    if (percent >= 7) return { label: 'Average', color: 'amber', emoji: '📊' };
    return { label: 'Below Average', color: 'red', emoji: '⚠️' };
};

export default function XIRRCalculator({ currency = '₹' }) {
    const [mode, setMode] = useState('simple');


    // --- Advanced Mode State ---
    const [cashFlows, setCashFlows] = useState(DEFAULT_FLOWS);

    // --- Simple Mode State ---
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().slice(0, 10));
    const [maturityDate, setMaturityDate] = useState(new Date().toISOString().slice(0, 10));
    const [recurringAmount, setRecurringAmount] = useState(10000);
    const [maturityAmount, setMaturityAmount] = useState(290000);

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setResult(null);
        setError('');
    }, [mode, cashFlows, frequency, startDate, maturityDate, recurringAmount, maturityAmount]);


    // --- Advanced Actions ---
    const handleAddRow = () => {
        const lastDate = cashFlows[cashFlows.length - 1]?.date || new Date().toISOString().slice(0, 10);
        setCashFlows([...cashFlows, { date: lastDate, amount: 0, type: 'investment' }]);
    };

    const handleRemoveRow = (index) => {
        if (cashFlows.length <= 2) {
            setError('Minimum 2 transactions required');
            return;
        }
        const newFlows = cashFlows.filter((_, i) => i !== index);
        setCashFlows(newFlows);
    };

    const handleChange = (index, field, value) => {
        const newFlows = [...cashFlows];
        newFlows[index][field] = value;
        setCashFlows(newFlows);
    };

    const toggleType = (index) => {
        const newFlows = [...cashFlows];
        newFlows[index].type = newFlows[index].type === 'investment' ? 'return' : 'investment';
        setCashFlows(newFlows);
    };

    // --- Calculation Logic ---
    // Auto-calculate on input change with robust error handling
    useEffect(() => {
        calculate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, cashFlows, frequency, startDate, maturityDate, recurringAmount, maturityAmount]);

    const calculate = () => {
        try {
            let flowsToCalculate = [];

            if (mode === 'simple') {
                const { flows, error: genError } = generateSimpleFlows(startDate, maturityDate, frequency, recurringAmount, maturityAmount);
                if (genError) {
                    setError(genError);
                    setResult(null);
                    return;
                }

                // Pre-validation for Simple Mode: Check for unrealistic losses
                const totalInvested = flows.reduce((acc, curr) => curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0);
                if (maturityAmount < totalInvested * 0.1 && maturityAmount > 0) {
                    setError("Maturity amount is too low compared to investment ( >90% loss). XIRR calculation may diverge.");
                    setResult(null);
                    return;
                }

                flowsToCalculate = flows;
            } else {
                // Map advanced flows: Apply sign based on type
                flowsToCalculate = cashFlows.map(f => ({
                    date: new Date(f.date),
                    amount: f.type === 'investment' ? -Math.abs(Number(f.amount)) : Math.abs(Number(f.amount))
                }));
            }

            // Validation
            if (flowsToCalculate.some(f => isNaN(f.date.getTime()) || isNaN(f.amount))) {
                setError('Please enter valid dates and amounts.');
                setResult(null);
                return;
            }

            // Ensure mixed positive/negative flows
            const hasInvest = flowsToCalculate.some(f => f.amount < 0);
            const hasReturn = flowsToCalculate.some(f => f.amount > 0);

            if (!hasInvest || !hasReturn) {
                // Not an error, just incomplete inputs
                setResult(null);
                setError(null);
                return;
            }

            const xirr = calculateXIRR(flowsToCalculate);

            if (typeof xirr === 'string' || xirr === null || isNaN(xirr) || !isFinite(xirr)) {
                // Handle various error returns from utils
                if (typeof xirr === 'string' && xirr.includes("Diverged")) {
                    setError("Calculation diverged. Please check if your inputs are realistic.");
                } else {
                    setError("Unable to calculate XIRR. Ensure inputs are valid.");
                }
                setResult(null);
            } else {
                setResult(xirr);
                setError('');
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during calculation.");
            setResult(null);
        }
    };

    // Stats & Chart Data
    const { stats, yearlyData, monthlyData } = useMemo(() => {
        let activeFlows = [];
        if (mode === 'simple') {
            const { flows } = generateSimpleFlows(startDate, maturityDate, frequency, recurringAmount, maturityAmount);
            activeFlows = flows || [];
        } else {
            activeFlows = cashFlows.map(f => ({
                ...f,
                date: new Date(f.date), // Ensure it's a Date object
                amount: f.type === 'investment' ? -Math.abs(Number(f.amount)) : Math.abs(Number(f.amount))
            }));
        }

        const totalInvested = activeFlows.reduce((acc, curr) => curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0);
        const totalReturned = activeFlows.reduce((acc, curr) => curr.amount > 0 ? acc + curr.amount : acc, 0);
        const profit = totalReturned - totalInvested;



        // --- Prepare Table Data (Yearly/Monthly Breakdown) ---
        // 1. Sort Flows
        const sortedFlows = [...activeFlows].sort((a, b) => a.date - b.date);

        // 2. Group flows by year and month
        const yearsMap = {};

        sortedFlows.forEach(flow => {
            const date = flow.date;
            if (isNaN(date.getTime())) return;

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthName = date.toLocaleString('default', { month: 'short' });

            if (!yearsMap[year]) {
                yearsMap[year] = {
                    year,
                    totalInvested: 0,
                    growth: 0, // interpreting withdrawals as 'growth/returns' column
                    balance: 0,
                    months: {}
                };
            }

            const isInvestment = flow.amount < 0;
            const absAmount = Math.abs(flow.amount);

            if (isInvestment) {
                yearsMap[year].totalInvested += absAmount;
                yearsMap[year].balance -= absAmount; // Net Flow: Decrease by investment
            } else {
                yearsMap[year].growth += absAmount;
                yearsMap[year].balance += absAmount; // Net Flow: Increase by return
            }

            // Monthly Aggregation
            if (!yearsMap[year].months[month]) {
                yearsMap[year].months[month] = {
                    month,
                    monthName,
                    invested: 0,
                    growth: 0,
                    balance: 0
                };
            }
            if (isInvestment) {
                yearsMap[year].months[month].invested += absAmount;
                yearsMap[year].months[month].balance -= absAmount;
            } else {
                yearsMap[year].months[month].growth += absAmount;
                yearsMap[year].months[month].balance += absAmount;
            }
        });

        // Flatten to arrays for Table and Chart
        const yData = Object.values(yearsMap).sort((a, b) => a.year - b.year);
        const mData = [];

        yData.forEach(y => {
            const sortedMonths = Object.values(y.months).sort((a, b) => a.month - b.month);
            sortedMonths.forEach(m => {
                // Add year property to monthly data for linking
                mData.push({ ...m, year: y.year });
            });
        });

        return {
            stats: { totalInvested, totalReturned, profit },
            yearlyData: yData,
            monthlyData: mData
        };
    }, [mode, cashFlows, frequency, startDate, maturityDate, recurringAmount, maturityAmount]);

    const inputsSection = (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => setMode('simple')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'simple' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Simple Mode
                </button>
                <button
                    onClick={() => setMode('advanced')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'advanced' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <List className="w-4 h-4" />
                    Advanced Cash Flows
                </button>
            </div>

            {mode === 'simple' ? (
                <div className="space-y-4 animate-fade-in">
                    {/* Instructions Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 leading-relaxed">
                            💡 <strong>Simple Mode:</strong> Perfect for regular investments like SIPs. Enter your investment frequency, dates, and amounts to calculate your annualized return.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Investment Frequency</label>
                        <p className="text-xs text-gray-500 mb-2">How often do you invest?</p>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-bold text-slate-900"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Start Date</label>
                        <p className="text-xs text-gray-500 mb-2">When did you start investing?</p>
                        <DateInput
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Maturity Date</label>
                        <p className="text-xs text-gray-500 mb-2">Current date or redemption date</p>
                        <DateInput
                            value={maturityDate}
                            onChange={(e) => setMaturityDate(e.target.value)}
                        />
                    </div>
                    <InputWithSlider
                        label="Recurring Investment Amount"
                        value={recurringAmount}
                        onChange={setRecurringAmount}
                        min={500}
                        max={1000000}
                        step={500}
                        currency={currency}
                    />

                    <InputWithSlider
                        label="Total Maturity Amount"
                        value={maturityAmount}
                        onChange={setMaturityAmount}
                        min={1000}
                        max={50000000}
                        step={1000}
                        currency={currency}
                    />
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {/* Instructions Banner */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700 leading-relaxed">
                            💡 <strong>Advanced Mode:</strong> Add all your deposits (investments) and withdrawals (returns) with exact dates. Click the type button to toggle between Deposit and Return.
                        </p>
                    </div>

                    <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                        <div className="w-32 sm:w-40">Date</div>
                        <div className="w-24 sm:w-32">Type</div>
                        <div className="flex-1">Amount</div>
                        <div className="w-8"></div>
                    </div>

                    {cashFlows.map((flow, index) => (
                        <div key={index} className="flex gap-2 items-center animate-slide-in-right" style={{ animationDelay: `${index * 30}ms` }}>
                            <div className="w-32 sm:w-40">
                                <DateInput
                                    value={flow.date}
                                    onChange={(e) => handleChange(index, 'date', e.target.value)}
                                    className="px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="w-24 sm:w-32">
                                <button
                                    onClick={() => toggleType(index)}
                                    className={`w-full px-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${flow.type === 'investment'
                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                        }`}
                                >
                                    {flow.type === 'investment' ? 'Deposit' : 'Return'}
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg z-10">
                                        <span className="text-gray-500 sm:text-sm font-bold">{getCurrencySymbol(currency)}</span>
                                    </div>
                                    <FormattedInput
                                        value={flow.amount}
                                        onChange={(val) => handleChange(index, 'amount', val)}
                                        currency={currency}
                                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-gray-900"
                                        placeholder="Amount"
                                    />
                                </div>
                            </div>
                            <div className="w-8 flex justify-center">
                                <button onClick={() => handleRemoveRow(index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-dashed border-teal-200 mt-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </button>
                </div>
            )}

            <div className="pt-4 border-t border-gray-100">
                {error && (
                    <div className="mt-3 text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Total Invested</p>
                    <p className="text-lg font-bold text-gray-800">{currency} {stats.totalInvested.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-lg font-bold text-gray-800">{currency} {stats.totalReturned.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );

    const summarySection = (
        <div className="space-y-6">
            {result !== null ? (
                <>
                    {/* Performance Badge */}
                    {(() => {
                        const badge = getPerformanceBadge(result);
                        return (
                            <div className={`bg-${badge.color}-50 border-2 border-${badge.color}-200 rounded-xl p-4 text-center`}>
                                <div className="text-3xl mb-2">{badge.emoji}</div>
                                <div className={`text-sm font-bold text-${badge.color}-800 uppercase tracking-wider`}>{badge.label} Performance</div>
                            </div>
                        );
                    })()}

                    <MetricCard
                        label="XIRR (Annualized Return)"
                        value={`${(result * 100).toFixed(2)}%`}
                        subtext="Compounded Annual Rate"
                        color="teal"
                        icon={<TrendingUp className="w-6 h-6" />}
                    />
                    <MetricCard
                        label="Absolute Profit"
                        value={stats.profit}
                        currency={currency}
                        isCurrency={true}
                        color={stats.profit >= 0 ? 'green' : 'red'}
                        icon={stats.profit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    />

                    {/* Analysis Block */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                            💡 What This Means
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Your strategy acts like a bank account giving you <strong className="text-teal-700 bg-teal-50 px-1 rounded">{(result * 100).toFixed(2)}% interest per year</strong>.
                            You invested a total of <strong>{currency}{stats.totalInvested.toLocaleString()}</strong> and your current value is <strong>{currency}{stats.totalReturned.toLocaleString()}</strong>.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                            <p className="font-semibold mb-1">💰 Future Value Example:</p>
                            <p>If you invest {currency}10,000 today at this rate, it would grow to <strong className="text-teal-700">{currency}{(10000 * Math.pow(1 + result, 10)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> in 10 years.</p>
                        </div>
                    </div>

                    {/* Benchmark Comparison */}
                    <BenchmarkComparison userReturn={result} userLabel="Your XIRR" />

                    {/* Waterfall / Bar Chart */}
                    <FinancialCompoundingBarChart
                        data={yearlyData}
                        currency={currency}
                    />

                    {/* Breakdown Table with PDF Export */}
                    <div className="mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Transaction Breakdown</h3>
                            <button
                                onClick={() => {
                                    // Use standardized yearlyData/monthlyData for PDF if possible, or raw flows
                                    // Let's stick to raw flows logic for PDF as it's more detailed
                                    let activeFlows = [];
                                    if (mode === 'simple') {
                                        const { flows } = generateSimpleFlows(startDate, maturityDate, frequency, recurringAmount, maturityAmount);
                                        activeFlows = flows || [];
                                    } else {
                                        activeFlows = cashFlows.map(f => ({
                                            ...f,
                                            date: new Date(f.date),
                                            amount: f.type === 'investment' ? -Math.abs(Number(f.amount)) : Math.abs(Number(f.amount))
                                        }));
                                    }
                                    const sortedFlows = [...activeFlows].sort((a, b) => a.date - b.date);

                                    const rows = sortedFlows.map(f => [
                                        !isNaN(f.date.getTime()) ? f.date.toLocaleDateString('en-US') : 'Invalid',
                                        f.amount < 0 ? 'Investment' : 'Return',
                                        Math.abs(f.amount)
                                    ]);
                                    downloadPDF(rows, ['Date', 'Type', 'Amount'], 'xirr_schedule.pdf');
                                }}
                                className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Export PDF
                            </button>
                        </div>

                        <CollapsibleInvestmentTable
                            yearlyData={yearlyData}
                            monthlyData={monthlyData}
                            currency={currency}
                            labels={{
                                year: "Year",
                                invested: "Deposits",
                                interest: "Withdrawals", // Re-purposing column
                                balance: "Net Flow" // Since we don't track running balance easily in XIRR
                            }}
                        />
                        <p className="text-[10px] text-gray-400 mt-2 italic">* "Net Flow" column indicates net cash movement, not portfolio balance.</p>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">Result will appear here</p>
                    <p className="text-sm">Enter the details to see the breakdown.</p>
                </div>
            )}
        </div>
    );


    return (
        <CalculatorLayout
            inputs={inputsSection}
            summary={summarySection}
            details={calculatorDetails.xirr_calculator.render()}
        />
    );
}
