import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

// Simplified Switzerland Tax for 2024
// In Switzerland, taxes are Federal, Cantonal, and Communal.
// Rates vary significantly by Canton (e.g., Zug is low, Zurich/Geneva higher).
const CANTON_RATES = {
    'ZH': 0.11, // Zurich (Cantonal + Communal avg)
    'GE': 0.15, // Geneva
    'ZG': 0.05, // Zug (Low tax)
    'BS': 0.13, // Basel-Stadt
};

// Federal Tax (Single, 2024 simplified)
const FEDERAL_BRACKETS = [
    { limit: 14500, rate: 0 },
    { limit: 31600, rate: 0.0077 },
    { limit: 41400, rate: 0.0088 },
    { limit: 55200, rate: 0.0264 },
    { limit: 72500, rate: 0.0297 },
    { limit: 755500, rate: 0.115 }, // simplified high end
    { limit: Infinity, rate: 0.115 }
];

// Social Security (AHV/IV/EO) + ALV
const SOCIAL_SECURITY_RATE = 0.064; // Employee part approx 6.4%

export default function SwitzerlandIncomeTaxCalculator({ currency = 'CHF' }) {
    const [annualSalary, setAnnualSalary] = useState(100000);
    const [canton, setCanton] = useState('ZH');

    const result = useMemo(() => {
        const gross = annualSalary;

        // 1. Social Security (AHV etc.)
        const socialSecurity = gross * SOCIAL_SECURITY_RATE;
        const taxableIncome = Math.max(0, gross - socialSecurity);

        // 2. Federal Tax Calculation
        let fedTax = 0;
        let prevLimit = 0;
        for (let b of FEDERAL_BRACKETS) {
            if (taxableIncome > prevLimit) {
                const incomeInBracket = Math.min(taxableIncome, b.limit) - prevLimit;
                fedTax += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // 3. Cantonal & Communal Tax (Simplified Average)
        const cantonRate = CANTON_RATES[canton] || 0.11;
        const cantonTax = taxableIncome * cantonRate;

        const totalTax = fedTax + cantonTax;
        const netPay = gross - socialSecurity - totalTax;

        return {
            gross,
            socialSecurity,
            fedTax,
            cantonTax,
            totalTax,
            netPay,
            monthlyNet: netPay / 12
        };
    }, [annualSalary, canton]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Salary (Gross)"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={50000}
                max={500000}
                step={5000}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Canton</label>
                <select
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                    <option value="ZH">Zurich (ZH)</option>
                    <option value="GE">Geneva (GE)</option>
                    <option value="ZG">Zug (ZG) - Lower Tax</option>
                    <option value="BS">Basel-Stadt (BS)</option>
                </select>
                <p className="text-xs text-gray-400">Tax rates vary significantly between cantons.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>Federal Tax</strong>, estimated <strong>Cantonal & Communal Tax</strong>,
                    and <strong>AHV/IV/EO/ALV</strong> social security.
                    Deductions (Professional, Insurance) are not fully modeled.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> Switzerland Income Tax Calculator
                </h2>
                <p className="text-sm text-red-800">Calculate your Swiss take-home pay including Federal and Cantonal taxes.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Annual Net: {new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.netPay))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.totalTax}
                            gain={result.socialSecurity}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Total Income Tax", value: result.totalTax, color: "text-red-700", bgColor: "" },
                                { label: "Social Security", value: result.socialSecurity, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Federal Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.fedTax))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Cantonal & Communal Tax (Est)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.cantonTax))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-t mt-2 pt-2">
                                <span className="text-gray-600">Social Security (AHV etc.)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.socialSecurity))}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net Income</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(Math.round(result.netPay))}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Swiss Tax Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.totalTax}
                            fees={result.socialSecurity}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Tax vs Social Security
                        </div>
                    </div>
                }
                details={calculatorDetails['switzerland-income-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
