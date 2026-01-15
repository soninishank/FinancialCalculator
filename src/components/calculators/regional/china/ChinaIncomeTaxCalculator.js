import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { CreditCard } from 'lucide-react';

// Individual Income Tax (IIT) China 2024
const CHINA_STANDARD_DEDUCTION = 60000; // 5000 RMB * 12

const CHINA_IIT_BRACKETS = [
    { limit: 36000, rate: 0.03, deduction: 0 },
    { limit: 144000, rate: 0.10, deduction: 2520 },
    { limit: 300000, rate: 0.20, deduction: 16920 },
    { limit: 420000, rate: 0.25, deduction: 31920 },
    { limit: 660000, rate: 0.30, deduction: 52920 },
    { limit: 960000, rate: 0.35, deduction: 85920 },
    { limit: Infinity, rate: 0.45, deduction: 181920 }
];

export default function ChinaIncomeTaxCalculator({ currency = 'CNY' }) {
    const [monthlySalary, setMonthlySalary] = useState(20000);
    const [socialInsuranceRate, setSocialInsuranceRate] = useState(10.5); // Average 8% Pension + 2% Medical + 0.5% Unemployment

    const result = useMemo(() => {
        const annualGross = monthlySalary * 12;
        const socialInsuranceYearly = Math.min(annualGross, 38100 * 12) * (socialInsuranceRate / 100); // capped at approx 3x average

        const taxableIncome = Math.max(0, annualGross - socialInsuranceYearly - CHINA_STANDARD_DEDUCTION);

        // IIT Calculation
        let iit = 0;
        for (let b of CHINA_IIT_BRACKETS) {
            if (taxableIncome <= b.limit) {
                iit = (taxableIncome * b.rate) - b.deduction;
                break;
            }
        }
        iit = Math.max(0, iit);

        const netAnnual = annualGross - socialInsuranceYearly - iit;

        return {
            annualGross,
            socialInsuranceYearly,
            taxableIncome,
            iit,
            netAnnual,
            monthlyNet: netAnnual / 12
        };
    }, [monthlySalary, socialInsuranceRate]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Salary (Pre-tax)"
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={5000}
                max={200000}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Social Insurance (%)"
                value={socialInsuranceRate}
                onChange={setSocialInsuranceRate}
                min={0}
                max={25}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>5,000 RMB / month</strong> standard deduction.
                    Calculates Individual Income Tax (IIT) based on 2024 progressive brackets.
                    Social Insurance rates vary by city (avg 10.5% used).
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> China Income Tax Calculator
                </h2>
                <p className="text-sm text-red-800">Estimate your take-home pay in China (IIT) after social insurance.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Take-Home Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Annual Net: {new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.netAnnual))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.iit}
                            gain={result.socialInsuranceYearly}
                            total={result.netAnnual}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax (IIT)", value: result.iit, color: "text-red-700", bgColor: "" },
                                { label: "Social Insurance", value: result.socialInsuranceYearly, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Take-Home", value: result.netAnnual, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Standard Deduction</span>
                                <span className="font-semibold text-teal-600">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(CHINA_STANDARD_DEDUCTION)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Taxable Income</span>
                                <span className="font-semibold text-gray-800">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.taxableIncome))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-t mt-2 pt-2">
                                <span className="text-gray-600">Individual Income Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.iit))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Social Insurance</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.socialInsuranceYearly))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net Income</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Math.round(result.netAnnual))}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">China Income Distribution</h3>
                        <FinancialLoanPieChart
                            principal={result.netAnnual}
                            totalInterest={result.iit}
                            fees={result.socialInsuranceYearly}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Tax vs Social Insurance
                        </div>
                    </div>
                }
                details={calculatorDetails['china-income-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
