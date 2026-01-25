'use client';

import React from 'react';

const US_BRACKETS_2024 = [
    { rate: 10, upTo: 11600 },
    { rate: 12, upTo: 47150 },
    { rate: 22, upTo: 100525 },
    { rate: 24, upTo: 191950 },
    { rate: 32, upTo: 243725 },
    { rate: 35, upTo: 609350 },
    { rate: 37, upTo: Infinity },
];

const STANDARD_DEDUCTION_SINGLE = 14600;
const STANDARD_DEDUCTION_MFJ = 29200;

function calcTax(taxableIncome) {
    let tax = 0;
    let prev = 0;
    for (const bracket of US_BRACKETS_2024) {
        if (taxableIncome <= prev) break;
        const chunk = Math.min(taxableIncome, bracket.upTo) - prev;
        tax += chunk * (bracket.rate / 100);
        prev = bracket.upTo;
    }
    return tax;
}

function getMarginalBracket(taxableIncome) {
    for (const b of US_BRACKETS_2024) {
        if (taxableIncome <= b.upTo) return b.rate;
    }
    return 37;
}

function bracketColor(rate) {
    if (rate <= 12) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
    if (rate <= 22) return 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800';
    if (rate <= 24) return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
    return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
}

export default function TaxBracketEstimator() {
    const [income, setIncome] = React.useState(95000);
    const [filingStatus, setFilingStatus] = React.useState('single');
    const [otherIncome, setOtherIncome] = React.useState(0);
    const [retirementContrib, setRetirementContrib] = React.useState(7000);

    const deduction = filingStatus === 'mfj' ? STANDARD_DEDUCTION_MFJ : STANDARD_DEDUCTION_SINGLE;
    const grossIncome = Number(income) + Number(otherIncome);
    const agi = Math.max(0, grossIncome - Number(retirementContrib));
    const taxableIncome = Math.max(0, agi - deduction);
    const federalTax = calcTax(taxableIncome);
    const effectiveRate = grossIncome > 0 ? (federalTax / grossIncome) * 100 : 0;
    const marginalRate = getMarginalBracket(taxableIncome);
    const afterTaxIncome = grossIncome - federalTax;
    const bracketCls = bracketColor(marginalRate);

    const usd = (n) => `$${Math.round(n).toLocaleString()}`;
    const pct = (n) => `${n.toFixed(1)}%`;

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">Tax Estimator</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Federal Tax Bracket</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">US 2024 tax year · Estimates only · Consult a CPA for advice.</p>
                </div>
                {/* Marginal bracket badge */}
                <div className={`self-start rounded-2xl border px-5 py-3 text-center min-w-[110px] ${bracketCls}`}>
                    <div className="text-3xl font-black">{marginalRate}%</div>
                    <div className="text-[10px] font-black uppercase tracking-wider mt-0.5">Marginal rate</div>
                </div>
            </div>

            {/* Inputs */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Filing Status
                    <select
                        value={filingStatus}
                        onChange={(e) => setFilingStatus(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                        <option value="single">Single</option>
                        <option value="mfj">Married Filing Jointly</option>
                    </select>
                </label>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Annual Salary / Wages ($)
                    <input
                        type="number" min="0"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value) || 0)}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Other Income (interest, freelance, etc.)
                    <input
                        type="number" min="0"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Pre-tax Retirement Contributions ($)
                    <input
                        type="number" min="0"
                        value={retirementContrib}
                        onChange={(e) => setRetirementContrib(Number(e.target.value) || 0)}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                </label>
            </div>

            {/* Results */}
            <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { label: 'Gross Income', value: usd(grossIncome), sub: '' },
                    { label: 'Taxable Income', value: usd(taxableIncome), sub: `After ${usd(deduction)} deduction` },
                    { label: 'Est. Federal Tax', value: usd(federalTax), sub: `Effective ${pct(effectiveRate)}` },
                    { label: 'After-Tax Income', value: usd(afterTaxIncome), sub: `${usd(Math.round(afterTaxIncome / 12))}/mo` },
                ].map(({ label, value, sub }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
                        <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">{value}</div>
                        {sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
                    </div>
                ))}
            </div>

            {/* Bracket ladder */}
            <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">2024 Bracket Ladder</p>
                <div className="space-y-1.5">
                    {US_BRACKETS_2024.filter(b => b.upTo !== Infinity).map((b, i) => {
                        const prev = i === 0 ? 0 : US_BRACKETS_2024[i - 1].upTo;
                        const isActive = taxableIncome > prev;
                        const isCurrent = taxableIncome <= b.upTo && taxableIncome > prev;
                        return (
                            <div key={b.rate} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isCurrent ? 'border-2 border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-950/30' : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 opacity-60'}`}>
                                <span className={`text-sm font-black w-10 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{b.rate}%</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex-1">
                                    {usd(prev)} – {usd(b.upTo)}
                                </span>
                                {isCurrent && <span className="text-[10px] font-black text-sky-700 dark:text-sky-300 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5">YOUR BRACKET</span>}
                            </div>
                        );
                    })}
                    {/* 37% top bracket */}
                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${taxableIncome > 609350 ? 'border-2 border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-950/30' : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 opacity-60'}`}>
                        <span className={`text-sm font-black w-10 ${taxableIncome > 609350 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>37%</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex-1">{usd(609350)}+</span>
                        {taxableIncome > 609350 && <span className="text-[10px] font-black text-sky-700 dark:text-sky-300 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5">YOUR BRACKET</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
