'use client';

import React from 'react';

const STORAGE_KEY = 'fincalc_savings_history_v1';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function loadHistory() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return getDefaultHistory();
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : getDefaultHistory();
    } catch {
        return getDefaultHistory();
    }
}

function getDefaultHistory() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            id: `${d.getFullYear()}-${d.getMonth()}`,
            label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
            income: 0,
            expenses: 0,
        });
    }
    return months;
}

function saveHistory(data) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function rateColor(rate) {
    if (rate >= 30) return { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
    if (rate >= 15) return { bar: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300' };
    if (rate >= 0) return { bar: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-300' };
    return { bar: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' };
}

export default function SavingsRateHistory() {
    const [history, setHistory] = React.useState([]);
    const [mounted, setMounted] = React.useState(false);
    const [editIdx, setEditIdx] = React.useState(null);

    React.useEffect(() => {
        setMounted(true);
        setHistory(loadHistory());
    }, []);

    const update = (idx, field, val) => {
        const next = history.map((m, i) => i === idx ? { ...m, [field]: Math.max(0, Number(val) || 0) } : m);
        setHistory(next);
        saveHistory(next);
    };

    // Compute stats
    const rates = history.map((m) => {
        const inc = Number(m.income) || 0;
        const exp = Number(m.expenses) || 0;
        const saved = inc - exp;
        const rate = inc > 0 ? (saved / inc) * 100 : 0;
        return { ...m, saved, rate };
    });

    const filledMonths = rates.filter((r) => r.income > 0);
    const avgRate = filledMonths.length > 0 ? filledMonths.reduce((s, r) => s + r.rate, 0) / filledMonths.length : 0;
    const totalSaved = filledMonths.reduce((s, r) => s + r.saved, 0);
    const maxRate = Math.max(...rates.map((r) => Math.abs(r.rate)), 50);

    if (!mounted) return null;

    const usd = (n) => `$${Math.round(n).toLocaleString()}`;

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">Track</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Savings Rate History</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log your income &amp; expenses each month to track savings momentum.</p>
                </div>
                {filledMonths.length > 0 && (
                    <div className={`rounded-2xl border px-4 py-3 text-center min-w-[100px] border-slate-200 dark:border-slate-800 ${rateColor(avgRate).text}`}>
                        <div className="text-2xl font-black">{avgRate.toFixed(1)}%</div>
                        <div className="text-[10px] font-black uppercase tracking-wider mt-0.5">Avg rate</div>
                    </div>
                )}
            </div>

            {/* Bar chart */}
            <div className="mt-6 flex items-end gap-2" style={{ height: 140 }}>
                {rates.map((r, i) => {
                    const height = maxRate > 0 ? Math.max(4, Math.abs(r.rate) / maxRate * 120) : 4;
                    const { bar, text } = rateColor(r.rate);
                    const isEditing = editIdx === i;
                    return (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setEditIdx(isEditing ? null : i)}
                            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                        >
                            <span className={`text-xs font-black ${text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {r.income > 0 ? `${r.rate.toFixed(0)}%` : '—'}
                            </span>
                            <div
                                className={`w-full max-w-[48px] rounded-t-lg ${bar} transition-all duration-300 ${isEditing ? 'ring-2 ring-offset-2 ring-sky-400' : ''}`}
                                style={{ height: r.income > 0 ? height : 4 }}
                            />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{r.label.split(' ')[0]}</span>
                        </button>
                    );
                })}
            </div>

            {/* Edit row */}
            {editIdx !== null && (
                <div className="mt-4 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{history[editIdx]?.label}</span>
                        <button type="button" onClick={() => setEditIdx(null)} className="text-xs text-slate-400 hover:text-slate-700">Done</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Income ($)
                            <input
                                type="number" min="0"
                                value={history[editIdx]?.income || ''}
                                placeholder="0"
                                onChange={(e) => update(editIdx, 'income', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Expenses ($)
                            <input
                                type="number" min="0"
                                value={history[editIdx]?.expenses || ''}
                                placeholder="0"
                                onChange={(e) => update(editIdx, 'expenses', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                            />
                        </label>
                    </div>
                    {history[editIdx]?.income > 0 && (
                        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            Saved <span className="font-black">{usd(rates[editIdx]?.saved || 0)}</span> → <span className={`font-black ${rateColor(rates[editIdx]?.rate || 0).text}`}>{(rates[editIdx]?.rate || 0).toFixed(1)}%</span> rate
                        </div>
                    )}
                </div>
            )}

            {/* Summary */}
            {filledMonths.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Saved</div>
                        <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{usd(totalSaved)}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Months Logged</div>
                        <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{filledMonths.length}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Best Month</div>
                        <div className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">
                            {filledMonths.length > 0 ? `${Math.max(...filledMonths.map(r => r.rate)).toFixed(0)}%` : '—'}
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Click any month bar to enter income and expenses · Data saved locally.</p>
        </div>
    );
}
