
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Calendar, List, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import CalculatorLayout from '../common/CalculatorLayout';
import { FinancialBarChart } from '../common/FinancialCharts';
import { calculateXIRR, generateSimpleFlows } from '../../utils/xirr';

const DEFAULT_FLOWS = [
    { date: new Date().getFullYear() + '-01-01', amount: 10000, type: 'investment' }, // Note: stored as positive, type determines sign
    { date: new Date().getFullYear() + '-06-01', amount: 5000, type: 'investment' },
    { date: (new Date().getFullYear() + 1) + '-01-01', amount: 18000, type: 'return' }, // return/redemption
];

const ResultCard = ({ label, value, subtext, color = 'teal', icon }) => (
    <div className={`p-4 bg-${color}-50 rounded-xl border border-${color}-100 flex items-start gap-4 transition-all hover:shadow-md`}>
        {icon && <div className={`p-3 bg-${color}-100 rounded-lg text-${color}-600`}>{icon}</div>}
        <div>
            <p className={`text-${color}-900 text-sm font-medium mb-1`}>{label}</p>
            <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
            {subtext && <p className={`text-${color}-600 text-xs mt-1`}>{subtext}</p>}
        </div>
    </div>
);

export default function XIRRCalculator({ currency = '₹' }) {
    const [mode, setMode] = useState('simple'); // 'simple' | 'advanced'

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
    const calculate = () => {
        let flowsToCalculate = [];

        if (mode === 'simple') {
            const { flows, error: genError } = generateSimpleFlows(startDate, maturityDate, frequency, recurringAmount, maturityAmount);
            if (genError) {
                setError(genError);
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
            return;
        }

        const xirr = calculateXIRR(flowsToCalculate);

        if (typeof xirr === 'string') {
            setError(xirr);
            setResult(null);
        } else {
            setResult(xirr);
            setError('');
        }
    };

    // Stats & Chart Data
    const { stats, chartData } = useMemo(() => {
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

        // Chart Data Preparation (Limit bars if too many)
        const sortedFlows = [...activeFlows].sort((a, b) => a.date - b.date);

        // If yearly/monthly simple mode, usually fine. If daily advanced, might be too many.
        // Let's aggregate by month for chart if too many points? For now raw flows.

        const data = {
            labels: sortedFlows.map(f => {
                // Check if date is valid before calling methods
                return !isNaN(f.date.getTime())
                    ? f.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                    : 'Invalid Date';
            }),
            datasets: [
                {
                    label: 'Investments',
                    data: sortedFlows.map(f => f.amount < 0 ? Math.abs(f.amount) : 0),
                    backgroundColor: '#ef4444', // Red for outflows
                    borderRadius: 4,
                },
                {
                    label: 'Returns',
                    data: sortedFlows.map(f => f.amount > 0 ? f.amount : 0),
                    backgroundColor: '#10b981', // Green for inflows
                    borderRadius: 4,
                }
            ]
        };

        return {
            stats: { totalInvested, totalReturned, profit },
            chartData: data
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
                // --- Simple Mode Inputs (Unchanged) ---
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    {/* ... other simple inputs same as before ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
                        <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Investment Amount</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                                <span className="text-gray-500 sm:text-sm font-medium">{currency}</span>
                            </div>
                            <input
                                type="number"
                                value={recurringAmount}
                                onChange={(e) => setRecurringAmount(e.target.value)}
                                className="block w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Maturity Amount</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                                <span className="text-gray-500 sm:text-sm font-medium">{currency}</span>
                            </div>
                            <input
                                type="number"
                                value={maturityAmount}
                                onChange={(e) => setMaturityAmount(e.target.value)}
                                className="block w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // --- Advanced Mode Inputs (UX Improved) ---
                <div className="space-y-3 animate-fade-in">
                    <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                        <div className="w-32 sm:w-40">Date</div>
                        <div className="w-24 sm:w-32">Type</div>
                        <div className="flex-1">Amount</div>
                        <div className="w-8"></div>
                    </div>

                    {cashFlows.map((flow, index) => (
                        <div key={index} className="flex gap-2 items-center animate-slide-in-right" style={{ animationDelay: `${index * 30}ms` }}>
                            <div className="w-32 sm:w-40">
                                <input
                                    type="date"
                                    value={flow.date}
                                    onChange={(e) => handleChange(index, 'date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                                <input
                                    type="number"
                                    value={flow.amount}
                                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500"
                                    placeholder="Amount"
                                />
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
                <button
                    onClick={calculate}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                    Calculate XIRR <ArrowRight className="w-4 h-4" />
                </button>
                {error && (
                    <div className="mt-3 text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
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
                    <ResultCard
                        label="XIRR (Annualized Return)"
                        value={`${(result * 100).toFixed(2)}%`}
                        subtext="Compounded Annual Rate"
                        color="teal"
                        icon={<TrendingUp className="w-6 h-6" />}
                    />
                    <ResultCard
                        label="Absolute Profit"
                        value={`${currency} ${(stats.profit).toLocaleString()}`}
                        color={stats.profit >= 0 ? 'green' : 'red'}
                        icon={stats.profit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    />

                    {/* Analysis Block */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                            💡 Insight
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your strategy acts like a bank account giving you <strong className="text-teal-700 bg-teal-50 px-1 rounded">{(result * 100).toFixed(2)}% interest per year</strong>.
                            You invested a total of <strong>{currency}{stats.totalInvested.toLocaleString()}</strong> and your current value is <strong>{currency}{stats.totalReturned.toLocaleString()}</strong>.
                        </p>
                    </div>

                    {/* Waterfall / Bar Chart */}
                    <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm mt-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider p-4 border-b border-gray-50 mb-2">Cash Flow Timeline</p>
                        <div className="h-48 w-full p-2">
                            {/* Simple Re-use of FinancialBarChart with stacked false */}
                            <FinancialBarChart
                                data={chartData}
                                currency={currency}
                                height={200}
                                options={{
                                    scales: { x: { stacked: true }, y: { stacked: true } },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                        <div className="flex justify-center gap-4 pb-4 text-xs font-medium text-gray-500">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Investment</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Return</div>
                        </div>
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
        />
    );
}
