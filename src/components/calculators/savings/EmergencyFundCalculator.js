import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import { calculatorDetails } from '../../../data/calculatorDetails';

const EmergencyFundCalculator = ({ currency }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
    const [monthsToCover, setMonthsToCover] = useState(6);
    const [currentSavings, setCurrentSavings] = useState(100000);

    const result = useMemo(() => {
        const expenses = parseFloat(monthlyExpenses) || 0;
        const months = parseFloat(monthsToCover) || 0;
        const savings = parseFloat(currentSavings) || 0;

        const target = expenses * months;
        const shortfall = Math.max(0, target - savings);
        const progress = target > 0 ? Math.min(100, (savings / target) * 100) : 0;
        const isFullyFunded = shortfall === 0;

        return {
            targetAmount: target,
            shortfall,
            progress,
            isFullyFunded
        };
    }, [monthlyExpenses, monthsToCover, currentSavings]);

    // Generate helper text based on months to cover
    const getMonthsLabel = (months) => {
        if (months <= 3) return '(Risky)';
        if (months <= 6) return '(Standard)';
        if (months <= 12) return '(Safe)';
        return '(Very Conservative)';
    };

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Essential Expenses"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                min={5000}
                max={500000}
                step={1000}
                currency={currency}
                helperText="Rent, EMI, Food, Utilities, Insurance etc."
            />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Months to Cover
                    </label>
                    <span className="text-sm font-bold text-teal-600">{monthsToCover} months {getMonthsLabel(monthsToCover)}</span>
                </div>
                <InputWithSlider
                    label=""
                    value={monthsToCover}
                    onChange={setMonthsToCover}
                    min={3}
                    max={24}
                    step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                    <span>3 Months</span>
                    <span>6 Months</span>
                    <span>12 Months</span>
                    <span>24 Months</span>
                </div>
            </div>

            <InputWithSlider
                label="Current Emergency Savings"
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={5000000}
                step={5000}
                currency={currency}
            />
        </div>
    );

    const summary = (
        <div className="space-y-6">
            {/* Target Amount Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Fund Amount</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {moneyFormat(result.targetAmount, currency)}
                </h2>
            </div>

            {/* Progress Visualization */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress to Goal</span>
                    <span className={`text-sm font-bold ${result.isFullyFunded ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {!isNaN(result.progress) ? result.progress.toFixed(1) : '0.0'}%
                    </span>
                </div>
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${result.isFullyFunded
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-r from-amber-400 to-amber-600'
                            }`}
                        style={{ width: `${result.progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                        {result.isFullyFunded ? '✓ Fully Funded' : `${moneyFormat(currentSavings, currency)}`}
                    </div>
                </div>
            </div>

            {/* Status Card */}
            {result.isFullyFunded ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                    <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-1">Fully Funded! 🎉</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        Your emergency fund is sufficient.
                    </p>
                </div>
            ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 text-center">
                    <p className="text-red-800 dark:text-red-300 font-medium mb-1">Gap to Bridge</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {moneyFormat(result.shortfall, currency)}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        You need to save this much more to be secure.
                    </p>
                </div>
            )}
        </div>
    );

    const details = calculatorDetails['emergency-fund-calculator']?.render() || (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Why You Need an Emergency Fund</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                    An <strong>Emergency Fund</strong> is money set aside to cover unexpected expenses or financial emergencies,
                    such as job loss, medical bills, or urgent home repairs.
                </p>

                <h4 className="font-bold text-gray-800 mt-6">Recommended Coverage:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>3 Months:</strong> Minimum for dual-income households with stable jobs
                    </li>
                    <li>
                        <strong>6 Months:</strong> Standard recommendation for most people
                    </li>
                    <li>
                        <strong>12 Months:</strong> Recommended for single-income households or freelancers
                    </li>
                    <li>
                        <strong>12-24 Months:</strong> For maximum security in volatile careers
                    </li>
                </ul>

                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mt-6">
                    <h4 className="font-bold text-teal-800 mb-2">Pro Tips:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-teal-700">
                        <li>Keep your emergency fund in a high-yield savings account for easy access</li>
                        <li>Don't invest it in stocks or long-term instruments</li>
                        <li>Replenish it immediately after withdrawal</li>
                        <li>Separate it from your regular spending account</li>
                    </ul>
                </div>
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

export default EmergencyFundCalculator;
