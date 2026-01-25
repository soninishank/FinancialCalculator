import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import InputWithSlider from '../../common/InputWithSlider';
import FormattedInput from '../../common/FormattedInput';
import { moneyFormat } from '../../../utils/formatting';

ChartJS.register(ArcElement, Tooltip, Legend);

const RentalYieldCalculator = ({ currency }) => {
    const [propertyValue, setPropertyValue] = useState(5000000);
    const [monthlyRent, setMonthlyRent] = useState(25000);
    const [annualMaintenance, setAnnualMaintenance] = useState(10000);
    const [propertyTax, setPropertyTax] = useState(5000);
    const [otherExpenses, setOtherExpenses] = useState(2000);

    const [grossYield, setGrossYield] = useState(0);
    const [netYield, setNetYield] = useState(0);
    const [annualCashFlow, setAnnualCashFlow] = useState(0);

    useEffect(() => {
        const val = parseFloat(propertyValue) || 0;
        const rent = parseFloat(monthlyRent) || 0;
        const maintenance = parseFloat(annualMaintenance) || 0;
        const tax = parseFloat(propertyTax) || 0;
        const other = parseFloat(otherExpenses) || 0;

        const annualRent = rent * 12;
        const totalExpenses = maintenance + tax + other;
        const netIncome = annualRent - totalExpenses;

        setAnnualCashFlow(netIncome);
        setGrossYield(val > 0 ? (annualRent / val) * 100 : 0);
        setNetYield(val > 0 ? (netIncome / val) * 100 : 0);

    }, [propertyValue, monthlyRent, annualMaintenance, propertyTax, otherExpenses]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <InputWithSlider
                    label="Property Value"
                    value={propertyValue}
                    onChange={setPropertyValue}
                    min={100000}
                    max={100000000}
                    step={50000}
                    currency={currency}
                />
                <InputWithSlider
                    label="Monthly Rent Expected"
                    value={monthlyRent}
                    onChange={setMonthlyRent}
                    min={1000}
                    max={500000}
                    step={1000}
                    currency={currency}
                />

                <h4 className="text-sm font-semibold text-gray-900 dark:text-white pt-4">Annual Expenses</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Maintenance</label>
                        <FormattedInput
                            value={annualMaintenance}
                            onChange={setAnnualMaintenance}
                            currency={currency}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:bg-slate-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Property Tax</label>
                        <FormattedInput
                            value={propertyTax}
                            onChange={setPropertyTax}
                            currency={currency}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:bg-slate-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Other Costs</label>
                        <FormattedInput
                            value={otherExpenses}
                            onChange={setOtherExpenses}
                            currency={currency}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:bg-slate-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Cash Flow Breakdown</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut
                            data={{
                                labels: ['Net Income', 'Maintenance', 'Property Tax', 'Other Costs'],
                                datasets: [{
                                    data: [annualCashFlow, annualMaintenance, propertyTax, otherExpenses],
                                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6366F1'],
                                    borderWidth: 0,
                                    hoverOffset: 4
                                }]
                            }}
                            options={{
                                plugins: {
                                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                let value = context.raw;
                                                let total = context.chart._metasets[context.datasetIndex].total;
                                                let percentage = (value / total * 100).toFixed(1) + '%';
                                                return ` ${context.label}: ${moneyFormat(value, currency)} (${percentage})`;
                                            }
                                        }
                                    }
                                },
                                cutout: '70%'
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Yield Analysis</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gross Yield</span>
                                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{!isNaN(grossYield) ? grossYield.toFixed(2) : "0.00"}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(grossYield * 5, 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Annual Rent ÷ Property Value</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Yield</span>
                                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{!isNaN(netYield) ? netYield.toFixed(2) : "0.00"}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${Math.min(netYield * 5, 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">(Annual Rent - Expenses) ÷ Property Value</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-900 dark:text-white font-semibold">Annual Net Income</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {moneyFormat(annualCashFlow, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalYieldCalculator;
