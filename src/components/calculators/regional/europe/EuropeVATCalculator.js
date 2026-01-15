import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { ShoppingCart } from 'lucide-react';

const VAT_RATES = [
    { country: 'Germany', standard: 19, reduced: 7 },
    { country: 'France', standard: 20, reduced: 5.5 },
    { country: 'Italy', standard: 22, reduced: 10 },
    { country: 'Spain', standard: 21, reduced: 10 },
    { country: 'Netherlands', standard: 21, reduced: 9 },
    { country: 'Ireland', standard: 23, reduced: 13.5 },
    { country: 'Custom', standard: 20, reduced: 0 }
];

export default function EuropeVATCalculator({ currency = 'EUR' }) {
    const [amount, setAmount] = useState(100);
    const [selectedCountry, setSelectedCountry] = useState('Germany');
    const [customRate, setCustomRate] = useState(20);
    const [isInclusive, setIsInclusive] = useState(false);
    const [isReduced, setIsReduced] = useState(false);

    const activeRate = useMemo(() => {
        if (selectedCountry === 'Custom') return customRate;
        const c = VAT_RATES.find(r => r.country === selectedCountry);
        return isReduced ? c.reduced : c.standard;
    }, [selectedCountry, customRate, isReduced]);

    const result = useMemo(() => {
        const rateDecimal = activeRate / 100;
        let netAmount, vatAmount, grossAmount;

        if (isInclusive) {
            // Amount is gross (with VAT)
            grossAmount = amount;
            netAmount = grossAmount / (1 + rateDecimal);
            vatAmount = grossAmount - netAmount;
        } else {
            // Amount is net (without VAT)
            netAmount = amount;
            vatAmount = netAmount * rateDecimal;
            grossAmount = netAmount + vatAmount;
        }

        return {
            netAmount,
            vatAmount,
            grossAmount,
            rate: activeRate
        };
    }, [amount, activeRate, isInclusive]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label={isInclusive ? "Gross Amount (Inc. VAT)" : "Net Amount (Excl. VAT)"}
                value={amount}
                onChange={setAmount}
                min={0}
                max={100000}
                step={10}
                currency={currency}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Country / Rate</label>
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                    {VAT_RATES.map(r => (
                        <option key={r.country} value={r.country}>{r.country}</option>
                    ))}
                </select>
            </div>

            {selectedCountry === 'Custom' ? (
                <InputWithSlider
                    label="Custom VAT Rate (%)"
                    value={customRate}
                    onChange={setCustomRate}
                    min={0}
                    max={50}
                    step={0.5}
                    symbol="%"
                    isDecimal={true}
                />
            ) : (
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsReduced(false)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${!isReduced ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Standard ({VAT_RATES.find(r => r.country === selectedCountry).standard}%)
                    </button>
                    <button
                        onClick={() => setIsReduced(true)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${isReduced ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Reduced ({VAT_RATES.find(r => r.country === selectedCountry).reduced}%)
                    </button>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Calculation Type</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsInclusive(false)}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${!isInclusive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Add VAT
                    </button>
                    <button
                        onClick={() => setIsInclusive(true)}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${isInclusive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Remove VAT
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Europe VAT Calculator
                </h2>
                <p className="text-sm text-indigo-800">Quickly calculate VAT inclusive or exclusive amounts for European countries.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">VAT Amount ({result.rate}%)</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.vatAmount)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Net (Excl. VAT)</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.netAmount)}
                                </p>
                            </div>
                            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                                <p className="text-xs text-teal-600 uppercase font-bold mb-1">Gross (Inc. VAT)</p>
                                <p className="text-xl font-bold text-teal-700">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.grossAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 underline decoration-teal-500 underline-offset-4">Reverse Calculation Proof</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Base Amount</span>
                                    <span className="font-medium">{new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.netAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">VAT ({result.rate}%)</span>
                                    <span className="font-medium text-teal-600">+{new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.vatAmount)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(result.grossAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 font-bold text-teal-600 text-xl">
                                %
                            </div>
                            <p className="text-gray-500 text-sm italic">
                                "{isInclusive ? 'Removing' : 'Adding'} {result.rate}% VAT to {new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)}"
                            </p>
                        </div>
                    </div>
                }
                details={calculatorDetails['europe-vat']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
