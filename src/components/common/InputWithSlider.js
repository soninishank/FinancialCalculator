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

  const sliderValue = Number(value) || 0; 
  const effectiveStep = isDecimal ? step : 1; 
  
  const formatBadgeValue = (val) => {
      if (isDecimal) return Number(val).toFixed(1);
      return Number(val).toLocaleString('en-IN');
  };
  
  // Helper for small range labels
  const formatRangeLabel = (val) => {
      if (isDecimal) return val;
      return moneyFormat(val, currency, true); // Use compact format for slider ends
  };


  return (
    <div className="mb-4">
      {/* Label and Badge Container */}
      <div className="flex justify-between items-end mb-1"> {/* Reduced mb-2 to mb-1 */}
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {/* Badge: Use smaller padding on mobile */}
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
          {currency ? prefix : ""} {formatBadgeValue(sliderValue)} {symbol === "%" ? "%" : ""}
        </span>
      </div>

      {/* Input Box Container */}
      <div className="relative">
        {prefix && (
          // Prefix/Symbol - Use smaller padding on mobile
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
            <span className="text-gray-500 font-semibold text-sm">{prefix}</span> {/* Smaller font size */}
          </div>
        )}

        <FormattedInput
          value={value}
          onChange={onChange}
          currency={currency}
          isDecimal={isDecimal}
          max={max}
          className={`
            w-full py-2.5 sm:py-3 pr-4 border border-gray-300 rounded-xl outline-none 
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all
            font-semibold text-gray-800
            ${prefix ? "pl-9 sm:pl-10" : "pl-4"} /* Adjusted left padding for prefix on mobile */
            text-base sm:text-lg /* Main input value should be slightly smaller on mobile */
          `}
        />
      </div>

      {/* Slider and Min/Max Labels */}
      <div className="mt-3 flex items-center gap-2 sm:gap-4"> {/* Reduced gap on mobile */}
        {/* Min Label - Formatted, smaller font on mobile */}
        <span className="text-xs text-gray-400 font-medium min-w-[20px] sm:min-w-[30px]">
          {formatRangeLabel(min)}
        </span>

        <input
          type="range"
          min={min}
          max={max}
          step={effectiveStep}
          value={sliderValue > max ? max : sliderValue} 
          onChange={(e) => onChange(e.target.value)} 
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
            accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300
          "
        />

        {/* Max Label - Formatted, smaller font on mobile */}
        <span className="text-xs text-gray-400 font-medium min-w-[20px] sm:min-w-[30px] text-right">
          {formatRangeLabel(max)}
        </span>
      </div>
    </div>
  );
}