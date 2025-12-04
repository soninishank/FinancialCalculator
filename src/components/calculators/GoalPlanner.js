import React, { useState } from "react";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import { getRequiredLumpSum, getRequiredSIP, getRequiredStepUpSIP ,calculateRealRate} from "../../utils/finance";
import { useInflation } from "../../hooks/useInflation"; 
import InflationToggle from "../common/InflationToggle";


export default function GoalPlanner({ currency, setCurrency }) {
  // Inputs
  const [targetAmount, setTargetAmount] = useState(10000000); 
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);
  const [stepUpPercent, setStepUpPercent] = useState(10);

  // Inflation Hook
  const { 
      isInflationAdjusted, 
      setIsInflationAdjusted, 
      inflationRate, 
      setInflationRate 
  } = useInflation(6);

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
          min={0} max={1000000000} step={0} 
          currency={currency} 
        />
        <InputWithSlider 
          label="Time Period (Years)" 
          value={years} 
          onChange={setYears} 
          min={1} max={40} 
        />
        <InputWithSlider 
          label="Expected Return (%)" 
          value={annualRate} 
          onChange={setAnnualRate} 
          min={1} max={30} symbol="%" 
        />
        <InputWithSlider 
          label="Step-Up Percentage (%)" 
          value={stepUpPercent} 
          onChange={setStepUpPercent} 
          min={0} max={20} symbol="%" 
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
    </div>
  );
}