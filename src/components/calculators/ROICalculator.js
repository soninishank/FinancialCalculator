import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialInvestmentPieChart } from '../common/FinancialCharts';
import ResultsTable from '../common/ResultsTable';
import {
    MAX_AMOUNT,
    MAX_YEARS,
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
            timeInYears,
            start
        };
    }, [initialInvestment, finalValue, absoluteProfit, years, months, inputMode, timeMode]);

    // --- TABLE DATA GENERATION ---
    const tableData = useMemo(() => {
        const data = [];
        const periods = timeMode === 'years' ? years : months;
        const rate = result.annualizedRoi / 100;

        let currentValue = result.start;

        // For accurate yearly/monthly projection steps strictly adhering to the final value:
        // If we simply compound `annualizedRoi` annually, we should hit exact `end` after `timeInYears`.
        // If months, we need monthly rate: (1 + annual)^ (1/12) - 1.

        const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
        const effectiveRate = timeMode === 'years' ? rate : monthlyRate;

        for (let i = 1; i <= periods; i++) {
            currentValue = currentValue * (1 + effectiveRate);
            const totalGrowth = currentValue - result.start;

            data.push({
                year: timeMode === 'years' ? i : `${i} (Mo)`,
                totalInvested: result.start,
                growth: totalGrowth,
                overallValue: currentValue
            });
        }

        return data;
    }, [result.start, result.annualizedRoi, years, months, timeMode]);


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
                        max={MAX_YEARS}
                        step={1}
                    />
                ) : (
                    <InputWithSlider
                        label="Investment Period (Months)"
                        value={months}
                        onChange={setMonths}
                        min={1}
                        max={MAX_YEARS * 12}
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
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Return (Absolute ROI)</p>
                <p className={`text-4xl font-extrabold mt-2 ${result.roiPercentage >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {result.roiPercentage.toFixed(2)}%
                </p>
                <p className={`text-sm mt-1 font-medium ${result.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {result.gain >= 0 ? "+" : ""}{moneyFormat(result.gain, currency)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Total % Gain over full period
                </p>
            </div>

            {/* CARD 2: Annualized */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Annualized Return (CAGR)</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                    {result.annualizedRoi.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Average Yearly Growth Rate
                </p>
            </div>
        </div>
    );

    const details = (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Confused between ROI and CAGR?</h3>

            <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                    This calculator provides <strong>both metrics</strong> because they answer different questions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="font-bold text-emerald-800 mb-1">Absolute ROI (Total Return)</p>
                        <p className="text-sm text-emerald-700">
                            How much total profit did I make?
                        </p>
                        <ul className="list-disc pl-4 mt-2 text-xs text-emerald-800 space-y-1">
                            <li>Best for: Simple profit check.</li>
                            <li>Problem: Ignores time. 50% in 1 year is better than 50% in 10 years, but ROI looks the same.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="font-bold text-blue-800 mb-1">CAGR (Annualized Return)</p>
                        <p className="text-sm text-blue-700">
                            How hard did my money work each year?
                        </p>
                        <ul className="list-disc pl-4 mt-2 text-xs text-blue-800 space-y-1">
                            <li>Best for: Comparing different investments.</li>
                            <li>Benefit: Accounts for time. It shows the effective yearly interest rate.</li>
                        </ul>
                    </div>
                </div>

                <p className="text-sm italic text-gray-500 mt-2">
                    *CAGR = Compounded Annual Growth Rate
                </p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            pieChart={
                <div className="h-full">
                    <FinancialInvestmentPieChart
                        invested={initialInvestment}
                        gain={result.gain}
                        total={result.computedFinalValue}
                        currency={currency}
                        years={timeMode === 'years' ? `${years} years` : `${months} months`}
                    />
                </div>
            }
            table={
                <ResultsTable
                    data={tableData}
                    currency={currency}
                    columns={[
                        { key: 'year', label: timeMode === 'years' ? 'Year' : 'Month', align: 'left' },
                        { key: 'totalInvested', label: 'Invested', align: 'right', format: 'money' },
                        { key: 'growth', label: 'Growth', align: 'right', format: 'money', color: 'green' },
                        { key: 'overallValue', label: 'Total Value', align: 'right', format: 'money', highlight: true }
                    ]}
                />
            }
            details={details}
        />
    );
}
