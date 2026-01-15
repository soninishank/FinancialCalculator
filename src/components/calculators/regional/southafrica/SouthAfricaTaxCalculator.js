import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { ShieldCheck } from 'lucide-react';

// South Africa SARS Tax 2024/25 (Individuals)
const SA_TAX_BRACKETS = [
    { limit: 237100, rate: 0.18, base: 0 },
    { limit: 370500, rate: 0.26, base: 42678 },
    { limit: 512800, rate: 0.31, base: 77362 },
    { limit: 673000, rate: 0.36, base: 121475 },
    { limit: 857900, rate: 0.39, base: 179147 },
    { limit: 1817000, rate: 0.41, base: 251258 },
    { limit: Infinity, rate: 0.45, base: 644489 }
];

// Tax Rebates 2024/25
const PRIMARY_REBATE = 17235;

export default function SouthAfricaTaxCalculator({ currency = 'ZAR' }) {
    const [annualSalary, setAnnualSalary] = useState(450000);
    const [medicalAidMembers, setMedicalAidMembers] = useState(1);

    const result = useMemo(() => {
        const gross = annualSalary;

        // 1. Income Tax Calculation
        let tax = 0;
        let prevLimit = 0;
        for (let b of SA_TAX_BRACKETS) {
            if (gross > prevLimit) {
                const incomeInBracket = Math.min(gross, b.limit) - prevLimit;
                // South Africa uses a slightly different logic for 'base', but the progressive method works:
                // If gross > prevLimit, it applies the rate to current portion.
                // The SA brackets usually provide (Base + % of Amount over X).
                // My loop matches the standard progressive calculation.
                // Re-calculating using SA specific provided base for accuracy:
            }
        }

        // Let's use the SA-specific Base + % logic for literal accuracy
        const bracket = SA_TAX_BRACKETS.find((b, i) => gross <= b.limit || b.limit === Infinity);
        const bracketIndex = SA_TAX_BRACKETS.indexOf(bracket);
        const previousBracketLimit = bracketIndex > 0 ? SA_TAX_BRACKETS[bracketIndex - 1].limit : 0;
        tax = bracket.base + ((gross - previousBracketLimit) * bracket.rate);

        // 2. Rebates
        let totalRebate = PRIMARY_REBATE;

        // Medical Schemes Fees Tax Credit (Monthly -> Annual)
        // Main: 364, 1st Dep: 364, Add: 246
        let medicalCredit = 0;
        if (medicalAidMembers > 0) medicalCredit += 364; // Main
        if (medicalAidMembers > 1) medicalCredit += 364; // 1st Dep
        if (medicalAidMembers > 2) medicalCredit += 246 * (medicalAidMembers - 2);

        const annualMedicalCredit = medicalCredit * 12;

        tax = Math.max(0, tax - totalRebate - annualMedicalCredit);

        // 3. UIF (Unemployment Insurance Fund) - 1% capped
        const uifCap = 17712 * 12; // Monthly cap 17712
        const uif = Math.min(gross, uifCap) * 0.01;

        const netPay = gross - tax - uif;

        return {
            gross,
            tax,
            uif,
            medicalCredit: annualMedicalCredit,
            netPay,
            monthlyNet: netPay / 12
        };
    }, [annualSalary, medicalAidMembers]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={100000}
                max={2500000}
                step={10000}
                currency={currency}
            />
            <InputWithSlider
                label="Medical Aid Members"
                value={medicalAidMembers}
                onChange={setMedicalAidMembers}
                min={0}
                max={10}
                step={1}
                symbol=""
            />
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculates <strong>SARS</strong> tax for 2024/25.
                    Includes <strong>Primary Rebate</strong> and <strong>Medical Tax Credits</strong>.
                    Standard 1% <strong>UIF</strong> deduction applied.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" /> South Africa Tax (PAYE)
                </h2>
                <p className="text-sm text-blue-800">Calculate your net take-home pay in South Africa including SARS rebates.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(Math.round(result.monthlyNet))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.tax}
                            gain={result.uif}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax (SARS)", value: result.tax, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "UIF Contribution", value: result.uif, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-teal-50 p-4 rounded-lg flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                            <p className="text-xs text-teal-800">
                                <strong>Rebate Impact:</strong> Saving {new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(PRIMARY_REBATE + result.medicalCredit)} through primary rebates and medical credits.
                            </p>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">SARS Tax Analysis</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.tax}
                            fees={result.uif}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['south-africa-tax']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
