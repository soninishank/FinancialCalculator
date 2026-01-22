import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DiscountCalculator = ({ currency }) => {
    const [price, setPrice] = useState(1000);
    const [discount1, setDiscount1] = useState(10);
    const [discount2, setDiscount2] = useState(0); // For double discounts

    // Results
    const [finalPrice, setFinalPrice] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [effectiveDiscount, setEffectiveDiscount] = useState(0);

    useEffect(() => {
        const p = parseFloat(price) || 0;
        const d1 = parseFloat(discount1) || 0;
        const d2 = parseFloat(discount2) || 0;

        // Apply first discount
        const priceAfterD1 = p - (p * (d1 / 100));

        // Apply second discount on top of the reduced price
        const final = priceAfterD1 - (priceAfterD1 * (d2 / 100));

        const saved = p - final;
        const effective = p > 0 ? (saved / p) * 100 : 0;

        setFinalPrice(final);
        setTotalSavings(saved);
        setEffectiveDiscount(effective);
    }, [price, discount1, discount2]);

    const chartData = {
        labels: ['Final Price', 'Savings'],
        datasets: [
            {
                data: [finalPrice, totalSavings],
                backgroundColor: ['#6366f1', '#10b981'],
                borderColor: ['#4f46e5', '#059669'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">

                <InputWithSlider
                    label="Original Price"
                    value={price}
                    onChange={setPrice}
                    min={0}
                    max={1000000}
                    step={100}
                    currency={currency}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputWithSlider
                        label="Discount 1"
                        value={discount1}
                        onChange={setDiscount1}
                        min={0}
                        max={100}
                        step={1}
                        symbol="%"
                    />
                    <InputWithSlider
                        label="Extra Discount (Optional)"
                        value={discount2}
                        onChange={setDiscount2}
                        min={0}
                        max={100}
                        step={1}
                        symbol="%"
                    />
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4">You Pay</h3>

                    <div className="flex justify-between items-end mb-2">
                        <span className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                            {moneyFormat(finalPrice, currency)}
                        </span>
                    </div>

                    <div className="pt-4 border-t border-indigo-200 dark:border-indigo-700 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Original Price</span>
                            <span className="line-through text-gray-500">
                                {moneyFormat(price, currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Total Savings</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                - {moneyFormat(totalSavings, currency)} <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full ml-1">({!isNaN(effectiveDiscount) ? effectiveDiscount.toFixed(2) : "0.00"}% off)</span>
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Chart Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="w-64 h-64 relative">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-sm text-gray-500 dark:text-gray-400">You Save</span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {!isNaN(effectiveDiscount) ? effectiveDiscount.toFixed(1) : "0.0"}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountCalculator;
