'use client';

import React from 'react';

const MONEY_OS_KEY = 'fincalc_money_os_v1';
const HEALTH_KEY = 'fincalc_health_score_v1';

function readMoneyOS() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MONEY_OS_KEY) : null;
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function readHealthInputs() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(HEALTH_KEY) : null;
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveHealthInputs(data) {
    try { window.localStorage.setItem(HEALTH_KEY, JSON.stringify(data)); } catch { /* noop */ }
}

/* ── Score helpers ── */
function calcSavingsRateScore(income, expenses) {
    if (!income || income <= 0) return { score: 0, label: 'No data', tip: 'Add income data to score this.' };
    const rate = ((income - expenses) / income) * 100;
    if (rate >= 20) return { score: 25, label: `${Math.round(rate)}%`, tip: 'Excellent — above 20% target.' };
    if (rate >= 10) return { score: 18, label: `${Math.round(rate)}%`, tip: 'Good — aim for 20% or higher.' };
    if (rate >= 0) return { score: 10, label: `${Math.round(rate)}%`, tip: 'Building — reduce discretionary spend.' };
    return { score: 0, label: `${Math.round(rate)}%`, tip: 'Spending exceeds income this period.' };
}

function calcDebtScore(monthlyDebt, monthlyIncome) {
    if (!monthlyIncome || monthlyIncome <= 0) return { score: 0, label: 'No data', tip: 'Add income to score this.' };
    if (!monthlyDebt || monthlyDebt <= 0) return { score: 25, label: '0%', tip: 'No debt payments — excellent.' };
    const ratio = (monthlyDebt / monthlyIncome) * 100;
    if (ratio <= 15) return { score: 25, label: `${Math.round(ratio)}%`, tip: 'Low debt-to-income — very healthy.' };
    if (ratio <= 30) return { score: 18, label: `${Math.round(ratio)}%`, tip: 'Moderate — keep paying down aggressively.' };
    if (ratio <= 43) return { score: 10, label: `${Math.round(ratio)}%`, tip: 'High — prioritize debt reduction.' };
    return { score: 4, label: `${Math.round(ratio)}%`, tip: 'Very high — focus on debt payoff immediately.' };
}

function calcEmergencyFundScore(fundAmount, monthlyExpenses) {
    if (!monthlyExpenses || monthlyExpenses <= 0) return { score: 0, label: 'No data', tip: 'Add expense data to score.' };
    if (!fundAmount || fundAmount <= 0) return { score: 0, label: '0 mo', tip: 'Start building an emergency fund ASAP.' };
    const months = fundAmount / monthlyExpenses;
    if (months >= 6) return { score: 25, label: `${months.toFixed(1)} mo`, tip: 'Outstanding — 6+ months covered.' };
    if (months >= 3) return { score: 18, label: `${months.toFixed(1)} mo`, tip: 'Solid — aim for 6 months.' };
    if (months >= 1) return { score: 10, label: `${months.toFixed(1)} mo`, tip: 'Getting there — keep contributing.' };
    return { score: 4, label: `${months.toFixed(1)} mo`, tip: 'Very thin safety net — prioritize savings.' };
}

function calcNetWorthTrendScore(hasPositiveTrend) {
    if (hasPositiveTrend === null) return { score: 0, label: 'No data', tip: 'Track net worth over time to score.' };
    if (hasPositiveTrend) return { score: 25, label: 'Growing', tip: 'Net worth trending up — great work.' };
    return { score: 10, label: 'Flat/Down', tip: 'Net worth flat or declining — review spending.' };
}

function scoreColor(score) {
    if (score >= 75) return { ring: 'stroke-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Excellent', bg: 'bg-emerald-500/10' };
    if (score >= 50) return { ring: 'stroke-amber-400', text: 'text-amber-600 dark:text-amber-400', label: 'Fair', bg: 'bg-amber-500/10' };
    if (score >= 25) return { ring: 'stroke-orange-500', text: 'text-orange-600 dark:text-orange-400', label: 'Needs Work', bg: 'bg-orange-500/10' };
    return { ring: 'stroke-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Critical', bg: 'bg-rose-500/10' };
}

