import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Map } from 'lucide-react';

const CANADA_TAX_YEAR = "2024";

// Federal Brackets 2024
const FED_BRACKETS = [
    { limit: 55867, rate: 0.15 },
    { limit: 111733, rate: 0.205 },
    { limit: 173205, rate: 0.26 },
    { limit: 246752, rate: 0.29 },
    { limit: Infinity, rate: 0.33 }
];

// Average Provincial Tax Rates (Simplified)
// In reality, each province has its own brackets.
const PROVINCIAL_RATES = {
    'ON': 0.10, // Ontario average
    'BC': 0.09, // BC average
    'QC': 0.15, // Quebec (higher)
    'AB': 0.11, // Alberta
};

export default function CanadaIncomeTaxCalculator({ currency = 'CAD' }) {
    const [grossSalary, setGrossSalary] = useState(75000);
    const [province, setProvince] = useState('ON');
    const [rrspContribution, setRrspContribution] = useState(0);

    const result = useMemo(() => {
        const annualGross = grossSalary;
        const taxableIncome = Math.max(0, annualGross - rrspContribution);

        // Federal Tax Calculation
        let fedTax = 0;
        let prevLimit = 0;
        for (let b of FED_BRACKETS) {
            if (taxableIncome > prevLimit) {
                const incomeInBracket = Math.min(taxableIncome, b.limit) - prevLimit;
                fedTax += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // Basic Personal Amount (Federal) ~15,705 credit at 15%
        const bpaCredit = 15705 * 0.15;
        fedTax = Math.max(0, fedTax - bpaCredit);

        // Provincial Tax (Simplified)
        const provTax = taxableIncome * (PROVINCIAL_RATES[province] || 0.10);

        // CPP and EI (Simplified)
        // CPP Max 2024: $3,867.50
        // EI Max 2024: $1,049.12
        const cpp = Math.min(3867.50, taxableIncome * 0.0595);
        const ei = Math.min(1049.12, taxableIncome * 0.0166);

        const totalTax = fedTax + provTax + cpp + ei;
        const netPay = annualGross - totalTax - rrspContribution;

        return {
            annualGross,
            rrspContribution,
            fedTax,
            provTax,
            cpp,
            ei,
            totalTax,
            netPay,
            monthlyNet: netPay / 12,
            biweeklyNet: netPay / 26
        };
    }, [grossSalary, province, rrspContribution]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={grossSalary}
                onChange={setGrossSalary}
                min={30000}
                max={500000}
                step={5000}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Province</label>
                <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                </select>
            </div>

            <InputWithSlider
                label="RRSP Contribution"
                value={rrspContribution}
                onChange={setRrspContribution}
                min={0}
                max={31560} // Max RRSP 2024
                step={500}
                currency={currency}
            />

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Based on <strong>{CANADA_TAX_YEAR}</strong> Federal brackets.
                    Provincial taxes use an <strong>average estimated rate</strong> for simplicity.
                    CPP/EI calculated at standard 2024 rates.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <Map className="w-5 h-5" /> Canada Income Tax Calculator
                </h2>
                <p className="text-sm text-red-800">Estimate your Canadian take-home pay including Federal, Provincial, CPP, and EI.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.monthlyNet)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Bi-Weekly: {new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.biweeklyNet)}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.fedTax + result.provTax}
                            gain={result.cpp + result.ei + result.rrspContribution}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Total Income Tax", value: result.fedTax + result.provTax, color: "text-red-700", bgColor: "" },
                                { label: "CPP + EI + RRSP", value: result.cpp + result.ei + result.rrspContribution, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Federal Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.fedTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Provincial Tax (Est)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.provTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">CPP & EI</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.cpp + result.ei)}</span>
                            </div>
                            {result.rrspContribution > 0 && (
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-gray-600">RRSP Contribution</span>
                                    <span className="font-semibold text-teal-600">-{new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.rrspContribution)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Annual Net Pay</span>
                                <span className="text-teal-700">{new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(result.netPay)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Deductions Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.fedTax + result.provTax}
                            fees={result.cpp + result.ei + result.rrspContribution}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Tax vs Mandatory Deductions
                        </div>
                    </div>
                }
                details={calculatorDetails['canada-income-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
