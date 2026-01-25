import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import { calculateEMI, calculateFlatRateEMI, calculateEffectiveInterestRate, computeLoanAmortization } from '../../../utils/finance';
import { FinancialCompoundingBarChart, FinancialLoanPieChart } from '../../common/FinancialCharts';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { calculatorDetails } from '../../../data/calculatorDetails';
import {
    MIN_LOAN, MAX_LOAN, STEP_LARGE,
    MIN_RATE, MAX_RATE,
    MIN_YEARS, MAX_YEARS
} from '../../../utils/constants';

export default function CompareLoans({ currency }) {
    const [principal, setPrincipal] = useState(500000);
    const [rate, setRate] = useState(10); // Annual Interest Rate
    const [tenure, setTenure] = useState(3); // Default 3 years
    const [tenureType, setTenureType] = useState('years'); // 'years' or 'months'

    // Normalize Tenure to Years for calculations
    const tenureYears = tenureType === 'years' ? tenure : tenure / 12;
    // For display validation
    const maxTenure = tenureType === 'years' ? MAX_YEARS : MAX_YEARS * 12;
    const minTenure = tenureType === 'years' ? MIN_YEARS : 6; // Min 6 months

    const [startDate] = useState(new Date().toISOString().slice(0, 7));

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        // Standard EMI formula
        const n = tenureYears * 12; // Total months
        const r_m = rate / 12 / 100;

        const reducingEMI = calculateEMI(principal, r_m, n);
        const totalReducingPayment = reducingEMI * n;
        const totalReducingInterest = totalReducingPayment - principal;

        // FLAT RATE
        const flatEMI = calculateFlatRateEMI(principal, rate, tenureYears);
        const totalFlatPayment = flatEMI * n;
        const totalFlatInterest = totalFlatPayment - principal;

        // EFFECTIVE RATE (True cost of Flat Rate)
        const effectiveFlatRate = calculateEffectiveInterestRate(principal, tenureYears, flatEMI);

        // Amortization (for charts/tables)
        const reducingAmort = computeLoanAmortization({
            principal,
            annualRate: rate,
            years: tenureYears,
            emi: reducingEMI,
            startDate
        });

        return {
            reducingEMI, totalReducingPayment, totalReducingInterest,
            flatEMI, totalFlatPayment, totalFlatInterest,
            effectiveFlatRate, reducingAmort, n
        };
    }, [principal, rate, tenureYears, startDate]);

    const {
        reducingEMI, totalReducingPayment, totalReducingInterest,
        flatEMI, totalFlatPayment, totalFlatInterest,
        effectiveFlatRate, reducingAmort, n
    } = results;

    const interestDifference = totalFlatInterest - totalReducingInterest;

    // --- VERDICT ---
    const verdict = (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl mt-4">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                ⚖️ The Verdict
            </h3>

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800/10 rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-300">True Cost of Flat Rate:</span>
                        <span className="text-3xl font-bold text-rose-300">{!isNaN(effectiveFlatRate) ? effectiveFlatRate.toFixed(2) : "0.00"}%</span>
                    </div>
                    <p className="text-sm text-gray-400 italic">
                        A Flat Rate of {rate}% is mathematically equal to a Reducing Rate of <strong>{!isNaN(effectiveFlatRate) ? effectiveFlatRate.toFixed(2) : "0.00"}%</strong>.
                    </p>
                </div>

                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-gray-300">Total Extra Paid (Flat):</span>
                    <span className="text-3xl font-bold text-rose-400">
                        {moneyFormat(Math.round(interestDifference), currency)}
                    </span>
                </div>
            </div>
        </div>
    );

    // --- INPUTS ---
    const inputs = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputWithSlider
                label="Loan Amount"
                value={principal}
                onChange={setPrincipal}
                min={MIN_LOAN} max={MAX_LOAN} step={STEP_LARGE}
                currency={currency}
            />

            <InputWithSlider
                label="Loan Tenure"
                value={tenure}
                onChange={setTenure}
                min={minTenure} max={maxTenure}
                rightElement={
                    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => { setTenureType('years'); setTenure(prev => Math.ceil(prev / 12) || 1); }}
                            className={`px-3 py-1 text-xs font-semibold rounded ${tenureType === 'years' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-gray-500'}`}
                        >
                            Years
                        </button>
                        <button
                            onClick={() => { setTenureType('months'); setTenure(prev => prev * 12); }}
                            className={`px-3 py-1 text-xs font-semibold rounded ${tenureType === 'months' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-gray-500'}`}
                        >
                            Months
                        </button>
                    </div>
                }
            />

            <InputWithSlider
                label="Interest Rate (%)"
                value={rate}
                onChange={setRate}
                min={MIN_RATE} max={MAX_RATE} step={0.1} isDecimal={true}
                symbol="%"
            />
        </div>
    );

    // --- SUMMARY ---
    const summary = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">BEST CHOICE</div>
                <h3 className="text-emerald-900 font-bold mb-4">Reducing Balance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Monthly EMI</p>
                        <p className="text-2xl font-black text-emerald-900">{moneyFormat(Math.round(reducingEMI), currency)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Interest</p>
                        <p className="text-2xl font-black text-emerald-900">{moneyFormat(Math.round(totalReducingInterest), currency)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">EXPENSIVE</div>
                <h3 className="text-rose-900 font-bold mb-4">Flat Rate Method</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Monthly EMI</p>
                        <p className="text-2xl font-black text-rose-900">{moneyFormat(Math.round(flatEMI), currency)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Total Interest</p>
                        <p className="text-2xl font-black text-rose-900">{moneyFormat(Math.round(totalFlatInterest), currency)}</p>
                    </div>
                </div>
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
                        <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Total Interest Comparison</h4>
                        <div className="h-[300px]">
                            <FinancialLoanPieChart
                                principal={totalReducingInterest}
                                totalInterest={totalFlatInterest}
                                fees={0}
                                currency={currency}
                                customLabels={{ principal: "Reducing", interest: "Flat Rate" }}
                                customData={[
                                    { name: "Reducing Balance", value: totalReducingInterest, color: "#10b981" },
                                    { name: "Flat Rate", value: totalFlatInterest, color: "#f43f5e" }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        {verdict}
                    </div>
                </div>
            }
            table={
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-50">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Side-by-Side Comparison</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Metric</th>
                                    <th className="px-6 py-4 text-emerald-600">Reducing Balance</th>
                                    <th className="px-6 py-4 text-rose-600">Flat Rate</th>
                                    <th className="px-6 py-4">Difference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="px-6 py-4 font-semibold">Monthly EMI</td>
                                    <td className="px-6 py-4 font-bold">{moneyFormat(reducingEMI, currency)}</td>
                                    <td className="px-6 py-4 font-bold">{moneyFormat(flatEMI, currency)}</td>
                                    <td className="px-6 py-4 text-rose-600 font-bold">+{moneyFormat(flatEMI - reducingEMI, currency)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-semibold">Total Interest</td>
                                    <td className="px-6 py-4 font-bold font-mono">{moneyFormat(totalReducingInterest, currency)}</td>
                                    <td className="px-6 py-4 font-bold font-mono">{moneyFormat(totalFlatInterest, currency)}</td>
                                    <td className="px-6 py-4 text-rose-600 font-bold font-mono">+{moneyFormat(totalFlatInterest - totalReducingInterest, currency)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-semibold">Effective APR</td>
                                    <td className="px-6 py-4 font-bold">{rate.toFixed(2)}%</td>
                                    <td className="px-6 py-4 font-bold text-rose-600">{effectiveFlatRate.toFixed(2)}%</td>
                                    <td className="px-6 py-4 text-rose-600 font-bold">+{(effectiveFlatRate - rate).toFixed(2)}%</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-slate-900/50/50">
                                    <td className="px-6 py-4 font-semibold">Total Cost of Loan</td>
                                    <td className="px-6 py-4 font-black">{moneyFormat(totalReducingPayment, currency)}</td>
                                    <td className="px-6 py-4 font-black">{moneyFormat(totalFlatPayment, currency)}</td>
                                    <td className="px-6 py-4 text-rose-600 font-black">+{moneyFormat(totalFlatPayment - totalReducingPayment, currency)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            }
            details={calculatorDetails['compare-loans'].render()}
        />
    );
}
