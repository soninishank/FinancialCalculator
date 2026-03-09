'use client';

import React from 'react';

const MONEY_OS_KEY = 'fincalc_money_os_v1';

/* ── Keyword → Category mapping ── */
const CATEGORY_RULES = [
    { keywords: ['rent', 'mortgage', 'housing', 'hoa', 'property tax', 'home'], category: 'Housing', emoji: '🏠', color: 'bg-blue-500' },
    { keywords: ['grocery', 'groceries', 'whole foods', 'trader joe', 'costco', 'food', 'restaurant', 'dining', 'doordash', 'uber eats', 'grubhub', 'meal', 'coffee', 'starbucks', 'lunch', 'dinner', 'breakfast'], category: 'Food & Dining', emoji: '🍽️', color: 'bg-orange-500' },
    { keywords: ['gas', 'uber', 'lyft', 'parking', 'transit', 'metro', 'bus', 'train', 'car', 'auto', 'insurance', 'fuel', 'toll'], category: 'Transportation', emoji: '🚗', color: 'bg-cyan-500' },
    { keywords: ['netflix', 'hulu', 'spotify', 'disney', 'hbo', 'youtube', 'apple tv', 'gaming', 'movie', 'concert', 'entertainment', 'steam'], category: 'Entertainment', emoji: '🎬', color: 'bg-violet-500' },
    { keywords: ['electric', 'water', 'internet', 'phone', 'cell', 'utility', 'utilities', 'cable', 'verizon', 'at&t', 't-mobile', 'comcast'], category: 'Utilities', emoji: '💡', color: 'bg-yellow-500' },
    { keywords: ['doctor', 'pharmacy', 'hospital', 'medical', 'dental', 'health', 'gym', 'fitness', 'wellness', 'therapy', 'prescription'], category: 'Health', emoji: '🏥', color: 'bg-rose-500' },
    { keywords: ['amazon', 'target', 'walmart', 'shopping', 'clothes', 'clothing', 'shoes', 'electronics', 'buy', 'purchase', 'store'], category: 'Shopping', emoji: '🛍️', color: 'bg-pink-500' },
    { keywords: ['tuition', 'school', 'course', 'book', 'education', 'student', 'learning', 'udemy', 'coursera'], category: 'Education', emoji: '📚', color: 'bg-indigo-500' },
    { keywords: ['subscription', 'saas', 'software', 'domain', 'hosting', 'cloud'], category: 'Subscriptions', emoji: '📦', color: 'bg-teal-500' },
    { keywords: ['travel', 'hotel', 'flight', 'airbnb', 'vacation', 'trip', 'booking'], category: 'Travel', emoji: '✈️', color: 'bg-emerald-500' },
];

function categorize(description) {
    const lower = (description || '').toLowerCase();
    for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some(kw => lower.includes(kw))) return rule;
    }
    return { category: 'Other', emoji: '📋', color: 'bg-slate-500' };
}

function readTransactions() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MONEY_OS_KEY) : null;
        const data = raw ? JSON.parse(raw) : null;
        return Array.isArray(data?.transactions) ? data.transactions : [];
    } catch { return []; }
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ExpenseCategorizer() {
    const [mounted, setMounted] = React.useState(false);
    const [expandedCategory, setExpandedCategory] = React.useState(null);
    const [months, setMonths] = React.useState(1); // 1 = this month, 3 = last 3 months

    React.useEffect(() => { setMounted(true); }, []);

    const { categories, totalExpenses, monthlyTrend } = React.useMemo(() => {
        const txs = readTransactions();
        const now = new Date();

        // Filter to expense transactions within the selected time range
        const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
        const expenses = txs.filter(t => {
            if (!t.date) return false;
            const d = new Date(t.date);
            if (d < cutoff) return false;
            return t.type === 'expense' || (!t.type && Number(t.amount) < 0);
        });

        // Categorize
        const catMap = {};
        expenses.forEach(t => {
            const rule = categorize(t.description || t.name || t.category || '');
            if (!catMap[rule.category]) {
                catMap[rule.category] = { ...rule, total: 0, transactions: [] };
            }
            catMap[rule.category].total += Math.abs(Number(t.amount) || 0);
            catMap[rule.category].transactions.push(t);
        });

        const sorted = Object.values(catMap).sort((a, b) => b.total - a.total);
        const total = sorted.reduce((s, c) => s + c.total, 0);

        // Monthly trend (last 3 months)
        const trend = [];
        for (let i = 2; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthTxs = txs.filter(t => {
                if (!t.date) return false;
                const d = new Date(t.date);
                return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() &&
                    (t.type === 'expense' || (!t.type && Number(t.amount) < 0));
            });
            const monthTotal = monthTxs.reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
            trend.push({
                label: m.toLocaleDateString('en-US', { month: 'short' }),
                total: monthTotal,
            });
        }

        return { categories: sorted, totalExpenses: total, monthlyTrend: trend };
    }, [months]);

    if (!mounted) return null;

    if (categories.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/50 p-6">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">No expense data to categorize</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Add transactions in Money OS and they'll be auto-categorized here with spending insights.
                </p>
            </div>
        );
    }

    const maxTrend = Math.max(...monthlyTrend.map(m => m.total), 1);

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Expense Insights</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                        {usd.format(totalExpenses)} <span className="text-base font-bold text-slate-500 dark:text-slate-400">total</span>
                    </h2>
                </div>
                <div className="flex gap-1.5">
                    {[1, 3, 6].map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMonths(m)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${months === m
                                ? 'bg-sky-600 text-white'
                                : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-400'
                                }`}
                        >
                            {m === 1 ? 'This month' : `${m} months`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Donut-style category bars */}
            <div className="mt-6 space-y-2">
                {categories.slice(0, 8).map(cat => {
                    const pct = totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0;
                    const isExpanded = expandedCategory === cat.category;
                    return (
                        <div key={cat.category}>
                            <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                                className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-3.5 hover:bg-slate-100 dark:hover:bg-slate-900/70 transition"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xl">{cat.emoji}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{cat.category}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{usd.format(cat.total)}</span>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-10 text-right">{pct}%</span>
                                    </div>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <div className={`h-full rounded-full ${cat.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                </div>
                            </button>

                            {/* Expanded transaction list */}
                            {isExpanded && (
                                <div className="ml-8 mt-1 mb-2 space-y-1">
                                    {cat.transactions.slice(0, 10).map((t, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/30">
                                            <span className="text-slate-600 dark:text-slate-400 truncate mr-3">
                                                {t.description || t.name || 'Transaction'}
                                                {t.date && <span className="text-slate-400 dark:text-slate-500 ml-2">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white shrink-0">{usd.format(Math.abs(Number(t.amount) || 0))}</span>
                                        </div>
                                    ))}
                                    {cat.transactions.length > 10 && (
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 px-3">+{cat.transactions.length - 10} more transactions</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Monthly trend mini chart */}
            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Monthly Trend</p>
                <div className="flex items-end gap-3 h-20">
                    {monthlyTrend.map((m, i) => {
                        const h = maxTrend > 0 ? Math.max(4, (m.total / maxTrend) * 100) : 4;
                        const isLast = i === monthlyTrend.length - 1;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{m.total > 0 ? usd.format(m.total) : '—'}</span>
                                <div
                                    className={`w-full rounded-lg transition-all duration-500 ${isLast ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    style={{ height: `${h}%` }}
                                />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
