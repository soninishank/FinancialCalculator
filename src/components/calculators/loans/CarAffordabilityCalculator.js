import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart, FinancialLoanPieChart } from '../../common/FinancialCharts';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { computeLoanAmortization } from '../../../utils/finance';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Calculator, Wallet, Percent, Calendar, Info } from 'lucide-react';

const CarAffordabilityCalculator = ({ currency }) => {
    const [monthlyIncome, setMonthlyIncome] = useState(100000);
    const [downPayment, setDownPayment] = useState(200000);
    const [interestRate, setInterestRate] = useState(9);
    const [loanTerm, setLoanTerm] = useState(5); // years
    const [startDate] = useState(new Date().toISOString().slice(0, 7));

    // Rule of thumb: Maximum recommended EMI is 20% of net income
    const affordableEMI = useMemo(() => monthlyIncome * 0.20, [monthlyIncome]);

    const results = useMemo(() => {
        const rate = parseFloat(interestRate) || 0;
        const term = parseFloat(loanTerm) || 0;
        const dp = parseFloat(downPayment) || 0;

        const r = rate / 12 / 100;
        const n = term * 12;

        let loanAmount = 0;
        if (rate > 0 && term > 0) {
            loanAmount = (affordableEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
        } else if (term > 0) {
            loanAmount = affordableEMI * n;
        }

        const maxCarPrice = loanAmount + dp;

        // Compute a sample amortization schedule for this affordable loan
        const amortization = computeLoanAmortization({
            principal: loanAmount,
            annualRate: rate,
            years: term,
            emi: affordableEMI,
            startDate
        });

        return {
            maxCarPrice,
            loanAmount,
            amortization
        };
    }, [affordableEMI, downPayment, interestRate, loanTerm, startDate]);

    const { maxCarPrice, loanAmount, amortization } = results;

    const inputs = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <InputWithSlider
                    label="Monthly Net Income"
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    min={10000}
                    max={1000000}
                    step={5000}
                    currency={currency}
                    icon={Wallet}
                />
                <InputWithSlider
                    label="Down Payment Saving"
                    value={downPayment}
                    onChange={setDownPayment}
                    min={0}
                    max={2000000}
                    step={10000}
                    currency={currency}
                    icon={Calculator}
                />
            </div>
            <div className="space-y-6">
                <InputWithSlider
                    label="Interest Rate"
                    value={interestRate}
                    onChange={setInterestRate}
                    min={1}
                    max={15}
                    step={0.1}
                    symbol="%"
                    icon={Percent}
                />
                <InputWithSlider
                    label="Loan Term (Years)"
                    value={loanTerm}
                    onChange={setLoanTerm}
                    min={1}
                    max={10}
                    step={1}
                    icon={Calendar}
                />
            </div>
        </div>
    );

    const summary = (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-slate-800/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white dark:bg-slate-800/20 transition-all duration-700"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20">
                    <div className="pb-6 md:pb-0">
                        <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest mb-2">Max Affordable Car Price</p>
                        <p className="text-5xl font-black">{moneyFormat(maxCarPrice, currency)}</p>
                    </div>
                    <div className="pt-6 md:pt-0 md:pl-8">
                        <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest mb-2">Recommended Max EMI</p>
                        <p className="text-3xl font-bold">{moneyFormat(affordableEMI, currency)} <span className="text-lg opacity-60">/mo</span></p>
                        <p className="text-xs text-indigo-200 mt-2 font-medium opacity-80">(Based on 20% rule of thumb)</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg h-fit"><Info size={16} /></div>
                <p className="leading-relaxed">
                    <strong>Financial Wisdom:</strong> Experts recommend the 20/4/10 rule: put <strong>20%</strong> down, finance for no more than <strong>4 years</strong>, and keep total car costs under <strong>10%</strong> of your gross income. This tool uses a more flexible 20% net income limit.
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Purchase Funding Breakdown</h4>
                        <div className="h-[300px]">
                            <FinancialLoanPieChart
                                principal={loanAmount}
                                totalInterest={amortization.finalTotalInterest}
                                fees={0}
                                currency={currency}
                                labels={{ invested: "Loan Amount", gain: "Down Payment" }}
                                customData={[
                                    { name: "Down Payment", value: downPayment, color: "#10b981" },
                                    { name: "Loan Amount", value: loanAmount, color: "#6366f1" }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Projected Loan Repayment</h4>
                        <div className="h-[300px]">
                            <FinancialCompoundingBarChart
                                data={amortization.rows}
                                currency={currency}
                                type="loan"
                            />
                        </div>
                    </div>
                </div>
            }
            table={
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Estimated Amortization Schedule (Max Loan)</h4>
                    <CollapsibleAmortizationTable
                        yearlyData={amortization.rows}
                        monthlyData={amortization.monthlyRows}
                        currency={currency}
                    />
                </div>
            }
            details={calculatorDetails['car-affordability-calculator']?.render() || <div className="text-gray-500 italic">Affordability guidelines help you avoid being "car poor" by ensuring your vehicle expenses don't consume too much of your monthly budget.</div>}
        />
    );
};

export default CarAffordabilityCalculator;
