import React, { useState, useMemo } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import CalculatorLayout from '../common/CalculatorLayout';
import UnifiedSummary from '../common/UnifiedSummary';
import MonthYearPicker from '../common/MonthYearPicker';
import { moneyFormat } from '../../utils/formatting';
import { computePPF } from '../../utils/finance';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PPFCalculator({ currency = 'INR' }) {
    const [investmentAmount, setInvestmentAmount] = useState(12500); // Default for monthly
    const [frequency, setFrequency] = useState('monthly'); // 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
    const [rate, setRate] = useState(7.1); // Default PPF Rate 7.1%
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
    const multiplier = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : frequency === 'half-yearly' ? 2 : 1;
    const annualInvestment = investmentAmount * multiplier;
    const isOverLimit = annualInvestment > 150001; // Tiny buffer for float math

    const inputs = (
        <div className="space-y-6">
            {/* Frequency Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                {['monthly', 'quarterly', 'half-yearly', 'yearly'].map((freq) => (
                    <button
                        key={freq}
                        onClick={() => {
                            setFrequency(freq);
                            // Adjust amount to stay within limits when switching
                            if (freq === 'monthly') setInvestmentAmount(Math.min(investmentAmount, 12500));
                            else if (freq === 'quarterly') setInvestmentAmount(Math.min(investmentAmount, 37500));
                            else if (freq === 'half-yearly') setInvestmentAmount(Math.min(investmentAmount, 75000));
                            else if (freq === 'yearly') setInvestmentAmount(Math.min(investmentAmount, 150000));
                        }}
                        className={`flex-1 py-2 text-[10px] md:text-xs font-bold capitalize rounded-lg transition-all ${frequency === freq
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {freq}
                    </button>
                ))}
            </div>

            <InputWithSlider
                label={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Deposit`}
                value={investmentAmount}
                onChange={setInvestmentAmount}
                min={500}
                max={
                    frequency === 'monthly' ? 12500 :
                        frequency === 'quarterly' ? 37500 :
                            frequency === 'half-yearly' ? 75000 : 150000
                }
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
                isDecimal={true}
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

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <UnifiedSummary
                        invested={result.totalInvestment}
                        gain={result.totalInterest}
                        total={result.maturityValue}
                        currency={currency}
                        years={years}
                    />
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                table={
                    <div className="mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                            <div className="flex items-center w-full md:w-auto">
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
                }
                details={
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    Key Features of PPF
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <span><strong>Lock-in Period:</strong> 15 years, extendable in blocks of 5 years indefinitely.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <span><strong>Tax Benefits (EEE):</strong> Exempt-Exempt-Exempt status.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    Extension Rules
                                </h4>
                                <p className="text-sm text-gray-600">Continue investing or earn interest without fresh deposits after 15 years.</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <p className="text-[13px] text-indigo-900 leading-relaxed font-medium">
                                PPF interest is compounded annually. For maximum benefit, invest before the 5th of each month.
                            </p>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
