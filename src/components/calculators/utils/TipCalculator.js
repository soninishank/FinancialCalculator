import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const TIP_PRESETS = [10, 15, 18, 20, 25];

const TipCalculator = ({ currency }) => {
    const [billAmount, setBillAmount] = useState(2500);
    const [tipPercent, setTipPercent] = useState(15);
    const [splitCount, setSplitCount] = useState(2);

    const result = useMemo(() => {
        const bill = parseFloat(billAmount) || 0;
        const tip = parseFloat(tipPercent) || 0;
        const split = Math.max(1, parseFloat(splitCount) || 1);

        const tipAmount = (bill * tip) / 100;
        const totalBill = bill + tipAmount;
        const perPerson = totalBill / split;
        const tipPerPerson = tipAmount / split;

        return { tipAmount, totalBill, perPerson, tipPerPerson };
    }, [billAmount, tipPercent, splitCount]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Bill Amount"
                value={billAmount}
                onChange={setBillAmount}
                min={100}
                max={100000}
                step={100}
                currency={currency}
            />

            {/* Tip Preset Buttons */}
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Quick Tip
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {TIP_PRESETS.map((pct) => (
                        <button
                            key={pct}
                            onClick={() => setTipPercent(pct)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200 border ${tipPercent === pct
                                ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/25 scale-105'
                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-teal-400 hover:text-teal-600'
                                }`}
                        >
                            {pct}%
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Tip Percentage"
                value={tipPercent}
                onChange={setTipPercent}
                min={0}
                max={50}
                step={1}
                suffix="%"
            />
            <InputWithSlider
                label="Split Between"
                value={splitCount}
                onChange={setSplitCount}
                min={1}
                max={20}
                step={1}
                suffix={splitCount === 1 ? ' person' : ' people'}
            />
        </div>
    );

    const summary = (
        <div className="space-y-4">
            {/* Per Person Card — Hero */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-center text-white">
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">
                    {splitCount > 1 ? 'Each Person Pays' : 'You Pay'}
                </p>
                <h2 className="text-5xl font-bold">
                    {moneyFormat(result.perPerson, currency)}
                </h2>
                {splitCount > 1 && (
                    <p className="text-sm opacity-80 mt-2">
                        Split {splitCount} ways · Tip per person: {moneyFormat(result.tipPerPerson, currency)}
                    </p>
                )}
            </div>

            {/* Bill Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bill Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {moneyFormat(billAmount, currency)}
                    </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 text-center">
                    <p className="text-xs font-semibold text-amber-500 uppercase mb-1">Tip ({tipPercent}%)</p>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                        {moneyFormat(result.tipAmount, currency)}
                    </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center">
                    <p className="text-xs font-semibold text-emerald-500 uppercase mb-1">Total</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {moneyFormat(result.totalBill, currency)}
                    </p>
                </div>
            </div>

            {/* Visual bar */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <span>Bill</span>
                    <span className="flex-1" />
                    <span>+ Tip</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${(billAmount / result.totalBill) * 100}%` }}
                    />
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                        style={{ width: `${(result.tipAmount / result.totalBill) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tipping Guide</h3>
            <div className="prose prose-teal max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-4">
                    Tipping customs vary by country and service type. Use these benchmarks as a starting point.
                </p>
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-200 dark:border-slate-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Service</th>
                                <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Typical Tip</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Restaurant (US)</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">15–20%</td></tr>
                            <tr className="bg-gray-50 dark:bg-slate-800/30"><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Restaurant (India)</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">5–10%</td></tr>
                            <tr><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Coffee / Quick Service</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">10–15%</td></tr>
                            <tr className="bg-gray-50 dark:bg-slate-800/30"><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Food Delivery</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">10–15%</td></tr>
                            <tr><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Salon / Spa</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">15–20%</td></tr>
                            <tr className="bg-gray-50 dark:bg-slate-800/30"><td className="border border-gray-200 dark:border-slate-700 px-4 py-2">Hotel Housekeeping</td><td className="border border-gray-200 dark:border-slate-700 px-4 py-2 font-bold text-teal-600">$2–5 / day</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                        💡 <strong>Pro Tip:</strong> Many restaurants in India include a "Service Charge" (often 5–10%) in the bill. Check before tipping extra — it's not mandatory to tip on top of a service charge.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            details={details}
            inputLabel="Your Bill"
            resultLabel="Tipping Reference"
        />
    );
};

export default TipCalculator;
