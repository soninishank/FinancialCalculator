'use client';

import React from 'react';

const MILESTONES_KEY = 'fincalc_milestones_v1';

const DEFAULT_MILESTONES = [
    { id: 'ms1', title: 'Emergency fund (3 months)', target: 10500, current: 10500, completed: true, emoji: '🛡️' },
    { id: 'ms2', title: 'Credit card debt free', target: 3200, current: 800, completed: false, emoji: '💳' },
    { id: 'ms3', title: '401(k) max ($23,000)', target: 23000, current: 14200, completed: false, emoji: '🏦' },
    { id: 'ms4', title: 'Emergency fund (6 months)', target: 21000, current: 10500, completed: false, emoji: '🛡️' },
    { id: 'ms5', title: '$100K net worth', target: 100000, current: 62000, completed: false, emoji: '🏆' },
    { id: 'ms6', title: 'Debt-free', target: 40200, current: 0, completed: false, emoji: '🎯' },
];

function loadMilestones() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MILESTONES_KEY) : null;
        if (!raw) return DEFAULT_MILESTONES;
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : DEFAULT_MILESTONES;
    } catch {
        return DEFAULT_MILESTONES;
    }
}

function saveMilestones(list) {
    try { window.localStorage.setItem(MILESTONES_KEY, JSON.stringify(list)); } catch { /* */ }
}

export default function FinancialMilestones() {
    const [milestones, setMilestones] = React.useState(DEFAULT_MILESTONES);
    const [mounted, setMounted] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [form, setForm] = React.useState({ title: '', target: '', current: '', emoji: '🎯' });

    React.useEffect(() => {
        setMounted(true);
        setMilestones(loadMilestones());
    }, []);

    const addMilestone = () => {
        if (!form.title.trim() || !form.target) return;
        const next = [...milestones, {
            id: `ms_${Date.now()}`,
            title: form.title,
            target: Number(form.target) || 0,
            current: Number(form.current) || 0,
            completed: false,
            emoji: form.emoji,
        }];
        setMilestones(next);
        saveMilestones(next);
        setAdding(false);
        setForm({ title: '', target: '', current: '', emoji: '🎯' });
    };

    const updateCurrent = (id, val) => {
        const next = milestones.map((m) => {
            if (m.id !== id) return m;
            const current = Math.max(0, Number(val) || 0);
            return { ...m, current, completed: current >= m.target };
        });
        setMilestones(next);
        saveMilestones(next);
    };

    const toggleComplete = (id) => {
        const next = milestones.map((m) => m.id === id ? { ...m, completed: !m.completed } : m);
        setMilestones(next);
        saveMilestones(next);
    };

    const removeMilestone = (id) => {
        const next = milestones.filter((m) => m.id !== id);
        setMilestones(next);
        saveMilestones(next);
    };

    const completedCount = milestones.filter((m) => m.completed).length;
    const totalCount = milestones.length;

    if (!mounted) return null;

    const usd = (n) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Milestones</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Financial Milestones</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {completedCount} of {totalCount} completed
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300"
                >
                    {adding ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {/* Overall progress */}
            {totalCount > 0 && (
                <div className="mt-4 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                </div>
            )}

            {/* Add form */}
            {adding && (
                <div className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-4 grid sm:grid-cols-3 gap-3">
                    <input className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm sm:col-span-2" placeholder="Milestone title (e.g. Pay off car)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <input type="number" min="0" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Target amount ($)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
                    <input type="number" min="0" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Progress so far ($)" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
                    <div className="flex gap-2 sm:col-span-2">
                        <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}>
                            <option value="🎯">🎯</option>
                            <option value="🛡️">🛡️</option>
                            <option value="💳">💳</option>
                            <option value="🏦">🏦</option>
                            <option value="🏡">🏡</option>
                            <option value="🚗">🚗</option>
                            <option value="🏆">🏆</option>
                            <option value="✈️">✈️</option>
                        </select>
                        <button type="button" onClick={addMilestone} className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-black text-white">Add</button>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="mt-6 relative">
                {/* vertical timeline line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-3">
                    {milestones.map((ms) => {
                        const target = Number(ms.target) || 0;
                        const current = Number(ms.current) || 0;
                        const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                        const done = ms.completed;
                        return (
                            <div key={ms.id} className="relative pl-12">
                                {/* Timeline dot */}
                                <button
                                    type="button"
                                    onClick={() => toggleComplete(ms.id)}
                                    className={`absolute left-0 top-3 w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${done
                                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                        }`}
                                >
                                    {done ? '✅' : ms.emoji}
                                </button>

                                <div className={`rounded-2xl border p-4 transition-all ${done
                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40'
                                    }`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className={`font-black text-sm ${done ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-slate-900 dark:text-white'}`}>
                                            {ms.title}
                                        </span>
                                        <button type="button" onClick={() => removeMilestone(ms.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 text-lg leading-none">×</button>
                                    </div>

                                    {target > 0 && (
                                        <>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number" min="0"
                                                        value={current}
                                                        onChange={(e) => updateCurrent(ms.id, e.target.value)}
                                                        className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm font-bold"
                                                    />
                                                    <span className="text-slate-400">of {usd(target)}</span>
                                                </div>
                                                <span className={`font-black ${done ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{pct}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {milestones.length === 0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-amber-300 dark:border-amber-700 p-5 text-center text-sm text-amber-700 dark:text-amber-300">
                    No milestones yet. Click &ldquo;+ Add&rdquo; to start tracking your finance goals.
                </div>
            )}

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Click emoji to mark complete/incomplete · Data saved locally.</p>
        </div>
    );
}
