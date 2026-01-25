'use client';

import React from 'react';
import Link from 'next/link';
import DebtPaydownTracker from './DebtPaydownTracker';
import InvestmentReturnSummary from './InvestmentReturnSummary';

const STORAGE_KEY = 'fincalc_profile_v1';

function getRiskBucket(score) {
    if (score <= 30) return { label: 'Conservative', color: 'text-emerald-700 dark:text-emerald-300' };
    if (score <= 65) return { label: 'Balanced', color: 'text-amber-700 dark:text-amber-300' };
    return { label: 'Growth-focused', color: 'text-blue-700 dark:text-blue-300' };
}

function getRecommendations(goal, riskBucket) {
    const base = [
        { slug: 'emergency-fund-calculator', title: 'Emergency Fund Calculator' },
        { slug: 'pure-sip', title: 'SIP Calculator' },
        { slug: 'compound-interest', title: 'Compound Interest Calculator' }
    ];

    if (goal === 'retirement') {
        base.unshift({ slug: 'ultimate-fire-planner', title: 'Ultimate FIRE Planner' });
        base.push({ slug: 'swr-simulator', title: 'Safe Withdrawal Rate Simulator' });
    }
    if (goal === 'house') {
        base.unshift({ slug: 'home-affordability-calculator', title: 'Home Affordability Calculator' });
        base.push({ slug: 'advanced-home-loan', title: 'Home Loan with Prepayments & Taxes' });
    }
    if (goal === 'debt') {
        base.unshift({ slug: 'debt-avalanche-snowball', title: 'Debt Avalanche vs Snowball' });
        base.push({ slug: 'refinance-calculator', title: 'Refinance Calculator' });
    }

    if (riskBucket.label === 'Conservative') {
        base.push({ slug: 'fixed-deposit', title: 'Fixed Deposit Calculator' });
        base.push({ slug: 'recurring-deposit', title: 'Recurring Deposit Calculator' });
    } else if (riskBucket.label === 'Growth-focused') {
        base.push({ slug: 'step-up-sip', title: 'Step-Up SIP Calculator' });
        base.push({ slug: 'target-amount-calculator', title: 'Target Amount Calculator' });
    }

    const map = new Map();
    base.forEach((item) => {
        if (!map.has(item.slug)) map.set(item.slug, item);
    });
    return Array.from(map.values()).slice(0, 6);
}

