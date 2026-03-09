'use client';

import React from 'react';
import Link from 'next/link';

const CHECKLIST_KEY = 'fincalc_checklist_v1';

const TIERS = [
    {
        id: 'foundation',
        name: 'Foundation',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-900',
        items: [
            { id: 'budget', title: 'Monthly budget set', desc: 'Know exactly where your money goes each month.', link: '/hub', linkLabel: 'Open Budget' },
            { id: 'emergency_1mo', title: '1-month emergency fund', desc: 'At least 1 month of expenses saved in liquid cash.', link: '/calculators/savings-goal', linkLabel: 'Plan savings' },
            { id: 'checking', title: 'No-fee checking account', desc: 'Using a checking account without monthly maintenance fees.' },
            { id: 'autopay', title: 'Bills on autopay', desc: 'All recurring bills set to autopay to avoid late fees.' },
        ],
    },
    {
        id: 'protection',
        name: 'Protection',
        color: 'text-sky-700 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        border: 'border-sky-200 dark:border-sky-900',
        items: [
            { id: 'emergency_3mo', title: '3-month emergency fund', desc: 'Cover 3 months of expenses for job loss or emergencies.', link: '/calculators/savings-goal', linkLabel: 'Plan savings' },
            { id: 'health_insurance', title: 'Health insurance', desc: 'Active health insurance coverage for you and dependents.' },
            { id: 'life_insurance', title: 'Life insurance (if dependents)', desc: 'Term life insurance if others depend on your income.' },
            { id: 'will', title: 'Will or estate plan', desc: 'A basic will and beneficiary designations on all accounts.' },
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        color: 'text-violet-700 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        border: 'border-violet-200 dark:border-violet-900',
        items: [
            { id: 'retirement', title: 'Retirement contributions', desc: 'Contributing to 401(k), IRA, or equivalent regularly.', link: '/calculators/retirement-savings', linkLabel: 'Plan retirement' },
            { id: 'employer_match', title: 'Full employer match', desc: 'Contributing enough to get the full employer 401(k) match.' },
            { id: 'high_interest_debt', title: 'No high-interest debt', desc: 'Credit card and high-interest debt fully paid off.', link: '/calculators/debt-payoff', linkLabel: 'Plan payoff' },
            { id: 'emergency_6mo', title: '6-month emergency fund', desc: 'Full 6-month runway for maximum financial security.' },
        ],
    },
    {
        id: 'optimization',
        name: 'Optimization',
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-900',
        items: [
            { id: 'tax_strategy', title: 'Tax-advantaged strategy', desc: 'Maximizing HSA, Roth IRA, or tax-loss harvesting.', link: '/calculators/federal-income-tax-estimator', linkLabel: 'Estimate taxes' },
            { id: 'diversified', title: 'Diversified investments', desc: 'Investments spread across asset classes beyond retirement.' },
            { id: 'net_worth_tracking', title: 'Tracking net worth', desc: 'Actively tracking net worth monthly or quarterly.', link: '/track', linkLabel: 'Open Track' },
        ],
    },
];

const ALL_ITEMS = TIERS.flatMap(tier => tier.items);
const TOTAL_ITEMS = ALL_ITEMS.length;

const BADGES = [
    { threshold: 0.25, emoji: '🌱', label: 'Getting Started' },
    { threshold: 0.50, emoji: '🔥', label: 'Building Momentum' },
    { threshold: 0.75, emoji: '⭐', label: 'Well Protected' },
    { threshold: 1.00, emoji: '🏆', label: 'Financially Fit' },
];

function loadChecked() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CHECKLIST_KEY) : null;
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveChecked(ids) {
    try { window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(ids)); } catch { /* noop */ }
}

export default function FinancialChecklist() {
    const [mounted, setMounted] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [collapsedTiers, setCollapsedTiers] = React.useState({});

    React.useEffect(() => {
        setMounted(true);
        setChecked(loadChecked());
    }, []);

    const toggle = (id) => {
        const next = checked.includes(id) ? checked.filter(c => c !== id) : [...checked, id];
        setChecked(next);
        saveChecked(next);
    };

    const toggleTier = (tierId) => {
        setCollapsedTiers(prev => ({ ...prev, [tierId]: !prev[tierId] }));
    };

    if (!mounted) return null;

    const completedCount = checked.length;
    const pct = Math.round((completedCount / TOTAL_ITEMS) * 100);
    const earnedBadges = BADGES.filter(b => (completedCount / TOTAL_ITEMS) >= b.threshold);
    const nextBadge = BADGES.find(b => (completedCount / TOTAL_ITEMS) < b.threshold);

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Financial Checklist</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                        {completedCount} of {TOTAL_ITEMS} complete
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {earnedBadges.map(b => (
                        <span key={b.label} className="text-2xl" title={b.label}>{b.emoji}</span>
                    ))}
                    {nextBadge && (
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">
                            Next: {nextBadge.emoji} at {Math.round(nextBadge.threshold * 100)}%
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{pct}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Tiers */}
            <div className="mt-6 space-y-4">
                {TIERS.map(tier => {
                    const tierChecked = tier.items.filter(item => checked.includes(item.id)).length;
                    const isCollapsed = collapsedTiers[tier.id];
                    const allDone = tierChecked === tier.items.length;

                    return (
                        <div key={tier.id} className={`rounded-2xl border ${tier.border} ${tier.bg} overflow-hidden`}>
                            <button
                                type="button"
                                onClick={() => toggleTier(tier.id)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-black ${tier.color}`}>{tier.name}</span>
                                    {allDone && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black">✓ Complete</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{tierChecked}/{tier.items.length}</span>
                                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {!isCollapsed && (
                                <div className="px-5 pb-4 space-y-2">
                                    {tier.items.map(item => {
                                        const isDone = checked.includes(item.id);
                                        return (
                                            <div key={item.id} className={`rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-3.5 flex items-start gap-3 transition-colors ${isDone ? 'bg-white/60 dark:bg-slate-900/40' : 'bg-white/90 dark:bg-slate-900/70'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggle(item.id)}
                                                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isDone
                                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-sky-400'
                                                        }`}
                                                >
                                                    {isDone && (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-bold ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                                        {item.title}
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                    {item.link && !isDone && (
                                                        <Link href={item.link} className="mt-1.5 inline-block text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline">
                                                            {item.linkLabel || 'Open tool'} →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
