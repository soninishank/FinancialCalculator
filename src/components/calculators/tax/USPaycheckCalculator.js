import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { BadgeDollarSign } from 'lucide-react';

const FED_BRACKETS_2024 = {
    single: [
        { limit: 11600, rate: 10 },
        { limit: 47150, rate: 12 },
        { limit: 100525, rate: 22 },
        { limit: 191950, rate: 24 },
        { limit: 243725, rate: 32 },
        { limit: 609350, rate: 35 },
        { limit: Infinity, rate: 37 }
    ],
    married: [
        { limit: 23200, rate: 10 },
        { limit: 94300, rate: 12 },
        { limit: 201050, rate: 22 },
        { limit: 383900, rate: 24 },
        { limit: 487450, rate: 32 },
        { limit: 731200, rate: 35 },
        { limit: Infinity, rate: 37 }
    ]
};

const STANDARD_DEDUCTION = {
    single: 14600,
    married: 29200
};

export default function USPaycheckCalculator({ currency = 'USD' }) {
    const [grossPay, setGrossPay] = useState(75000);
    const [payFrequency, setPayFrequency] = useState(26); // Bi-weekly default
    const [filingStatus, setFilingStatus] = useState('single');
    const [stateTaxRate, setStateTaxRate] = useState(0); // User input %

    const result = useMemo(() => {
        const annualGross = grossPay;

        // Federal Tax Calculation
        const deductions = STANDARD_DEDUCTION[filingStatus];
        const taxableIncome = Math.max(0, annualGross - deductions);

        let federalTax = 0;
        let previousLimit = 0;
        const brackets = FED_BRACKETS_2024[filingStatus];

        for (let bracket of brackets) {
            if (taxableIncome > previousLimit) {
                const incomeInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
                federalTax += incomeInBracket * (bracket.rate / 100);
                previousLimit = bracket.limit;
            } else {
                break;
            }
        }

        // FICA Taxes
        // SS: 6.2% on first $168,600 (2024 limit)
        const ssWageBase = 168600;
        const ssTax = Math.min(annualGross, ssWageBase) * 0.062;

        // Medicare: 1.45% all wages + 0.9% additional over 200k/250k
        let medicareTax = annualGross * 0.0145;
        const medicareSurtaxThreshold = filingStatus === 'married' ? 250000 : 200000;
        if (annualGross > medicareSurtaxThreshold) {
            medicareTax += (annualGross - medicareSurtaxThreshold) * 0.009;
        }

        const ficaTax = ssTax + medicareTax;

        // State Tax
        const stateTax = annualGross * (stateTaxRate / 100);

        const totalTax = federalTax + ficaTax + stateTax;
        const netPayAnnual = annualGross - totalTax;

        const netPayPerCheck = netPayAnnual / payFrequency;

        return {
            annualGross,
            federalTax,
            ficaTax,
            stateTax,
            totalTax,
            netPayAnnual,
            netPayPerCheck
        };
    }, [grossPay, payFrequency, filingStatus, stateTaxRate]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Pay"
                value={grossPay}
                onChange={setGrossPay}
                min={20000}
                max={500000}
                step={1000}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Pay Frequency</label>
                <select
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                    <option value={52}>Weekly (52 paychecks)</option>
                    <option value={26}>Bi-Weekly (26 paychecks)</option>
                    <option value={24}>Semi-Monthly (24 paychecks)</option>
                    <option value={12}>Monthly (12 paychecks)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Filing Status</label>
                <select
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                </select>
            </div>

            <InputWithSlider
                label="State Tax Rate (%)"
                value={stateTaxRate}
                onChange={setStateTaxRate}
                min={0}
                max={15}
                step={0.1}
                symbol="%"
                isDecimal={true}
                helperText="Enter your state's estimated flat rate."
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <BadgeDollarSign className="w-5 h-5" /> US Paycheck Calculator
                </h2>
                <p className="text-sm text-blue-800">Calculate your take-home pay after Federal, FICA, and State taxes.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Estimated Take-Home Pay Per Paycheck</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.netPayPerCheck)}
                            </p>
                        </div>

                        <UnifiedSummary
                            invested={result.federalTax} // Mapping Fed Tax
                            gain={result.ficaTax + result.stateTax} // Mapping Other Taxes
                            total={result.netPayAnnual} // Annual Net
                            currency={currency}
                            labels={{ invested: "Federal Tax", gain: "FICA + State Tax", total: "Annual Net Pay" }}
                        />

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Federal Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.federalTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">FICA (SS & Medicare)</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.ficaTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">State Tax</span>
                                <span className="font-semibold text-red-600">-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.stateTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 mt-2 border-t border-gray-200 font-bold">
                                <span className="text-gray-800">Total Taxes</span>
                                <span className="text-red-700">-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalTax)}</span>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Where Your Money Goes</h3>
                        <FinancialLoanPieChart
                            principal={result.netPayAnnual}
                            totalInterest={result.federalTax}
                            fees={result.ficaTax + result.stateTax}
                            currency={currency}
                        />
                        <div className="text-center text-xs text-gray-400 mt-2">
                            Principal = Net Pay, Interest = Federal Tax, Fees = FICA/State Tax
                        </div>
                    </div>
                }
                details={calculatorDetails['us-paycheck-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
