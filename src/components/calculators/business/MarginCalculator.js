import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { FinancialDoughnutChart } from '../../common/FinancialCharts';
import { moneyFormat } from '../../../utils/formatting';
import { calculatorDetails } from '../../../data/calculatorDetails';

const MarginCalculator = ({ currency }) => {
    const [cost, setCost] = useState(100);
    const [revenue, setRevenue] = useState(150);

    const result = useMemo(() => {
        const c = parseFloat(cost) || 0;
        const r = parseFloat(revenue) || 0;

        const p = r - c;
        const marg = r > 0 ? (p / r) * 100 : 0;
        const mark = c > 0 ? (p / c) * 100 : 0;

        return {
            profit: p,
            margin: marg,
            markup: mark
        };
    }, [cost, revenue]);

    const chartData = {
        labels: ['Cost', 'Profit'],
        datasets: [
            {
                data: [parseFloat(cost) || 0, result.profit > 0 ? result.profit : 0],
                backgroundColor: ['#94a3b8', '#10b981'],
                borderColor: ['#64748b', '#059669'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const inputs = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputWithSlider
                    label="Cost"
                    value={cost}
                    onChange={setCost}
                    min={0}
                    max={10000000}
                    step={100}
                    currency={currency}
                />
                <InputWithSlider
                    label="Revenue"
                    value={revenue}
                    onChange={setRevenue}
                    min={0}
                    max={10000000}
                    step={100}
                    currency={currency}
                />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Key Difference</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    <strong>Margin</strong> is based on Revenue (Sales Price), while <strong>Markup</strong> is based on Cost.
                    A 50% Markup equals a 33.3% Margin.
                </p>
            </div>
        </div>
    );

    const summary = (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Results</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
                    <div className="pt-4 md:pt-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gross Profit</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {moneyFormat(result.profit, currency)}
                        </p>
                    </div>
                    <div className="pt-4 md:pt-0 md:pl-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Margin</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                            {!isNaN(result.margin) ? result.margin.toFixed(2) : '0.00'}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">(Profit ÷ Revenue)</p>
                    </div>
                    <div className="pt-4 md:pt-0 md:pl-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Markup</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                            {!isNaN(result.markup) ? result.markup.toFixed(2) : '0.00'}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">(Profit ÷ Cost)</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const charts = (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
            <div className="relative w-64 h-64 mx-auto">
                <FinancialDoughnutChart
                    data={chartData}
                    currency={currency}
                    height={256}
                    options={chartOptions}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Margin</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {!isNaN(result.margin) ? result.margin.toFixed(1) : '0.0'}%
                    </span>
                </div>
            </div>
        </div>
    );

    const details = calculatorDetails['margin-calculator']?.render() || (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Margin vs Markup Explained</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                    <strong>Margin</strong> and <strong>Markup</strong> are both profitability metrics, but they use different denominators:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="font-bold text-indigo-800 mb-2">Profit Margin</p>
                        <p className="text-sm text-indigo-700">
                            Margin = (Profit ÷ Revenue) × 100
                        </p>
                        <p className="text-xs text-indigo-600 mt-2">
                            Tells you what percentage of your sales is pure profit.
                        </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="font-bold text-purple-800 mb-2">Markup</p>
                        <p className="text-sm text-purple-700">
                            Markup = (Profit ÷ Cost) × 100
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                            Tells you how much you've marked up the cost to set your selling price.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-4">
                    <p className="font-bold text-amber-800 mb-2">Example:</p>
                    <p className="text-sm text-amber-700">
                        If you buy an item for $100 and sell it for $150:
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-sm text-amber-700 space-y-1">
                        <li>Profit = $50</li>
                        <li>Margin = $50 ÷ $150 = 33.3%</li>
                        <li>Markup = $50 ÷ $100 = 50%</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={charts}
            details={details}
        />
    );
};

export default MarginCalculator;
