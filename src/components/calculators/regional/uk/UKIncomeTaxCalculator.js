import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Wallet } from 'lucide-react';

const UK_TAX_YEAR = "2024/25";

// Standard Personal Allowance: £12,570
const PERSONAL_ALLOWANCE = 12570;

const UK_TAX_BRACKETS = [
    { limit: 12570, rate: 0 },
    { limit: 50270, rate: 20 },
    { limit: 125140, rate: 40 },
    { limit: Infinity, rate: 45 }
];

// National Insurance (Class 1) - Simplified for 2024/25
// Primary Threshold: £12,570 (£1,048/month)
// Main Rate: 8% (reduced from 10% in April 2024)
// Upper Earnings Limit: £50,270 (£4,189/month)
// Upper Rate: 2%
const NI_THRESHOLD = 12570;
const NI_UPPER_LIMIT = 50270;

export default function UKIncomeTaxCalculator({ currency = 'GBP' }) {
    const [grossSalary, setGrossSalary] = useState(35000);
    const [pensionContribution, setPensionContribution] = useState(5); // %

    const result = useMemo(() => {
        const annualGross = grossSalary;
        const pensionAmount = (annualGross * pensionContribution) / 100;
        const taxableIncomeBase = Math.max(0, annualGross - pensionAmount);

        // Personal Allowance Tapering: £1 for every £2 over £100k
        let adjustedPersonalAllowance = PERSONAL_ALLOWANCE;
        if (taxableIncomeBase > 100000) {
            const reduction = Math.floor((taxableIncomeBase - 100000) / 2);
            adjustedPersonalAllowance = Math.max(0, PERSONAL_ALLOWANCE - reduction);
        }

        const taxableIncomeAfterAllowance = Math.max(0, taxableIncomeBase - adjustedPersonalAllowance);

        // Income Tax Calculation
        let incomeTax = 0;
        let previousLimit = PERSONAL_ALLOWANCE; // Basic rate starts after PA

        // Note: Brackets are defined from £0, but 0-PA is 0%.
        // For simplicity with tapering, we calculate manually.
        if (taxableIncomeBase > adjustedPersonalAllowance) {
            const basicBand = Math.min(taxableIncomeBase, 50270) - adjustedPersonalAllowance;
            if (basicBand > 0) incomeTax += basicBand * 0.20;

            const higherBand = Math.min(taxableIncomeBase, 125140) - Math.max(adjustedPersonalAllowance, 50270);
            if (higherBand > 0) incomeTax += higherBand * 0.40;

            const additionalBand = taxableIncomeBase - Math.max(adjustedPersonalAllowance, 125140);
            if (additionalBand > 0) incomeTax += additionalBand * 0.45;
        }

        // National Insurance Calculation
        let ni = 0;
        if (annualGross > NI_THRESHOLD) {
            const mainBand = Math.min(annualGross, NI_UPPER_LIMIT) - NI_THRESHOLD;
            ni += mainBand * 0.08;

            const upperBand = Math.max(0, annualGross - NI_UPPER_LIMIT);
            ni += upperBand * 0.02;
        }

        const totalDeductions = incomeTax + ni + pensionAmount;
        const takeHomePay = annualGross - totalDeductions;

        return {
            annualGross,
            pensionAmount,
            incomeTax,
            ni,
            totalDeductions,
            takeHomePay,
            monthlyTakeHome: takeHomePay / 12,
            weeklyTakeHome: takeHomePay / 52
        };
    }, [grossSalary, pensionContribution]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={grossSalary}
                onChange={setGrossSalary}
                min={10000}
                max={250000}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Pension Contribution (%)"
                value={pensionContribution}
                onChange={setPensionContribution}
                min={0}
                max={50}
                step={1}
                symbol="%"
            />

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculations based on <strong>{UK_TAX_YEAR}</strong> tax year rules for England, Wales, and NI.
                    Includes Personal Allowance tapering and 8% NI rate.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> UK Income Tax Calculator
                </h2>
                <p className="text-sm text-teal-800">Estimate your take-home pay after Income Tax, National Insurance, and Pension.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Take-Home Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.monthlyTakeHome)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Weekly: {new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.weeklyTakeHome)}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.incomeTax}
                            gain={result.ni + result.pensionAmount}
                            total={result.takeHomePay}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax", value: result.incomeTax, color: "text-red-700", bgColor: "" },
                                { label: "NI + Pension", value: result.ni + result.pensionAmount, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Take-Home", value: result.takeHomePay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Annual Gross</span>
                                <span className="font-semibold">{new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.annualGross)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Income Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.incomeTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">National Insurance</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.ni)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Pension Contribution</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.pensionAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Total Deductions</span>
                                <span className="text-red-700">-{new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(result.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Gross Pay Distribution</h3>
                        <FinancialLoanPieChart
                            principal={result.takeHomePay}
                            totalInterest={result.incomeTax}
                            fees={result.ni + result.pensionAmount}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Take-Home vs Taxes vs Deductions
                        </div>
                    </div>
                }
                details={calculatorDetails['uk-income-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
