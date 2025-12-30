import React, { useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { downloadPDF } from '../../utils/export';
// FinancialInvestmentPieChart removed
import MonthYearPicker from '../common/MonthYearPicker';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import {
    MAX_AMOUNT,
    MAX_YEARS,
    DEFAULT_ROI_INITIAL,
    DEFAULT_ROI_FINAL,
    DEFAULT_ROI_YEARS
} from '../../utils/constants';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import UnifiedSummary from '../common/UnifiedSummary';

export default function ROICalculator({ currency = 'INR' }) {
    const [initialInvestment, setInitialInvestment] = React.useState(DEFAULT_ROI_INITIAL);
    const [finalValue, setFinalValue] = React.useState(DEFAULT_ROI_FINAL);
    const [absoluteProfit, setAbsoluteProfit] = React.useState(DEFAULT_ROI_FINAL - DEFAULT_ROI_INITIAL);

    // Duration State
    const [years, setYears] = React.useState(DEFAULT_ROI_YEARS);
    const [months, setMonths] = React.useState(DEFAULT_ROI_YEARS * 12);

    // Modes
    const [inputMode, setInputMode] = React.useState('value'); // 'value' | 'profit'
    const [timeMode, setTimeMode] = React.useState('years');   // 'years' | 'months'

    const {
        startDate, setStartDate,
    } = useCalculatorState();

    // timeMode 'years' | 'months' for duration input

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

        let timeInYears = timeMode === 'months' ? Number(months) / 12 : Number(years);

        const roiPercentage = start > 0 ? (gain / start) * 100 : 0;

        // Annualized ROI (CAGR)
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
    const tableResult = useMemo(() => {
        const yearlyData = [];
        const monthlyData = [];
        const totalMonthsRequested = Math.round((timeMode === 'years' ? years : months / 12) * 12);
        const rate = result.annualizedRoi / 100;
        const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;

        let currentValue = result.start;
        const startObj = new Date(startDate);
        const startMonth = startObj.getMonth();
        const startYear = startObj.getFullYear();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let m = 1; m <= totalMonthsRequested; m++) {
            currentValue = currentValue * (1 + monthlyRate);

            const calendarMonthTotal = startMonth + (m - 1);
            const calendarYear = startYear + Math.floor(calendarMonthTotal / 12);
            const calendarMonth = calendarMonthTotal % 12;

            monthlyData.push({
                year: calendarYear,
                month: calendarMonth + 1,
                monthName: monthNames[calendarMonth],
                invested: result.start,
                interest: currentValue - result.start,
                balance: currentValue
            });
        }

        // Robust Calendar Year Aggregation
        const yearsSet = new Set(monthlyData.map(r => r.year));
        const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

        sortedYears.forEach(year => {
            const monthsInYear = monthlyData.filter(r => r.year === year);
            const lastMonth = monthsInYear[monthsInYear.length - 1];

            yearlyData.push({
                year: year,
                totalInvested: lastMonth.invested,
                growth: lastMonth.interest,
                balance: lastMonth.balance
            });
        });

        return { yearlyData, monthlyData };
    }, [result.start, result.annualizedRoi, years, months, timeMode, startDate]);


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
                    min={initialInvestment} // Result can't be less than investment (No loss allowed)
                    max={MAX_AMOUNT * 2}
                    step={100}
                    currency={currency}
                />
            ) : (
                <InputWithSlider
                    label="Total Profit / Gain"
                    value={absoluteProfit}
                    onChange={setAbsoluteProfit}
                    min={0} // No negative profit allowed per user request
                    max={MAX_AMOUNT}
                    step={100}
                    currency={currency}
                />
            )}

            <div className="md:col-span-2">
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

    // --- SUMMARY ---
    const summarySection = (
        <UnifiedSummary
            invested={result.start}
            gain={result.gain}
            total={result.computedFinalValue}
            currency={currency}
            years={result.timeInYears}
            customCards={[
                {
                    label: "Annualized Return (CAGR)",
                    value: `${result.annualizedRoi.toFixed(2)}%`,
                    color: "text-blue-600",
                    subtext: "Effective yearly growth rate"
                }
            ]}
        />
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
            summary={summarySection}

            table={
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => {
                                    const data = tableResult.yearlyData.map(r => [
                                        `Year ${r.year}`,
                                        Math.round(r.totalInvested),
                                        Math.round(r.growth),
                                        Math.round(r.balance)
                                    ]);
                                    downloadPDF(data, ['Year', 'Invested', 'Growth', 'Balance'], 'roi_schedule.pdf');
                                }}
                                className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Export PDF
                            </button>
                            <div className="flex items-center">
                                <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                                <div className="w-48">
                                    <MonthYearPicker
                                        value={startDate}
                                        onChange={setStartDate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={tableResult.yearlyData}
                        monthlyData={tableResult.monthlyData}
                        currency={currency}
                    />
                </div>
            }
            details={details}
        />
    );
}