/* ── Circular gauge ── */
function CircularGauge({ score, size = 160, strokeWidth = 12 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const colors = scoreColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    className={`${colors.ring} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth} strokeDasharray={circumference}
                    strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${colors.text}`}>{score}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">of 100</span>
            </div>
        </div>
    );
}

/* ── Main component ── */
export default function FinancialHealthScore() {
    const [mounted, setMounted] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);
    const [inputs, setInputs] = React.useState({ monthlyDebt: '', emergencyFund: '', netWorthUp: null });

    React.useEffect(() => {
        setMounted(true);
        setInputs(prev => ({ ...prev, ...readHealthInputs() }));
    }, []);

    const scores = React.useMemo(() => {
        const moneyOS = readMoneyOS();
        const txs = Array.isArray(moneyOS?.transactions) ? moneyOS.transactions : [];
        const now = new Date();
        const thisMonth = txs.filter(t => {
            if (!t.date) return false;
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
        const expenses = thisMonth.filter(t => t.type === 'expense' || (!t.type && Number(t.amount) < 0)).reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

        const savingsRate = calcSavingsRateScore(income, expenses);
        const debtRatio = calcDebtScore(Number(inputs.monthlyDebt) || 0, income);
        const emergencyFund = calcEmergencyFundScore(Number(inputs.emergencyFund) || 0, expenses);
        const netWorthTrend = calcNetWorthTrendScore(inputs.netWorthUp);

        return { savingsRate, debtRatio, emergencyFund, netWorthTrend, total: savingsRate.score + debtRatio.score + emergencyFund.score + netWorthTrend.score };
    }, [inputs]);

    const handleInputChange = (field, value) => {
        const next = { ...inputs, [field]: value };
        setInputs(next);
        saveHealthInputs(next);
    };

    if (!mounted) return null;

    const colors = scoreColor(scores.total);
    const dimensions = [
        { key: 'savingsRate', label: 'Savings Rate', data: scores.savingsRate, max: 25 },
        { key: 'debtRatio', label: 'Debt-to-Income', data: scores.debtRatio, max: 25 },
        { key: 'emergencyFund', label: 'Emergency Fund', data: scores.emergencyFund, max: 25 },
        { key: 'netWorthTrend', label: 'Net Worth Trend', data: scores.netWorthTrend, max: 25 },
    ];

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <CircularGauge score={scores.total} />
                <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Financial Health</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Your Score: <span className={colors.text}>{colors.label}</span></h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Combines savings rate, debt ratio, emergency fund, and net worth trend into a single 0–100 score.
                    </p>
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 text-sm font-bold text-sky-700 dark:text-sky-300 hover:underline"
                    >
                        {expanded ? 'Hide breakdown' : 'Show breakdown & settings'}
                    </button>
                </div>
            </div>

            {/* Score bars */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {dimensions.map(d => {
                    const pct = Math.round((d.data.score / d.max) * 100);
                    return (
                        <div key={d.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{d.label}</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{d.data.label}</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : pct >= 25 ? 'bg-orange-500' : 'bg-rose-500'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{d.data.tip}</p>
                        </div>
                    );
                })}
            </div>

            {/* Expanded inputs */}
            {expanded && (
                <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-5 space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Manual Inputs</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Savings rate and expenses are auto-detected from Money OS. Fill in these fields for a complete score.</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Debt Payments ($)</label>
                            <input
                                type="number" min="0" placeholder="e.g. 800"
                                value={inputs.monthlyDebt}
                                onChange={e => handleInputChange('monthlyDebt', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Fund Balance ($)</label>
                            <input
                                type="number" min="0" placeholder="e.g. 15000"
                                value={inputs.emergencyFund}
                                onChange={e => handleInputChange('emergencyFund', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Is your net worth trending up?</label>
                        <div className="flex gap-2">
                            {[{ val: true, label: 'Yes, growing' }, { val: false, label: 'Flat or down' }, { val: null, label: 'Not sure' }].map(opt => (
                                <button
                                    key={String(opt.val)}
                                    type="button"
                                    onClick={() => handleInputChange('netWorthUp', opt.val)}
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${inputs.netWorthUp === opt.val
                                        ? 'bg-sky-600 text-white'
                                        : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
