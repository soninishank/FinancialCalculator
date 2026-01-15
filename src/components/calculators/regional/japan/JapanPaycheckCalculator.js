import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Building2 } from 'lucide-react';

// Simplified Japan Tax/Insurance for 2024
// Social Insurance (approx 15% for employee)
// - Health Insurance: ~5%
// - Pension: ~9.15% (for Employees' Pension Insurance)
// - Employment Insurance: ~0.6%
const SOCIAL_INSURANCE_RATE = 0.1475; // Approx total for employee

// Income Tax (Simplified brackets)
const JP_INCOME_TAX_BRACKETS = [
    { limit: 1950000, rate: 0.05, deduction: 0 },
    { limit: 3300000, rate: 0.10, deduction: 97500 },
    { limit: 6950000, rate: 0.20, deduction: 427500 },
    { limit: 9000000, rate: 0.23, deduction: 636000 },
    { limit: 18000000, rate: 0.33, deduction: 1536000 },
    { limit: 40000000, rate: 0.40, deduction: 2796000 },
    { limit: Infinity, rate: 0.45, deduction: 4796000 }
];

export default function JapanPaycheckCalculator({ currency = 'JPY' }) {
    const [monthlySalary, setMonthlySalary] = useState(400000); // 400k Yen/month
    const [bonusMonths, setBonusMonths] = useState(2); // 2 months bonus/year

    const result = useMemo(() => {
        const annualGross = (monthlySalary * 12) + (monthlySalary * bonusMonths);

        // 1. Social Insurance
        const socialInsurance = annualGross * SOCIAL_INSURANCE_RATE;

        // 2. Employment Income Deduction (Simplified)
        // This is a complex formula in JP, but we'll use a rough estimate
        let incomeDeduction = 0;
        if (annualGross <= 1800000) incomeDeduction = annualGross * 0.4 - 100000;
        else if (annualGross <= 3600000) incomeDeduction = annualGross * 0.3 + 80000;
        else if (annualGross <= 6600000) incomeDeduction = annualGross * 0.2 + 440000;
        else if (annualGross <= 8500000) incomeDeduction = annualGross * 0.1 + 1100000;
        else incomeDeduction = 1950000; // Max

        const taxableBase = Math.max(0, annualGross - socialInsurance - incomeDeduction - 480000); // 480k basic deduction

        // 3. National Income Tax
        let incomeTax = 0;
        for (let b of JP_INCOME_TAX_BRACKETS) {
            if (taxableBase <= b.limit) {
                incomeTax = (taxableBase * b.rate) - b.deduction;
                break;
            }
        }
        incomeTax = Math.max(0, incomeTax);

        // 4. Resident Tax (Approx 10% of previous year's taxable base)
        const residentTax = taxableBase * 0.10;

        const totalDeductions = socialInsurance + incomeTax + residentTax;
        const netAnnual = annualGross - totalDeductions;

        return {
            annualGross,
            socialInsurance,
            incomeTax,
            residentTax,
            netAnnual,
            monthlyNet: netAnnual / 12,
            monthlyGross: annualGross / 12
        };
    }, [monthlySalary, bonusMonths]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Gross Salary"
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={150000}
                max={2000000}
                step={10000}
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
                    Includes estimates for <strong>Health Insurance</strong>, <strong>Welfare Pension</strong>,
                    <strong>National Income Tax</strong>, and <strong>Resident Tax (10%)</strong>.
                    Deductions are simplified for general estimation.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Japan Paycheck Calculator
                </h2>
                <p className="text-sm text-purple-800">Estimate your take-home pay in Japan after social insurance and taxes.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Estimated Monthly Take-Home (Incl. Bonus Avg)</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Annual Net: {new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.netAnnual))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.socialInsurance}
                            gain={result.incomeTax + result.residentTax}
                            total={result.netAnnual}
                            currency={currency}
                            customMetrics={[
                                { label: "Social Insurance", value: result.socialInsurance, color: "text-red-700", bgColor: "" },
                                { label: "Income + Resident Tax", value: result.incomeTax + result.residentTax, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Take-Home", value: result.netAnnual, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Annual Gross (w/ Bonus)</span>
                                <span className="font-semibold">{new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.annualGross))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Social Insurance</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.socialInsurance))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Income Tax (National)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.incomeTax))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Resident Tax (Approx)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.residentTax))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net (Approx)</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(Math.round(result.netAnnual))}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Japan Salary Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netAnnual}
                            totalInterest={result.socialInsurance}
                            fees={result.incomeTax + result.residentTax}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Insurance vs Taxes
                        </div>
                    </div>
                }
                details={calculatorDetails['japan-paycheck']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
