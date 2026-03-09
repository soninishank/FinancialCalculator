import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

// 2025 Federal Income Tax Brackets
const BRACKETS_2025 = {
    single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ],
    married: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 }
    ],
    hoh: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ]
};

const STANDARD_DEDUCTION_2025 = {
    single: 15000,
    married: 30000,
    hoh: 22500
};

const FILING_STATUS_LABELS = {
    single: 'Single',
    married: 'Married Filing Jointly',
    hoh: 'Head of Household'
};

const FederalIncomeTaxEstimator = ({ currency = 'USD' }) => {
    const [grossIncome, setGrossIncome] = useState(75000);
    const [filingStatus, setFilingStatus] = useState('single');
    const [useItemized, setUseItemized] = useState(false);
    const [itemizedDeductions, setItemizedDeductions] = useState(15000);
    const [retirement401k, setRetirement401k] = useState(0);

    const result = useMemo(() => {
        const gross = parseFloat(grossIncome) || 0;
        const contrib401k = Math.min(parseFloat(retirement401k) || 0, 23500); // 2025 limit

        // AGI after 401k
        const agi = Math.max(0, gross - contrib401k);

        // Deductions
        const standardDed = STANDARD_DEDUCTION_2025[filingStatus];
        const itemizedDed = parseFloat(itemizedDeductions) || 0;
        const deduction = useItemized ? itemizedDed : standardDed;

        // Taxable income
        const taxableIncome = Math.max(0, agi - deduction);

        // Calculate tax by bracket
        const brackets = BRACKETS_2025[filingStatus];
        let totalTax = 0;
        let marginalRate = 0;
        const bracketBreakdown = [];

        for (const bracket of brackets) {
            if (taxableIncome > bracket.min) {
                const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
                const taxInBracket = taxableInBracket * bracket.rate;
                totalTax += taxInBracket;
                marginalRate = bracket.rate;

                if (taxableInBracket > 0) {
                    bracketBreakdown.push({
                        rate: bracket.rate,
                        income: taxableInBracket,
                        tax: taxInBracket
                    });
                }
            }
        }

        const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;
        const takeHome = gross - totalTax;
        const monthlyTakeHome = takeHome / 12;

        return {
            grossIncome: gross,
            agi,
            deduction,
            taxableIncome,
            totalTax,
            effectiveRate,
            marginalRate: marginalRate * 100,
            takeHome,
            monthlyTakeHome,
            bracketBreakdown
        };
    }, [grossIncome, filingStatus, useItemized, itemizedDeductions, retirement401k]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Income"
                value={grossIncome}
                onChange={setGrossIncome}
                min={10000}
                max={1000000}
                step={1000}
                currency={currency}
                helperText="Your total income before taxes"
            />

            {/* Filing Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filing Status
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(FILING_STATUS_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFilingStatus(key)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filingStatus === key
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deduction Toggle */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deductions
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setUseItemized(false)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${!useItemized
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Standard ({moneyFormat(STANDARD_DEDUCTION_2025[filingStatus], currency)})
                    </button>
                    <button
                        onClick={() => setUseItemized(true)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${useItemized
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Itemized
                    </button>
                </div>
            </div>

            {useItemized && (
                <InputWithSlider
                    label="Total Itemized Deductions"
                    value={itemizedDeductions}
                    onChange={setItemizedDeductions}
                    min={0}
                    max={200000}
                    step={500}
                    currency={currency}
                    helperText="Mortgage interest, state/local taxes, charity, etc."
                />
            )}

            <InputWithSlider
                label="401(k) Contributions"
                value={retirement401k}
                onChange={setRetirement401k}
                min={0}
                max={23500}
                step={500}
                currency={currency}
                helperText="Pre-tax 401(k) contributions (max $23,500 for 2025)"
            />
        </div>
    );

    const summary = (
        <div className="space-y-6">
            {/* Tax Headline */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Estimated Federal Tax</p>
                <h2 className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {moneyFormat(result.totalTax, currency)}
                </h2>
                <p className="text-xs text-gray-500 mt-2">for tax year 2025</p>
            </div>

            {/* Rate Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Effective Rate</p>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{result.effectiveRate.toFixed(1)}%</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 text-center">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Marginal Rate</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">{result.marginalRate.toFixed(0)}%</p>
                </div>
            </div>

            {/* Take-Home */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">After-Tax Take Home</p>
                <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{moneyFormat(result.takeHome, currency)}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    {moneyFormat(result.monthlyTakeHome, currency)}/month
                </p>
            </div>

            {/* Bracket Breakdown */}
            {result.bracketBreakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tax Bracket Breakdown</p>
                    <div className="space-y-2">
                        {result.bracketBreakdown.map((b, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 w-12 text-center">
                                    {(b.rate * 100).toFixed(0)}%
                                </span>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-300 to-red-500 rounded-full"
                                            style={{ width: `${Math.min(100, (b.income / result.taxableIncome) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-20 text-right">
                                    {moneyFormat(b.tax, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Gross Income</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(result.grossIncome, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Adjusted Gross Income (AGI)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(result.agi, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deductions</span>
                        <span className="font-semibold text-green-600">−{moneyFormat(result.deduction, currency)}</span>
                    </div>
                    <hr className="border-gray-100 dark:border-slate-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Taxable Income</span>
                        <span className="font-bold text-gray-900 dark:text-white">{moneyFormat(result.taxableIncome, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Understanding Federal Income Tax (2025)</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                    The U.S. uses a <strong>progressive tax system</strong> — you pay higher rates only on income above each bracket threshold, not on your entire income.
                </p>

                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-6">Key Terms</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Marginal Rate:</strong> The tax rate on your last dollar of income</li>
                    <li><strong>Effective Rate:</strong> Your actual average tax rate (total tax ÷ gross income)</li>
                    <li><strong>Standard Deduction:</strong> A flat amount everyone can deduct ($15,000 single, $30,000 married in 2025)</li>
                    <li><strong>AGI:</strong> Adjusted Gross Income — gross income minus pre-tax deductions like 401(k)</li>
                </ul>

                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30 mt-6">
                    <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-2">Tax-Saving Tips</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-teal-700 dark:text-teal-400">
                        <li>Maximize 401(k) contributions to reduce taxable income</li>
                        <li>Consider itemizing if mortgage interest + SALT + charity &gt; standard deduction</li>
                        <li>Contribute to an HSA for triple tax advantage</li>
                        <li>Use tax-loss harvesting to offset capital gains</li>
                    </ul>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                    Note: This is an estimate for federal income tax only. It does not include state taxes, FICA (Social Security + Medicare), or credits.
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            details={details}
        />
    );
};

export default FederalIncomeTaxEstimator;
