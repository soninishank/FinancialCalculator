import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { FinancialLoanDoughnutChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { GraduationCap, TrendingDown } from 'lucide-react';

export default function StudentLoanPayoffCalculator({ currency = 'USD' }) {
    const [loanAmount, setLoanAmount] = useState(35000);
    const [interestRate, setInterestRate] = useState(5.5);
    const [loanTerm, setLoanTerm] = useState(10); // years
    const [extraPayment, setExtraPayment] = useState(0);
    const [paymentPlan, setPaymentPlan] = useState('standard'); // standard, extended, graduated

    const result = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        let termMonths = loanTerm * 12;

        // Adjust term based on payment plan
        if (paymentPlan === 'extended') termMonths = 25 * 12;

        // Calculate base EMI (Standard Repayment)
        const baseEMI = monthlyRate === 0
            ? loanAmount / termMonths
            : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1);

        // With extra payment
        const totalMonthlyPayment = baseEMI + extraPayment;

        // Amortization schedule
        let balance = loanAmount;
        let totalInterest = 0;
        const schedule = [];
        let monthCount = 0;

        while (balance > 0 && monthCount < termMonths) {
            monthCount++;
            const interestPayment = balance * monthlyRate;
            let principalPayment = totalMonthlyPayment - interestPayment;

            // Last payment adjustment
            if (principalPayment > balance) {
                principalPayment = balance;
            }

            balance -= principalPayment;
            totalInterest += interestPayment;

            if (balance < 0) balance = 0;

            // Store yearly milestones and monthly data
            if (monthCount % 12 === 0 || balance === 0) {
                schedule.push({
                    month: monthCount,
                    year: Math.ceil(monthCount / 12),
                    payment: totalMonthlyPayment,
                    principal: principalPayment,
                    interest: interestPayment,
                    balance: balance
                });
            }
        }

        // Interest saved with extra payment
        const baseMonthlyPayment = baseEMI;
        let baseBalance = loanAmount;
        let baseTotalInterest = 0;
        for (let i = 1; i <= termMonths; i++) {
            const baseInterest = baseBalance * monthlyRate;
            const basePrincipal = baseMonthlyPayment - baseInterest;
            baseBalance -= basePrincipal;
            baseTotalInterest += baseInterest;
            if (baseBalance <= 0) break;
        }

        return {
            monthlyPayment: totalMonthlyPayment,
            totalPayment: loanAmount + totalInterest,
            totalInterest,
            payoffMonths: monthCount,
            payoffYears: (monthCount / 12).toFixed(1),
            schedule,
            interestSaved: extraPayment > 0 ? baseTotalInterest - totalInterest : 0,
            timeSaved: extraPayment > 0 ? termMonths - monthCount : 0
        };
    }, [loanAmount, interestRate, loanTerm, extraPayment, paymentPlan]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Total Student Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                min={5000}
                max={200000}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Interest Rate (%)"
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={12}
                step={0.1}
                symbol="%"
                isDecimal={true}
                helperText="Federal: 3-7% | Private: 4-12%"
            />

            <InputWithSlider
                label="Loan Term (Years)"
                value={loanTerm}
                onChange={setLoanTerm}
                min={5}
                max={30}
                step={1}
                suffix=" Years"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Repayment Plan</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'standard', label: 'Standard (10yr)' },
                        { value: 'extended', label: 'Extended (25yr)' }
                    ].map(plan => (
                        <button
                            key={plan.value}
                            onClick={() => setPaymentPlan(plan.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${paymentPlan === plan.value
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {plan.label}
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Extra Monthly Payment"
                value={extraPayment}
                onChange={setExtraPayment}
                min={0}
                max={2000}
                step={50}
                currency={currency}
                helperText="Accelerate payoff and save on interest"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" /> Student Loan Payoff Calculator
                </h2>
                <p className="text-sm text-blue-800">Calculate payoff strategies and see how extra payments reduce debt faster.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Monthly Payment</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPayment)}</p>
                            <p className="text-xs mt-2 opacity-90">Debt-free in {result.payoffYears} years ({result.payoffMonths} months)</p>
                        </div>

                        <UnifiedSummary
                            invested={loanAmount}
                            gain={result.totalInterest}
                            total={result.totalPayment}
                            currency={currency}
                            labels={{ invested: "Principal", gain: "Total Interest", total: "Total Payment" }}
                        />

                        {extraPayment > 0 && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                                    <p className="text-sm font-bold text-emerald-900">Savings from Extra Payments</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-emerald-600">Interest Saved</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.interestSaved)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-600">Time Saved</p>
                                        <p className="text-lg font-bold text-emerald-700">{result.timeSaved} months</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                }
                charts={
                    <div className="mt-8 space-y-8">
                        <div>
                            <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Payment Breakdown</h3>
                            <FinancialLoanDoughnutChart
                                principal={loanAmount}
                                interest={result.totalInterest}
                                currency={currency}
                            />
                        </div>
                        <CollapsibleAmortizationTable
                            yearlyData={result.schedule.map(item => ({
                                year: item.year,
                                principalPaid: item.principal * 12,
                                interestPaid: item.interest * 12,
                                totalExpense: 0,
                                closingBalance: item.balance,
                                totalPaidPercent: ((loanAmount - item.balance) / loanAmount) * 100
                            }))}
                            monthlyData={[]}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['student-loan-payoff']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
