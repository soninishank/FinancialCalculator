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
}) {
  const prefix = currency ? getCurrencySymbol(currency) : (symbol || "");
  const isCurrencyInput = !!currency;

  // Value to show in the small badge
  const badgeValue = isCurrencyInput 
    ? moneyFormat(value, currency, true)
    : `${value}${symbol || ''}`;

  // Value to show on the slider labels
  const formatLabel = (val) => {
    if (isCurrencyInput) return moneyFormat(val, currency, true);
    return val;
  };

  return (
    <div className="mb-4">
      
      {/* 1. LABEL & BADGE (Float over the input) */}
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {/* The Badge: Matches the clean look in the screenshot */}
        <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full shadow-sm">
          {badgeValue}
        </span>
      </div>

      {/* 2. INPUT FIELD AND PREFIX */}
      <div className="flex items-center">
        {/* The Prefix Box (Styled to connect seamlessly) */}
        {prefix && (
          <span className={`
            px-4 py-3 bg-gray-50 font-semibold text-gray-700 text-lg
            border border-gray-300 border-r-0 rounded-l-xl 
            shadow-[0_1px_2px_rgba(0,0,0,0.05)]
            shrink-0
          `}>
            {isCurrencyInput ? prefix : symbol}
          </span>
        )}
        
        {/* The Input Field (Styled to connect seamlessly) */}
        <FormattedInput
          value={value}
          onChange={onChange}
          currency={currency}
          className={`
            w-full py-3 pr-4 border border-gray-300 rounded-xl outline-none 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
            font-semibold text-gray-800 text-lg
            ${prefix ? "rounded-l-none pl-3" : "pl-4"} 
          `}
        />
      </div>

      {/* 3. Slider Section (Min/Max Labels) */}
      <div className="mt-3 flex items-center gap-4">
        {/* Min Label */}
        <span className="text-xs text-gray-500 font-medium min-w-[30px]">
          {formatLabel(min)}
        </span>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value > max ? max : value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
            accent-blue-600 hover:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300
          `}
        />

        {/* Max Label */}
        <span className="text-xs text-gray-500 font-medium min-w-[30px] text-right">
          {formatLabel(max)}
        </span>
      </div>
    </div>
  );
}