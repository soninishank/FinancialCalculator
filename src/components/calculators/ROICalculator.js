import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialPieChart } from '../common/FinancialCharts';
import {
    CHART_COLORS,
    LABELS,
    MAX_AMOUNT,
    DEFAULT_ROI_INITIAL,
    DEFAULT_ROI_FINAL,
    DEFAULT_ROI_YEARS
} from '../../utils/constants';

export default function ROICalculator({ currency }) {
    const [initialInvestment, setInitialInvestment] = useState(DEFAULT_ROI_INITIAL);
    const [finalValue, setFinalValue] = useState(DEFAULT_ROI_FINAL);
    const [years, setYears] = useState(DEFAULT_ROI_YEARS); // Optional time period

    const result = useMemo(() => {
        const start = Number(initialInvestment);
        const end = Number(finalValue);
        const time = Number(years);

        const gain = end - start;
        const roiPercentage = start > 0 ? (gain / start) * 100 : 0;

        // Annualized ROI (CAGR essentially)
        // Formula: (End / Start)^(1/n) - 1
        let annualizedRoi = 0;
        if (start > 0 && end > 0 && time > 0) {
            annualizedRoi = (Math.pow(end / start, 1 / time) - 1) * 100;
        }

        return {
            gain,
            roiPercentage,
            annualizedRoi
        };
    }, [initialInvestment, finalValue, years]);

    // --- CHART ---
    const pieData = {
        labels: [LABELS.INVESTED_AMOUNT, LABELS.WEALTH_GAINED],
        datasets: [
            {
                data: [
                    initialInvestment,
                    result.gain > 0 ? result.gain : 0 // Don't show negative slice
                ],
                backgroundColor: [CHART_COLORS.NEUTRAL, CHART_COLORS.PRIMARY],
                borderWidth: 0
            }
        ]
    };

    // --- UI INPUTS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Amount Invested"
                value={initialInvestment}
                onChange={setInitialInvestment}
                min={100}
                max={MAX_AMOUNT}
                step={100}
                currency={currency}
            />
            <InputWithSlider
                label="Amount Returned (Final Value)"
                value={finalValue}
                onChange={setFinalValue}
                min={100}
                max={MAX_AMOUNT * 2} // Allow larger output
                step={100}
                currency={currency}
            />

            <InputWithSlider
                label="Investment Period (Years)"
                value={years}
                onChange={setYears}
                min={0.1} // Allow months (e.g. 0.5)
                max={50}
                step={0.1}
                isDecimal={true}
            />
        </>
    );

    // --- SUMMARY CARDS ---
    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

            {/* CARD 1: ROI % */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Return on Investment</p>
                <p className={`text-4xl font-extrabold mt-2 ${result.roiPercentage >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {result.roiPercentage.toFixed(2)}%
                </p>
                <p className={`text-sm mt-1 font-medium ${result.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {result.gain >= 0 ? "+" : ""}{moneyFormat(result.gain, currency)}
                </p>
            </div>

            {/* CARD 2: Annualized */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Annualized Return</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                    {result.annualizedRoi.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Compounded Annual Growth Rate
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            // Pie chart only makes sense if there is a gain. If loss, standard pie might look weird but we handle it.
            pieChart={
                <div className="h-64 flex justify-center items-center bg-white p-4 rounded-xl border mt-6">
                    <FinancialPieChart data={pieData} currency={currency} height={250} />
                </div>
            }
            charts={null}
            table={null}
        />
    );
}
