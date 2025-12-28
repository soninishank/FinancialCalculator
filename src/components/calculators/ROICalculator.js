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
    const [absoluteProfit, setAbsoluteProfit] = useState(DEFAULT_ROI_FINAL - DEFAULT_ROI_INITIAL);
    const [years, setYears] = useState(DEFAULT_ROI_YEARS);
    const [months, setMonths] = useState(DEFAULT_ROI_YEARS * 12);
    const [inputMode, setInputMode] = useState('value'); // 'value' for Final Value, 'profit' for Absolute Profit
    const [timeMode, setTimeMode] = useState('years'); // 'years' or 'months'

    const result = useMemo(() => {
        const start = Number(initialInvestment);
        let end;
        let gain;

        if (inputMode === 'profit') {
            gain = Number(absoluteProfit);
            end = start + gain;
        } else {
            end = Number(finalValue);
            gain = end - start;
        }

        // Normalize time to years for CAGR formula
        const timeInYears = timeMode === 'months' ? Number(months) / 12 : Number(years);
        const roiPercentage = start > 0 ? (gain / start) * 100 : 0;

        // Annualized ROI (CAGR essentially)
        let annualizedRoi = 0;
        if (start > 0 && end > 0 && timeInYears > 0) {
            annualizedRoi = (Math.pow(end / start, 1 / timeInYears) - 1) * 100;
        }

        return {
            gain,
            roiPercentage,
            annualizedRoi,
            computedFinalValue: end,
            timeInYears
        };
    }, [initialInvestment, finalValue, absoluteProfit, years, months, inputMode, timeMode]);

    // Handle initial calculation and sync
    const handleModeChange = (mode) => {
        if (mode === 'profit') {
            setAbsoluteProfit(finalValue - initialInvestment);
        } else {
            setFinalValue(initialInvestment + absoluteProfit);
        }
        setInputMode(mode);
    };

    const handleTimeModeChange = (mode) => {
        if (mode === 'months') {
            setMonths(Math.round(years * 12));
        } else {
            setYears(Number((months / 12).toFixed(2)));
        }
        setTimeMode(mode);
    };

    // --- CHART ---
    const pieData = {
        labels: [LABELS.INVESTED_AMOUNT, LABELS.WEALTH_GAINED],
        datasets: [
            {
                data: [
                    initialInvestment,
                    result.gain > 0 ? result.gain : 0
                ],
                backgroundColor: [CHART_COLORS.NEUTRAL, CHART_COLORS.PRIMARY],
                borderWidth: 0
            }
        ]
    };

    // --- UI INPUTS ---
    const inputs = (
        <>
            <div className="md:col-span-2 mb-2">
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => handleModeChange('value')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'value' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Final Value Mode
                    </button>
                    <button
                        onClick={() => handleModeChange('profit')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'profit' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Profit Mode
                    </button>
                </div>
            </div>

            <InputWithSlider
                label="Amount Invested"
                value={initialInvestment}
                onChange={setInitialInvestment}
                min={100}
                max={MAX_AMOUNT}
                step={100}
                currency={currency}
            />

            {inputMode === 'value' ? (
                <InputWithSlider
                    label="Amount Returned (Final Value)"
                    value={finalValue}
                    onChange={setFinalValue}
                    min={100}
                    max={MAX_AMOUNT * 2}
                    step={100}
                    currency={currency}
                />
            ) : (
                <InputWithSlider
                    label="Total Profit / Gain"
                    value={absoluteProfit}
                    onChange={setAbsoluteProfit}
                    min={-MAX_AMOUNT} // Allow losses
                    max={MAX_AMOUNT}
                    step={100}
                    currency={currency}
                />
            )}

            <div className="md:col-span-2 mt-4">
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-4">
                    <button
                        onClick={() => handleTimeModeChange('years')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeMode === 'years' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Years
                    </button>
                    <button
                        onClick={() => handleTimeModeChange('months')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeMode === 'months' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Months
                    </button>
                </div>

                {timeMode === 'years' ? (
                    <InputWithSlider
                        label="Investment Period (Years)"
                        value={years}
                        onChange={setYears}
                        min={1}
                        max={50}
                        step={1}
                    />
                ) : (
                    <InputWithSlider
                        label="Investment Period (Months)"
                        value={months}
                        onChange={setMonths}
                        min={1}
                        max={600}
                        step={1}
                    />
                )}
            </div>
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
