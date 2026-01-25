import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { FinancialDoughnutChart } from '../../common/FinancialCharts';
import { moneyFormat } from '../../../utils/formatting';
import { calculatorDetails } from '../../../data/calculatorDetails';

const BreakEvenCalculator = ({ currency }) => {
    const [fixedCosts, setFixedCosts] = useState(50000);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(50);
    const [sellingPricePerUnit, setSellingPricePerUnit] = useState(100);

    const result = useMemo(() => {
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

        return {
            contributionMargin: cm,
            contributionMarginRatio: cmRatio * 100,
            breakEvenUnits: beUnits,
            breakEvenSales: beSales
        };
    }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit]);

    const chartData = {
        labels: ['Variable Costs', 'Contribution Margin'],
        datasets: [
            {
                data: [
                    parseFloat(variableCostPerUnit) || 0,
                    result.contributionMargin > 0 ? result.contributionMargin : 0
                ],
                backgroundColor: ['#f43f5e', '#10b981'],
                borderColor: ['#e11d48', '#059669'],
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

            {result.contributionMargin <= 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
                    ⚠️ Selling Price must be higher than Variable Cost to ever break even.
                </div>
            )}
        </div>
    );

    const summary = (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                    Break-Even Point
                </h3>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Units to Sell</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat('en-IN').format(Math.ceil(result.breakEvenUnits))}{' '}
                        <span className="text-sm text-gray-400 font-normal">units</span>
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Sales Revenue Needed</span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {moneyFormat(result.breakEvenSales, currency)}
                    </span>
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">Margin per Unit</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {!isNaN(result.contributionMarginRatio)
                            ? result.contributionMarginRatio.toFixed(1)
                            : '0.0'}%
                    </span>
                </div>
            </div>
            <p className="mt-4 text-xs text-center text-gray-500 max-w-xs mx-auto">
                This chart shows the portion of each sale (Contribution Margin) that goes towards covering your fixed costs.
            </p>
        </div>
    );

    const details = calculatorDetails['break-even-calculator']?.render() || (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">About Break-Even Analysis</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                    The <strong>Break-Even Point</strong> is the level of sales at which total revenue equals total costs, resulting in neither profit nor loss.
                </p>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-4">Key Concepts:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Fixed Costs:</strong> Expenses that don't change with production volume (rent, salaries, insurance).
                    </li>
                    <li>
                        <strong>Variable Costs:</strong> Expenses that increase with each unit produced (materials, direct labor).
                    </li>
                    <li>
                        <strong>Contribution Margin:</strong> Selling Price minus Variable Cost per unit. This is what contributes to covering fixed costs.
                    </li>
                </ul>
                <p className="text-sm italic text-gray-500 mt-4">
                    Formula: Break-Even Units = Fixed Costs ÷ (Selling Price - Variable Cost)
                </p>
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

export default BreakEvenCalculator;
