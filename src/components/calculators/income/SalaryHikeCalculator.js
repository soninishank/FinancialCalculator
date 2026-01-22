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

const SalaryHikeCalculator = ({ currency }) => {
    // Using local state instead of missing CalculatorContext
    const [currentSalary, setCurrentSalary] = useState(500000);
    const [hikePercentage, setHikePercentage] = useState(10);
    const [newSalary, setNewSalary] = useState(0);
    const [hikeAmount, setHikeAmount] = useState(0);

    useEffect(() => {
        const salary = parseFloat(currentSalary) || 0;
        const hike = parseFloat(hikePercentage) || 0;

        const increase = (salary * hike) / 100;
        const finalSalary = salary + increase;

        setHikeAmount(increase);
        setNewSalary(finalSalary);
    }, [currentSalary, hikePercentage]);

    const chartData = {
        labels: ['Current Salary', 'Hike Amount'],
        datasets: [
            {
                data: [parseFloat(currentSalary) || 0, hikeAmount],
                backgroundColor: ['#e2e8f0', '#10b981'],
                borderColor: ['#cbd5e1', '#059669'],
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
            {/* Input Section */}
            <div className="flex-1 space-y-6">

                <InputWithSlider
                    label="Current Annual Salary"
                    value={currentSalary}
                    onChange={setCurrentSalary}
                    min={100000}
                    max={10000000}
                    step={10000}
                    currency={currency}
                />

                <InputWithSlider
                    label="Hike Percentage"
                    value={hikePercentage}
                    onChange={setHikePercentage}
                    min={0}
                    max={100}
                    step={0.5}
                    symbol="%"
                />

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4">New Salary Structure</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Old Salary</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {moneyFormat(parseFloat(currentSalary) || 0, currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Hike Amount</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                + {moneyFormat(hikeAmount, currency)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700 flex justify-between items-center">
                            <span className="text-indigo-900 dark:text-indigo-100 font-bold">New Annual Salary</span>
                            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                {moneyFormat(newSalary, currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>New Monthly Salary</span>
                            <span>
                                {moneyFormat(newSalary / 12, currency)} /mo
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
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Hike</span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {hikePercentage}%
                        </span>
                    </div>
                </div>
                <div className="mt-6 w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                            <span className="text-gray-600 dark:text-gray-300">Current Salary</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{newSalary > 0 && !isNaN(currentSalary) ? (parseFloat(currentSalary) / newSalary * 100).toFixed(1) : '0.0'}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-600 dark:text-gray-300">Hike Amount</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{newSalary > 0 && !isNaN(hikeAmount) ? (hikeAmount / newSalary * 100).toFixed(1) : '0.0'}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryHikeCalculator;
