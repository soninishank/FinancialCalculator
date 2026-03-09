import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const CATEGORIES = [
    { key: 'venue', label: 'Venue & Hospitality', icon: '🏛️', defaultPct: 30 },
    { key: 'catering', label: 'Catering & Beverages', icon: '🍽️', defaultPct: 25 },
    { key: 'decor', label: 'Decor & Flowers', icon: '💐', defaultPct: 12 },
    { key: 'photography', label: 'Photo & Video', icon: '📸', defaultPct: 10 },
    { key: 'attire', label: 'Attire & Jewelry', icon: '👗', defaultPct: 10 },
    { key: 'music', label: 'Music & Entertainment', icon: '🎵', defaultPct: 5 },
    { key: 'misc', label: 'Invitations, Gifts & Misc', icon: '🎁', defaultPct: 8 },
];

const COLORS = [
    { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', bar: 'from-rose-400 to-rose-600', border: 'border-rose-200 dark:border-rose-800/40' },
    { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', bar: 'from-amber-400 to-amber-600', border: 'border-amber-200 dark:border-amber-800/40' },
    { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', bar: 'from-violet-400 to-violet-600', border: 'border-violet-200 dark:border-violet-800/40' },
    { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', bar: 'from-blue-400 to-blue-600', border: 'border-blue-200 dark:border-blue-800/40' },
    { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', bar: 'from-pink-400 to-pink-600', border: 'border-pink-200 dark:border-pink-800/40' },
    { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', bar: 'from-teal-400 to-teal-600', border: 'border-teal-200 dark:border-teal-800/40' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', bar: 'from-indigo-400 to-indigo-600', border: 'border-indigo-200 dark:border-indigo-800/40' },
];

const WeddingCostPlanner = ({ currency }) => {
    const [totalBudget, setTotalBudget] = useState(2000000);
    const [guestCount, setGuestCount] = useState(200);
    const [monthsToSave, setMonthsToSave] = useState(12);
    const [currentSavings, setCurrentSavings] = useState(500000);

    const initAllocations = {};
    CATEGORIES.forEach(c => { initAllocations[c.key] = c.defaultPct; });
    const [allocations, setAllocations] = useState(initAllocations);

    const handleAllocation = (key, val) => {
        setAllocations(prev => ({ ...prev, [key]: val }));
    };

    const totalAllocatedPct = useMemo(() =>
        Object.values(allocations).reduce((s, v) => s + v, 0),
        [allocations]
    );

    const result = useMemo(() => {
        const budget = parseFloat(totalBudget) || 0;
        const guests = Math.max(1, parseFloat(guestCount) || 0);
        const months = Math.max(1, parseFloat(monthsToSave) || 0);
        const saved = parseFloat(currentSavings) || 0;

        const breakdown = CATEGORIES.map((cat, i) => ({
            ...cat,
            pct: allocations[cat.key],
            amount: (budget * allocations[cat.key]) / 100,
            color: COLORS[i],
        }));

        const totalAllocated = breakdown.reduce((s, c) => s + c.amount, 0);
        const remaining = budget - totalAllocated;
        const perGuest = guests > 0 ? budget / guests : 0;
        const shortfall = Math.max(0, budget - saved);
        const monthlySaving = shortfall > 0 && months > 0 ? shortfall / months : 0;

        return { breakdown, totalAllocated, remaining, perGuest, shortfall, monthlySaving };
    }, [totalBudget, guestCount, monthsToSave, currentSavings, allocations]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Total Wedding Budget"
                value={totalBudget}
                onChange={setTotalBudget}
                min={100000}
                max={50000000}
                step={100000}
                currency={currency}
            />
            <InputWithSlider
                label="Expected Guest Count"
                value={guestCount}
                onChange={setGuestCount}
                min={10}
                max={2000}
                step={10}
            />
            <InputWithSlider
                label="Current Savings for Wedding"
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={50000000}
                step={50000}
                currency={currency}
            />
            <InputWithSlider
                label="Months Until Wedding"
                value={monthsToSave}
                onChange={setMonthsToSave}
                min={1}
                max={36}
                step={1}
                suffix=" months"
            />

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    Category Allocation (%)
                </h3>
                <div className="space-y-3">
                    {CATEGORIES.map(cat => (
                        <InputWithSlider
                            key={cat.key}
                            label={`${cat.icon} ${cat.label}`}
                            value={allocations[cat.key]}
                            onChange={(v) => handleAllocation(cat.key, v)}
                            min={0}
                            max={60}
                            step={1}
                            suffix="%"
                        />
                    ))}
                </div>
                <div className={`mt-3 p-3 rounded-xl text-sm font-medium text-center ${totalAllocatedPct === 100
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    : totalAllocatedPct > 100
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200'
                    }`}>
                    Total Allocated: {totalAllocatedPct}% {totalAllocatedPct === 100 ? '✅' : totalAllocatedPct > 100 ? '⚠️ Over budget!' : '⚠️ Under-allocated'}
                </div>
            </div>
        </div>
    );

    const summary = (
        <div className="space-y-4">
            {/* Budget Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Wedding Budget</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {moneyFormat(totalBudget, currency)}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Cost per guest: <strong>{moneyFormat(result.perGuest, currency)}</strong>
                </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
                {result.breakdown.map(cat => (
                    <div key={cat.key} className={`${cat.color.bg} p-4 rounded-xl border ${cat.color.border}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${cat.color.text} text-sm`}>
                                {cat.icon} {cat.label} ({cat.pct}%)
                            </span>
                            <span className={`font-bold ${cat.color.text}`}>
                                {moneyFormat(cat.amount, currency)}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${cat.color.bar} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(cat.pct, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Savings Plan */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800/30 text-center">
                <p className="text-xs font-semibold text-purple-500 uppercase mb-1">Monthly Savings Needed</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {moneyFormat(result.monthlySaving, currency)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    to bridge the {moneyFormat(result.shortfall, currency)} gap in {monthsToSave} months
                </p>
            </div>
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Wedding Budget Planning Guide</h3>
            <div className="prose prose-teal max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-4">
                    Wedding planning is one of the biggest financial events in life. A well-structured budget prevents overspending and ensures every aspect of your big day is covered.
                </p>
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30 my-4">
                    <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-2">The Golden Rules</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-teal-700 dark:text-teal-400">
                        <li>Allocate <strong>10–15%</strong> contingency buffer beyond your planned budget</li>
                        <li>Book venue and catering first — they take up 50–55% of the budget</li>
                        <li>Get all quotes in writing and negotiate for package deals</li>
                        <li>Track every expense to avoid last-minute surprises</li>
                    </ul>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                        💡 <strong>Pro Tip:</strong> The per-guest cost metric is your best negotiation tool. Use it to compare venues and caterers on equal footing.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            details={details}
            inputLabel="Wedding Details"
            resultLabel="Budget Breakdown"
        />
    );
};

export default WeddingCostPlanner;
