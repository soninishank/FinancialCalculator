'use client';

import React from 'react';
import Link from 'next/link';

const MONEY_OS_KEY = 'fincalc_money_os_v1';

function readMoneyOS() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MONEY_OS_KEY) : null;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function pctOf(value, total) {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
}

export default function CashFlowSummaryBanner() {
    const [data, setData] = React.useState(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const moneyOS = readMoneyOS();
        if (moneyOS) setData(moneyOS);
    }, []);

    // Derive stats from Money OS data
    const stats = React.useMemo(() => {
        if (!data) return null;

        const transactions = Array.isArray(data.transactions) ? data.transactions : [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonth = transactions.filter((t) => {
            if (!t.date) return false;
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = thisMonth
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0);

        const expenses = thisMonth
            .filter((t) => t.type === 'expense' || (!t.type && Number(t.amount) < 0))
            .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0);

        const netCash = income - expenses;
        const savingsRate = income > 0 ? pctOf(netCash, income) : null;

        return { income, expenses, netCash, savingsRate, txCount: thisMonth.length };
    }, [data]);

    if (!mounted) return null;

    // No Money OS data at all — show a soft prompt
    if (!data || !stats || stats.txCount === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">No cash flow data yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Add transactions in Money OS to see live spending and savings stats here.
                    </p>
                </div>
                <Link
                    href="/hub"
                    className="rounded-full bg-slate-900 dark:bg-white px-4 py-2 text-xs font-black text-white dark:text-slate-950 whitespace-nowrap"
                >
                    Open Money OS
                </Link>
            </div>
        );
    }

    const { income, expenses, netCash, savingsRate } = stats;
    const isPositive = netCash >= 0;

    const netColor = isPositive
        ? 'text-emerald-700 dark:text-emerald-300'
        : 'text-rose-700 dark:text-rose-300';

    const srStatus =
        savingsRate === null ? null
            : savingsRate >= 20 ? { label: 'Healthy', cls: 'text-emerald-700 dark:text-emerald-300' }
                : savingsRate >= 10 ? { label: 'Fair', cls: 'text-amber-700 dark:text-amber-300' }
                    : { label: 'Low', cls: 'text-rose-700 dark:text-rose-300' };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">This month · Cash Flow</p>
                </div>
                <Link
                    href="/hub"
                    className="text-xs font-black text-sky-700 dark:text-sky-300 hover:underline whitespace-nowrap"
                >
                    Open Money OS →
                </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <BannerStat label="Income" value={usdFormatter.format(income)} />
                <BannerStat label="Expenses" value={usdFormatter.format(expenses)} />
                <BannerStat
                    label="Net Cash"
                    value={(isPositive ? '+' : '') + usdFormatter.format(netCash)}
                    valueClass={netColor}
                />
                <BannerStat
                    label="Savings Rate"
                    value={savingsRate !== null ? `${savingsRate}%` : '—'}
                    valueClass={srStatus?.cls}
                    sub={srStatus?.label}
                />
            </div>

            {/* Spend bar */}
            {income > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span>Spend</span>
                        <span>{Math.min(100, pctOf(expenses, income))}% of income</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${expenses / income >= 1 ? 'bg-rose-500' : expenses / income >= 0.8 ? 'bg-amber-400' : 'bg-teal-500'}`}
                            style={{ width: `${Math.min(100, pctOf(expenses, income))}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function BannerStat({ label, value, valueClass = 'text-slate-900 dark:text-white', sub }) {
    return (
        <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
            <div className={`mt-1 text-xl font-black ${valueClass}`}>{value}</div>
            {sub && <div className={`text-xs font-bold ${valueClass} opacity-80`}>{sub}</div>}
        </div>
    );
}
