import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

const HK_TAX_YEAR = "2023/24";

// Progressive Rates (Simplified)
const PROGRESSIVE_BRACKETS = [
    { limit: 50000, rate: 0.02 },
    { limit: 100000, rate: 0.06 },
    { limit: 150000, rate: 0.10 },
    { limit: 200000, rate: 0.14 },
    { limit: Infinity, rate: 0.17 }
];

// Basic Allowance for Single person
const BASIC_ALLOWANCE = 132000;
// MPF Max 2024: $18,000/year (5% capped at $1,500/month)
const MPF_CAP_ANNUAL = 18000;

export default function HongKongSalaryTaxCalculator({ currency = 'HKD' }) {
    const [annualSalary, setAnnualSalary] = useState(500000);
    const [isMarried, setIsMarried] = useState(false);

    const result = useMemo(() => {
        const gross = annualSalary;
        const mpf = Math.min(MPF_CAP_ANNUAL, gross * 0.05);

        // Allowance
        const allowance = isMarried ? 264000 : 132000;
        const netChargeableIncome = Math.max(0, gross - mpf - allowance);

        // 1. Progressive Tax Calculation
        let progressiveTax = 0;
        let prevLimit = 0;
        for (let b of PROGRESSIVE_BRACKETS) {
            if (netChargeableIncome > prevLimit) {
                const incomeInBracket = Math.min(netChargeableIncome, b.limit) - prevLimit;
                progressiveTax += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // 2. Standard Tax Calculation (15% of gross income after MPF)
        const standardTax = (gross - mpf) * 0.15;

        // HK Tax is the lower of Progressive vs Standard
        const finalTaxBeforeReduction = Math.min(progressiveTax, standardTax);

        // Tax Reduction (assume $6,000 as per recent budget)
        const taxReduction = Math.min(6000, finalTaxBeforeReduction);
        const finalTax = Math.max(0, finalTaxBeforeReduction - taxReduction);

        const netPay = gross - mpf - finalTax;

        return {
            gross,
            mpf,
            allowance,
            netChargeableIncome,
            progressiveTax,
            standardTax,
            finalTax,
            netPay,
            monthlyNet: netPay / 12
        };
    }, [annualSalary, isMarried]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={150000}
                max={2000000}
                step={10000}
                currency={currency}
            />

            <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Filing Status</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setIsMarried(false)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${!isMarried ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500'}`}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => setIsMarried(true)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${isMarried ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500'}`}
                    >
                        Married
                    </button>
                </div>
                <p className="text-xs text-gray-400">Allowance: Single (HK$132k), Married (HK$264k)</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>MPF (5%)</strong> deduction, <strong>Basic Allowance</strong>,
                    and compares <strong>Progressive vs. Standard Tax Rates</strong>.
                    Applies estimated HK$6,000 tax reduction.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> Hong Kong Salary Tax Calculator
                </h2>
                <p className="text-sm text-blue-800">Calculate your HK net income after MPF and Salaries Tax.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Annual Net: {new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.netPay))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.finalTax}
                            gain={result.mpf}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Salaries Tax", value: result.finalTax, color: "text-red-700", bgColor: "" },
                                { label: "MPF Contribution", value: result.mpf, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Total Allowance</span>
                                <span className="font-semibold text-teal-600">{new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(result.allowance)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Net Chargeable Income</span>
                                <span className="font-semibold">{new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.netChargeableIncome))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-t mt-2 pt-2">
                                <span className="text-gray-600">Salaries Tax (Lower of Std/Prog)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.finalTax))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">MPF Contribution</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.mpf))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net Income</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('zh-HK', { style: 'currency', currency }).format(Math.round(result.netPay))}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Net Income Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.finalTax}
                            fees={result.mpf}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Tax vs MPF
                        </div>
                    </div>
                }
                details={calculatorDetails['hongkong-salary-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
