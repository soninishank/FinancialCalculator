'use client';

import React from 'react';

const MILESTONES_KEY = 'fincalc_goal_milestones_v1';

const PRESETS = [
    { name: 'Emergency Fund', target: 15000, emoji: '🛡️' },
    { name: 'Down Payment', target: 60000, emoji: '🏠' },
    { name: 'Vacation Fund', target: 5000, emoji: '✈️' },
    { name: 'New Car', target: 30000, emoji: '🚗' },
    { name: 'Wedding', target: 25000, emoji: '💍' },
    { name: 'Retirement Milestone', target: 100000, emoji: '🏖️' },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function loadGoals() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MILESTONES_KEY) : null;
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveGoals(goals) {
    try { window.localStorage.setItem(MILESTONES_KEY, JSON.stringify(goals)); } catch { /* noop */ }
}

function projectedDate(current, target, monthlyContribution) {
    if (!monthlyContribution || monthlyContribution <= 0 || current >= target) return null;
    const remaining = target - current;
    const months = Math.ceil(remaining / monthlyContribution);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function GoalMilestonesTimeline() {
    const [mounted, setMounted] = React.useState(false);
    const [goals, setGoals] = React.useState([]);
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', target: '', current: '', monthly: '', emoji: '🎯' });

    React.useEffect(() => {
        setMounted(true);
        setGoals(loadGoals());
    }, []);

    const addGoal = () => {
        if (!form.name || !form.target) return;
        const next = [...goals, {
            id: generateId(),
            name: form.name,
            target: Number(form.target) || 0,
            current: Number(form.current) || 0,
            monthly: Number(form.monthly) || 0,
            emoji: form.emoji,
            createdAt: new Date().toISOString(),
        }];
        setGoals(next);
        saveGoals(next);
        setForm({ name: '', target: '', current: '', monthly: '', emoji: '🎯' });
        setShowForm(false);
    };

    const removeGoal = (id) => {
        const next = goals.filter(g => g.id !== id);
        setGoals(next);
        saveGoals(next);
    };

    const updateGoalCurrent = (id, newCurrent) => {
        const next = goals.map(g => g.id === id ? { ...g, current: Number(newCurrent) || 0 } : g);
        setGoals(next);
        saveGoals(next);
    };

    const applyPreset = (preset) => {
        setForm({ name: preset.name, target: String(preset.target), current: '', monthly: '', emoji: preset.emoji });
        setShowForm(true);
    };

    if (!mounted) return null;

    const sortedGoals = [...goals].sort((a, b) => {
        const aPct = a.target > 0 ? a.current / a.target : 0;
        const bPct = b.target > 0 ? b.current / b.target : 0;
        return bPct - aPct;
    });

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Goal Timeline</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Financial Milestones</h2>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-full bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-bold text-white transition"
                >
                    {showForm ? 'Cancel' : '+ Add Goal'}
                </button>
            </div>

            {/* Presets */}
            {showForm && (
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Quick templates</p>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map(p => (
                                <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => applyPreset(p)}
                                    className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-sky-400 transition"
                                >
                                    {p.emoji} {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-5 grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Goal Name</label>
                            <input
                                type="text" placeholder="e.g. Emergency Fund"
                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Amount ($)</label>
                            <input
                                type="number" min="0" placeholder="e.g. 15000"
                                value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Saved So Far ($)</label>
                            <input
                                type="number" min="0" placeholder="e.g. 3000"
                                value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Contribution ($)</label>
                            <input
                                type="number" min="0" placeholder="e.g. 500"
                                value={form.monthly} onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="button"
                                onClick={addGoal}
                                disabled={!form.name || !form.target}
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 px-6 py-2.5 text-sm font-bold text-white transition"
                            >
                                Add Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            {sortedGoals.length > 0 ? (
                <div className="mt-6 space-y-4">
                    {sortedGoals.map(goal => {
                        const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                        const isDone = pct >= 100;
                        const projected = projectedDate(goal.current, goal.target, goal.monthly);
                        const daysLeft = projected ? Math.ceil((projected - new Date()) / (1000 * 60 * 60 * 24)) : null;

                        return (
                            <div key={goal.id} className={`rounded-2xl border p-5 transition-all ${isDone
                                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50'
                                }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-2xl">{goal.emoji}</span>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{goal.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {usd.format(goal.current)} of {usd.format(goal.target)}
                                                {goal.monthly > 0 && <span> · {usd.format(goal.monthly)}/mo</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-lg font-black ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-300'}`}>
                                            {isDone ? '✓' : `${pct}%`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeGoal(goal.id)}
                                            className="text-slate-400 hover:text-rose-500 text-xs font-bold"
                                            title="Remove"
                                        >✕</button>
                                    </div>
                                </div>

                                {/* Progress bar with milestone markers */}
                                <div className="mt-3 relative">
                                    <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    {/* Milestone markers at 25/50/75% */}
                                    {[25, 50, 75].map(m => (
                                        <div
                                            key={m}
                                            className={`absolute top-0 h-3 w-0.5 ${pct >= m ? 'bg-white/60' : 'bg-slate-400/30'}`}
                                            style={{ left: `${m}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Projected completion & inline update */}
                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {isDone && '🎉 Goal reached!'}
                                        {!isDone && projected && (
                                            <>
                                                Projected: <span className="font-bold text-slate-700 dark:text-slate-200">{projected.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                                <span className="ml-2 text-slate-400">({daysLeft} days)</span>
                                            </>
                                        )}
                                        {!isDone && !projected && goal.monthly <= 0 && 'Add monthly contribution to see projected date'}
                                    </div>
                                    {!isDone && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Update saved:</label>
                                            <input
                                                type="number" min="0"
                                                value={goal.current}
                                                onChange={e => updateGoalCurrent(goal.id, e.target.value)}
                                                className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                !showForm && (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                        <p className="text-3xl mb-2">🎯</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No goals yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Add a financial goal to track your progress with projected dates and milestones.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}
