import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import FormattedInput from '../../common/FormattedInput';
import { moneyFormat } from '../../../utils/formatting';

ChartJS.register(ArcElement, Tooltip, Legend);

const StockAverageCalculator = ({ currency }) => {
    const [entries, setEntries] = useState([
        { quantity: '', price: '' },
        { quantity: '', price: '' }
    ]);
    const [averagePrice, setAveragePrice] = useState(0);
    const [totalUnits, setTotalUnits] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const handleChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const addEntry = () => {
        setEntries([...entries, { quantity: '', price: '' }]);
    };

    const removeEntry = (index) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
    };

    useEffect(() => {
        let tUnits = 0;
        let tAmount = 0;

        entries.forEach(entry => {
            const q = parseFloat(entry.quantity) || 0;
            const p = parseFloat(entry.price) || 0;
            tUnits += q;
            tAmount += q * p;
        });

        setTotalUnits(tUnits);
        setTotalAmount(tAmount);
        setAveragePrice(tUnits > 0 ? tAmount / tUnits : 0);
    }, [entries]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                <FormattedInput
                                    value={entry.quantity}
                                    onChange={(val) => handleChange(index, 'quantity', val)}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:bg-slate-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Qty"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Price per share</label>
                                <FormattedInput
                                    value={entry.price}
                                    onChange={(val) => handleChange(index, 'price', val)}
                                    currency={currency}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:bg-slate-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Price"
                                />
                            </div>
                            {entries.length > 2 && (
                                <button
                                    onClick={() => removeEntry(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addEntry}
                        className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                        <span className="text-lg">+</span> Add another trade
                    </button>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4">Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Total Units</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{totalUnits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Total Investment</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {moneyFormat(totalAmount, currency)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700 flex justify-between items-center">
                            <span className="text-indigo-900 dark:text-indigo-100 font-bold">Average Price</span>
                            <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                {moneyFormat(averagePrice, currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 h-fit">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Why Average Down?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Stock averaging (or averaging down) is a strategy where you buy more shares of a stock as the price drops. This lowers your average cost per share, meaning the stock price doesn't need to rise as much for you to break even or make a profit.
                </p>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                        <strong>Tip:</strong> Always ensure the fundamentals of the company are still strong before averaging down.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StockAverageCalculator;
