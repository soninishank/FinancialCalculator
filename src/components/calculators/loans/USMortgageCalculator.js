import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialPieChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Home } from 'lucide-react';

export default function USMortgageCalculator({ currency = 'USD' }) {
    const [homeValue, setHomeValue] = useState(400000);
    const [downPayment, setDownPayment] = useState(80000); // 20% default
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // Annual %
    const [homeInsurance, setHomeInsurance] = useState(1200); // Annual Amount
    const [pmiRate, setPmiRate] = useState(0.5); // Annual PMI rate if LTV < 80% (actually LTV > 80%)
    const [hoaFees, setHoaFees] = useState(0); // Monthly

    const result = useMemo(() => {
        const principal = homeValue - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        // Principal & Interest (P&I)
        let monthlyPI = 0;
        if (monthlyRate === 0) {
            monthlyPI = principal / numberOfPayments;
        } else {
            monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        // Property Tax (Monthly)
        const monthlyPropertyTax = (homeValue * (propertyTaxRate / 100)) / 12;

        // Home Insurance (Monthly)
        const monthlyInsurance = homeInsurance / 12;

        // PMI (Monthly) - typically applies if Down Payment < 20%
        const ltv = ((principal / homeValue) * 100);
        let monthlyPMI = 0;
        if (ltv > 80) {
            // Simple PMI calculation: (Loan Amount * PMI Rate) / 12
            monthlyPMI = (principal * (pmiRate / 100)) / 12;
        }

        const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaFees;

        return {
            principal,
            monthlyPI,
            monthlyPropertyTax,
            monthlyInsurance,
            monthlyPMI,
            hoaFees,
            totalMonthlyPayment,
            totalInterest: (monthlyPI * numberOfPayments) - principal,
            totalPaymentOverTerm: totalMonthlyPayment * numberOfPayments
        };
    }, [homeValue, downPayment, interestRate, loanTerm, propertyTaxRate, homeInsurance, pmiRate, hoaFees]);

    const chartData = {
        labels: ['Principal & Interest', 'Property Tax', 'Home Insurance', 'PMI', 'HOA'],
        datasets: [{
            data: [
                result.monthlyPI,
                result.monthlyPropertyTax,
                result.monthlyInsurance,
                result.monthlyPMI,
                result.hoaFees
            ],
            backgroundColor: [
                '#6366f1', // Indigo (P&I)
                '#0ea5e9', // Sky (Tax)
                '#10b981', // Emerald (Ins)
                '#f59e0b', // Amber (PMI)
                '#ec4899'  // Pink (HOA)
            ],
            borderWidth: 0
        }]
    };

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Home Value"
                value={homeValue}
                onChange={setHomeValue}
                min={50000}
                max={2000000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Down Payment"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                max={homeValue}
                step={1000}
                currency={currency}
                helperText={`LTV: ${((homeValue - downPayment) / homeValue * 100).toFixed(1)}%`}
            />

            <InputWithSlider
                label="Interest Rate (%)"
                value={interestRate}
                onChange={setInterestRate}
                min={1}
                max={15}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Loan Term (Years)"
                value={loanTerm}
                onChange={setLoanTerm}
                min={5}
                max={40}
                step={1}
                suffix=" Years"
            />

            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Property Tax (Annual %)"
                    value={propertyTaxRate}
                    onChange={setPropertyTaxRate}
                    min={0}
                    max={5}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                />
                <InputWithSlider
                    label="Home Insurance (Annual)"
                    value={homeInsurance}
                    onChange={setHomeInsurance}
                    min={0}
                    max={10000}
                    step={50}
                    currency={currency}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="PMI Rate (%)"
                    value={pmiRate}
                    onChange={setPmiRate}
                    min={0}
                    max={2.5}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                    helperText="Applies if Down Payment < 20%"
                />
                <InputWithSlider
                    label="HOA Fees (Monthly)"
                    value={hoaFees}
                    onChange={setHoaFees}
                    min={0}
                    max={2000}
                    step={10}
                    currency={currency}
                />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Home className="w-5 h-5" /> US Mortgage Calculator
                </h2>
                <p className="text-sm text-blue-800">Calculate your monthly mortgage payment including Taxes, Insurance, PMI, and HOA.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.principal} // Reusing "invested" for Loan Amount
                            gain={result.totalInterest} // Reusing "gain" for Total Interest
                            total={result.totalPaymentOverTerm} // Total Cost
                            currency={currency}
                            labels={{ invested: "Loan Amount", gain: "Total Interest", total: "Total Cost" }}
                        />
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Monthly Payment</p>
                            <p className="text-2xl font-bold text-indigo-700">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(result.totalMonthlyPayment)}
                            </p>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Monthly Breakdown</h3>
                        <FinancialPieChart data={chartData} currency={currency} />
                    </div>
                }
                details={calculatorDetails['us-mortgage-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
