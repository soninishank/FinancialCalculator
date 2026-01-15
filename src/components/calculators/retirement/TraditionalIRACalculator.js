import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { PiggyBank } from 'lucide-react';

export default function TraditionalIRACalculator({ currency = 'USD' }) {
    const [currentAge, setCurrentAge] = useState(35);
    const [currentBalance, setCurrentBalance] = useState(25000);
    const [annualContribution, setAnnualContribution] = useState(6500);
    const [expectedReturn, setExpectedReturn] = useState(8);
    const [retirementAge, setRetirementAge] = useState(65);
    const [currentIncome, setCurrentIncome] = useState(85000);
    const [filingStatus, setFilingStatus] = useState('single');

    const result = useMemo(() => {
        const years = retirementAge - currentAge;

        // Contribution limits (2024)
        const baseLimit = 7000;
        const catchUpLimit = 8000; // Age 50+
        const isCatchUpEligible = currentAge >= 50;
        const contributionLimit = isCatchUpEligible ? catchUpLimit : baseLimit;
        const actualContribution = Math.min(annualContribution, contributionLimit);

        // Tax deduction phase-out for Traditional IRA (2024)
        // Single: $77k-$87k, Married: $123k-$143k (if covered by workplace plan)
        const phaseOutRanges = {
            single: { start: 77000, end: 87000 },
            married: { start: 123000, end: 143000 }
        };

        const range = phaseOutRanges[filingStatus];
        let deductibleAmount = actualContribution;

        if (currentIncome > range.end) {
            deductibleAmount = 0;
        } else if (currentIncome > range.start) {
            const phaseOutPercentage = (range.end - currentIncome) / (range.end - range.start);
            deductibleAmount = actualContribution * phaseOutPercentage;
        }

        const taxSavings = deductibleAmount * 0.22; // Assume 22% tax bracket

        // Growth projection
        let balance = currentBalance;
        const yearlyData = [];
        let totalContributions = currentBalance;

        for (let year = 1; year <= years; year++) {
            const yearContribution = year <= years ? actualContribution : 0;
            balance = (balance + yearContribution) * (1 + expectedReturn / 100);
            totalContributions += yearContribution;

            yearlyData.push({
                year: currentAge + year,
                totalInvested: Math.round(totalContributions),
                growth: Math.round(balance - totalContributions),
                balance: Math.round(balance)
            });
        }

        // RMD calculation at age 73 (new SECURE 2.0 rule)
        const rmdAge = 73;
        const yearsToRMD = Math.max(0, rmdAge - currentAge);
        const balanceAtRMD = currentBalance * Math.pow(1 + expectedReturn / 100, yearsToRMD);
        const rmdDivisor = 26.5; // IRS uniform lifetime table approximation for age 73
        const firstRMD = balanceAtRMD / rmdDivisor;

        return {
            years,
            actualContribution,
            contributionLimit,
            deductibleAmount,
            taxSavings,
            finalBalance: balance,
            totalContributions,
            totalGrowth: balance - totalContributions,
            yearlyData,
            firstRMD,
            rmdAge,
            isFullyDeductible: deductibleAmount === actualContribution
        };
    }, [currentAge, currentBalance, annualContribution, expectedReturn, retirementAge, currentIncome, filingStatus]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                min={18}
                max={70}
                step={1}
                suffix=" Years"
            />

            <InputWithSlider
                label="Current IRA Balance"
                value={currentBalance}
                onChange={setCurrentBalance}
                min={0}
                max={500000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Annual Contribution"
                value={annualContribution}
                onChange={setAnnualContribution}
                min={0}
                max={result.contributionLimit}
                step={500}
                currency={currency}
                helperText={`2024 limit: $${result.contributionLimit.toLocaleString()} ${currentAge >= 50 ? '(w/ catch-up)' : ''}`}
            />

            <InputWithSlider
                label="Expected Annual Return (%)"
                value={expectedReturn}
                onChange={setExpectedReturn}
                min={0}
                max={12}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                min={currentAge + 1}
                max={75}
                step={1}
                suffix=" Years"
            />

            <InputWithSlider
                label="Current Annual Income"
                value={currentIncome}
                onChange={setCurrentIncome}
                min={20000}
                max={250000}
                step={5000}
                currency={currency}
                helperText="For tax deduction phase-out calculation"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' }
                    ].map(status => (
                        <button
                            key={status.value}
                            onClick={() => setFilingStatus(status.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filingStatus === status.value
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" /> Traditional IRA Calculator
                </h2>
                <p className="text-sm text-indigo-800">Calculate growth, tax deductions, and Required Minimum Distributions.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.totalContributions}
                            gain={result.totalGrowth}
                            total={result.finalBalance}
                            currency={currency}
                            labels={{ invested: "Total Contributions", gain: "Investment Growth", total: "IRA Balance at Retirement" }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`border p-4 rounded-xl text-center ${result.isFullyDeductible ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: result.isFullyDeductible ? '#059669' : '#d97706' }}>
                                    Tax Deductible
                                </p>
                                <p className="text-xl font-bold" style={{ color: result.isFullyDeductible ? '#059669' : '#d97706' }}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.deductibleAmount)}
                                </p>
                                <p className="text-[10px] mt-1" style={{ color: result.isFullyDeductible ? '#059669' : '#d97706' }}>
                                    {result.isFullyDeductible ? 'Fully deductible' : 'Partially deductible'}
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Annual Tax Savings</p>
                                <p className="text-xl font-bold text-blue-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.taxSavings)}
                                </p>
                                <p className="text-[10px] text-blue-500 mt-1">Est. at 22% tax bracket</p>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                            <p className="text-sm font-bold text-purple-900 mb-2">Required Minimum Distribution (RMD)</p>
                            <div className="text-center">
                                <p className="text-xs text-purple-600">First RMD at age {result.rmdAge}</p>
                                <p className="text-xl font-bold text-purple-700 mt-1">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.firstRMD)}
                                </p>
                                <p className="text-[10px] text-purple-500 mt-1">Estimated mandatory withdrawal</p>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">IRA Growth Projection</h3>
                        <FinancialCompoundingBarChart
                            data={result.yearlyData}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['traditional-ira-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
