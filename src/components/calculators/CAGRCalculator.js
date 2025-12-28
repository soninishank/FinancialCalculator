import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import UnifiedSummary from '../common/UnifiedSummary';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import MonthYearPicker from '../common/MonthYearPicker';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import { calculateDetailedCAGR } from '../../utils/finance';
import { calculatorDetails } from '../../data/calculatorDetails';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import { MAX_AMOUNT } from '../../utils/constants';
import { validateDateRange, getEffectiveScheduleStart } from '../../utils/calculatorUtils';
import { CalculationModeToggle, DateRangeInputs } from '../common/CommonCalculatorFields';

const CAGRCalculator = ({ currency }) => {
  const {
    lumpSum: beginningValue, setLumpSum: setBeginningValue,
    calculationMode, setCalculationMode,
    startDate, setStartDate,
    endDate, setEndDate,
    scheduleStartDate, setScheduleStartDate
  } = useCalculatorState({
    lumpSum: 100000,
    years: 5
  });

  const [endingValue, setEndingValue] = useState(200000);
  const [years, setYears] = useState(5);
  const [timeUnit, setTimeUnit] = useState('years'); // 'years' | 'months' | 'days'

  const effectiveScheduleStartDate = getEffectiveScheduleStart(calculationMode, startDate, scheduleStartDate);

  const result = useMemo(() => {
    // Performance & Validation guard
    if (calculationMode === 'dates') {
      if (!validateDateRange(startDate, endDate)) {
        return { cagr: 0, timeInYears: 0, yearlyData: [], monthlyData: [] };
      }
    }

    return calculateDetailedCAGR({
      beginningValue,
      endingValue,
      time: years,
      timeUnit,
      startDate: calculationMode === 'dates' ? startDate : null,
      endDate: calculationMode === 'dates' ? endDate : null,
      scheduleStartDate: effectiveScheduleStartDate
    });
  }, [beginningValue, endingValue, years, timeUnit, startDate, endDate, calculationMode, effectiveScheduleStartDate]);

  const inputs = (
    <div className="space-y-6">
      <CalculationModeToggle mode={calculationMode} setMode={setCalculationMode} />

      <InputWithSlider
        label="Beginning Value"
        value={beginningValue}
        onChange={setBeginningValue}
        min={1000}
        max={MAX_AMOUNT}
        step={1000}
        currency={currency}
      />

      <InputWithSlider
        label="Ending Value"
        value={endingValue}
        onChange={setEndingValue}
        min={1000}
        max={MAX_AMOUNT}
        step={1000}
        currency={currency}
      />

      {calculationMode === 'duration' ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">Investment Period</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['years', 'months', 'days'].map((u) => (
                <button
                  key={u}
                  onClick={() => setTimeUnit(u)}
                  className={`px-3 py-1 text-[10px] md:text-xs font-semibold rounded-md transition-all capitalize ${timeUnit === u ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
    </div>
  );

  const isExtreme = result.cagr > 10000; // More than 10,000% is usually an outlier/short term
  const isVeryShort = result.timeInYears < 0.0833; // Less than 1 month

  const formattedCagr = result.cagr.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  return (
    <CalculatorLayout
      inputs={inputs}
      summary={
        <div className="space-y-8">
          <div className="bg-white border-l-8 border-teal-500 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {isExtreme && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider animate-pulse uppercase">
                High Annualized Rate
              </div>
            )}
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Compound Annual Growth Rate
            </p>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className={`text-4xl lg:text-5xl font-black text-teal-600 break-all`}>
                {formattedCagr}%
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
                  Growth average over <strong>{result.timeInYears.toFixed(2)} years</strong>.
                </p>
                {isVeryShort && (
                  <p className="text-[10px] text-amber-600 font-bold italic">
                    ⚠ Note: Annualized returns can be misleading for very short periods.
                  </p>
                )}
              </div>
            </div>
          </div>
          <UnifiedSummary
            invested={beginningValue}
            gain={endingValue - beginningValue}
            total={endingValue}
            currency={currency}
            years={result.timeInYears.toFixed(2)}
          />
        </div>
      }
      charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
      table={
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
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
          <CollapsibleInvestmentTable
            yearlyData={result.yearlyData}
            monthlyData={result.monthlyData}
            currency={currency}
          />
        </div>
      }
      details={calculatorDetails.cagr_calculator.render()}
    />
  );
};

export default CAGRCalculator;