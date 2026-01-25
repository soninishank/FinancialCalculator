'use client';

import React from 'react';

const BILLS_KEY = 'fincalc_bills_v1';

const DEFAULT_BILLS = [
    { id: 'rent', name: 'Rent / Mortgage', amount: 1500, dueDay: 1, category: 'Housing', emoji: '🏠' },
    { id: 'electric', name: 'Electricity', amount: 120, dueDay: 10, category: 'Utilities', emoji: '⚡' },
    { id: 'internet', name: 'Internet', amount: 60, dueDay: 15, category: 'Utilities', emoji: '📶' },
    { id: 'insurance', name: 'Health Insurance', amount: 250, dueDay: 5, category: 'Insurance', emoji: '🏥' },
    { id: 'streaming', name: 'Streaming Services', amount: 30, dueDay: 20, category: 'Entertainment', emoji: '📺' },
];

function loadBills() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(BILLS_KEY) : null;
        if (!raw) return DEFAULT_BILLS;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : DEFAULT_BILLS;
    } catch {
        return DEFAULT_BILLS;
    }
}

function saveBills(bills) {
    try {
        window.localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
    } catch { /* ignore */ }
}

function daysUntilDue(dueDay) {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (dueDay >= currentDay) return dueDay - currentDay;
    return daysInMonth - currentDay + dueDay; // next month
}

function urgencyClass(days) {
    if (days <= 2) return { border: 'border-rose-300 dark:border-rose-700', badge: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200' };
    if (days <= 7) return { border: 'border-amber-300 dark:border-amber-700', badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200' };
    return { border: 'border-slate-200 dark:border-slate-800', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' };
}

export default function BillCalendar() {
    const [bills, setBills] = React.useState(DEFAULT_BILLS);
    const [mounted, setMounted] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [newBill, setNewBill] = React.useState({ name: '', amount: '', dueDay: 1, category: 'Other', emoji: '📄' });

    React.useEffect(() => {
        setMounted(true);
        setBills(loadBills());
    }, []);

    const totalMonthly = bills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const sortedBills = [...bills].sort((a, b) => daysUntilDue(a.dueDay) - daysUntilDue(b.dueDay));

    const addBill = () => {
        if (!newBill.name.trim() || !newBill.amount) return;
        const next = [...bills, { ...newBill, id: `bill_${Date.now()}`, amount: Number(newBill.amount) }];
        setBills(next);
        saveBills(next);
        setAdding(false);
        setNewBill({ name: '', amount: '', dueDay: 1, category: 'Other', emoji: '📄' });
    };

    const removeBill = (id) => {
        const next = bills.filter((b) => b.id !== id);
        setBills(next);
        saveBills(next);
    };

    if (!mounted) return null;

    const usd = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Bills</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {bills.length} recurring bills · {usd(totalMonthly)}/month
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600"
                >
                    {adding ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {/* Add bill form */}
            {adding && (
                <div className="mt-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/60 dark:bg-violet-950/20 p-4 grid sm:grid-cols-4 gap-3">
                    <input
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm sm:col-span-2"
                        placeholder="Bill name"
                        value={newBill.name}
                        onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    />
                    <input
                        type="number"
                        min="0"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                        placeholder="Amount $"
                        value={newBill.amount}
                        onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max="31"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                            placeholder="Due day"
                            value={newBill.dueDay}
                            onChange={(e) => setNewBill({ ...newBill, dueDay: Number(e.target.value) || 1 })}
                        />
                        <button
                            type="button"
                            onClick={addBill}
                            className="rounded-lg bg-violet-700 dark:bg-violet-600 px-3 py-2 text-xs font-black text-white whitespace-nowrap"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {/* Bill list */}
            <div className="mt-4 space-y-2">
                {sortedBills.map((bill) => {
                    const days = daysUntilDue(bill.dueDay);
                    const { border, badge } = urgencyClass(days);
                    return (
                        <div key={bill.id} className={`rounded-2xl border ${border} bg-slate-50/60 dark:bg-slate-950/40 px-4 py-3 flex items-center gap-3`}>
                            <span className="text-lg">{bill.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{bill.name}</span>
                                    <span className={`text-[10px] font-black rounded-full px-2 py-0.5 ${badge}`}>
                                        {days === 0 ? 'Due today' : `Due in ${days}d`}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {bill.category} · Day {bill.dueDay} of month
                                </div>
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white shrink-0">{usd(bill.amount)}</div>
                            <button
                                type="button"
                                onClick={() => removeBill(bill.id)}
                                className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>

            {bills.length === 0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                    No bills yet. Click &ldquo;+ Add&rdquo; to track your recurring expenses.
                </div>
            )}
        </div>
    );
}
