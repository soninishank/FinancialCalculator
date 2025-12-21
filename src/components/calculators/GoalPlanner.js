import React, { useState } from "react";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import { getRequiredLumpSum, getRequiredSIP, getRequiredStepUpSIP, calculateRealRate } from "../../utils/finance";
import { useInflation } from "../../hooks/useInflation";
import InflationToggle from "../common/InflationToggle";
import { FinancialLineChart } from "../common/FinancialCharts";
import {
  DEFAULT_TARGET_AMOUNT,
  DEFAULT_TENURE_YEARS,
  DEFAULT_RATE,
  DEFAULT_STEP_UP,
  DEFAULT_INFLATION,
  MIN_AMOUNT,
  // MAX_AMOUNT unused
  MIN_YEARS,
  MAX_YEARS,
  MIN_RATE,
  MAX_RATE,
  // MIN_STEP_UP unused
  MAX_STEP_UP
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MAX_AMOUNT = 1000000000; // 100 Cr for Goal Planner
const LOC_MIN_STEP_UP = 0;

export default function GoalPlanner({ currency, setCurrency }) {
  // Inputs
  const [targetAmount, setTargetAmount] = useState(DEFAULT_TARGET_AMOUNT);
  const [years, setYears] = useState(DEFAULT_TENURE_YEARS);
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);
  const [stepUpPercent, setStepUpPercent] = useState(DEFAULT_STEP_UP);

  // Inflation Hook
  const {
    isInflationAdjusted,
    setIsInflationAdjusted,
    inflationRate,
    setInflationRate
  } = useInflation(DEFAULT_INFLATION);

  // --- CRITICAL LOGIC: Calculate the Effective Rate ---
  const effectiveRate = isInflationAdjusted
    ? calculateRealRate(annualRate, inflationRate)
    : annualRate;

  // Calculations
  const requiredLump = getRequiredLumpSum(targetAmount, effectiveRate, years);
  const requiredSIP = getRequiredSIP(targetAmount, effectiveRate, years);
  const requiredStepUp = getRequiredStepUpSIP(targetAmount, effectiveRate, years, stepUpPercent);
  const isNegativeRealRate = effectiveRate <= 0 && isInflationAdjusted;

  return (
    <div className="animate-fade-in">

      {/* Target Inputs */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-8 text-white mb-10 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">What is your Financial Goal?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Target Amount Display */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center"> {/* Added flex/justify-center for better alignment */}
            <label className="block text-sm font-medium text-teal-100 mb-2">Target Amount</label>
            <div className="text-4xl font-extrabold tracking-tight">
              {moneyFormat(targetAmount, currency, true)}
            </div>
          </div>
          {/* Time Horizon Display */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center"> {/* Added border-white/10 and flex/justify-center for consistency */}
            <label className="block text-sm font-medium text-teal-100 mb-2">Time Horizon</label>
            <div className="text-3xl font-bold">{years} Years</div>
          </div>

        </div>
      </div>

      {/* Sliders Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
        <InputWithSlider
          label="Target Amount"
          value={targetAmount}
          onChange={setTargetAmount}
          min={MIN_AMOUNT} max={LOC_MAX_AMOUNT} step={100000}
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
      </div>

      {/* INFLATION TOGGLE COMPONENT */}
      <InflationToggle
        isAdjusted={isInflationAdjusted}
        setIsAdjusted={setIsInflationAdjusted}
        rate={inflationRate}
        setRate={setInflationRate}
      />
      <div className="text-sm font-medium text-gray-700 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
        Effective Rate Used in Calculation:
        <strong className="text-indigo-600 ml-1">
          {effectiveRate.toFixed(2)}%
        </strong>
        {isNegativeRealRate && (
          <span className="text-red-500 ml-3">
            (Cannot reach goal: Real return is zero or negative.)
          </span>
        )}
      </div>

      {/* RESULT CARDS: The "Options" */}
      <h3 className="text-xl font-bold text-gray-800 mb-6">How to achieve this goal:</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Option 1: Lump Sum */}
        <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Option 1</div>
          <div className="text-lg font-bold text-indigo-700 mt-1">One-time Investment</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            {moneyFormat(Math.round(requiredLump), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Invest once today and forget it.</p>
        </div>

        {/* Option 2: SIP */}
        <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Option 2</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">Monthly SIP</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            {moneyFormat(Math.round(requiredSIP), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Consistent monthly investment.</p>
        </div>

        {/* Option 3: Step-Up */}
        <div className="bg-white border-l-4 border-rose-500 rounded-xl p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Option 3</div>
          <div className="text-lg font-bold text-rose-700 mt-1">Step-Up SIP</div>

          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            {moneyFormat(Math.round(requiredStepUp), currency)}
          </div>

          {/* --- DYNAMIC NOTE LOGIC --- */}
          {stepUpPercent === 0 ? (
            <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg p-2">
              <p className="text-xs text-orange-700 font-medium">
                ℹ️ Same as Option 2 because Step-Up is 0%.
              </p>
              <p className="text-[10px] text-orange-600 mt-1">
                Increase the <strong>Step-Up Percentage</strong> slider above to see how starting small works.
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              Start with this amount, and increase it by <strong className="text-gray-800">{stepUpPercent}%</strong> every year.
            </p>
          )}

        </div>

      </div>

      {/* CHART SECTION */}
      <div className="mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-bold text-lg mb-4">Investment Path Comparison</h3>
        <p className="text-sm text-gray-500 mb-6">See how your money grows under each option to reach your goal of <b>{moneyFormat(targetAmount, currency)}</b>.</p>

        <FinancialLineChart
          data={{
            labels: Array.from({ length: years + 1 }, (_, i) => `Year ${i}`),
            datasets: [
              {
                label: 'Lump Sum Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  // FV = PV * (1+r)^n
                  const r = effectiveRate / 100;
                  return Math.round(requiredLump * Math.pow(1 + r, i));
                }),
                borderColor: '#6366F1', // Indigo (Option 1)
                backgroundColor: 'transparent',
                tension: 0.4
              },
              {
                label: 'SIP Amount Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  // FV of SIP
                  // A typical SIP accumulation logic approx per year
                  const r = effectiveRate / 100;
                  // Simple yearly accumulation for visualization
                  // Year 0 = 0.
                  if (i === 0) return 0;

                  // Precise monthly calculation for Year 'i'
                  // FV = P * [ (1+i)^n - 1 ] / i * (1+i)
                  const monthlyRate = r / 12;
                  const months = i * 12;
                  const val = requiredSIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
                  return Math.round(val);
                }),
                borderColor: '#10B981', // Emerald (Option 2)
                backgroundColor: 'transparent',
                tension: 0.4
              },
              {
                label: 'Step-Up Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  if (i === 0) return 0;
                  // This is complex to behave exactly like the precise util, 
                  // so we will approximate or simulate year by year for chart.
                  // But since we are visualizing, a simple yearly compounding loop is better.
                  let total = 0;
                  let currentSip = requiredStepUp;
                  const r = effectiveRate / 100; // annual
                  const monthlyRate = r / 12;

                  // Simulate 'i' years
                  for (let y = 1; y <= i; y++) {
                    // 12 months at currentSip
                    const yearVal = currentSip * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate);

                    // Current corpus grows for this year
                    total = total * (1 + r) + yearVal; // Approx (corpus grows annually, new money added)
                    // Actually better: detailed month simulation is too heavy for render here.
                    // Let's use a simplified yearly model for the chart or just call it good.
                    // For chart, let's assume monthly compounding within the year for the SIP part.

                    // Step up for next year
                    currentSip = currentSip * (1 + stepUpPercent / 100);
                  }
                  return Math.round(total);
                }),
                borderColor: '#F43F5E', // Rose (Option 3)
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
    </div>
  );
}