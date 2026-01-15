import React, { useState } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import { calculateEMI, calculateFlatRateEMI, calculateEffectiveInterestRate } from '../../../utils/finance';
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

    // --- CALCULATIONS ---

    // 1. REDUCING BALANCE
    // Standard EMI formula
    const n = tenureYears * 12; // Total months
    const r_m = rate / 12 / 100;

    const reducingEMI = calculateEMI(principal, r_m, n);
    const totalReducingPayment = reducingEMI * n;
    const totalReducingInterest = totalReducingPayment - principal;

    // 2. FLAT RATE
    const flatEMI = calculateFlatRateEMI(principal, rate, tenureYears);
    const totalFlatPayment = flatEMI * n;
    const totalFlatInterest = totalFlatPayment - principal;

    // 3. EFFECTIVE RATE (True cost of Flat Rate)
    const effectiveFlatRate = calculateEffectiveInterestRate(principal, tenureYears, flatEMI);

    // --- VERDICT ---
    const interestDifference = totalFlatInterest - totalReducingInterest;

    // Usually Flat Rate EMI > Reducing EMI for same quoted rate?
    // Actually:
    // Flat Rate 10% means you pay 10% on WHOLE principal every year.
    // Reducing Rate 10% means you pay 10% on outstanding.
    // So Flat Rate 10% is MUCH MORE expensive than Reducing 10%.
    // Therefore Flat Interest > Reducing Interest.

    const verdict = (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl mt-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">⚖️</span>
                The Verdict
            </h3>

            <div className="space-y-6">
                <div>
                    <p className="text-gray-300 text-sm font-medium uppercase tracking-wide mb-2">If Quoted Rate is Same ({rate}%)</p>
                    <div className="text-xl">
                        A <span className="text-rose-400 font-bold">Flat Rate Loan</span> is significantly more expensive.
                    </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">True Cost of Flat Rate:</span>
                        <span className="text-2xl font-bold text-rose-300">{effectiveFlatRate.toFixed(2)}%</span>
                    </div>
                    <p className="text-sm text-gray-400">
                        A Flat Rate of {rate}% is mathematically equal to a Reducing Rate of {effectiveFlatRate.toFixed(2)}%.
                    </p>
                </div>

                <div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                        <span className="text-gray-300">You Pay Extra:</span>
                        <span className="text-3xl font-bold text-rose-400">
                            {moneyFormat(Math.round(interestDifference), currency)}
                        </span>
                    </div>
                    <p className="text-gray-300">
                        Always choose <strong>Reducing Balance</strong> unless the Flat Rate is significantly lower (below {(effectiveFlatRate / 1.8).toFixed(1)}%).
                    </p>
                </div>
            </div>
        </div>
    );

    // --- INPUTS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Loan Amount"
                value={principal}
                onChange={setPrincipal}
                min={MIN_LOAN} max={MAX_LOAN} step={STEP_LARGE}
                currency={currency}
            />

            <div className="space-y-2">
                <InputWithSlider
                    label="Loan Tenure"
                    value={tenure}
                    onChange={setTenure}
                    min={minTenure} max={maxTenure}
                    rightElement={
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => { setTenureType('years'); setTenure(prev => Math.ceil(prev / 12) || 1); }}
                                className={`px-3 py-1 text-xs font-semibold rounded ${tenureType === 'years' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                            >
                                Years
                            </button>
                            <button
                                onClick={() => { setTenureType('months'); setTenure(prev => prev * 12); }}
                                className={`px-3 py-1 text-xs font-semibold rounded ${tenureType === 'months' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                            >
                                Months
                            </button>
                        </div>
                    }
                />
            </div>

            <InputWithSlider
                label="Interest Rate (%)"
                value={rate}
                onChange={setRate}
                min={MIN_RATE} max={MAX_RATE} step={0.1} isDecimal={true}
                symbol="%"
            />
        </>
    );

    // --- SUMMARY CARDS ---
    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">

            {/* REDUCING BALANCE CARD */}
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-bl-xl">
                    RECOMMENDED
                </div>
                <h3 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Reducing Balance Method
                </h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-emerald-700 uppercase">Monthly EMI</p>
                        <p className="text-3xl font-extrabold text-emerald-900">{moneyFormat(Math.round(reducingEMI), currency)}</p>
                    </div>

                    <div className="pt-4 border-t border-emerald-200/60 flex justify-between">
                        <div>
                            <p className="text-xs text-emerald-700">Total Interest</p>
                            <p className="font-bold text-emerald-900">{moneyFormat(Math.round(totalReducingInterest), currency)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-emerald-700">Total Payable</p>
                            <p className="font-bold text-emerald-900">{moneyFormat(Math.round(totalReducingPayment), currency)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLAT RATE CARD */}
            <div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-6 shadow-sm">
                <h3 className="text-rose-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Flat Rate Method
                </h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-rose-700 uppercase">Monthly EMI</p>
                        <p className="text-3xl font-extrabold text-rose-900">{moneyFormat(Math.round(flatEMI), currency)}</p>
                        <p className="text-xs text-rose-600 font-medium mt-1">
                            (+{moneyFormat(Math.round(flatEMI - reducingEMI), currency)} more/month)
                        </p>
                    </div>

                    <div className="pt-4 border-t border-rose-200/60 flex justify-between">
                        <div>
                            <p className="text-xs text-rose-700">Total Interest</p>
                            <p className="font-bold text-rose-900">{moneyFormat(Math.round(totalFlatInterest), currency)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-rose-700">Total Payable</p>
                            <p className="font-bold text-rose-900">{moneyFormat(Math.round(totalFlatPayment), currency)}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={verdict} // Using charts slot for Verdict to leverage full width
            pieChart={null}
            table={null}
            details={calculatorDetails['compare-loans'].render()}
        />
    );
}
