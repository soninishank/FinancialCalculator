import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { FinancialPieChart, FinancialLoanPieChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Home } from 'lucide-react';
import MonthYearPicker from '../../common/MonthYearPicker';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { computeAdvancedLoanAmortization } from '../../../utils/finance';
import { moneyFormat } from '../../../utils/formatting';

export default function USMortgageCalculator({ currency = 'USD' }) {
    const [homeValue, setHomeValue] = useState(400000);
    const [downPayment, setDownPayment] = useState(80000); // 20% default
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // Annual %
    const [homeInsurance, setHomeInsurance] = useState(1200); // Annual Amount
    const [pmiRate, setPmiRate] = useState(0.5); // Annual PMI rate if LTV < 80% (actually LTV > 80%)
    const [hoaFees, setHoaFees] = useState(0); // Monthly
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const result = useMemo(() => {
        const principal = homeValue - downPayment;
        const propertyTaxYearly = (homeValue * propertyTaxRate) / 100;

        // PMI (Monthly) - typically applies if Down Payment < 20%
        const ltv = (homeValue > 0) ? ((principal / homeValue) * 100) : 0;
        let monthlyPMI = 0;
        if (ltv > 80) {
            monthlyPMI = (principal * (pmiRate / 100)) / 12;
        }

        const res = computeAdvancedLoanAmortization({
            principal,
            annualRate: interestRate,
            years: loanTerm,
            startDate,
            propertyTaxYearly,
            homeInsuranceYearly: homeInsurance,
            maintenanceMonthly: monthlyPMI + hoaFees
        });

        return {
            ...res,
            loanAmount: principal,
            monthlyPMI // For chart breakdown
        };
    }, [homeValue, downPayment, interestRate, loanTerm, propertyTaxRate, homeInsurance, pmiRate, hoaFees, startDate]);

    const { summary, monthlyRows, yearlyRows } = result;

    const chartData = {
        labels: ['Principal & Interest', 'Property Tax', 'Home Insurance', 'PMI', 'HOA'],
        datasets: [{
            data: [
                summary?.baseEMI || 0,
                (homeValue * (propertyTaxRate / 100)) / 12,
                homeInsurance / 12,
                result.monthlyPMI,
                hoaFees
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
                helperText={`LTV: ${(() => {
                    const ltv = ((homeValue - downPayment) / homeValue * 100);
                    return (homeValue !== 0 && !isNaN(ltv)) ? ltv.toFixed(1) : "0.0";
                })()}%`}
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

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Loan Start Date</label>
                    <MonthYearPicker value={startDate} onChange={setStartDate} />
                </div>
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
                    <div className="space-y-8 mt-10">
                        {/* TOTAL LOAN SUMMARY SECTION */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 shadow-2xl overflow-hidden relative group transition-all hover:shadow-indigo-100/50">
                            <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-slate-100">
                                {/* METRICS (2/5) */}
                                <div className="lg:col-span-2 flex flex-col divide-y divide-slate-50">
                                    <div className="p-8 text-center bg-white dark:bg-slate-800 transition-colors hover:bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loan Amount (Principal)</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                                            {moneyFormat(result.loanAmount, currency)}
                                        </p>
                                    </div>
                                    <div className="p-8 text-center bg-teal-50/20 transition-colors hover:bg-teal-50/40">
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Total Interest Paid</p>
                                        <p className="text-3xl font-black text-teal-700 tracking-tighter">
                                            {moneyFormat(summary.totalInterest, currency)}
                                        </p>
                                    </div>
                                    <div className="p-8 text-center bg-indigo-50/30 transition-colors hover:bg-indigo-50/50">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Cost of Loan</p>
                                        <p className="text-3xl font-black text-indigo-700 tracking-tighter">
                                            {moneyFormat(summary.totalAmountPaid, currency)}
                                        </p>
                                        <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-wide italic">Over {loanTerm} Years</p>
                                    </div>
                                </div>

                                {/* CHART (3/5) */}
                                <div className="lg:col-span-3 p-10 flex flex-col justify-center items-center bg-slate-50/20 relative">
                                    <div className="absolute top-6 left-10 flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Principal vs Interest</h4>
                                    </div>
                                    <div className="w-full h-80">
                                        <FinancialLoanPieChart
                                            principal={result.loanAmount}
                                            totalInterest={summary.totalInterest}
                                            currency={currency}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MONTHLY PAYMENT BANNER */}
                        <div className="bg-indigo-600 p-10 rounded-3xl text-center shadow-2xl shadow-indigo-100 border-b-[10px] border-indigo-800 transform hover:scale-[1.005] transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-slate-800/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>

                            <p className="text-[10px] text-indigo-100 font-black uppercase tracking-[0.3em] mb-3 opacity-90">Estimated Monthly Payment</p>
                            <p className="text-6xl font-black text-white tracking-tighter mb-6 drop-shadow-lg">
                                {moneyFormat(summary.baseEMI + (homeValue * (propertyTaxRate / 100) / 12) + (homeInsurance / 12) + result.monthlyPMI + hoaFees, currency)}
                            </p>

                            <div className="flex flex-wrap justify-center gap-y-3 gap-x-8 px-4">
                                <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 bg-white dark:bg-slate-800/10 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
                                    P&I: {moneyFormat(summary.baseEMI, currency)}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 bg-white dark:bg-slate-800/10 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="w-1.5 h-1.5 bg-sky-300 rounded-full"></span>
                                    Taxes: {moneyFormat((homeValue * (propertyTaxRate / 100) / 12), currency)}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 bg-white dark:bg-slate-800/10 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                                    Ins: {moneyFormat((homeInsurance / 12), currency)}
                                </span>
                                {(result.monthlyPMI > 0 || hoaFees > 0) && (
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 bg-white dark:bg-slate-800/10 px-3 py-1.5 rounded-full border border-white/5">
                                        <span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>
                                        PMI & HOA: {moneyFormat(result.monthlyPMI + hoaFees, currency)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-16 bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16"></div>
                        <h3 className="text-slate-900 dark:text-slate-100 font-black text-2xl mb-10 flex items-center gap-4 relative z-10">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            Monthly Payment Breakdown
                        </h3>
                        <div className="h-[450px] relative z-10">
                            <FinancialPieChart data={chartData} currency={currency} />
                        </div>
                    </div>
                }
                table={
                    <div className="mt-16">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-2 h-8 bg-slate-800 rounded-full"></span>
                            <h3 className="text-slate-900 dark:text-slate-100 font-black text-2xl">Detailed Amortization Schedule</h3>
                        </div>
                        <CollapsibleAmortizationTable
                            yearlyData={yearlyRows}
                            monthlyData={monthlyRows}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['us-mortgage-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
