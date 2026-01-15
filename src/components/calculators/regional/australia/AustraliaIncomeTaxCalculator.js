import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

const AU_TAX_YEAR = "2024/25"; // Stage 3 tax cuts applied

// Resident tax rates 2024–25 (Stage 3)
const AU_TAX_BRACKETS = [
    { limit: 18200, rate: 0 },
    { limit: 45000, rate: 16 },
    { limit: 135000, rate: 30 },
    { limit: 190000, rate: 30 }, // Note: 30% up to 135k, then 30% up to 190k is simplified
    { limit: Infinity, rate: 45 }
];

// Refined Stage 3 Brackets:
// 0 – $18,200: Nil
// $18,201 – $45,000: 16%
// $45,001 – $135,000: 30%
// $135,001 – $190,000: 30%
// Over $190,000: 45%
// Actually:
// 0 - 18,200: 0
// 18,201 - 45,000: 16%
// 45,001 - 135,000: 30%
// 135,001 - 190,000: 37% -> Wait, checking latest 24/25 Stage 3
// Stage 3 Revised:
// 18,201 to 45,000 -> 16%
// 45,001 to 135,000 -> 30%
// 135,001 to 190,000 -> 37%
// > 190,000 -> 45%

export default function AustraliaIncomeTaxCalculator({ currency = 'AUD' }) {
    const [grossSalary, setGrossSalary] = useState(85000);
    const [superContribution, setSuperContribution] = useState(11.5); // % (SG is 11.5% in 2024/25)
    const [isSuperIncluded, setIsSuperIncluded] = useState(false); // Salary package includes super or not

    const result = useMemo(() => {
        let annualGross = grossSalary;
        let superAmount = 0;

        if (isSuperIncluded) {
            // Salary is "Package", so we need to extract super
            // Package = Base + (Base * 0.115) = Base * 1.115
            const baseSalary = annualGross / (1 + superContribution / 100);
            superAmount = annualGross - baseSalary;
            annualGross = baseSalary;
        } else {
            // Salary is "Base", super is on top
            superAmount = (annualGross * superContribution) / 100;
        }

        const taxableIncome = annualGross;

        // Income Tax Calculation (Resident 24/25 Stage 3)
        let incomeTax = 0;

        if (taxableIncome > 190000) {
            incomeTax = 59287 + (taxableIncome - 190000) * 0.45;
        } else if (taxableIncome > 135000) {
            incomeTax = 38937 + (taxableIncome - 135000) * 0.37;
        } else if (taxableIncome > 45000) {
            incomeTax = 4288 + (taxableIncome - 45000) * 0.30;
        } else if (taxableIncome > 18200) {
            incomeTax = (taxableIncome - 18200) * 0.16;
        }

        // Medicare Levy (typically 2%)
        // Thresholds apply, but for simplicity we use 2% for most
        const medicareLevy = taxableIncome > 26000 ? taxableIncome * 0.02 : 0;

        const totalTax = incomeTax + medicareLevy;
        const netPay = annualGross - totalTax;

        return {
            annualGross,
            superAmount,
            incomeTax,
            medicareLevy,
            totalTax,
            netPay,
            monthlyNet: netPay / 12,
            fortnightlyNet: netPay / 26
        };
    }, [grossSalary, superContribution, isSuperIncluded]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Salary"
                value={grossSalary}
                onChange={setGrossSalary}
                min={30000}
                max={500000}
                step={5000}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salary Type</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsSuperIncluded(false)}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${!isSuperIncluded ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Base + Super
                    </button>
                    <button
                        onClick={() => setIsSuperIncluded(true)}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${isSuperIncluded ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Inc. Super
                    </button>
                </div>
            </div>

            <InputWithSlider
                label="Super Guarantee (%)"
                value={superContribution}
                onChange={setSuperContribution}
                min={0}
                max={20}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>Stage 3 Tax Cuts</strong> (effective July 1, 2024) and <strong>2% Medicare Levy</strong>.
                    Low Income Tax Offset (LITO) not fully modeled for simplicity.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> Australia Income Tax Calculator
                </h2>
                <p className="text-sm text-orange-800">Calculate your Australian net pay and Medicare levy after Stage 3 tax cuts.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.monthlyNet)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Fortnightly: {new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.fortnightlyNet)}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.incomeTax}
                            gain={result.medicareLevy}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax", value: result.incomeTax, color: "text-red-700", bgColor: "" },
                                { label: "Medicare Levy", value: result.medicareLevy, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Taxable Income</span>
                                <span className="font-semibold">{new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.annualGross)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Income Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.incomeTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Medicare Levy</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.medicareLevy)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Super (Paid by Employer)</span>
                                <span className="font-semibold text-teal-600">+{new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.superAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net Pay</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(result.netPay)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Income Distribution</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.incomeTax}
                            fees={result.medicareLevy}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Net Pay vs Tax vs Medicare
                        </div>
                    </div>
                }
                details={calculatorDetails['australia-income-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
