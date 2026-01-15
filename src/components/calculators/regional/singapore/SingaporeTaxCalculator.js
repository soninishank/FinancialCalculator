import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Building2 } from 'lucide-react';

// Singapore Income Tax (Resident) 2024
// CPF Rates (Employee < 55)
const CPF_EMPLOYEE_RATE = 0.20;
const CPF_EMPLOYER_RATE = 0.17;
const CPF_WAGE_CEILING = 6800; // Monthly ceiling for 2024 (Jan 1)

const SG_TAX_BRACKETS = [
    { limit: 20000, rate: 0, base: 0 },
    { limit: 30000, rate: 0.02, base: 0 },
    { limit: 40000, rate: 0.035, base: 200 },
    { limit: 80000, rate: 0.07, base: 550 },
    { limit: 120000, rate: 0.115, base: 3350 },
    { limit: 160000, rate: 0.15, base: 7950 },
    { limit: 200000, rate: 0.18, base: 13950 },
    { limit: 240000, rate: 0.19, base: 21150 },
    { limit: 280000, rate: 0.195, base: 28750 },
    { limit: 320000, rate: 0.20, base: 36550 },
    { limit: 500000, rate: 0.22, base: 44550 },
    { limit: 1000000, rate: 0.23, base: 84150 },
    { limit: Infinity, rate: 0.24, base: 199150 }
];

export default function SingaporeTaxCalculator({ currency = 'SGD' }) {
    const [monthlySalary, setMonthlySalary] = useState(6000);
    const [bonusMonths, setBonusMonths] = useState(1);

    const result = useMemo(() => {
        const annualGross = monthlySalary * 12 + monthlySalary * bonusMonths;

        // CPF Calculation (assuming Singapore Resident)
        const monthlyCPF = Math.min(monthlySalary, CPF_WAGE_CEILING) * CPF_EMPLOYEE_RATE;
        const bonusCPF = Math.min(monthlySalary * bonusMonths, 102000 - Math.min(monthlySalary, CPF_WAGE_CEILING) * 12) * CPF_EMPLOYEE_RATE;
        const totalCPF = (monthlyCPF * 12) + bonusCPF;

        const employerCPF = (Math.min(monthlySalary, CPF_WAGE_CEILING) * CPF_EMPLOYER_RATE * 12) +
            (Math.min(monthlySalary * bonusMonths, 102000 - Math.min(monthlySalary, CPF_WAGE_CEILING) * 12) * CPF_EMPLOYER_RATE);

        const netAssessableIncome = Math.max(0, annualGross - totalCPF);

        // Income Tax
        let tax = 0;
        let prevLimit = 0;
        let baseTax = 0;
        for (let b of SG_TAX_BRACKETS) {
            if (netAssessableIncome > b.limit) {
                prevLimit = b.limit;
                baseTax = b.base + (b.limit - (SG_TAX_BRACKETS[SG_TAX_BRACKETS.indexOf(b) - 1]?.limit || 0)) * (SG_TAX_BRACKETS[SG_TAX_BRACKETS.indexOf(b) - 1]?.rate || 0);
                // base is actually pre-calculated in the obj usually, but we need the current bracket
            } else {
                // Bracket found
                const bracket = SG_TAX_BRACKETS[SG_TAX_BRACKETS.indexOf(b)];
                const incomeInBracket = netAssessableIncome - prevLimit;
                tax = b.base + (incomeInBracket * b.rate);
                break;
            }
        }

        const netPay = annualGross - totalCPF - tax;

        return {
            annualGross,
            totalCPF,
            employerCPF,
            taxableIncome: netAssessableIncome,
            incomeTax: tax,
            netPay,
            monthlyNet: netPay / 12
        };
    }, [monthlySalary, bonusMonths]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Basic Salary"
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={2000}
                max={50000}
                step={100}
                currency={currency}
            />
            <InputWithSlider
                label="Annual Bonus (Months)"
                value={bonusMonths}
                onChange={setBonusMonths}
                min={0}
                max={12}
                step={0.5}
                symbol=" months"
            />
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>CPF (20%)</strong> for employees under 55.
                    Calculates Personal Income Tax based on <strong>YA 2024</strong> resident rates.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Singapore Income Tax & CPF
                </h2>
                <p className="text-sm text-red-800">Calculate your CPF contributions and net take-home pay in Singapore.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Take-Home Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.totalCPF}
                            gain={result.incomeTax}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "CPF Contribution", value: result.totalCPF, color: "text-blue-700", bgColor: "bg-blue-50/30" },
                                { label: "Income Tax", value: result.incomeTax, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Annual Gross</span>
                                <span className="font-semibold">{new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(result.annualGross)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Employee CPF (20%)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(result.totalCPF)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Income Tax (Est)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(result.incomeTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Employer CPF (17%)</span>
                                <span className="text-teal-700">+{new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(result.employerCPF)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Singapore Salary Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.totalCPF}
                            fees={result.incomeTax}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs CPF vs Tax
                        </div>
                    </div>
                }
                details={calculatorDetails['singapore-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
