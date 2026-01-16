import React, { useState, useEffect } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const EmergencyFundCalculator = ({ currency }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
    const [monthsToCover, setMonthsToCover] = useState(6);
    const [currentSavings, setCurrentSavings] = useState(100000);

    const [targetAmount, setTargetAmount] = useState(0);
    const [shortfall, setShortfall] = useState(0);

    useEffect(() => {
        const expenses = parseFloat(monthlyExpenses) || 0;
        const months = parseFloat(monthsToCover) || 0;
        const savings = parseFloat(currentSavings) || 0;

        const target = expenses * months;
        setTargetAmount(target);
        setShortfall(Math.max(0, target - savings));
    }, [monthlyExpenses, monthsToCover, currentSavings]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
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

                <InputWithSlider
                    label={`Months to Cover: ${monthsToCover}`}
                    value={monthsToCover}
                    onChange={setMonthsToCover}
                    min={3}
                    max={24}
                    step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mb-6 -mt-2 px-1">
                    <span>3 Months (Risky)</span>
                    <span>6 Months (Standard)</span>
                    <span>12 Months (Safe)</span>
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

            <div className="flex-1">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm h-full flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Fund Amount</p>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                            {moneyFormat(targetAmount, currency)}
                        </h2>
                    </div>

                    {shortfall > 0 ? (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 text-center">
                            <p className="text-red-800 dark:text-red-300 font-medium mb-1">Gap to Bridge</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {moneyFormat(shortfall, currency)}
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-2">You need to save this much more to be secure.</p>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                            <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-1">Fully Funded! 🎉</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">Your emergency fund is sufficient.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyFundCalculator;
