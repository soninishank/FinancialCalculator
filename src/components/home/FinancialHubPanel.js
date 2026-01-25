'use client';

import React from 'react';
import Link from 'next/link';

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function sanitizeAmount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
}

const MONEY_OS_KEY = 'fincalc_money_os_v1';

function readMoneyOS() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MONEY_OS_KEY) : null;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function computeHealthScore({ emergencyMonths, dti, savingsRate, investmentRate, goalCount }) {
    const pillars = [
        // Emergency buffer (6+ months = 20 pts)
        Math.min(20, (sanitizeAmount(emergencyMonths) / 6) * 20),
        // DTI: <= 28% = 20 pts, 36-43% = 10, >= 43% = 0
        dti <= 28 ? 20 : dti <= 36 ? 15 : dti <= 43 ? 8 : 0,
        // Savings rate: >= 20% = 20 pts
        Math.min(20, (sanitizeAmount(savingsRate) / 20) * 20),
        // Investment rate: >= 10% = 20 pts
        Math.min(20, (sanitizeAmount(investmentRate) / 10) * 20),
        // Goals: >= 1 goal = 20 pts
        goalCount >= 1 ? 20 : 0,
    ];
    return Math.round(pillars.reduce((a, b) => a + b, 0));
}

function scoreLabel(score) {
    if (score >= 80) return { label: 'Excellent', color: 'emerald' };
    if (score >= 60) return { label: 'Good', color: 'teal' };
    if (score >= 40) return { label: 'Fair', color: 'amber' };
    return { label: 'Needs Attention', color: 'rose' };
}

const COLOR_MAP = {
    emerald: {
        bar: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/50',
    },
    teal: {
        bar: 'bg-teal-500',
        text: 'text-teal-700 dark:text-teal-300',
        badge: 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700',
        bg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-800/50',
    },
    amber: {
        bar: 'bg-amber-400',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700',
        bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-800/50',
    },
    rose: {
        bar: 'bg-rose-500',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700',
        bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800/50',
    },
};

const SCORE_PILLARS_META = [
    { key: 'emergency', label: 'Emergency Buffer', max: 20, tip: 'Aim for 6+ months of expenses saved.' },
    { key: 'dti', label: 'Debt-to-Income', max: 20, tip: 'Keep total monthly debt below 28% of income.' },
    { key: 'savings', label: 'Savings Rate', max: 20, tip: 'Save at least 20% of monthly income.' },
    { key: 'investment', label: 'Investment Rate', max: 20, tip: 'Invest at least 10% of monthly income.' },
    { key: 'goals', label: 'Goal Tracking', max: 20, tip: 'Set at least one financial goal in Money OS.' },
];

