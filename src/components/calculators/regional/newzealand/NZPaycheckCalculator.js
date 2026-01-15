import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Wallet } from 'lucide-react';

// New Zealand Income Tax (PAYE) 2024/25
const NZ_TAX_BRACKETS = [
    { limit: 14000, rate: 0.105 },
    { limit: 48000, rate: 0.175 },
    { limit: 70000, rate: 0.30 },
    { limit: 180000, rate: 0.33 },
    { limit: Infinity, rate: 0.39 }
];

const ACC_LEVY_RATE = 0.016; // 1.6% for 2024/25
const ACC_EARNINGS_CAP = 142283;

export default function NZPaycheckCalculator({ currency = 'NZD' }) {
    const [annualSalary, setAnnualSalary] = useState(75000);
    const [kiwiSaverRate, setKiwiSaverRate] = useState(3); // 3%, 4%, 6%, 8%, 10%
    const [studentLoan, setStudentLoan] = useState(false);

    const result = useMemo(() => {
        const gross = annualSalary;

        // 1. Income Tax (PAYE)
        let incomeTax = 0;
        let prevLimit = 0;
        for (let b of NZ_TAX_BRACKETS) {
            if (gross > prevLimit) {
                const incomeInBracket = Math.min(gross, b.limit) - prevLimit;
                incomeTax += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // 2. ACC Levy
        const accLevy = Math.min(gross, ACC_EARNINGS_CAP) * ACC_LEVY_RATE;

        // 3. KiwiSaver (Employee)
        const kiwiSaverAmount = (gross * kiwiSaverRate) / 100;

        // 4. Student Loan Repayment (12% over threshold)
        const studentLoanThreshold = 24128;
        const studentLoanRepayment = studentLoan && gross > studentLoanThreshold
            ? (gross - studentLoanThreshold) * 0.12
            : 0;

        const totalDeductions = incomeTax + accLevy + kiwiSaverAmount + studentLoanRepayment;
        const netPay = gross - totalDeductions;

        return {
            gross,
            incomeTax,
            accLevy,
            kiwiSaverAmount,
            studentLoanRepayment,
            totalDeductions,
            netPay,
            monthlyNet: netPay / 12,
            fortnightlyNet: netPay / 26
        };
    }, [annualSalary, kiwiSaverRate, studentLoan]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={30000}
                max={300000}
                step={1000}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">KiwiSaver Contribution (%)</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[0, 3, 4, 6, 8, 10].map(rate => (
                        <button
                            key={rate}
                            onClick={() => setKiwiSaverRate(rate)}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all shrink-0 ${kiwiSaverRate === rate ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            {rate}%
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">Student Loan</span>
                    <span className="text-xs text-gray-400">12% over $24,128</span>
                </div>
                <button
                    onClick={() => setStudentLoan(!studentLoan)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${studentLoan ? 'bg-teal-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${studentLoan ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculations based on <strong>2024/25</strong> PAYE tax rates.
                    Includes <strong>1.6% ACC Levy</strong>.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-teal-400" /> New Zealand PAYE Calculator
                </h2>
                <p className="text-sm text-gray-400">Estimate your NZ take-home pay after PAYE, ACC, and KiwiSaver.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Fortnightly Take-Home Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(Math.round(result.fortnightlyNet))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.incomeTax}
                            gain={result.accLevy + result.kiwiSaverAmount + result.studentLoanRepayment}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "Income Tax", value: result.incomeTax, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "Deductions", value: result.accLevy + result.kiwiSaverAmount + result.studentLoanRepayment, color: "text-gray-700", bgColor: "bg-gray-50/30" },
                                { label: "Annual Net Pay", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">PAYE Income Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(result.incomeTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">ACC Earner Levy</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(result.accLevy)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">KiwiSaver ({kiwiSaverRate}%)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(result.kiwiSaverAmount)}</span>
                            </div>
                            {studentLoan && (
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-gray-600">Student Loan</span>
                                    <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(result.studentLoanRepayment)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Total Deductions</span>
                                <span className="text-red-700">-{new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(result.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">NZ Pay Distribution</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.incomeTax}
                            fees={result.accLevy + result.kiwiSaverAmount + result.studentLoanRepayment}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Net Pay vs TAX vs Levies
                        </div>
                    </div>
                }
                details={calculatorDetails['nz-paycheck']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