export default function PersonalFinancePlanner() {
    const [profile, setProfile] = React.useState({
        age: 30,
        monthlyIncome: 6000,
        monthlyExpenses: 3500,
        currentSavings: 20000,
        monthlyInvestment: 800,
        goal: 'wealth',
        horizonYears: 10
    });
    const [savedAt, setSavedAt] = React.useState('');
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setProfile((prev) => ({ ...prev, ...parsed }));
            }
        } catch {
            // ignore storage parse errors
        }
    }, []);

    if (!isMounted) return null;

    const monthlySurplus = Number(profile.monthlyIncome) - Number(profile.monthlyExpenses);
    const savingsRate = profile.monthlyIncome > 0 ? (monthlySurplus / Number(profile.monthlyIncome)) * 100 : 0;
    const emergencyTarget = Number(profile.monthlyExpenses) * 6;
    const runwayMonths = profile.monthlyExpenses > 0 ? Number(profile.currentSavings) / Number(profile.monthlyExpenses) : 0;

    const riskScore = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                (Number(profile.horizonYears) * 5) +
                (profile.goal === 'retirement' ? 10 : 0) +
                (savingsRate >= 20 ? 15 : 0) -
                (profile.age > 45 ? 15 : 0)
            )
        )
    );
    const riskBucket = getRiskBucket(riskScore);
    const recommendations = getRecommendations(profile.goal, riskBucket);

    // FIRE calculations
    const annualExpenses = Number(profile.monthlyExpenses) * 12;
    const fireNumber = annualExpenses * 25;
    const fireProgress = fireNumber > 0 ? Math.min(100, Math.round((Number(profile.currentSavings) / fireNumber) * 100)) : 0;
    const monthlyInvestment = Number(profile.monthlyInvestment);
    const annualRate = 0.07; // 7% real return assumption
    const monthlyRate = annualRate / 12;
    let yearsToFIRE = null;
    if (monthlyInvestment > 0 && fireNumber > Number(profile.currentSavings)) {
        const gap = fireNumber - Number(profile.currentSavings);
        // n = ln(1 + gap * r / PMT) / ln(1 + r)  [future value of annuity + lump sum]
        // Solved numerically month by month (fast enough for small n)
        let balance = Number(profile.currentSavings);
        let months = 0;
        while (balance < fireNumber && months < 600) {
            balance = balance * (1 + monthlyRate) + monthlyInvestment;
            months++;
        }
        yearsToFIRE = balance >= fireNumber ? (months / 12) : null;
    } else if (Number(profile.currentSavings) >= fireNumber) {
        yearsToFIRE = 0;
    }

    const saveProfile = () => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setSavedAt(new Date().toLocaleString());
    };

    return (
        <section className="py-14">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Personalized Plan Builder</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Build your own finance snapshot and jump to the right tools.</p>
                        </div>
                        <button
                            onClick={saveProfile}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
                        >
                            Save profile
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                            <Field label="Age">
                                <input type="number" min="18" max="80" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Monthly income">
                                <input type="number" min="0" value={profile.monthlyIncome} onChange={(e) => setProfile({ ...profile, monthlyIncome: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Monthly expenses">
                                <input type="number" min="0" value={profile.monthlyExpenses} onChange={(e) => setProfile({ ...profile, monthlyExpenses: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Current savings">
                                <input type="number" min="0" value={profile.currentSavings} onChange={(e) => setProfile({ ...profile, currentSavings: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Monthly investment">
                                <input type="number" min="0" value={profile.monthlyInvestment} onChange={(e) => setProfile({ ...profile, monthlyInvestment: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Goal horizon (years)">
                                <input type="number" min="1" max="40" value={profile.horizonYears} onChange={(e) => setProfile({ ...profile, horizonYears: Number(e.target.value) || 1 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                            </Field>
                            <Field label="Primary goal">
                                <select value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
                                    <option value="wealth">Wealth building</option>
                                    <option value="retirement">Retirement/FIRE</option>
                                    <option value="house">Buy a home</option>
                                    <option value="debt">Debt reduction</option>
                                </select>
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <Metric label="Monthly surplus" value={`$${monthlySurplus.toLocaleString()}`} />
                            <Metric label="Savings rate" value={`${savingsRate.toFixed(1)}%`} />
                            <Metric label="Emergency target (6 months)" value={`$${emergencyTarget.toLocaleString()}`} />
                            <Metric label="Current runway" value={`${runwayMonths.toFixed(1)} months`} />
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Risk posture</p>
                                <p className={`text-lg font-black mt-1 ${riskBucket.color}`}>{riskBucket.label}</p>
                            </div>
                            {savedAt && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Saved: {savedAt}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3">Recommended next calculators</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recommendations.map((item) => (
                                <Link key={item.slug} href={`/calculators/${item.slug}`} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* FIRE Progress Widget */}
                    {fireNumber > 0 && (
                        <div className="mt-8 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-700 dark:text-indigo-300">FIRE Progress</p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">At 25× annual expenses · 7% real return assumption</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-indigo-700 dark:text-indigo-300">{fireProgress}%</span>
                                    <span className="text-xs text-slate-500">of FIRE number</span>
                                </div>
                            </div>

                            <div className="mt-3 h-3 w-full rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${fireProgress}%` }}
                                />
                            </div>

                            <div className="mt-4 grid sm:grid-cols-3 gap-3">
                                <div className="rounded-xl bg-white/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 p-3">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Your FIRE #</div>
                                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">${fireNumber.toLocaleString()}</div>
                                </div>
                                <div className="rounded-xl bg-white/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 p-3">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Current Savings</div>
                                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">${Number(profile.currentSavings).toLocaleString()}</div>
                                </div>
                                <div className="rounded-xl bg-white/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 p-3">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Est. Years to FIRE</div>
                                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                        {yearsToFIRE === 0 ? '🎉 Already there!' : yearsToFIRE !== null ? `${yearsToFIRE.toFixed(1)} yrs` : '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href="/calculators/ultimate-fire-planner"
                                    className="text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                                >
                                    Open full FIRE Planner →
                                </Link>
                            </div>
                        </div>
                    )}

                    <DebtPaydownTracker />
                    <InvestmentReturnSummary />
                </div>
            </div>
        </section>
    );
}

function Field({ label, children }) {
    return (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="mb-1 block">{label}</span>
            {children}
        </label>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">{value}</p>
        </div>
    );
}
