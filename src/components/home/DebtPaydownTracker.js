'use client';

import React from 'react';
import Link from 'next/link';

const DEBTS_KEY = 'fincalc_debts_v1';

const DEFAULT_DEBTS = [
    { id: 'cc1', name: 'Credit Card A', balance: 3200, rate: 22.9, minPayment: 96, emoji: '💳' },
    { id: 'car', name: 'Car Loan', balance: 12000, rate: 7.5, minPayment: 280, emoji: '🚗' },
    { id: 'student', name: 'Student Loan', balance: 25000, rate: 5.0, minPayment: 290, emoji: '🎓' },
];

function loadDebts() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(DEBTS_KEY) : null;
        if (!raw) return DEFAULT_DEBTS;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : DEFAULT_DEBTS;
    } catch {
        return DEFAULT_DEBTS;
    }
}

function saveDebts(debts) {
    try {
        window.localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
    } catch { /* ignore */ }
}

/**
 * Estimate months to payoff with fixed payment (no extra).
 * n = -ln(1 - r * B / P) / ln(1 + r)
 */
function monthsToPayoff(balance, annualRate, payment) {
    if (!balance || balance <= 0) return 0;
    if (!payment || payment <= 0) return Infinity;
    const r = annualRate / 100 / 12;
    if (r === 0) return Math.ceil(balance / payment);
    const denom = Math.log(1 + r);
    const num = -Math.log(1 - (r * balance) / payment);
    if (!isFinite(num) || num <= 0) return Infinity;
    return Math.ceil(num / denom);
}

function totalInterest(balance, annualRate, payment) {
    if (!balance || !payment) return 0;
    const r = annualRate / 100 / 12;
    let b = balance;
    let interest = 0;
    let months = 0;
    while (b > 0 && months < 600) {
        const int = b * r;
        interest += int;
        b = b + int - payment;
        months++;
        if (b < 0) b = 0;
    }
    return Math.round(interest);
}

const usd = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const rateColor = (r) => r >= 15 ? 'text-rose-700 dark:text-rose-300' : r >= 8 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300';

export default function DebtPaydownTracker() {
    const [debts, setDebts] = React.useState(DEFAULT_DEBTS);
    const [mounted, setMounted] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [newDebt, setNewDebt] = React.useState({ name: '', balance: '', rate: '', minPayment: '', emoji: '💳' });

    React.useEffect(() => {
        setMounted(true);
        setDebts(loadDebts());
    }, []);

    const totalBalance = debts.reduce((s, d) => s + (Number(d.balance) || 0), 0);
    const totalMinPayment = debts.reduce((s, d) => s + (Number(d.minPayment) || 0), 0);

    const updateDebt = (id, field, rawValue) => {
        const value = field === 'name' || field === 'emoji' ? rawValue : Math.max(0, Number(rawValue) || 0);
        const next = debts.map((d) => d.id === id ? { ...d, [field]: value } : d);
        setDebts(next);
        saveDebts(next);
    };

    const addDebt = () => {
        if (!newDebt.name.trim() || !newDebt.balance) return;
        const next = [
            ...debts,
            {
                ...newDebt,
                id: `debt_${Date.now()}`,
                balance: Number(newDebt.balance),
                rate: Number(newDebt.rate),
                minPayment: Number(newDebt.minPayment),
            }
        ];
        setDebts(next);
        saveDebts(next);
        setAdding(false);
        setNewDebt({ name: '', balance: '', rate: '', minPayment: '', emoji: '💳' });
    };

    const removeDebt = (id) => {
        const next = debts.filter((d) => d.id !== id);
        setDebts(next);
        saveDebts(next);
    };

    // Sort by highest APR first (avalanche method)
    const sortedDebts = [...debts].sort((a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0));

    if (!mounted) return null;

    return (
        <div className="mt-8 rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/60 dark:bg-rose-950/20 p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">Debt Paydown Tracker</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {debts.length} debts · {usd(totalBalance)} total · {usd(totalMinPayment)}/mo minimum
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setAdding((v) => !v)}
                        className="rounded-full border border-rose-200 dark:border-rose-700 px-3 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300"
                    >
                        {adding ? 'Cancel' : '+ Add Debt'}
                    </button>
                    <Link
                        href="/calculators/debt-avalanche-snowball"
                        className="rounded-full border border-rose-200 dark:border-rose-700 px-3 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300"
                    >
                        Payoff Planner →
                    </Link>
                </div>
            </div>

            {/* Add debt form */}
            {adding && (
                <div className="mt-4 rounded-2xl border border-rose-200 dark:border-rose-700 bg-white/70 dark:bg-rose-950/30 p-4 grid sm:grid-cols-4 gap-3">
                    <input
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm sm:col-span-2"
                        placeholder="Debt name (e.g. Visa Card)"
                        value={newDebt.name}
                        onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                    />
                    <input
                        type="number" min="0"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                        placeholder="Balance $"
                        value={newDebt.balance}
                        onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <input
                            type="number" min="0" step="0.1"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                            placeholder="APR %"
                            value={newDebt.rate}
                            onChange={(e) => setNewDebt({ ...newDebt, rate: e.target.value })}
                        />
                        <input
                            type="number" min="0"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                            placeholder="Min $"
                            value={newDebt.minPayment}
                            onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={addDebt}
                            className="rounded-lg bg-rose-700 dark:bg-rose-600 px-3 py-2 text-xs font-black text-white whitespace-nowrap"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {sortedDebts.map((debt) => {
                    const balance = Number(debt.balance) || 0;
                    const rate = Number(debt.rate) || 0;
                    const payment = Number(debt.minPayment) || 0;
                    const months = monthsToPayoff(balance, rate, payment);
                    const intCost = totalInterest(balance, rate, payment);
                    const isInfinite = !isFinite(months);

                    return (
                        <div key={debt.id} className="rounded-2xl border border-white/80 dark:border-rose-900/40 bg-white/80 dark:bg-rose-950/30 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{debt.emoji}</span>
                                    <span className="font-black text-sm text-slate-900 dark:text-white truncate">{debt.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDebt(debt.id)}
                                    className="text-slate-300 dark:text-slate-600 hover:text-rose-500 text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance</div>
                                    <input
                                        type="number" min="0"
                                        value={balance}
                                        onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">APR %</div>
                                    <input
                                        type="number" min="0" step="0.1"
                                        value={rate}
                                        onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Min Payment</div>
                                    <input
                                        type="number" min="0"
                                        value={payment}
                                        onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Est. Payoff</div>
                                    <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                                        {isInfinite ? '⚠️ ∞' : `${months} mo`}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className={`text-xs font-black ${rateColor(rate)}`}>{rate}% APR</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {isInfinite ? 'Payment too low' : `${usd(intCost)} total interest`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {debts.length === 0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-rose-300 dark:border-rose-700 p-5 text-center text-sm text-rose-700 dark:text-rose-300">
                    Debt-free! Or click &ldquo;+ Add Debt&rdquo; to start tracking.
                </div>
            )}

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Sorted by highest APR first (avalanche method) · Data saved locally.</p>
        </div>
    );
}
