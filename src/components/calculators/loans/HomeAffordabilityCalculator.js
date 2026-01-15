import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Home, Calculator } from 'lucide-react';

export default function HomeAffordabilityCalculator({ currency = 'USD' }) {
    const [annualIncome, setAnnualIncome] = useState(95000);
    const [monthlyDebts, setMonthlyDebts] = useState(500);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(7.0);
    const [loanTerm, setLoanTerm] = useState(30);
    const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
    const [homeInsurance, setHomeInsurance] = useState(150);
    const [hoaFees, setHOAFees] = useState(0);

    const result = useMemo(() => {
        const monthlyIncome = annualIncome / 12;

        // 28/36 Rule: Front-end and Back-end ratios
        const frontEndRatio = 0.28; // 28% of gross income for housing
        const backEndRatio = 0.36; // 36% of gross income for total debt

        const maxHousingPayment = monthlyIncome * frontEndRatio;
        const maxTotalDebt = monthlyIncome * backEndRatio;
        const maxMortgagePayment = Math.min(maxHousingPayment, maxTotalDebt - monthlyDebts);

        // PMI calculation (if down payment < 20%)
        const needsPMI = downPaymentPercent < 20;

        // Work backwards from max payment to find affordable home price
        // Monthly payment = P&I + Property Tax + Insurance + HOA + PMI
        const monthlyInsurance = homeInsurance;
        const monthlyHOA = hoaFees;

        // Available for P&I
        let availableForPI = maxMortgagePayment - monthlyInsurance - monthlyHOA;

        // Iterative calculation to find max home price
        let homePrice = 0;
        let loanAmount = 0;
        let monthlyPI = 0;
        let pmiPayment = 0;

        for (let testPrice = 100000; testPrice <= 5000000; testPrice += 10000) {
            const downPayment = testPrice * (downPaymentPercent / 100);
            const testLoanAmount = testPrice - downPayment;
            const testPropertyTax = (testPrice * (propertyTaxRate / 100)) / 12;
            const testPMI = needsPMI ? (testLoanAmount * 0.005) / 12 : 0; // ~0.5% annual PMI

            const monthlyRate = interestRate / 100 / 12;
            const numPayments = loanTerm * 12;
            const testPI = monthlyRate === 0
                ? testLoanAmount / numPayments
                : (testLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1);

            const totalHousingCost = testPI + testPropertyTax + monthlyInsurance + monthlyHOA + testPMI;

            if (totalHousingCost <= maxMortgagePayment) {
                homePrice = testPrice;
                loanAmount = testLoanAmount;
                monthlyPI = testPI;
                pmiPayment = testPMI;
            } else {
                break;
            }
        }

        const downPayment = homePrice * (downPaymentPercent / 100);
        const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
        const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyHOA + pmiPayment;

        // DTI ratios
        const frontEndDTI = (totalMonthlyPayment / monthlyIncome) * 100;
        const backEndDTI = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100;

        return {
            maxHomePrice: homePrice,
            downPayment,
            loanAmount,
            monthlyPI,
            monthlyPropertyTax,
            monthlyInsurance,
            monthlyHOA,
            pmiPayment,
            totalMonthlyPayment,
            frontEndDTI,
            backEndDTI,
            needsPMI,
            monthlyIncome
        };
    }, [annualIncome, monthlyDebts, downPaymentPercent, interestRate, loanTerm, propertyTaxRate, homeInsurance, hoaFees]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Gross Income"
                value={annualIncome}
                onChange={setAnnualIncome}
                min={30000}
                max={300000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Monthly Debt Payments"
                value={monthlyDebts}
                onChange={setMonthlyDebts}
                min={0}
                max={5000}
                step={50}
                currency={currency}
                helperText="Car loans, student loans, credit cards, etc."
            />

            <InputWithSlider
                label="Down Payment (%)"
                value={downPaymentPercent}
                onChange={setDownPaymentPercent}
                min={3.5}
                max={50}
                step={0.5}
                symbol="%"
                isDecimal={true}
                helperText="20%+ avoids PMI"
            />

            <InputWithSlider
                label="Mortgage Interest Rate (%)"
                value={interestRate}
                onChange={setInterestRate}
                min={2}
                max={12}
                step={0.125}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Loan Term (Years)"
                value={loanTerm}
                onChange={setLoanTerm}
                min={15}
                max={30}
                step={5}
                suffix=" Years"
            />

            <InputWithSlider
                label="Property Tax Rate (% of Home Value)"
                value={propertyTaxRate}
                onChange={setPropertyTaxRate}
                min={0}
                max={3}
                step={0.1}
                symbol="%"
                isDecimal={true}
                helperText="Avg US: 1.1% | High: NJ 2.5%, TX 1.7% | Low: HI 0.3%"
            />

            <InputWithSlider
                label="Monthly Home Insurance"
                value={homeInsurance}
                onChange={setHomeInsurance}
                min={50}
                max={500}
                step={10}
                currency={currency}
            />

            <InputWithSlider
                label="Monthly HOA Fees"
                value={hoaFees}
                onChange={setHOAFees}
                min={0}
                max={800}
                step={25}
                currency={currency}
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Home className="w-5 h-5" /> Home Affordability Calculator
                </h2>
                <p className="text-sm text-blue-800">Calculate the maximum home price you can afford based on income and debts.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Maximum Home Price</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.maxHomePrice)}</p>
                            <p className="text-xs mt-2 opacity-90">Based on 28/36 rule</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Down Payment</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.downPayment)}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{downPaymentPercent}% of home price</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Loan Amount</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.loanAmount)}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{loanTerm}-year mortgage</p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Calculator className="w-4 h-4 text-emerald-600" />
                                <p className="text-sm font-bold text-emerald-900">Monthly Payment Breakdown</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Principal & Interest:</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPI)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Property Tax:</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPropertyTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Home Insurance:</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyInsurance)}</span>
                                </div>
                                {result.monthlyHOA > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">HOA Fees:</span>
                                        <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyHOA)}</span>
                                    </div>
                                )}
                                {result.needsPMI && (
                                    <div className="flex justify-between text-amber-700">
                                        <span>PMI (Private Mortgage Insurance):</span>
                                        <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.pmiPayment)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-emerald-900">
                                    <span>Total Monthly Payment:</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalMonthlyPayment)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Front-End DTI</p>
                                <p className="text-xl font-bold text-blue-700">{result.frontEndDTI.toFixed(1)}%</p>
                                <p className="text-[10px] text-blue-500 mt-1">Housing / Income (≤28%)</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-purple-600 uppercase font-bold mb-1">Back-End DTI</p>
                                <p className="text-xl font-bold text-purple-700">{result.backEndDTI.toFixed(1)}%</p>
                                <p className="text-[10px] text-purple-500 mt-1">Total Debt / Income (≤36%)</p>
                            </div>
                        </div>

                        {result.needsPMI && (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                                <p className="text-xs text-amber-700">
                                    💡 Tip: Put down 20% to avoid ${result.pmiPayment.toFixed(0)}/month PMI
                                </p>
                            </div>
                        )}
                    </div>
                }
                details={calculatorDetails['home-affordability-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
