// src/components/common/InputWithSlider.js
import React from "react";
import FormattedInput from "./FormattedInput";
import { getCurrencySymbol, moneyFormat } from "../../utils/formatting";

export default function InputWithSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  currency,
  symbol,
  isDecimal = false,
}) {
  let prefix = null;
  if (currency) {
    prefix = getCurrencySymbol(currency);
  } else if (symbol) {
    prefix = symbol;
  }

  // --- CRITICAL FIX 1: Ensure slider always gets a Number value ---
  // The state 'value' is a string for decimals ("40.5"). This converts it safely.
  const sliderValue = Number(value) || 0; 

  // Function to ensure step is correct (e.g. 1 or 0.1)
  const effectiveStep = isDecimal ? step : 1; 
  
  // Helper to format the max label for the badge
  const formatBadgeValue = (val) => {
      // Use toFixed(0) for integers, toFixed(1) for decimals in the badge
      if (isDecimal) return Number(val).toFixed(1);
      return Number(val).toLocaleString('en-IN');
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {/* Badge: Use the raw value for consistency */}
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
          {currency ? prefix : ""} {formatBadgeValue(sliderValue)} {symbol === "%" ? "%" : ""}
        </span>
      </div>

      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-gray-500 font-semibold">{prefix}</span>
          </div>
        )}

        <FormattedInput
          value={value}
          onChange={onChange}
          currency={currency}
          isDecimal={isDecimal}
          max={max} // Pass the max for the validation in FormattedInput.js
          className={`
            w-full py-3 pr-4 border border-gray-300 rounded-xl outline-none 
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all
            font-semibold text-gray-800
            ${prefix ? "pl-10" : "pl-4"} 
          `}
        />
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* Min Label */}
        <span className="text-xs text-gray-400 font-medium min-w-[30px]">
          {isDecimal ? min : moneyFormat(min, currency, true)}
        </span>

        <input
          type="range"
          min={min}
          max={max}
          step={effectiveStep} // Use the correct step
          // Use sliderValue to prevent the string from breaking the slider
          value={sliderValue > max ? max : sliderValue} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
            accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300
          "
        />

        {/* Max Label */}
        <span className="text-xs text-gray-400 font-medium min-w-[30px] text-right">
          {isDecimal ? max : moneyFormat(max, currency, true)}
        </span>
      </div>
    </div>
  );
}