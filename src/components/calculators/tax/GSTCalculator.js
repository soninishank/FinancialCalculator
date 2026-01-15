import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Receipt, ArrowRightLeft } from 'lucide-react';

export default function GSTCalculator({ currency = 'INR' }) {
    const [amount, setAmount] = useState(10000);
    const [gstRate, setGstRate] = useState(18);
    const [isInclusive, setIsInclusive] = useState(false); // false = Exclusive (Add GST), true = Inclusive (Remove GST)

    const result = useMemo(() => {
        let netAmount, gstAmount, totalAmount;

        if (isInclusive) {
            // Amount includes GST. We need to find the base amount.
            // Formula: Total = Base * (1 + Rate/100)
            // Base = Total / (1 + Rate/100)
            totalAmount = amount;
            netAmount = amount / (1 + gstRate / 100);
            gstAmount = totalAmount - netAmount;
        } else {
            // Amount is base. We need to add GST.
            netAmount = amount;
            gstAmount = amount * (gstRate / 100);
            totalAmount = netAmount + gstAmount;
        }

        return {
            netAmount,
            gstAmount,
            totalAmount
        };
    }, [amount, gstRate, isInclusive]);

    const inputs = (
        <div className="space-y-6">
            {/* Calculation Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
                <button
                    onClick={() => setIsInclusive(false)}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!isInclusive
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Add GST <span className="text-[10px] font-normal opacity-75">(Exclusive)</span>
                </button>
                <button
                    onClick={() => setIsInclusive(true)}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isInclusive
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Remove GST <span className="text-[10px] font-normal opacity-75">(Inclusive)</span>
                </button>
            </div>

            <InputWithSlider
                label={isInclusive ? "Total Amount (Inc. GST)" : "Net Amount (Ex. GST)"}
                value={amount}
                onChange={setAmount}
                min={100}
                max={1000000}
                step={100}
                currency={currency}
            />

            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    GST Rate
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {[5, 12, 18, 28].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => setGstRate(rate)}
                            className={`py-2 px-1 rounded-lg text-sm font-bold border transition-colors ${gstRate === rate
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {rate}%
                        </button>
                    ))}
                    <div className="relative">
                        <input
                            type="number"
                            value={gstRate}
                            onChange={(e) => setGstRate(Number(e.target.value))}
                            className={`w-full py-2 pl-2 pr-1 rounded-lg text-sm font-bold border text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${[5, 12, 18, 28].includes(gstRate)
                                ? 'bg-gray-50 text-gray-500 border-gray-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                        />
                        <span className="absolute right-1 top-2.5 text-[10px] text-gray-400 font-bold">%</span>
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5" /> GST Calculator
                </h2>
                <p className="text-sm text-indigo-700">Calculate GST inclusive or exclusive amounts instantly.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <UnifiedSummary
                        invested={result.netAmount}
                        gain={result.gstAmount}
                        total={result.totalAmount}
                        currency={currency}
                        labels={{
                            invested: "Net Amount",
                            gain: "GST Amount",
                            total: "Total Amount"
                        }}
                    />
                }
                details={calculatorDetails['gst-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
