import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const DEFAULT_SPLITS = { needs: 50, wants: 30, savings: 20 };

const BudgetPlanner50_30_20 = ({ currency }) => {
    const [income, setIncome] = useState(80000);
    const [needsPct, setNeedsPct] = useState(DEFAULT_SPLITS.needs);
    const [wantsPct, setWantsPct] = useState(DEFAULT_SPLITS.wants);

    const savingsPct = useMemo(() => Math.max(0, 100 - needsPct - wantsPct), [needsPct, wantsPct]);

    const result = useMemo(() => {
        const inc = parseFloat(income) || 0;
        const needs = (inc * needsPct) / 100;
        const wants = (inc * wantsPct) / 100;
        const savings = (inc * savingsPct) / 100;
        return { needs, wants, savings };
    }, [income, needsPct, wantsPct, savingsPct]);

    const categories = [
        { label: 'Needs', sub: 'Rent, Groceries, Utilities, Insurance, EMIs', amount: result.needs, pct: needsPct, color: 'from-rose-400 to-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
        { label: 'Wants', sub: 'Dining, Entertainment, Shopping, Subscriptions', amount: result.wants, pct: wantsPct, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40' },
        { label: 'Savings & Investments', sub: 'SIP, FD, Emergency Fund, Debt Repayment', amount: result.savings, pct: savingsPct, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40' },
    ];

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Take-Home Pay"
                value={income}
                onChange={setIncome}
                min={10000}
                max={1000000}
                step={5000}
                currency={currency}
                helperText="After-tax income credited to your bank"
            />
            <InputWithSlider
                label="Needs %"
                value={needsPct}
                onChange={setNeedsPct}
                min={0}
                max={100}
                step={1}
                suffix="%"
                helperText="Essentials: rent, food, transport, bills"
            />
            <InputWithSlider
                label="Wants %"
                value={wantsPct}
                onChange={setWantsPct}
                min={0}
                max={100 - needsPct}
                step={1}
                suffix="%"
                helperText="Lifestyle: dining, travel, subscriptions"
            />
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Remaining for Savings</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{savingsPct}%</span>
            </div>
        </div>
    );

    const summary = (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly Income</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {moneyFormat(income, currency)}
                </h2>
            </div>

            {categories.map((cat) => (
                <div key={cat.label} className={`${cat.bg} p-5 rounded-2xl border ${cat.border}`}>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className={`font-bold ${cat.text}`}>{cat.label} ({cat.pct}%)</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.sub}</p>
                        </div>
                        <p className={`text-xl font-bold ${cat.text}`}>
                            {moneyFormat(cat.amount, currency)}
                        </p>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                        <div
                            className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                            style={{ width: `${cat.pct}%` }}
                        />
                    </div>
                </div>
            ))}

            {savingsPct < 20 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                        ⚠️ Your savings allocation ({savingsPct}%) is below the recommended 20%.
                    </p>
                </div>
            )}
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">The 50/30/20 Rule Explained</h3>
            <div className="prose prose-teal max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-4">
                    Popularized by Senator Elizabeth Warren in <strong>"All Your Worth"</strong>, the 50/30/20 rule is one of the simplest and most effective budgeting frameworks ever created.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/30">
                        <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-2">50% — Needs</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-400">Non-negotiable bills: housing, food, insurance, minimum debt payments, transport.</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">30% — Wants</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400">Lifestyle choices: dining out, hobbies, streaming, vacations, upgrades.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">20% — Savings</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">Future you: SIPs, emergency fund, extra debt payments, retirement contributions.</p>
                    </div>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30">
                    <p className="text-sm text-teal-800 dark:text-teal-300 font-medium">
                        💡 <strong>Pro Tip:</strong> If your Needs exceed 50%, look for ways to reduce fixed costs first (negotiate rent, switch insurance, refinance loans). Don't cut Savings to fund Wants.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            details={details}
            inputLabel="Budget Setup"
            resultLabel="Your Budget Breakdown"
        />
    );
};

export default BudgetPlanner50_30_20;
