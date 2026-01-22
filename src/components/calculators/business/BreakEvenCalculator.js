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

const BreakEvenCalculator = ({ currency }) => {
    const [fixedCosts, setFixedCosts] = useState(50000);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(50);
    const [sellingPricePerUnit, setSellingPricePerUnit] = useState(100);

    // Results
    const [breakEvenUnits, setBreakEvenUnits] = useState(0);
    const [breakEvenSales, setBreakEvenSales] = useState(0);
    const [contributionMargin, setContributionMargin] = useState(0);
    const [contributionMarginRatio, setContributionMarginRatio] = useState(0);

    useEffect(() => {
        const fc = parseFloat(fixedCosts) || 0;
        const vc = parseFloat(variableCostPerUnit) || 0;
        const sp = parseFloat(sellingPricePerUnit) || 0;

        const cm = sp - vc;
        const cmRatio = sp > 0 ? (cm / sp) : 0;

        // Break even point (units) = Fixed Costs / (Selling Price - Variable Costs)
        let beUnits = 0;
        if (cm > 0) {
            beUnits = fc / cm;
        }

        const beSales = beUnits * sp;

        setContributionMargin(cm);
        setContributionMarginRatio(cmRatio * 100);
        setBreakEvenUnits(beUnits);
        setBreakEvenSales(beSales);
    }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit]);

    const chartData = {
        labels: ['Variable Costs', 'Contribution Margin'],
        datasets: [
            {
                data: [parseFloat(variableCostPerUnit) || 0, contributionMargin > 0 ? contributionMargin : 0],
                backgroundColor: ['#f43f5e', '#10b981'],
                borderColor: ['#e11d48', '#059669'],
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
                    label="Total Fixed Costs"
                    value={fixedCosts}
                    onChange={setFixedCosts}
                    min={1000}
                    max={10000000}
                    step={1000}
                    currency={currency}
                    helperText="Rent, Insurance, Salaries (costs that don't change with production volume)"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputWithSlider
                        label="Variable Cost (Per Unit)"
                        value={variableCostPerUnit}
                        onChange={setVariableCostPerUnit}
                        min={0}
                        max={10000}
                        step={10}
                        currency={currency}
                        helperText="Materials, Labor..."
                    />
                    <InputWithSlider
                        label="Selling Price (Per Unit)"
                        value={sellingPricePerUnit}
                        onChange={setSellingPricePerUnit}
                        min={0}
                        max={20000}
                        step={10}
                        currency={currency}
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Break-Even Point</h3>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Units to Sell</span>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {new Intl.NumberFormat('en-IN').format(Math.ceil(breakEvenUnits))} <span className="text-sm text-gray-400 font-normal">units</span>
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Sales Revenue Needed</span>
                        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {moneyFormat(breakEvenSales, currency)}
                        </span>
                    </div>
                </div>

                {contributionMargin <= 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
                        ⚠️ Selling Price must be higher than Variable Cost to ever break even.
                    </div>
                )}

            </div>

            {/* Chart Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="w-64 h-64 relative">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Margin per Unit</span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {!isNaN(contributionMarginRatio) ? contributionMarginRatio.toFixed(1) : "0.0"}%
                        </span>
                    </div>
                </div>
                <p className="mt-4 text-xs text-center text-gray-500 max-w-xs">
                    This chart shows the portion of each sale (Contribution Margin) that goes towards covering your fixed costs.
                </p>
            </div>
        </div>
    );
};

export default BreakEvenCalculator;
