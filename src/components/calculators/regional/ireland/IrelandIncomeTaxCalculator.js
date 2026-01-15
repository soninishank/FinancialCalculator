import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

// Ireland PAYE 2024
const IE_TAX_BRACKETS = [
    { limit: 42000, rate: 0.20 }, // Single person
    { limit: Infinity, rate: 0.40 }
];

// USCRates 2024
const USC_BRACKETS = [
    { limit: 12012, rate: 0.005 },
    { limit: 25760, rate: 0.02 },
    { limit: 70044, rate: 0.04 },
    { limit: Infinity, rate: 0.08 }
];

const PRSI_RATE = 0.04; // Class A employee (will change to 4.1% in Oct 2024, using 4% for now)

export default function IrelandIncomeTaxCalculator({ currency = 'EUR' }) {
    const [annualSalary, setAnnualSalary] = useState(55000);
    const [pensionContribution, setPensionContribution] = useState(5);

    const result = useMemo(() => {
        const gross = annualSalary;
        const pensionAmount = (gross * pensionContribution) / 100;
        const taxableIncome = Math.max(0, gross - pensionAmount);

        // 1. PAYE (Income Tax)
        let paye = 0;
        if (taxableIncome <= 42000) {
            paye = taxableIncome * 0.20;
        } else {
            paye = (42000 * 0.20) + (taxableIncome - 42000) * 0.40;
        }

        // Standard Tax Credits (Single: Personal €1,875 + PAYE €1,875)
        const taxCredits = 1875 + 1875;
        paye = Math.max(0, paye - taxCredits);

        // 2. USC (Universal Social Charge)
        let usc = 0;
        let prevLimit = 0;
        for (let b of USC_BRACKETS) {
            if (gross > prevLimit) {
                const incomeInBracket = Math.min(gross, b.limit) - prevLimit;
                usc += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // 3. PRSI (Social Insurance)
        const prsi = gross * PRSI_RATE;

        const totalDeductions = paye + usc + prsi + pensionAmount;
        const netPay = gross - totalDeductions;

        return {
            gross,
            paye,
            usc,
            prsi,
            pensionAmount,
            totalDeductions,
            netPay,
            monthlyNet: netPay / 12
        };
    }, [annualSalary, pensionContribution]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={20000}
                max={250000}
                step={1000}
                currency={currency}
            />
            <InputWithSlider
                label="Pension Contribution (%)"
                value={pensionContribution}
                onChange={setPensionContribution}
                min={0}
                max={30}
                step={1}
                symbol="%"
            />
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Includes <strong>PAYE</strong>, <strong>USC</strong>, and <strong>PRSI (4%)</strong> for 2024.
                    Standard credits for a single person (€3,750) applied.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> Ireland Income Tax (PAYE)
                </h2>
                <p className="text-sm text-green-800">Estimate your take-home pay in Ireland after Tax, USC, and PRSI.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.paye}
                            gain={result.usc + result.prsi + result.pensionAmount}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax (PAYE)", value: result.paye, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "USC + PRSI + Pension", value: result.usc + result.prsi + result.pensionAmount, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">PAYE Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(result.paye)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">USC Charge</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(result.usc)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">PRSI Contribution</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(result.prsi)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Ireland Tax Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.paye}
                            fees={result.usc + result.prsi + result.pensionAmount}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['ireland-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
