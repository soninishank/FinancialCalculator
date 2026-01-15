import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

// India Income Tax FY 2024-25 (AY 2025-26)
const NEW_REGIME_BRACKETS = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

const OLD_REGIME_BRACKETS = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

export default function IndiaIncomeTaxCalculator({ currency = 'INR' }) {
    const [annualSalary, setAnnualSalary] = useState(1200000);
    const [deductions, setDeductions] = useState(150000); // 80C etc for old regime
    const [hra, setHra] = useState(0);

    const calculateTax = (income, brackets, rebateLimit = 0) => {
        let tax = 0;
        let prevLimit = 0;
        for (let b of brackets) {
            if (income > prevLimit) {
                const incomeInBracket = Math.min(income, b.limit) - prevLimit;
                tax += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // Rebate u/s 87A
        if (income <= rebateLimit) {
            tax = 0;
        }

        // Health & Education Cess (4%)
        return tax * 1.04;
    };

    const result = useMemo(() => {
        // New Regime (FY 24-25 Budget updates)
        const standardDeduction = 75000;
        const taxableNew = Math.max(0, annualSalary - standardDeduction);
        const taxNew = calculateTax(taxableNew, NEW_REGIME_BRACKETS, 700000); // Rebate up to 7L in new regime

        // Old Regime
        const standardDeductionOld = 50000;
        const totalOldDeductions = standardDeductionOld + deductions + hra;
        const taxableOld = Math.max(0, annualSalary - totalOldDeductions);
        const taxOld = calculateTax(taxableOld, OLD_REGIME_BRACKETS, 500000); // Rebate up to 5L in old regime

        return {
            annualSalary,
            newRegime: {
                taxableIncome: taxableNew,
                tax: taxNew,
                netPay: annualSalary - taxNew
            },
            oldRegime: {
                taxableIncome: taxableOld,
                tax: taxOld,
                netPay: annualSalary - taxOld
            }
        };
    }, [annualSalary, deductions, hra]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={200000}
                max={5000000}
                step={10000}
                currency={currency}
            />

            <div className="p-4 bg-gray-50 rounded-xl border border-teal-100">
                <p className="text-sm font-bold text-teal-800 mb-2">Old Regime Only:</p>
                <div className="space-y-4">
                    <InputWithSlider
                        label="Deductions (80C, 80D, etc.)"
                        value={deductions}
                        onChange={setDeductions}
                        min={0}
                        max={300000}
                        step={5000}
                        currency={currency}
                    />
                    <InputWithSlider
                        label="HRA / Rent Exemption"
                        value={hra}
                        onChange={setHra}
                        min={0}
                        max={500000}
                        step={5000}
                        currency={currency}
                    />
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculations based on <strong>FY 2024-25 / AY 2025-26</strong>.
                    Includes <strong>Standard Deduction</strong> (New: 75k, Old: 50k) and <strong>4% Cess</strong>.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> India Income Tax (New vs Old)
                </h2>
                <p className="text-sm text-orange-800">Compare your take-home pay under the New and Old tax regimes for 2024-25.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border transition-all ${result.newRegime.tax <= result.oldRegime.tax ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase">New Regime</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Math.round(result.newRegime.netPay / 12))}
                                    <span className="text-xs block font-normal text-gray-400">/ month</span>
                                </p>
                                {result.newRegime.tax <= result.oldRegime.tax && <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                            </div>
                            <div className={`p-4 rounded-xl border transition-all ${result.oldRegime.tax < result.newRegime.tax ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase">Old Regime</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Math.round(result.oldRegime.netPay / 12))}
                                    <span className="text-xs block font-normal text-gray-400">/ month</span>
                                </p>
                                {result.oldRegime.tax < result.newRegime.tax && <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                            </div>
                        </div>

                        <UnifiedSummary
                            invested={result.newRegime.tax}
                            gain={result.oldRegime.tax}
                            total={result.newRegime.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "New Regime Tax", value: result.newRegime.tax, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "Old Regime Tax", value: result.oldRegime.tax, color: "text-indigo-700", bgColor: "bg-indigo-50/30" },
                                { label: "Monthly Net (Best)", value: Math.max(result.newRegime.netPay, result.oldRegime.netPay) / 12, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                            <p className="text-xs text-blue-800">
                                <strong>Comparison:</strong> {result.newRegime.tax <= result.oldRegime.tax
                                    ? `New Regime saves you ${new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Math.round(result.oldRegime.tax - result.newRegime.tax))} annually.`
                                    : `Old Regime saves you ${new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Math.round(result.newRegime.tax - result.oldRegime.tax))} annually.`}
                            </p>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Taxes: New vs Old</h3>
                        <div className="flex items-end justify-center gap-8 h-48 bg-gray-50 rounded-2xl p-6">
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="bg-red-500 w-12 rounded-t-lg transition-all duration-1000"
                                    style={{ height: `${(result.newRegime.tax / Math.max(result.newRegime.tax, result.oldRegime.tax)) * 100}%`, minHeight: '10px' }}
                                ></div>
                                <span className="text-[10px] font-bold text-gray-500">New</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="bg-indigo-500 w-12 rounded-t-lg transition-all duration-1000"
                                    style={{ height: `${(result.oldRegime.tax / Math.max(result.newRegime.tax, result.oldRegime.tax)) * 100}%`, minHeight: '10px' }}
                                ></div>
                                <span className="text-[10px] font-bold text-gray-500">Old</span>
                            </div>
                        </div>
                    </div>
                }
                details={calculatorDetails['india-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
