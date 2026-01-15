import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { HeartPulse } from 'lucide-react';

export default function HSACalculator({ currency = 'USD' }) {
    const [currentBalance, setCurrentBalance] = useState(5000);
    const [annualContribution, setAnnualContribution] = useState(4150); // 2024 Individual limit
    const [employerMatch, setEmployerMatch] = useState(500);
    const [annualExpenses, setAnnualExpenses] = useState(500);
    const [expectedReturn, setExpectedReturn] = useState(7);
    const [years, setYears] = useState(20);

    const result = useMemo(() => {
        let balance = currentBalance;
        const totalContributionPerYear = annualContribution + employerMatch;
        const netContributionPerYear = totalContributionPerYear - annualExpenses;

        const yearlyData = [];
        let totalInvested = currentBalance;

        for (let i = 1; i <= years; i++) {
            // End of year calculation
            // Simplified: Add contribution at start of year, then apply growth
            const startBalance = balance + netContributionPerYear;
            const growth = startBalance * (expectedReturn / 100);
            balance = startBalance + growth;
            totalInvested += netContributionPerYear;

            yearlyData.push({
                year: i,
                totalInvested: Math.round(totalInvested),
                growth: Math.round(balance - totalInvested),
                balance: Math.round(balance)
            });
        }

        return {
            finalBalance: balance,
            totalNetContributions: totalInvested,
            totalGrowth: balance - totalInvested,
            yearlyData
        };
    }, [currentBalance, annualContribution, employerMatch, annualExpenses, expectedReturn, years]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Current HSA Balance"
                value={currentBalance}
                onChange={setCurrentBalance}
                min={0}
                max={100000}
                step={500}
                currency={currency}
            />

            <InputWithSlider
                label="Annual Contribution"
                value={annualContribution}
                onChange={setAnnualContribution}
                min={0}
                max={8300} // 2024 Family limit
                step={100}
                currency={currency}
                helperText="2024 Limits: $4,150 Individual / $8,300 Family"
            />

            <InputWithSlider
                label="Employer Annual Match"
                value={employerMatch}
                onChange={setEmployerMatch}
                min={0}
                max={5000}
                step={50}
                currency={currency}
            />

            <InputWithSlider
                label="Annual Medical Expenses (Paid from HSA)"
                value={annualExpenses}
                onChange={setAnnualExpenses}
                min={0}
                max={10000}
                step={100}
                currency={currency}
                helperText="Withdrawals for medical costs reduce growth."
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
                label="Years to Grow"
                value={years}
                onChange={setYears}
                min={1}
                max={40}
                step={1}
                suffix=" Years"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5" /> HSA Growth Calculator
                </h2>
                <p className="text-sm text-emerald-800">Maximize your "Triple Tax-Advantaged" account. Project your future medical nest egg.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.totalNetContributions}
                            gain={result.totalGrowth}
                            total={result.finalBalance}
                            currency={currency}
                            labels={{ invested: "Total Net Contributions", gain: "Investment Growth", total: "Final HSA Balance" }}
                        />
                        <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-center">
                            <p className="text-xs text-teal-600 font-bold uppercase mb-1">Potential Tax Savings</p>
                            <p className="text-lg font-bold text-teal-700">
                                Estimated ~{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalNetContributions * 0.25)}
                            </p>
                            <p className="text-[10px] text-teal-500 mt-1">Assuming 25% effective tax bracket (Federal + State)</p>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">HSA Growth Projection</h3>
                        <FinancialCompoundingBarChart
                            data={result.yearlyData}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['hsa-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
