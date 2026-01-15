import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../../common/FinancialCharts';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Receipt } from 'lucide-react';

// Brazil CLT 2024
// INSS 2024 (Employee contribution)
const BRAZIL_INSS_BRACKETS = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 },
    { limit: Infinity, rate: 0.14 } // Cap at 7786.02
];

// IRRF 2024 (Monthly)
const BRAZIL_IRRF_BRACKETS = [
    { limit: 2112.00, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 158.40 },
    { limit: 3751.05, rate: 0.15, deduction: 370.40 },
    { limit: 4664.68, rate: 0.225, deduction: 651.73 },
    { limit: Infinity, rate: 0.275, deduction: 884.96 }
];

export default function BrazilCLTCalculator({ currency = 'BRL' }) {
    const [monthlySalary, setMonthlySalary] = useState(6000);
    const [dependents, setDependents] = useState(0);

    const result = useMemo(() => {
        const gross = monthlySalary;

        // 1. INSS Calculation (Progressive)
        let inss = 0;
        let prevLimit = 0;
        const maxInssSalary = 7786.02;
        const baseForInss = Math.min(gross, maxInssSalary);

        for (let b of BRAZIL_INSS_BRACKETS) {
            if (baseForInss > prevLimit) {
                const incomeInBracket = Math.min(baseForInss, b.limit) - prevLimit;
                inss += incomeInBracket * b.rate;
                prevLimit = b.limit;
            } else break;
        }

        // 2. IRRF Calculation
        // IRRF Base = Gross - INSS - (189.59 * dependents)
        const irrfBase = Math.max(0, gross - inss - (189.59 * dependents));
        let irrf = 0;
        for (let b of BRAZIL_IRRF_BRACKETS) {
            if (irrfBase <= b.limit || b.limit === Infinity) {
                irrf = (irrfBase * b.rate) - b.deduction;
                break;
            }
        }
        irrf = Math.max(0, irrf);

        // 3. FGTS (Employer side, but shown for info)
        const fgts = gross * 0.08;

        const netPay = gross - inss - irrf;

        return {
            gross,
            inss,
            irrf,
            fgts,
            netPay,
            monthlyNet: netPay
        };
    }, [monthlySalary, dependents]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Gross Salary (Salário Bruto)"
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={1412}
                max={50000}
                step={100}
                currency={currency}
            />
            <InputWithSlider
                label="Dependents (Dependentes)"
                value={dependents}
                onChange={setDependents}
                min={0}
                max={10}
                step={1}
                symbol=""
            />
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Calculates <strong>INSS</strong> and <strong>IRRF</strong> based on 2024 tables.
                    Includes <strong>FGTS (8%)</strong> employer contribution estimation.
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5" /> Brazil CLT Paycheck (Salário Líquido)
                </h2>
                <p className="text-sm text-blue-800">Calculate your net monthly salary in Brazil after INSS and IRRF.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Monthly Net Pay (Líquido)</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Math.round(result.netPay))}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.inss}
                            gain={result.irrf}
                            total={result.netPay}
                            currency={currency}
                            customMetrics={[
                                { label: "INSS", value: result.inss, color: "text-red-700", bgColor: "bg-red-50/30" },
                                { label: "IRRF (Tax)", value: result.irrf, color: "text-orange-700", bgColor: "bg-orange-50/30" },
                                { label: "Net Salary", value: result.netPay, color: "text-teal-700", bgColor: "bg-teal-50/30" }
                            ]}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1 font-bold">
                                <span className="text-gray-800">Employer Benefit: FGTS</span>
                                <span className="text-blue-700">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(result.fgts)}</span>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-1">Paid by employer to your retirement fund.</p>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Salário Breakdown</h3>
                        <FinancialLoanPieChart
                            principal={result.netPay}
                            totalInterest={result.inss}
                            fees={result.irrf}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['brazil-clt']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
