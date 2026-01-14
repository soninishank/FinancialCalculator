import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import { downloadPDF } from '../../utils/export';
import InputWithSlider from '../common/InputWithSlider';
import UnifiedSummary from '../common/UnifiedSummary';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import MonthYearPicker from '../common/MonthYearPicker';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import { calculateSimpleInterest } from '../../utils/finance';
import { calculatorDetails } from '../../data/calculatorDetails';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import { MAX_AMOUNT, MAX_RATE } from '../../utils/constants';
import { validateDateRange, getEffectiveScheduleStart } from '../../utils/calculatorUtils';
import { CalculationModeToggle, DateRangeInputs } from '../common/CommonCalculatorFields';

const SimpleInterest = ({ currency }) => {
    const {
        lumpSum: principal, setLumpSum: setPrincipal,
        annualRate: rate, setAnnualRate: setRate,
        years: time, setYears: setTime,
        calculationMode, setCalculationMode,
        startDate, setStartDate,
        endDate, setEndDate,
        scheduleStartDate, setScheduleStartDate
    } = useCalculatorState({
        lumpSum: 100000,
        annualRate: 6,
        years: 5
    });

    const [timeUnit, setTimeUnit] = useState('years'); // 'years' | 'months' | 'days'

    const effectiveScheduleStartDate = getEffectiveScheduleStart(calculationMode, startDate, scheduleStartDate);

    const result = useMemo(() => {
        // Performance & Validation guard
        if (calculationMode === 'dates') {
            if (!validateDateRange(startDate, endDate)) {
                return { interest: 0, totalAmount: principal, timeInYears: 0, yearlyData: [], monthlyData: [] };
            }
        }

        return calculateSimpleInterest({
            principal,
            rate,
            time,
            timeUnit,
            startDate: calculationMode === 'dates' ? startDate : null,
            endDate: calculationMode === 'dates' ? endDate : null,
            scheduleStartDate: effectiveScheduleStartDate
        });
    }, [principal, rate, time, timeUnit, startDate, endDate, calculationMode, effectiveScheduleStartDate]);

    const inputs = (
        <div className="space-y-6">
            <CalculationModeToggle mode={calculationMode} setMode={setCalculationMode} />

            <InputWithSlider
                label="Principal Amount"
                value={principal}
                onChange={setPrincipal}
                min={1000}
                max={MAX_AMOUNT}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Rate of Interest (p.a)"
                value={rate}
                onChange={setRate}
                min={1}
                max={MAX_RATE}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />

            {calculationMode === 'duration' ? (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-black text-slate-900 uppercase tracking-tight">Time Period</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['years', 'months', 'days'].map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setTimeUnit(u)}
                                    className={`px-3 py-1 text-[10px] md:text-xs font-semibold rounded-md transition-all capitalize ${timeUnit === u ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                    <InputWithSlider
                        label=""
                        value={time}
                        onChange={setTime}
                        min={1}
                        max={timeUnit === 'years' ? 50 : timeUnit === 'months' ? 360 : 3650}
                        suffix={timeUnit}
                    />
                </div>
            ) : (
                <DateRangeInputs
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />
            )}
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="space-y-8">
                    <UnifiedSummary
                        invested={principal}
                        gain={result.interest}
                        total={result.totalAmount}
                        currency={currency}
                        years={result.timeInYears.toFixed(2)}
                    />
                </div>
            }
            charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
            table={
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => {
                                    const data = result.yearlyData.map(r => [
                                        `Year ${r.year}`,
                                        Math.round(r.totalInvested),
                                        Math.round(r.growth),
                                        Math.round(r.balance)
                                    ]);
                                    downloadPDF(data, ['Year', 'Principal', 'Interest', 'Value'], 'simple_interest_schedule.pdf');
                                }}
                                className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Export PDF
                            </button>
                            <div className="flex items-center">
                                <label className="text-sm font-black text-slate-900 uppercase tracking-tight mr-2 whitespace-nowrap">Schedule starts:</label>
                                <div className="w-48 relative">
                                    <MonthYearPicker
                                        value={effectiveScheduleStartDate}
                                        onChange={setScheduleStartDate}
                                    />
                                    {calculationMode === 'dates' && (
                                        <div
                                            className="absolute inset-0 bg-gray-50/50 cursor-not-allowed rounded-lg"
                                            title="Starts from selected Start Date"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={result.yearlyData}
                        monthlyData={result.monthlyData}
                        currency={currency}
                    />
                </div>
            }
            details={calculatorDetails['simple-interest'].render()}
        />
    );
};

export default SimpleInterest;
