import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { PiggyBank, AlertCircle } from 'lucide-react';

export default function RothIRACalculator({ currency = 'USD' }) {
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(60);
    const [startingBalance, setStartingBalance] = useState(5000);
    const [annualContribution, setAnnualContribution] = useState(6500);
    const [expectedReturn, setExpectedReturn] = useState(8);
    const [marginalTaxRate, setMarginalTaxRate] = useState(22); // For tax savings comparison

    const maxContribution2024 = 7000;
    const catchUpLimit = 1000; // Extra if age >= 50

    const result = useMemo(() => {
        const yearsToInvest = Math.max(0, retirementAge - currentAge);
        let balance = startingBalance;
        let totalInvested = startingBalance;
        let taxableAccountBalance = startingBalance; // Comparison
        const yearlyData = [];

        for (let i = 1; i <= yearsToInvest; i++) {
            const age = currentAge + i;
            // Determine limit based on age (catch-up contributions over 50)
            const limit = age >= 50 ? maxContribution2024 + catchUpLimit : maxContribution2024;

            // Allow user input but cap at limit for calculation visuals? 
            // Better: warn user but calculate what they asked, or cap it. Let's calculate as is but show warning.

            const investment = annualContribution;

            // Roth Growth (Tax Free)
            const interest = (balance + investment) * (expectedReturn / 100);
            balance += investment + interest;
            totalInvested += investment;

            // Taxable Account Comparison
            // Investment is post-tax (same as Roth), but gains are taxed annually (e.g. dividends) or at end (LTCG).
            // Simplified: Assume 15% LTCG tax drag effectively reducing return? 
            // Or simpler: Tax the final gain difference.
            // Let's just track the growth and show theoretical tax savings on gains.

            yearlyData.push({
                year: age,
                invested: totalInvested,
                gain: balance - totalInvested,
                balance: balance,
                totalInvested: totalInvested,
                growth: balance - totalInvested,
                limit: limit
            });
        }

        // Calculate potential tax savings
        // If this money was in a taxable account, gains would be taxed at LTCG (say 15%) or income tax.
        // Tax savings = Final Gain * Tax Rate (approx 15-20% usually).
        // Let's use a conservative 15% LTCG estimate for savings display.
        const totalGain = balance - totalInvested;
        const potentialTaxSavings = totalGain * 0.15;

        return {
            finalBalance: balance,
            totalInvested,
            totalGain,
            potentialTaxSavings,
            yearlyData,
            isOverLimit: annualContribution > (currentAge >= 50 ? maxContribution2024 + catchUpLimit : maxContribution2024)
        };
    }, [currentAge, retirementAge, startingBalance, annualContribution, expectedReturn]);

    const inputs = (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Current Age"
                    value={currentAge}
                    onChange={setCurrentAge}
                    min={18}
                    max={retirementAge - 1}
                    step={1}
                    suffix=" Years"
                />
                <InputWithSlider
                    label="Retirement Age"
                    value={retirementAge}
                    onChange={setRetirementAge}
                    min={currentAge + 1}
                    max={80}
                    step={1}
                    suffix=" Years"
                />
            </div>

            <InputWithSlider
                label="Starting Balance"
                value={startingBalance}
                onChange={setStartingBalance}
                min={0}
                max={500000}
                step={500}
                currency={currency}
            />

            <InputWithSlider
                label="Annual Contribution"
                value={annualContribution}
                onChange={setAnnualContribution}
                min={0}
                max={20000}
                step={100}
                currency={currency}
            />
            {result.isOverLimit && (
                <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                        <strong>Note:</strong> The contribution limit for 2024 is ${new Intl.NumberFormat().format(currentAge >= 50 ? maxContribution2024 + catchUpLimit : maxContribution2024)}. Excess contributions may be penalized.
                    </p>
                </div>
            )}

            <InputWithSlider
                label="Expected Annual Return"
                value={expectedReturn}
                onChange={setExpectedReturn}
                min={2}
                max={15}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" /> Roth IRA Calculator
                </h2>
                <p className="text-sm text-purple-800">Tax-free growth for your retirement savings.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.totalInvested}
                            gain={result.totalGain}
                            total={result.finalBalance}
                            currency={currency}
                        />
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Estimated Tax Savings</p>
                            <p className="text-lg font-bold text-emerald-700">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.potentialTaxSavings)}
                            </p>
                            <p className="text-[10px] text-emerald-600 mt-1">*Compared to a taxable account (est. 15% LTCG tax)</p>
                        </div>
                    </div>
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                details={calculatorDetails['roth-ira-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
