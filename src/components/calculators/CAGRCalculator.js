import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import InputWithSlider from "../common/InputWithSlider";
import { calculateCAGR } from "../../utils/finance";
import {
  MIN_AMOUNT,
  MIN_YEARS,
  MAX_AMOUNT,
  MAX_YEARS
} from "../../utils/constants";

// We only use the initial state values for fields that are not passed via props (like annualRate, which is not used here)
export default function CAGRCalculator({ currency, setCurrency }) {
  // Inputs
  const [beginningValue, setBeginningValue] = useState(100000);
  const [endingValue, setEndingValue] = useState(200000);
  const [years, setYears] = useState(5); // Years is defined locally here
  

  // Calculation
  const cagr = useMemo(
    () => calculateCAGR(Number(beginningValue), Number(endingValue), Number(years)),
    [beginningValue, endingValue, years]
  );
  
  // UX Logic
  const isCagrPositive = cagr > 0;
  const cagrColor = isCagrPositive ? "text-emerald-600" : "text-rose-600";
  const cagrLabel = isCagrPositive ? "Compound Annual Growth Rate" : "Annual Decline Rate";
  
  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        
        {/* Beginning Value */}
        <InputWithSlider
          label="Beginning Investment Value"
          value={beginningValue}
          onChange={setBeginningValue}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={1000}
          currency={currency}
        />

        {/* Ending Value */}
        <InputWithSlider
          label="Ending Investment Value"
          value={endingValue}
          onChange={setEndingValue}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={1000}
          currency={currency}
        />
        
        {/* Years */}
        <InputWithSlider
          label="Investment Period (Years)"
          value={years}
          onChange={setYears}
          min={MIN_YEARS} max={MAX_YEARS}
        />
      </div>

      {/* SUMMARY CARD */}
      <div className="mt-12 max-w-sm mx-auto">
        <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-6 shadow-xl text-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">
            {cagrLabel}
          </p>
          <div className={`text-5xl font-extrabold ${cagrColor}`}>
            {cagr.toFixed(2)}%
          </div>
          
          <p className="text-gray-500 text-xs mt-4">
            This means your investment grew (or shrank) by {cagr.toFixed(2)}% every year on average.
          </p>
        </div>
      </div>
    </div>
  );
}