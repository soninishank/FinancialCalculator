import React, { useState, useMemo } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
import { moneyFormat } from '../../utils/formatting';
import { computePPF } from '../../utils/finance';
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PPFCalculator({ currency = 'INR' }) {
    const [investmentAmount, setInvestmentAmount] = useState(12500); // 1.5L / 12
    const [frequency, setFrequency] = useState('monthly'); // 'monthly' | 'yearly'
    const [rate, setRate] = useState(7.1); // Current PPF Rate
    const [years, setYears] = useState(15);
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7));

    const result = useMemo(() => {
        return computePPF({
            investmentAmount,
            frequency,
            interestRate: rate,
            years,
            startDate
        });
    }, [investmentAmount, frequency, rate, years, startDate]);

    // Warning for 1.5L Limit
    const annualInvestment = frequency === 'monthly' ? investmentAmount * 12 : investmentAmount;
    const isOverLimit = annualInvestment > 150000;

    const inputs = (
        <div className="space-y-6">
            {/* Frequency Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                {['monthly', 'yearly'].map((freq) => (
                    <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${frequency === freq
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {freq} Investment
                    </button>
                ))}
            </div>

            <InputWithSlider
                label={frequency === 'monthly' ? "Monthly Deposit" : "Yearly Deposit"}
                value={investmentAmount}
                onChange={setInvestmentAmount}
                min={500}
                max={frequency === 'monthly' ? 50000 : 200000}
                step={500}
                currency={currency}
            />

            {isOverLimit && (
                <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                        <strong>Note:</strong> The maximum tax-exempt limit for PPF is ₹1.5 Lakhs per financial year.
                        You are investing {moneyFormat(annualInvestment, currency)} per year.
                    </p>
                </div>
            )}

            <InputWithSlider
                label="Interest Rate (%)"
                value={rate}
                onChange={setRate}
                min={4}
                max={12}
                step={0.1}
                symbol="%"
                helperText="Current PPF Interest Rate is 7.1%"
            />

            <InputWithSlider
                label="Duration (Years)"
                value={years}
                onChange={setYears}
                min={15}
                max={50}
                step={5}
                suffix="Years"
                helperText="Min. 15 Years. Extendable in blocks of 5 years."
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* INFO BANNER */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Public Provident Fund (PPF)
                </h2>
                <p className="text-sm text-indigo-700">A safe, government-backed long term investment with tax-free returns.</p>
            </div>

            {/* INPUTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
                {inputs}
            </div>

            {/* SUMMARY & PIE CHART - Side by Side */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-gray-100">

                    {/* LEFT: METRICS (2/5) */}
                    <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
                        <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Investment</p>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {moneyFormat(result.totalInvestment, currency)}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-emerald-50/30">
                            <p className="text-sm font-semibold text-emerald-900 mb-1">Total Interest</p>
                            <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                                {moneyFormat(result.totalInterest, currency)}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-indigo-50/30">
                            <p className="text-sm font-semibold text-indigo-900 mb-1">Maturity Amount</p>
                            <p className="text-xs text-indigo-600 mb-2 font-medium opacity-80">
                                After {years} Years
                            </p>
                            <p className="text-2xl font-bold text-indigo-700 tracking-tight">
                                {moneyFormat(result.maturityValue, currency)}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: PIE CHART (3/5) */}
                    <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center bg-gray-50/30">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 self-start">Break-up of Maturity Value</h4>
                        <div className="w-full h-80">
                            <FinancialInvestmentPieChart
                                invested={result.totalInvestment}
                                gain={result.totalInterest}
                                total={result.maturityValue}
                                currency={currency}
                                years={`${years} Years`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BAR CHART */}
            <div className="mt-8">
                <FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />
            </div>

            {/* TABLE */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                    <div className="flex items-center">
                        <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                        <div className="w-48">
                            <MonthYearPicker
                                value={startDate}
                                onChange={setStartDate}
                            />
                        </div>
                    </div>
                </div>
                <CollapsibleInvestmentTable
                    yearlyData={result.yearlyData}
                    monthlyData={result.monthlyData}
                    currency={currency}
                />
            </div>
        </div>
    );
}
