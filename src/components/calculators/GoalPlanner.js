import React, { useState, useMemo } from "react";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import { getRequiredLumpSum, getRequiredSIP, getRequiredStepUpSIP, calculateRealRate } from "../../utils/finance";
import { useInflation } from "../../hooks/useInflation";
import InflationToggle from "../common/InflationToggle";
import { FinancialLineChart } from "../common/FinancialCharts";
import ResultsTable from "../common/ResultsTable";
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
    ? calculateRealRate(Number(annualRate), Number(inflationRate))
    : Number(annualRate);

  // Calculations
  const requiredLump = getRequiredLumpSum(targetAmount, effectiveRate, years);
  const requiredSIP = getRequiredSIP(targetAmount, effectiveRate, years);
  const requiredStepUp = getRequiredStepUpSIP(targetAmount, effectiveRate, years, stepUpPercent);
  const isNegativeRealRate = effectiveRate <= 0 && isInflationAdjusted;

  // --- Generate Table Data ---
  const { lumpSumData, sipData, stepUpData } = useMemo(() => {
    const r = effectiveRate / 100;
    const monthlyRate = r / 12;
    const lData = [];
    const sData = [];
    const suData = [];

    for (let i = 0; i <= years; i++) {
      // 1. Lump Sum
      const lumpVal = requiredLump * Math.pow(1 + monthlyRate, i * 12);
      lData.push({
        year: i,
        invested: requiredLump,
        value: Math.round(lumpVal)
      });

      // 2. SIP
      let sipVal = 0;
      let sipInvested = 0;
      if (i > 0) {
        const months = i * 12;
        sipInvested = requiredSIP * months;
        sipVal = requiredSIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      }
      sData.push({
        year: i,
        invested: Math.round(sipInvested),
        value: Math.round(sipVal)
      });

      // 3. Step-Up
      let stepUpVal = 0;
      let stepUpInvested = 0;
      if (i > 0) {
        let total = 0;
        let totalInv = 0;
        let currentSip = requiredStepUp;
        for (let y = 1; y <= i; y++) {
          const yearVal = currentSip * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate);
          total = total * Math.pow(1 + monthlyRate, 12) + yearVal;
          totalInv += currentSip * 12;
          currentSip = currentSip * (1 + stepUpPercent / 100);
        }
        stepUpVal = total;
        stepUpInvested = totalInv;
      }
      suData.push({
        year: i,
        invested: Math.round(stepUpInvested),
        value: Math.round(stepUpVal)
      });
    }

    return { lumpSumData: lData, sipData: sData, stepUpData: suData };
  }, [years, effectiveRate, requiredLump, requiredSIP, requiredStepUp, stepUpPercent]);

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
      </div>

      {/* INFLATION TOGGLE COMPONENT */}
      <InflationToggle
        isAdjusted={isInflationAdjusted}
        setIsAdjusted={setIsInflationAdjusted}
        rate={inflationRate}
        setRate={setInflationRate}
      />
      {isInflationAdjusted && (
        <div className="text-sm font-medium text-gray-700 mt-4 mb-8 p-3 bg-gray-50 rounded-xl border border-gray-100">
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
      )}

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
                label: 'One-time Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  const r = effectiveRate / 100;
                  const monthlyRate = r / 12;
                  return Math.round(requiredLump * Math.pow(1 + monthlyRate, i * 12));
                }),
                borderColor: '#6366F1',
                backgroundColor: 'transparent',
                tension: 0.4
              },
              {
                label: 'SIP Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  if (i === 0) return 0;
                  const r = effectiveRate / 100;
                  const monthlyRate = r / 12;
                  const months = i * 12;
                  return Math.round(requiredSIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
                }),
                borderColor: '#10B981',
                backgroundColor: 'transparent',
                tension: 0.4
              },
              {
                label: 'Step-Up Path',
                data: Array.from({ length: years + 1 }, (_, i) => {
                  if (i === 0) return 0;
                  let total = 0;
                  let currentSip = requiredStepUp;
                  const r = effectiveRate / 100;
                  const monthlyRate = r / 12;
                  for (let y = 1; y <= i; y++) {
                    const yearVal = currentSip * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate);
                    total = total * Math.pow(1 + monthlyRate, 12) + yearVal;
                    currentSip = currentSip * (1 + stepUpPercent / 100);
                  }
                  return Math.round(total);
                }),
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

      {/* INDIVIDUAL GROWTH TABLES */}
      <div className="mt-12 space-y-12">

        {/* Lump Sum Table */}
        <div>
          <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="p-1 bg-indigo-100 rounded">Option 1</span>
            Lump Sum Growth
          </h3>
          <ResultsTable
            data={lumpSumData}
            currency={currency}
            columns={[
              { key: 'year', label: 'Year', align: 'left' },
              { key: 'invested', label: 'Invested Amount', align: 'right', format: 'money' },
              { key: 'value', label: 'Expected Value', align: 'right', format: 'money', highlight: true }
            ]}
          />
        </div>

        {/* SIP Table */}
        <div>
          <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
            <span className="p-1 bg-emerald-100 rounded">Option 2</span>
            SIP Growth
          </h3>
          <ResultsTable
            data={sipData}
            currency={currency}
            columns={[
              { key: 'year', label: 'Year', align: 'left' },
              { key: 'invested', label: 'Total Invested', align: 'right', format: 'money' },
              { key: 'value', label: 'Expected Value', align: 'right', format: 'money', highlight: true }
            ]}
          />
        </div>

        {/* Step-Up Table */}
        <div>
          <h3 className="text-lg font-bold text-rose-700 mb-3 flex items-center gap-2">
            <span className="p-1 bg-rose-100 rounded">Option 3</span>
            Step-Up SIP Growth
          </h3>
          <ResultsTable
            data={stepUpData}
            currency={currency}
            columns={[
              { key: 'year', label: 'Year', align: 'left' },
              { key: 'invested', label: 'Total Invested', align: 'right', format: 'money' },
              { key: 'value', label: 'Expected Value', align: 'right', format: 'money', highlight: true }
            ]}
          />
        </div>

      </div>
    </div>
  );
}