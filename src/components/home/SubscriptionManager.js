'use client';

import React from 'react';

const SUBS_KEY = 'fincalc_subscriptions_v1';

const DEFAULT_SUBS = [
    { id: 'netflix', name: 'Netflix', amount: 15.49, frequency: 'monthly', category: 'Entertainment', emoji: '📺', active: true },
    { id: 'spotify', name: 'Spotify', amount: 10.99, frequency: 'monthly', category: 'Entertainment', emoji: '🎵', active: true },
    { id: 'gym', name: 'Gym Membership', amount: 49.99, frequency: 'monthly', category: 'Health', emoji: '💪', active: true },
    { id: 'cloud', name: 'Cloud Storage', amount: 2.99, frequency: 'monthly', category: 'Tech', emoji: '☁️', active: true },
    { id: 'news', name: 'News Subscription', amount: 120, frequency: 'annual', category: 'Education', emoji: '📰', active: true },
    { id: 'domain', name: 'Domain Renewal', amount: 15, frequency: 'annual', category: 'Tech', emoji: '🌐', active: false },
];

function loadSubs() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(SUBS_KEY) : null;
        if (!raw) return DEFAULT_SUBS;
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : DEFAULT_SUBS;
    } catch {
        return DEFAULT_SUBS;
    }
}

function saveSubs(list) {
    try { window.localStorage.setItem(SUBS_KEY, JSON.stringify(list)); } catch { /* */ }
}

function annualize(amount, freq) {
    const n = Number(amount) || 0;
    return freq === 'annual' ? n : n * 12;
}

const CATEGORIES = ['Entertainment', 'Health', 'Tech', 'Education', 'Finance', 'Other'];
const catColors = {
    Entertainment: 'bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200',
    Health: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
    Tech: 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200',
    Education: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
    Finance: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200',
    Other: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
};

export default function SubscriptionManager() {
    const [subs, setSubs] = React.useState(DEFAULT_SUBS);
    const [mounted, setMounted] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', amount: '', frequency: 'monthly', category: 'Other', emoji: '📦' });

    React.useEffect(() => {
        setMounted(true);
        setSubs(loadSubs());
    }, []);

    const activeSubs = subs.filter((s) => s.active);
    const monthlyTotal = activeSubs.reduce((s, sub) => s + (sub.frequency === 'annual' ? (Number(sub.amount) || 0) / 12 : (Number(sub.amount) || 0)), 0);
    const annualTotal = activeSubs.reduce((s, sub) => s + annualize(sub.amount, sub.frequency), 0);

    const addSub = () => {
        if (!form.name.trim() || !form.amount) return;
        const next = [...subs, { ...form, id: `sub_${Date.now()}`, amount: Number(form.amount), active: true }];
        setSubs(next);
        saveSubs(next);
        setAdding(false);
        setForm({ name: '', amount: '', frequency: 'monthly', category: 'Other', emoji: '📦' });
    };

    const toggleSub = (id) => {
        const next = subs.map((s) => s.id === id ? { ...s, active: !s.active } : s);
        setSubs(next);
        saveSubs(next);
    };

    const removeSub = (id) => {
        const next = subs.filter((s) => s.id !== id);
        setSubs(next);
        saveSubs(next);
    };

    if (!mounted) return null;

    const usd = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Category breakdown
    const catSpend = {};
    activeSubs.forEach((s) => {
        const cat = s.category || 'Other';
        catSpend[cat] = (catSpend[cat] || 0) + annualize(s.amount, s.frequency);
    });
    const catEntries = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-700 dark:text-violet-300">Track</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Subscriptions</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {activeSubs.length} active · {usd(monthlyTotal)}/mo · {usd(annualTotal)}/yr
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

            {/* Add form */}
            {adding && (
                <div className="mt-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/60 dark:bg-violet-950/20 p-4 grid sm:grid-cols-2 gap-3">
                    <input className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Subscription name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input type="number" min="0" step="0.01" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Amount ($)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                    </select>
                    <div className="flex gap-2">
                        <select className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="button" onClick={addSub} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-black text-white">Add</button>
                    </div>
                </div>
            )}

            {/* Subscription list */}
            <div className="mt-4 space-y-2">
                {subs.map((sub) => {
                    const catCls = catColors[sub.category] || catColors.Other;
                    return (
                        <div
                            key={sub.id}
                            className={`rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 transition-opacity ${!sub.active ? 'opacity-40' : ''}`}
                        >
                            <button type="button" onClick={() => toggleSub(sub.id)} className="text-lg shrink-0" title={sub.active ? 'Pause' : 'Activate'}>
                                {sub.emoji}
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-bold text-sm ${sub.active ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>{sub.name}</span>
                                    <span className={`text-[10px] font-black rounded-full px-2 py-0.5 ${catCls}`}>{sub.category}</span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {sub.frequency === 'annual' ? `${usd(sub.amount)}/yr` : `${usd(sub.amount)}/mo`}
                                    {sub.frequency === 'monthly' && <span className="text-slate-400"> · {usd(annualize(sub.amount, sub.frequency))}/yr</span>}
                                </div>
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                                {usd(sub.frequency === 'annual' ? Number(sub.amount) / 12 : Number(sub.amount))}<span className="text-slate-400 font-normal">/mo</span>
                            </div>
                            <button type="button" onClick={() => removeSub(sub.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 text-lg leading-none shrink-0">×</button>
                        </div>
                    );
                })}
            </div>

            {/* Category breakdown */}
            {catEntries.length > 0 && (
                <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Annual spend by category</p>
                    <div className="flex gap-2 flex-wrap">
                        {catEntries.map(([cat, total]) => (
                            <div key={cat} className={`rounded-xl px-3 py-2 text-xs font-bold ${catColors[cat] || catColors.Other}`}>
                                {cat}: ${Math.round(total).toLocaleString()}/yr
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Click emoji to pause/unpause · Data saved locally.</p>
        </div>
    );
}
