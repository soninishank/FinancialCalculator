import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { CreditCard } from 'lucide-react';

// Mexico ISR 2024 (Monthly Brackets approximate)
const MX_ISR_BRACKETS = [
    { limit: 746.04, rate: 0.0192, base: 0 },
    { limit: 6332.05, rate: 0.0640, base: 14.32 },
    { limit: 11128.01, rate: 0.1088, base: 371.83 },
    { limit: 12935.82, rate: 0.16, base: 893.63 },
    { limit: 15487.71, rate: 0.1792, base: 1182.88 },
    { limit: 31236.49, rate: 0.2136, base: 1640.18 },
    { limit: 49233.00, rate: 0.2352, base: 5004.12 },
    { limit: 93993.90, rate: 0.30, base: 9236.89 },
    { limit: 125325.20, rate: 0.32, base: 22665.17 },
    { limit: 375975.61, rate: 0.34, base: 32684.76 },
    { limit: Infinity, rate: 0.35, base: 117905.90 }
];

export default function MexicoISRCalculator({ currency = 'MXN' }) {
    const [monthlySalary, setMonthlySalary] = useState(25000);

    const result = useMemo(() => {
        const gross = monthlySalary;

        // 1. ISR (Income Tax)
        let isr = 0;
        let prevLimit = 0;
        for (let b of MX_ISR_BRACKETS) {
            if (gross <= b.limit || b.limit === Infinity) {
                const excess = gross - prevLimit;
                isr = b.base + (excess * b.rate);
                break;
            }
            prevLimit = b.limit;
        }

        // 2. IMSS (Social Security - rough estimate 2.5% for employee)
        const imss = gross * 0.025;

        const netPay = gross - isr - imss;

        return {
            gross,
            isr,
            imss,
            netPay,
            annualNet: netPay * 12
        };
    }, [monthlySalary]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Gross Salary"
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={5000}
                max={500000}
                step={1000}
                currency={currency}
            />
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculates <strong>ISR</strong> based on 2024 monthly tables.
                    Includes an estimated <strong>2.5% IMSS</strong> social security deduction.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Mexico ISR & Paycheck
                </h2>
                <p className="text-sm text-emerald-800">Estimate your net monthly pay in Mexico after ISR and IMSS.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Math.round(result.netPay))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.isr}
                            gain={result.imss}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "ISR (Income Tax)", value: result.isr, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "IMSS (Social)", value: result.imss, color: "text-orange-700", bgColor: "bg-orange-50/30" },
                                { label: "Monthly Net", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Paycheck Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.isr}
                            fees={result.imss}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['mexico-isr']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
