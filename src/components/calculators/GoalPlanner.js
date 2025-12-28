import React, { useMemo } from "react";
import CalculatorLayout from "../common/CalculatorLayout";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import {
  getRequiredLumpSum,
  getRequiredSIP,
  getRequiredStepUpSIP,
  calculateRealRate,
  computeYearlySchedule
} from "../../utils/finance";
import InflationToggle from "../common/InflationToggle";
import { FinancialLineChart } from "../common/FinancialCharts";
import {
  DEFAULT_TARGET_AMOUNT,
  DEFAULT_TENURE_YEARS,
  DEFAULT_RATE,
  DEFAULT_STEP_UP,
  DEFAULT_INFLATION,
  MIN_AMOUNT,
  MIN_YEARS,
  MAX_YEARS,
  MIN_RATE,
  MAX_RATE,
  MAX_STEP_UP,
  TARGET_MAX_AMOUNT_GOAL_PLANNER
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MIN_STEP_UP = 0;

export default function GoalPlanner({ currency, setCurrency }) {
  const {
    targetAmount, setTargetAmount,
    years, setYears,
    annualRate, setAnnualRate,
    stepUpPercent, setStepUpPercent,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
    startDate, setStartDate,
  } = useCalculatorState({
    targetAmount: DEFAULT_TARGET_AMOUNT,
    years: DEFAULT_TENURE_YEARS,
    annualRate: DEFAULT_RATE,
    stepUpPercent: DEFAULT_STEP_UP,
    isInflationAdjusted: false,
    inflationRate: DEFAULT_INFLATION,
  });

  // --- CRITICAL LOGIC: Calculate the Effective Rate ---
  const effectiveRate = isInflationAdjusted
    ? calculateRealRate(Number(annualRate), Number(inflationRate))
    : Number(annualRate);

  // Calculations
  const requiredLump = getRequiredLumpSum(targetAmount, effectiveRate, years);
  const requiredSIP = getRequiredSIP(targetAmount, effectiveRate, years);
  const requiredStepUp = getRequiredStepUpSIP(targetAmount, effectiveRate, years, stepUpPercent);
  const isNegativeRealRate = effectiveRate <= 0 && isInflationAdjusted;

  // --- Generate Table Data ---
  const { lumpSumData, lumpSumMonthly, sipData, sipMonthly, stepUpData, stepUpMonthly } = useMemo(() => {
    // 1. Lump Sum
    const { rows: lData, monthlyRows: lDataMonthly } = computeYearlySchedule({
      lumpSum: requiredLump,
      monthlySIP: 0,
      stepUpPercent: 0,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    // 2. SIP
    const { rows: sData, monthlyRows: sDataMonthly } = computeYearlySchedule({
      lumpSum: 0,
      monthlySIP: requiredSIP,
      stepUpPercent: 0,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    // 3. Step-Up SIP
    const { rows: suData, monthlyRows: suDataMonthly } = computeYearlySchedule({
      lumpSum: 0,
      monthlySIP: requiredStepUp,
      stepUpPercent: stepUpPercent,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    return {
      lumpSumData: lData, lumpSumMonthly: lDataMonthly,
      sipData: sData, sipMonthly: sDataMonthly,
      stepUpData: suData, stepUpMonthly: suDataMonthly
    };
  }, [years, effectiveRate, requiredLump, requiredSIP, requiredStepUp, stepUpPercent, startDate]);

  const inputs = (
    <div className="space-y-8">
      <InputWithSlider
        label="Target Amount"
        value={targetAmount}
        onChange={setTargetAmount}
        min={MIN_AMOUNT} max={TARGET_MAX_AMOUNT_GOAL_PLANNER} step={100000}
        currency={currency}
      />
      <InputWithSlider
        label="Time Period (Years)"
        value={years}
        onChange={setYears}
        min={MIN_YEARS} max={MAX_YEARS} step={1}
      />
      <InputWithSlider
        label="Expected Return (%)"
        value={annualRate}
        onChange={setAnnualRate}
        min={MIN_RATE} max={MAX_RATE} symbol="%"
      />
      <InputWithSlider
        label="Step-Up Percentage (%)"
        value={stepUpPercent}
        onChange={setStepUpPercent}
        min={LOC_MIN_STEP_UP} max={MAX_STEP_UP} symbol="%"
      />
      <InflationToggle
        isAdjusted={isInflationAdjusted}
        setIsAdjusted={setIsInflationAdjusted}
        rate={inflationRate}
        setRate={setInflationRate}
      />
      {isInflationAdjusted && isNegativeRealRate && (
        <div className="text-sm font-medium text-red-500 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
          ⚠️ Cannot reach goal: Real return is zero or negative.
        </div>
      )}
    </div>
  );

  const summary = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-indigo-600 uppercase">Option 1: One-time investment</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredLump), currency)}
          </div>
        </div>
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">Option 2: Monthly SIP</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredSIP), currency)}
          </div>
        </div>
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-rose-600 uppercase">Option 3: Step-Up SIP</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredStepUp), currency)}
          </div>
          {stepUpPercent > 0 && (
            <p className="text-xs text-rose-700 mt-1 font-medium">Increases by {stepUpPercent}% every year</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      summary={summary}
      charts={
        <div className="mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Investment Path Comparison</h3>
          <FinancialLineChart
            data={{
              labels: Array.from({ length: years + 1 }, (_, i) => `Year ${i} `),
              datasets: [
                {
                  label: 'One-time Path',
                  data: lumpSumData.map(r => r.balance),
                  borderColor: '#6366F1',
                  backgroundColor: 'transparent',
                  tension: 0.4
                },
                {
                  label: 'SIP Path',
                  data: sipData.map(r => r.balance),
                  borderColor: '#10B981',
                  backgroundColor: 'transparent',
                  tension: 0.4
                },
                {
                  label: 'Step-Up Path',
                  data: stepUpData.map(r => r.balance),
                  borderColor: '#F43F5E',
                  backgroundColor: 'transparent',
                  tension: 0.4,
                  borderDash: [5, 5]
                }
              ]
            }}
            currency={currency}
            height={350}
          />
        </div>
      }
      table={
        <div className="mt-12 space-y-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Growth Schedules</h3>
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

          <div>
            <h4 className="text-md font-bold text-indigo-700 mb-2">Option 1: Lump Sum Schedule</h4>
            <CollapsibleInvestmentTable
              yearlyData={lumpSumData}
              monthlyData={lumpSumMonthly}
              currency={currency}
            />
          </div>

          <div>
            <h4 className="text-md font-bold text-emerald-700 mb-2">Option 2: SIP Schedule</h4>
            <CollapsibleInvestmentTable
              yearlyData={sipData}
              monthlyData={sipMonthly}
              currency={currency}
            />
          </div>

          <div>
            <h4 className="text-md font-bold text-rose-700 mb-2">Option 3: Step-Up SIP</h4>
            <CollapsibleInvestmentTable
              yearlyData={stepUpData}
              monthlyData={stepUpMonthly}
              currency={currency}
            />
          </div>
        </div>
      }
    />
  );
}