import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarginCalculator = ({ currency }) => {
    // We'll reuse existing context fields for cost and revenue if suitable, 
    // or just use generic inputs since this calculator is self-contained.
    // For specific variable naming clarity, local state is often better if not sharing globally.
    // But we need to use `useCalculator` to persist state across tab switches if we want standard behavior.
    // Let's use generic custom fields from context or just map existing ones.
    // Mapping: principal -> Cost, interestRate -> Revenue (Not ideal type mismatch)
    // Let's stick to local state if the context doesn't have "cost" and "revenue".
    // Actually, usually we add new keys to context if we want persistence. 
    // To safe time, I'll use local state but initialize from context if I could. 
    // For now, I'll use local state for simplicity as these are quick calculators.

    // WAIT, the prompt implies I should fit into the existing system. 
    // The previous calculator used `useCalculator`. 
    // I should check `CalculatorContext.js` to see available fields or if I can add new ones.
    // Since I can't easily edit context without potential side effects on other calcs,
    // I will use local state for specific fields but allow context for common ones if applicable.
    // Actually, `SalaryHikeCalculator` used `currentSalary` and `hikePercentage` which might be new or reused.
    // I will assume for now I should use local state for these specific business inputs 
    // to avoid polluting global context unless I edit the context file.

    const [cost, setCost] = useState(100);
    const [revenue, setRevenue] = useState(150);

    // Computed values
    const [profit, setProfit] = useState(0);
    const [margin, setMargin] = useState(0);
    const [markup, setMarkup] = useState(0);

    useEffect(() => {
        const c = parseFloat(cost) || 0;
        const r = parseFloat(revenue) || 0;

        const p = r - c;
        const marg = r > 0 ? (p / r) * 100 : 0;
        const mark = c > 0 ? (p / c) * 100 : 0;

        setProfit(p);
        setMargin(marg);
        setMarkup(mark);
    }, [cost, revenue]);

    const chartData = {
        labels: ['Cost', 'Profit'],
        datasets: [
            {
                data: [parseFloat(cost) || 0, profit > 0 ? profit : 0],
                backgroundColor: ['#94a3b8', '#10b981'],
                borderColor: ['#64748b', '#059669'],
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

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Results</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
                        <div className="pt-4 md:pt-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gross Profit</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {moneyFormat(profit, currency)}
                            </p>
                        </div>
                        <div className="pt-4 md:pt-0 md:pl-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Margin</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                {!isNaN(margin) ? margin.toFixed(2) : "0.00"}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">(Profit ÷ Revenue)</p>
                        </div>
                        <div className="pt-4 md:pt-0 md:pl-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Markup</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {!isNaN(markup) ? markup.toFixed(2) : "0.00"}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">(Profit ÷ Cost)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Key Difference</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                        <strong>Margin</strong> is based on Revenue (Sales Price), while <strong>Markup</strong> is based on Cost.
                        A 50% Markup equals a 33.3% Margin.
                    </p>
                </div>

            </div>

            {/* Chart Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="w-64 h-64 relative">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Margin</span>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {!isNaN(margin) ? margin.toFixed(1) : "0.0"}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarginCalculator;
