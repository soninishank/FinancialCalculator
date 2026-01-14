import React, { useState, useMemo } from 'react';
import { downloadPDF } from '../../utils/export';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import UnifiedSummary from '../common/UnifiedSummary';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import MonthYearPicker from '../common/MonthYearPicker';
import TaxToggle from '../common/TaxToggle';
import InflationToggle from '../common/InflationToggle';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import { calculateCompoundInterest, calculateRealValue } from '../../utils/finance';
import { calculateLTCG } from '../../utils/tax';
import { calculatorDetails } from '../../data/calculatorDetails';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import { MAX_AMOUNT, MAX_RATE, DEFAULT_INFLATION } from '../../utils/constants';
import { validateDateRange, getEffectiveScheduleStart } from '../../utils/calculatorUtils';
import { CalculationModeToggle, DateRangeInputs } from '../common/CommonCalculatorFields';

const COMPOUND_FREQUENCIES = [
    { label: 'Monthly', value: 12 },
    { label: 'Quarterly', value: 4 },
    { label: 'Half-Yearly', value: 2 },
    { label: 'Yearly', value: 1 },
];

const CompoundInterest = ({ currency }) => {
    const {
        lumpSum, setLumpSum,
        annualRate, setAnnualRate,
        years, setYears,
        compoundingFrequency, setCompoundingFrequency,
        isTaxApplied, setIsTaxApplied,
        ltcgRate, setLtcgRate,
        isExemptionApplied, setIsExemptionApplied,
        exemptionLimit, setExemptionLimit,
        isInflationAdjusted, setIsInflationAdjusted,
        inflationRate, setInflationRate,
        calculationMode, setCalculationMode,
        startDate, setStartDate,
        endDate, setEndDate,
        scheduleStartDate, setScheduleStartDate
    } = useCalculatorState({
        lumpSum: 100000,
        annualRate: 8,
        years: 10,
        compoundingFrequency: 1,
        inflationRate: DEFAULT_INFLATION,
    });

    const [timeUnit, setTimeUnit] = useState('years');

    const effectiveScheduleStartDate = getEffectiveScheduleStart(calculationMode, startDate, scheduleStartDate);

    const result = useMemo(() => {
        // Performance & Validation guard
        if (calculationMode === 'dates') {
            if (!validateDateRange(startDate, endDate)) {
                return { totalAmount: lumpSum, timeInYears: 0, yearlyData: [], monthlyData: [] };
            }
        }

        return calculateCompoundInterest({
            principal: lumpSum,
            rate: annualRate,
            time: years,
            timeUnit,
            frequency: compoundingFrequency,
            startDate: calculationMode === 'dates' ? startDate : null,
            endDate: calculationMode === 'dates' ? endDate : null,
            scheduleStartDate: effectiveScheduleStartDate
        });
    }, [lumpSum, annualRate, years, timeUnit, compoundingFrequency, startDate, endDate, calculationMode, effectiveScheduleStartDate]);

    // --- TAX & INFLATION ---
    const gain = (result.totalAmount || 0) - lumpSum;
    const taxResult = calculateLTCG(gain, lumpSum, isTaxApplied, {
        taxRate: Number(ltcgRate),
        currency,
        exemptionApplied: Boolean(isExemptionApplied),
        exemptionLimit: Number(exemptionLimit) || 0,
    });

    const taxAmount = taxResult?.taxAmount ?? 0;
    const netGainVal = taxResult?.netGain ?? gain - taxAmount;
    const netFutureValueVal = taxResult?.netFutureValue ?? result.totalAmount - taxAmount;

    const realValueVal = useMemo(() => {
        return calculateRealValue(result.totalAmount || lumpSum, inflationRate, result.timeInYears || 0);
    }, [result.totalAmount, lumpSum, inflationRate, result.timeInYears]);

    const inputs = (
        <div className="space-y-6">
            <CalculationModeToggle mode={calculationMode} setMode={setCalculationMode} />

            <InputWithSlider
                label="Principal Amount"
                value={lumpSum}
                onChange={setLumpSum}
                min={1000}
                max={MAX_AMOUNT}
                step={1000}
                currency={currency}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithSlider
                    label="Interest Rate (%)"
                    value={annualRate}
                    onChange={setAnnualRate}
                    min={1}
                    max={MAX_RATE}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                />
                <div className="flex flex-col mb-4">
                    <div className="flex justify-between items-end mb-2">
                        <label htmlFor="compounding-frequency" className="text-sm font-black text-slate-900 uppercase tracking-tight cursor-pointer">Compounding Frequency</label>
                        {/* Invisible spacer to match InputWithSlider's badge height for alignment */}
                        <span className="text-xs font-black px-3 py-1 border border-transparent opacity-0 select-none">Spacer</span>
                    </div>
                    <div className="relative">
                        <select
                            id="compounding-frequency"
                            value={compoundingFrequency}
                            onChange={(e) => setCompoundingFrequency(Number(e.target.value))}
                            className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-black text-slate-950 text-lg appearance-none cursor-pointer bg-white"
                        >
                            {COMPOUND_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {calculationMode === 'duration' ? (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-black text-slate-900 uppercase tracking-tight">Time Period</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['years', 'months', 'days'].map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setTimeUnit(u)}
                                    className={`px-4 py-2.5 text-xs font-semibold rounded-md transition-all capitalize ${timeUnit === u ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                    <InputWithSlider
                        label=""
                        value={years}
                        onChange={setYears}
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

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <TaxToggle
                        currency={currency}
                        isTaxApplied={isTaxApplied}
                        setIsTaxApplied={setIsTaxApplied}
                        taxRate={ltcgRate}
                        onTaxRateChange={setLtcgRate}
                        isExemptionApplied={isExemptionApplied}
                        setIsExemptionApplied={setIsExemptionApplied}
                        exemptionLimit={exemptionLimit}
                        onExemptionLimitChange={setExemptionLimit}
                    />
                </div>
                <div className="flex-1">
                    <InflationToggle
                        isAdjusted={isInflationAdjusted}
                        setIsAdjusted={setIsInflationAdjusted}
                        rate={inflationRate}
                        setRate={setInflationRate}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="space-y-8">
                    <UnifiedSummary
                        invested={lumpSum}
                        gain={gain}
                        total={result.totalAmount}
                        currency={currency}
                        years={(result.timeInYears || 0).toFixed(2)}
                        tax={{ applied: isTaxApplied, postTaxValue: netFutureValueVal, postTaxGain: netGainVal, taxDeducted: taxAmount }}
                        inflation={{ applied: isInflationAdjusted, realValue: realValueVal, inflationRate: inflationRate }}
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
                                    downloadPDF(data, ['Year', 'Principal', 'Interest', 'Balance'], 'compound_interest_schedule.pdf');
                                }}
                                className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Export PDF
                            </button>
                            <div className="flex items-center">
                                <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
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
            details={calculatorDetails['compound-interest'].render()}
        />
    );
};

export default CompoundInterest;
