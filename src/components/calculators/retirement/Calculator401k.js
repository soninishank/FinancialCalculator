import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Briefcase } from 'lucide-react';

export default function Calculator401k({ currency = 'USD' }) {
    const [currentSalary, setCurrentSalary] = useState(60000);
    const [contributionPercent, setContributionPercent] = useState(10);
    const [employerMatchPercent, setEmployerMatchPercent] = useState(50); // Match 50% of contributions
    const [employerMatchLimit, setEmployerMatchLimit] = useState(6); // Up to 6% of salary
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(65);
    const [annualReturn, setAnnualReturn] = useState(7);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [salaryIncrease, setSalaryIncrease] = useState(2); // Annual salary increase

    const result = useMemo(() => {
        const yearsToInvest = Math.max(0, retirementAge - currentAge);
        let balance = currentBalance;
        let totalEmployeeContribution = 0;
        let totalEmployerContribution = 0;
        let salary = currentSalary;
        let totalInterest = 0;

        const yearlyData = [];

        for (let i = 1; i <= yearsToInvest; i++) {
            const yearLabel = currentAge + i;

            // Employee Contribution
            const employeeContrib = salary * (contributionPercent / 100);

            // Employer Contribution
            // Match rule: e.g., 50% of employee contribution, UP TO 6% of salary
            const validMatchSalaryPercent = Math.min(contributionPercent, employerMatchLimit);
            const employerContrib = salary * (validMatchSalaryPercent / 100) * (employerMatchPercent / 100);

            const totalYearDeposit = employeeContrib + employerContrib;

            // Interest (Compounding)
            const interest = (balance + totalYearDeposit / 2) * (annualReturn / 100); // Approximation: deposits happen throughout year

            balance += totalYearDeposit + interest;
            totalEmployeeContribution += employeeContrib;
            totalEmployerContribution += employerContrib;
            totalInterest += interest;

            yearlyData.push({
                year: yearLabel,
                invested: totalEmployeeContribution + totalEmployerContribution, // Cumulative invested
                gain: balance - (totalEmployeeContribution + totalEmployerContribution + currentBalance),
                balance: balance,
                totalInvested: totalEmployeeContribution + totalEmployerContribution + currentBalance,
                growth: balance - (totalEmployeeContribution + totalEmployerContribution + currentBalance),
                salary: salary,
                employeeContrib,
                employerContrib
            });

            // Salary Hike for next year
            salary = salary * (1 + salaryIncrease / 100);
        }

        return {
            finalBalance: balance,
            totalEmployeeContribution,
            totalEmployerContribution,
            totalInterest,
            yearlyData
        };
    }, [currentSalary, contributionPercent, employerMatchPercent, employerMatchLimit, currentAge, retirementAge, annualReturn, currentBalance, salaryIncrease]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Current Annual Salary"
                value={currentSalary}
                onChange={setCurrentSalary}
                min={20000}
                max={500000}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Current 401(k) Balance"
                value={currentBalance}
                onChange={setCurrentBalance}
                min={0}
                max={1000000}
                step={1000}
                currency={currency}
            />

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
                    max={75}
                    step={1}
                    suffix=" Years"
                />
            </div>

            <InputWithSlider
                label="Your Contribution (%)"
                value={contributionPercent}
                onChange={setContributionPercent}
                min={1}
                max={30} // IRS limits exist, but let's keep it flexible
                step={1}
                symbol="%"
                helperText="Percentage of salary you save."
            />

            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Employer Match (%)"
                    value={employerMatchPercent}
                    onChange={setEmployerMatchPercent}
                    min={0}
                    max={100}
                    step={10}
                    symbol="%"
                    helperText="% of your contribution matched."
                />
                <InputWithSlider
                    label="Match Limit (%)"
                    value={employerMatchLimit}
                    onChange={setEmployerMatchLimit}
                    min={0}
                    max={15}
                    step={1}
                    symbol="%"
                    helperText="Up to % of salary."
                />
            </div>

            <InputWithSlider
                label="Annual Salary Increase"
                value={salaryIncrease}
                onChange={setSalaryIncrease}
                min={0}
                max={10}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Expected Annual Return"
                value={annualReturn}
                onChange={setAnnualReturn}
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
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> 401(k) Retirement Calculator
                </h2>
                <p className="text-sm text-blue-800">Plan your retirement with employer matching and compound growth.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.totalEmployeeContribution + result.totalEmployerContribution + currentBalance}
                            gain={result.totalInterest}
                            total={result.finalBalance}
                            currency={currency}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <p className="text-[10px] md:text-xs text-indigo-600 font-bold uppercase mb-1">Your Contribution</p>
                                <p className="text-sm md:text-lg font-bold text-indigo-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.totalEmployeeContribution)}
                                </p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-[10px] md:text-xs text-emerald-600 font-bold uppercase mb-1">Employer Match</p>
                                <p className="text-sm md:text-lg font-bold text-emerald-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.totalEmployerContribution)}
                                </p>
                            </div>
                        </div>
                    </div>
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                details={calculatorDetails['401k-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