export default function FinancialHubPanel() {
    const [monthlyExpenses, setMonthlyExpenses] = React.useState(4000);
    const [safetyMonths, setSafetyMonths] = React.useState(6);
    const [monthlyIncome, setMonthlyIncome] = React.useState(7000);
    const [monthlyDebt, setMonthlyDebt] = React.useState(1800);
    const [monthlySavings, setMonthlySavings] = React.useState(1200);
    const [monthlyInvestment, setMonthlyInvestment] = React.useState(700);
    const [goalCount, setGoalCount] = React.useState(0);

    React.useEffect(() => {
        const data = readMoneyOS();
        if (data && Array.isArray(data.goals)) {
            setGoalCount(data.goals.length);
        }
    }, []);

    const emergencyTarget = sanitizeAmount(monthlyExpenses) * sanitizeAmount(safetyMonths);
    const dti = monthlyIncome > 0 ? (sanitizeAmount(monthlyDebt) / sanitizeAmount(monthlyIncome)) * 100 : 0;
    const savingsRate = monthlyIncome > 0 ? (sanitizeAmount(monthlySavings) / sanitizeAmount(monthlyIncome)) * 100 : 0;
    const investmentRate = monthlyIncome > 0 ? (sanitizeAmount(monthlyInvestment) / sanitizeAmount(monthlyIncome)) * 100 : 0;
    const emergencyMonths = monthlyExpenses > 0 ? sanitizeAmount(safetyMonths) : 0;

    const healthScore = computeHealthScore({ emergencyMonths, dti, savingsRate, investmentRate, goalCount });
    const { label: scoreText, color: scoreColor } = scoreLabel(healthScore);
    const colors = COLOR_MAP[scoreColor];

    // Compute individual pillar scores for breakdown bar
    const pillarScores = {
        emergency: Math.round(Math.min(20, (sanitizeAmount(emergencyMonths) / 6) * 20)),
        dti: dti <= 28 ? 20 : dti <= 36 ? 15 : dti <= 43 ? 8 : 0,
        savings: Math.round(Math.min(20, (savingsRate / 20) * 20)),
        investment: Math.round(Math.min(20, (investmentRate / 10) * 20)),
        goals: goalCount >= 1 ? 20 : 0,
    };

    let dtiLabel = 'Healthy';
    let dtiStyle = 'text-emerald-700 dark:text-emerald-300';
    if (dti >= 36 && dti < 43) {
        dtiLabel = 'Watch closely';
        dtiStyle = 'text-amber-700 dark:text-amber-300';
    } else if (dti >= 43) {
        dtiLabel = 'High risk';
        dtiStyle = 'text-rose-700 dark:text-rose-300';
    }

    return (
        <section className="py-14 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900/50 dark:to-slate-950">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Financial Hub</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Quick diagnostics before you invest, borrow, or rebalance.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Emergency Buffer Check</h3>
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Monthly expenses
                                    <input
                                        type="number"
                                        min="0"
                                        value={monthlyExpenses}
                                        onChange={(e) => setMonthlyExpenses(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Safety months
                                    <input
                                        type="range"
                                        min="3"
                                        max="12"
                                        value={safetyMonths}
                                        onChange={(e) => setSafetyMonths(e.target.value)}
                                        className="mt-2 w-full"
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{safetyMonths} months</span>
                                </label>
                            </div>

                            <div className="mt-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 p-4">
                                <p className="text-xs uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-300">Target emergency fund</p>
                                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                                    {usdFormatter.format(emergencyTarget)}
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link href="/calculators/emergency-fund-calculator" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                    Open Emergency Fund Calculator
                                </Link>
                                <Link href="/calculators/fixed-deposit" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                    Park in FD/RD Tools
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Debt-to-Income Quick Audit</h3>
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Monthly take-home income
                                    <input
                                        type="number"
                                        min="0"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Monthly debt payments
                                    <input
                                        type="number"
                                        min="0"
                                        value={monthlyDebt}
                                        onChange={(e) => setMonthlyDebt(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                                    />
                                </label>
                            </div>

                            <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-600 dark:text-slate-400">Current DTI ratio</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{dti.toFixed(1)}%</p>
                                <p className={`text-sm font-bold mt-1 ${dtiStyle}`}>{dtiLabel}</p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link href="/calculators/debt-avalanche-snowball" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                    Open Debt Payoff Planner
                                </Link>
                                <Link href="/calculators/refinance-calculator" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                    Check Refinance Impact
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Financial Health Score Card ── */}
                    <div className="mt-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Financial Health Score</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Composite snapshot across 5 financial pillars.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`text-5xl font-black ${colors.text}`}>{healthScore}</div>
                                <div className="text-left">
                                    <div className={`text-xs font-black uppercase tracking-wider border rounded-full px-3 py-1 ${colors.badge}`}>{scoreText}</div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">out of 100</div>
                                </div>
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="mt-4 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                                style={{ width: `${healthScore}%` }}
                            />
                        </div>

                        {/* Two extra inputs */}
                        <div className="mt-5 grid sm:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Monthly savings
                                <input
                                    type="number"
                                    min="0"
                                    value={monthlySavings}
                                    onChange={(e) => setMonthlySavings(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Monthly investment
                                <input
                                    type="number"
                                    min="0"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                                />
                            </label>
                        </div>

                        {/* Pillar breakdown */}
                        <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
                            {SCORE_PILLARS_META.map((pillar) => {
                                const pts = pillarScores[pillar.key];
                                const pct = (pts / pillar.max) * 100;
                                return (
                                    <div key={pillar.key} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{pillar.label}</div>
                                        <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">{pts}<span className="text-xs font-medium text-slate-400">/{pillar.max}</span></div>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{pillar.tip}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`mt-5 rounded-xl border p-4 ${colors.bg}`}>
                            <p className={`text-sm font-bold ${colors.text}`}>
                                {healthScore >= 80 && '🏆 Great shape. Keep contributing to investments and maintain your emergency buffer.'}
                                {healthScore >= 60 && healthScore < 80 && '✅ Solid foundation. Focus on bumping your savings or investment rate to the next tier.'}
                                {healthScore >= 40 && healthScore < 60 && '⚠️ Some gaps to address. Check which pillars scored lowest and start there.'}
                                {healthScore < 40 && '🚨 Multiple areas need immediate attention. Start with an emergency fund and reducing debt.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
