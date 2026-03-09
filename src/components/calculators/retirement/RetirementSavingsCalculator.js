import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const RetirementSavingsCalculator = ({ currency }) => {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(65);
    const [currentSavings, setCurrentSavings] = useState(50000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [expectedReturn, setExpectedReturn] = useState(7);
    const [desiredIncome, setDesiredIncome] = useState(5000);

    const result = useMemo(() => {
        const yearsToRetire = Math.max(1, retirementAge - currentAge);
        const months = yearsToRetire * 12;
        const monthlyRate = (parseFloat(expectedReturn) || 0) / 100 / 12;
        const saved = parseFloat(currentSavings) || 0;
        const monthly = parseFloat(monthlyContribution) || 0;
        const income = parseFloat(desiredIncome) || 0;

        // Future value of current savings
        const fvCurrentSavings = saved * Math.pow(1 + monthlyRate, months);

        // Future value of monthly contributions (annuity)
        let fvContributions = 0;
        if (monthlyRate > 0) {
            fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else {
            fvContributions = monthly * months;
        }

        const totalAtRetirement = fvCurrentSavings + fvContributions;

        // How much needed at retirement (using 4% rule)
        const annualIncomeNeeded = income * 12;
        const nestedEgg = annualIncomeNeeded / 0.04;

        // Gap analysis
        const surplus = totalAtRetirement - nestedEgg;
        const isOnTrack = surplus >= 0;

        // Monthly income from portfolio at 4% SWR
        const monthlyIncomeFromPortfolio = (totalAtRetirement * 0.04) / 12;

        // Total contributed
        const totalContributed = saved + (monthly * months);
        const totalGrowth = totalAtRetirement - totalContributed;

        // If not on track, how much extra per month needed?
        let extraMonthlyNeeded = 0;
        if (!isOnTrack && months > 0) {
            const shortfall = nestedEgg - fvCurrentSavings;
            if (monthlyRate > 0) {
                extraMonthlyNeeded = shortfall * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
            } else {
                extraMonthlyNeeded = shortfall / months;
            }
            extraMonthlyNeeded = Math.max(0, extraMonthlyNeeded - monthly);
        }

        // Milestone: when do you become a millionaire?
        let millionaireAge = null;
        let balance = saved;
        for (let m = 1; m <= months; m++) {
            balance = (balance + monthly) * (1 + monthlyRate);
            if (balance >= 1000000 && millionaireAge === null) {
                millionaireAge = currentAge + Math.floor(m / 12);
            }
        }

        return {
            totalAtRetirement,
            nestedEgg,
            surplus,
            isOnTrack,
            monthlyIncomeFromPortfolio,
            totalContributed,
            totalGrowth,
            extraMonthlyNeeded,
            yearsToRetire,
            fvCurrentSavings,
            fvContributions,
            millionaireAge
        };
    }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, desiredIncome]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                min={18}
                max={70}
                step={1}
            />
            <InputWithSlider
                label="Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                min={Math.max(currentAge + 1, 40)}
                max={80}
                step={1}
            />
            <InputWithSlider
                label="Current Retirement Savings"
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={5000000}
                step={5000}
                currency={currency}
            />
            <InputWithSlider
                label="Monthly Contribution"
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                min={0}
                max={50000}
                step={100}
                currency={currency}
                helperText="How much you save/invest per month"
            />
            <InputWithSlider
                label="Expected Annual Return (%)"
                value={expectedReturn}
                onChange={setExpectedReturn}
                min={1}
                max={15}
                step={0.5}
                suffix="%"
            />
            <InputWithSlider
                label="Desired Monthly Income in Retirement"
                value={desiredIncome}
                onChange={setDesiredIncome}
                min={1000}
                max={50000}
                step={500}
                currency={currency}
                helperText="How much monthly income do you want in retirement?"
            />
        </div>
    );

    const summary = (
        <div className="space-y-6">
            {/* Projected Nest Egg */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Retirement Nest Egg</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {moneyFormat(result.totalAtRetirement, currency)}
                </h2>
                <p className="text-xs text-gray-500 mt-2">at age {retirementAge} ({result.yearsToRetire} years from now)</p>
            </div>

            {/* On Track / Off Track */}
            {result.isOnTrack ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">You&apos;re On Track! ✅</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                        Surplus of {moneyFormat(result.surplus, currency)} above your target
                    </p>
                </div>
            ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-800/30 text-center">
                    <p className="text-lg font-bold text-red-800 dark:text-red-300">Gap Detected ⚠️</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Shortfall of {moneyFormat(Math.abs(result.surplus), currency)}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        Save an extra <strong>{moneyFormat(result.extraMonthlyNeeded, currency)}/month</strong> to close the gap
                    </p>
                </div>
            )}

            {/* Monthly Income from Portfolio */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30 text-center">
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">Monthly Income (4% Rule)</p>
                    <p className="text-lg font-bold text-teal-800 dark:text-teal-200">
                        {moneyFormat(result.monthlyIncomeFromPortfolio, currency)}
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 text-center">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Target Needed</p>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {moneyFormat(result.nestedEgg, currency)}
                    </p>
                </div>
            </div>

            {/* Millionaire Milestone */}
            {result.millionaireAge && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 text-center">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        💰 You&apos;ll hit <strong>$1M</strong> at age <strong>{result.millionaireAge}</strong>
                    </p>
                </div>
            )}

            {/* Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Contributed</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(result.totalContributed, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Investment Growth</span>
                        <span className="font-semibold text-emerald-600">{moneyFormat(result.totalGrowth, currency)}</span>
                    </div>
                    <hr className="border-gray-100 dark:border-slate-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Savings (FV)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(result.fvCurrentSavings, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Contributions (FV)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(result.fvContributions, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Retirement Planning Basics</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                    This calculator estimates how much you&apos;ll have saved by retirement and whether it&apos;s enough to fund
                    your desired lifestyle using the widely-accepted <strong>4% Safe Withdrawal Rate</strong>.
                </p>

                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-6">The 4% Rule</h4>
                <p>
                    The 4% rule suggests you can withdraw 4% of your portfolio in the first year of retirement, then adjust
                    for inflation, and your money should last 30+ years. To generate {moneyFormat(desiredIncome, currency)}/month, you
                    need {moneyFormat(result.nestedEgg, currency)}.
                </p>

                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-6">Key Factors</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Time:</strong> The earlier you start, the more compounding works for you</li>
                    <li><strong>Contribution Rate:</strong> Even small increases compound dramatically over decades</li>
                    <li><strong>Return Rate:</strong> Historically, diversified stock portfolios return ~7% after inflation</li>
                    <li><strong>Spending:</strong> Lower retirement expenses mean a smaller nest egg needed</li>
                </ul>

                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30 mt-6">
                    <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-2">Quick Tips</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-teal-700 dark:text-teal-400">
                        <li>Max out employer 401(k) matching — it&apos;s free money</li>
                        <li>Consider Roth IRA for tax-free growth</li>
                        <li>Increase contributions by 1% each year after raises</li>
                        <li>Don&apos;t forget Social Security income as a supplement</li>
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

export default RetirementSavingsCalculator;
