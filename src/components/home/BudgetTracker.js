'use client';

import React from 'react';

const BUDGET_KEY = 'fincalc_budget_v1';

const DEFAULT_CATEGORIES = [
    { id: 'housing', label: 'Housing / Rent', budget: 1500, emoji: '🏠' },
    { id: 'food', label: 'Food & Groceries', budget: 600, emoji: '🛒' },
    { id: 'transport', label: 'Transport', budget: 300, emoji: '🚗' },
    { id: 'utilities', label: 'Utilities', budget: 200, emoji: '💡' },
    { id: 'healthcare', label: 'Healthcare', budget: 150, emoji: '🏥' },
    { id: 'entertainment', label: 'Entertainment', budget: 200, emoji: '🎬' },
    { id: 'savings', label: 'Savings / Investments', budget: 800, emoji: '💰' },
    { id: 'other', label: 'Other', budget: 250, emoji: '📦' },
];

function loadBudget() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(BUDGET_KEY) : null;
        if (!raw) return DEFAULT_CATEGORIES;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

function saveBudget(categories) {
    try {
        window.localStorage.setItem(BUDGET_KEY, JSON.stringify(categories));
    } catch { /* ignore */ }
}

function statusColor(pct) {
    if (pct >= 100) return { bar: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/20' };
    if (pct >= 80) return { bar: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/20' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/20' };
}

export default function BudgetTracker() {
    const [categories, setCategories] = React.useState(DEFAULT_CATEGORIES);
    const [mounted, setMounted] = React.useState(false);
    const [editId, setEditId] = React.useState(null);

    React.useEffect(() => {
        setMounted(true);
        setCategories(loadBudget());
    }, []);

    const totalBudget = categories.reduce((s, c) => s + (Number(c.budget) || 0), 0);
    const totalActual = categories.reduce((s, c) => s + (Number(c.actual) || 0), 0);
    const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0;
    const totalColors = statusColor(totalPct);

    const updateField = (id, field, rawValue) => {
        const value = field === 'label' ? rawValue : Math.max(0, Number(rawValue) || 0);
        const next = categories.map((c) => c.id === id ? { ...c, [field]: value } : c);
        setCategories(next);
        saveBudget(next);
    };

    if (!mounted) return null;

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-700 dark:text-violet-300">Budget Tracker</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Budget vs Actual</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Set a monthly budget per category and track your spending.</p>
                </div>

                {/* Summary pill */}
                <div className={`self-start sm:self-auto rounded-2xl border px-4 py-3 text-center min-w-[120px] border-slate-200 dark:border-slate-800 ${totalColors.bg}`}>
                    <div className={`text-2xl font-black ${totalColors.text}`}>{totalPct}%</div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">of budget used</div>
                </div>
            </div>

            {/* Totals bar */}
            <div className="mt-5 flex items-center gap-4">
                <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${totalColors.bar}`}
                        style={{ width: `${totalPct}%` }}
                    />
                </div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    ${totalActual.toLocaleString()} <span className="text-slate-400 font-medium">/ ${totalBudget.toLocaleString()}</span>
                </div>
            </div>

            {/* Category rows */}
            <div className="mt-6 space-y-2">
                {categories.map((cat) => {
                    const budget = Number(cat.budget) || 0;
                    const actual = Number(cat.actual) || 0;
                    const pct = budget > 0 ? Math.min(100, Math.round((actual / budget) * 100)) : 0;
                    const colors = statusColor(pct);
                    const isEditing = editId === cat.id;

                    return (
                        <div key={cat.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">{cat.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{cat.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => setEditId(isEditing ? null : cat.id)}
                                            className="text-[11px] font-bold text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                                        >
                                            {isEditing ? 'Done' : 'Edit'}
                                        </button>
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Budget ($)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cat.budget}
                                                    onChange={(e) => updateField(cat.id, 'budget', e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm"
                                                />
                                            </label>
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Actual Spent ($)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cat.actual || ''}
                                                    placeholder="0"
                                                    onChange={(e) => updateField(cat.id, 'actual', e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm"
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="mt-1.5 flex items-center justify-between text-xs">
                                                <span className={`font-bold ${colors.text}`}>{pct}%</span>
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    ${actual.toLocaleString()} <span className="text-slate-400">/ ${budget.toLocaleString()}</span>
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Data saved locally to your browser.</p>
        </div>
    );
}
