import React, { useState, useEffect } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import FormattedInput from '../../common/FormattedInput';
import { moneyFormat } from '../../../utils/formatting';
import { calculateEMI, computeLoanAmortization } from '../../../utils/finance';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { downloadPDF } from '../../../utils/export';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    MIN_LOAN, MAX_LOAN, STEP_LARGE,
    MIN_RATE, MAX_RATE
} from '../../../utils/constants';

// Predefined colors for up to 3 comparisons
const COLORS = [
    { main: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-900', stroke: '#10B981' }, // Emerald
    { main: '#F43F5E', bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-900', stroke: '#F43F5E' },   // Rose
    { main: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', stroke: '#3B82F6' }    // Blue
];

const DEFAULT_PROFILE = {
    id: 1,
    name: '',
    principal: 1000000,
    rate: 10,
    tenure: 20, // years
    tenureType: 'years',
    startDate: new Date().toISOString().slice(0, 7) // YYYY-MM
};

export default function EMIComparison({ currency }) {
    // Start with 2 profiles
    const [profiles, setProfiles] = useState([
        { ...DEFAULT_PROFILE, id: 1, rate: 10 },
        { ...DEFAULT_PROFILE, id: 2, rate: 8.5 }
    ]);

    // Derived metrics map
    const [results, setResults] = useState([]);

    // --- LOGIC ---
    useEffect(() => {
        const calculateProfile = (p) => {
            const tenureYears = p.tenureType === 'years' ? p.tenure : p.tenure / 12;
            const months = Math.round(tenureYears * 12);
            const r_m = p.rate / 12 / 100;

            const emi = calculateEMI(p.principal, r_m, months);
            const totalPayment = emi * months;
            const totalInterest = totalPayment - p.principal;

            // Date calculations
            const [startYear, startMonth] = p.startDate.split('-').map(Number);
            const endDate = new Date(startYear, startMonth - 1 + months);
            const endDateStr = endDate.toLocaleString('default', { month: 'long', year: 'numeric' });

            // Use improved calculation utility for accurate amortization schedule
            const { rows: yearlyRows, monthlyRows } = computeLoanAmortization({
                principal: p.principal,
                annualRate: p.rate,
                years: tenureYears,
                emi: emi,
                startDate: p.startDate
            });

            // Schedule calculation for chart (Reconstruct from monthlyRows)
            // Chart expects strictly { month: 0, balance: P } ... { month: N, balance: 0 }
            // monthlyRows starts from month 1.
            const schedule = [{ month: 0, balance: p.principal }];
            monthlyRows.forEach((row, i) => {
                schedule.push({ month: i + 1, balance: row.closingBalance });
            });

            return {
                ...p,
                emi,
                totalPayment,
                totalInterest,
                endDateStr,
                months,
                schedule,
                yearlyRows,
                monthlyRows
            };
        };

        setResults(profiles.map(calculateProfile));
    }, [profiles]);

    // Combine schedules for the chart
    const chartData = [];
    if (results.length > 0) {
        // Find max months
        const maxMonths = Math.max(...results.map(r => r.months));
        // We only have yearly points in schedule
        for (let m = 0; m <= maxMonths; m += 12) {
            const point = { name: `Year ${m / 12}` };
            results.forEach((res, idx) => {
                // Find closest balance point
                const snap = res.schedule.find(s => s.month === m);
                if (snap) {
                    point[`Loan ${idx + 1}`] = Math.round(snap.balance);
                } else if (m > res.months) {
                    point[`Loan ${idx + 1}`] = 0;
                }
            });
            chartData.push(point);
        }
    }

    // Handlers
    const updateProfile = (id, field, value) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addProfile = () => {
        if (profiles.length < 3) {
            setProfiles(prev => [
                ...prev,
                { ...DEFAULT_PROFILE, id: Date.now(), rate: 9 } // simple default
            ]);
        }
    };

    const removeProfile = (id) => {
        if (profiles.length > 2) {
            setProfiles(prev => prev.filter(p => p.id !== id));
        }
    };

    // --- RENDER ---
    const inputs = (
        <div className="space-y-4">
            <div className={`grid grid-cols-1 ${profiles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {profiles.map((profile, index) => (
                    <div key={profile.id} className="relative bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className={`absolute -left-2 -top-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${COLORS[index].bg.replace('bg-', 'bg-').replace('50', '500')}`}>
                            {index + 1}
                        </div>

                        <div className="flex justify-between items-center mb-4 pl-6">
                            <FormattedInput
                                type="text"
                                placeholder={`LOAN PROFILE ${index + 1}`}
                                value={profile.name}
                                onChange={(val) => updateProfile(profile.id, 'name', val.toUpperCase())}
                                className="font-semibold text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 focus:outline-none w-full mr-2 transition-colors placeholder-gray-400 uppercase"
                            />
                            {profiles.length > 2 && (
                                <button
                                    onClick={() => removeProfile(profile.id)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <InputWithSlider
                                id={`emi-comp-loanAmount-${profile.id}`}
                                label="Loan Amount"
                                value={profile.principal}
                                onChange={(v) => updateProfile(profile.id, 'principal', v)}
                                min={MIN_LOAN} max={MAX_LOAN} step={STEP_LARGE}
                                currency={currency}
                                compact={true}
                            />

                            <InputWithSlider
                                id={`emi-comp-interestRate-${profile.id}`}
                                label="Interest Rate (%)"
                                value={profile.rate}
                                onChange={(v) => updateProfile(profile.id, 'rate', v)}
                                min={MIN_RATE} max={MAX_RATE} step={0.1} isDecimal={true}
                                symbol="%"
                                compact={true}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label
                                        htmlFor={`emi-comp-tenure-${profile.id}`}
                                        className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-2"
                                    >
                                        Tenure
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <InputWithSlider
                                            id={`emi-comp-tenure-${profile.id}`}
                                            label="Tenure (Years)"
                                            value={profile.tenure}
                                            onChange={(v) => updateProfile(profile.id, 'tenure', Number(v))}
                                            min={1}
                                            max={30}
                                            hideLabel
                                        />
                                        <div className="flex bg-gray-100 rounded-lg p-1 shrink-0 h-full">
                                            <button
                                                onClick={() => updateProfile(profile.id, 'tenureType', 'years')}
                                                className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${profile.tenureType === 'years' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                            >Yr</button>
                                            <button
                                                onClick={() => updateProfile(profile.id, 'tenureType', 'months')}
                                                className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${profile.tenureType === 'months' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                            >Mo</button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-2"
                                    >
                                        Start Date
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            aria-label="Start Month"
                                            value={profile.startDate.split('-')[1]}
                                            onChange={(e) => {
                                                const [y] = profile.startDate.split('-');
                                                updateProfile(profile.id, 'startDate', `${y}-${e.target.value}`);
                                            }}
                                            className="w-2/3 border-2 border-slate-200 rounded-xl p-3 text-lg font-medium text-slate-950 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all bg-white"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const m = String(i + 1).padStart(2, '0');
                                                const date = new Date(2000, i, 1);
                                                return <option key={m} value={m}>{date.toLocaleString('default', { month: 'long' })}</option>;
                                            })}
                                        </select>
                                        <FormattedInput
                                            value={profile.startDate.split('-')[0]}
                                            onChange={(val) => {
                                                const [, mStr] = profile.startDate.split('-');
                                                updateProfile(profile.id, 'startDate', `${val}-${mStr}`);
                                            }}
                                            className="w-1/3 border-2 border-slate-200 rounded-xl p-3 text-lg font-medium text-slate-950 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all bg-white text-center"
                                            placeholder="Year"
                                            min={new Date().getFullYear() - 50}
                                            max={new Date().getFullYear() + 50}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {profiles.length < 3 && (
                <button
                    onClick={addProfile}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="text-xl">+</span> Add Another Loan to Compare
                </button>
            )}
        </div>
    );

    const summaryCards = (
        <div className={`grid grid-cols-1 ${results.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            {results.map((res, index) => {
                // Find extremes
                const interests = results.map(r => r.totalInterest);
                const minInterest = Math.min(...interests);
                const maxInterest = Math.max(...interests);

                const isCheapest = res.totalInterest === minInterest;
                const isMostExpensive = res.totalInterest === maxInterest && results.length > 1; // Only show if we have comparison
                const savings = maxInterest - res.totalInterest;

                return (
                    <div
                        key={res.id}
                        className={`${COLORS[index].bg} border-l-4 ${COLORS[index].border} rounded-xl p-5 shadow-sm relative overflow-hidden transition-all`}
                    >
                        {isCheapest && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                                CHEAPEST OPTION
                            </div>
                        )}

                        {isMostExpensive && !isCheapest && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                                MOST EXPENSIVE
                            </div>
                        )}

                        <h3 className={`${COLORS[index].text} font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 truncate`}>
                            {res.name || `Loan ${index + 1}`}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Monthly EMI</p>
                                <p className={`text-2xl font-bold ${COLORS[index].text}`}>
                                    {moneyFormat(Math.round(res.emi), currency)}
                                </p>
                                {isCheapest && results.length > 1 && (
                                    <p className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-100/50 p-1 rounded inline-block">
                                        Save {moneyFormat(Math.round(savings), currency)} vs Expensive
                                    </p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-black/5">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">Total Interest</span>
                                    <span className={`text-sm font-semibold ${COLORS[index].text}`}>
                                        {moneyFormat(Math.round(res.totalInterest), currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">Total Payment</span>
                                    <span className={`text-sm font-semibold ${COLORS[index].text}`}>
                                        {moneyFormat(Math.round(res.totalPayment), currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t border-black/5">
                                    <span className="text-xs text-gray-500">Last EMI</span>
                                    <span className="text-xs font-medium text-gray-700">{res.endDateStr}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const charts = (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Repayment Timeline (Outstanding Balance)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => (value / 100000).toFixed(1) + 'L'}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => moneyFormat(value, currency)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        {results.map((r, i) => (
                            <Line
                                key={r.id}
                                type="monotone"
                                dataKey={`Loan ${i + 1}`}
                                stroke={COLORS[i].stroke}
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                                name={r.name || `Loan ${i + 1} Balance`}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const [activeTab, setActiveTab] = useState(0);

    const amortizationTable = (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Amortization Schedule</h3>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {results.map((res, index) => (
                    <button
                        key={res.id}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${activeTab === index
                            ? `${COLORS[index].bg.replace('50', '500')} text-white shadow-md`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {res.name || `Loan ${index + 1}`}
                    </button>
                ))}
            </div>

            {/* Table Content - Uses Reusable Component */}
            <div className="mt-4">
                <div className="flex justify-end mb-2">
                    <button
                        onClick={() => {
                            const data = results[activeTab].yearlyRows.map(r => [
                                `Year ${r.year}`,
                                Math.round(r.principalPaid),
                                Math.round(r.interestPaid),
                                Math.round(r.closingBalance)
                            ]);
                            const headers = ['Year', 'Principal Paid', 'Interest Paid', 'Balance'];
                            downloadPDF(data, headers, `amortization_schedule_${results[activeTab].name || 'loan'}.pdf`);
                        }}
                        className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-lg transition-colors"
                    >
                        Export PDF
                    </button>
                </div>
                {results[activeTab] && (
                    <CollapsibleAmortizationTable
                        yearlyData={results[activeTab].yearlyRows}
                        monthlyData={results[activeTab].monthlyRows}
                        currency={currency}
                    />
                )}
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summaryCards}
            charts={charts}
            pieChart={null}
            table={amortizationTable}
            details={calculatorDetails['emi-comparison'].render()}
        />
    );
}
