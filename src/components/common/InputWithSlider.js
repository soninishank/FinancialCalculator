// src/components/common/InputWithSlider.js
import React from "react";
import FormattedInput from "./FormattedInput";
import { getCurrencySymbol, moneyFormat } from "../../utils/formatting";

// --- NEW HELPER FUNCTION FOR CURRENCY PREFIX ---
const getDisplayPrefix = (currencyCode) => {
  if (!currencyCode) return null;

  // Get the standard symbol (e.g., HK$, $, ¥)
  const symbol = getCurrencySymbol(currencyCode);

  // Logic to avoid redundancy (e.g., HKHK$)
  switch (currencyCode) {
    case 'CAD':
    case 'AUD':
    case 'SGD':
      // Check if the symbol is just '$' (generic symbol). If so, prepend code.
      if (symbol === '$') {
        return `${currencyCode.substring(0, 2)}${symbol}`;
      }
      return symbol;
    case 'HKD':
      // HKD symbol is typically HK$, so we just return the symbol.
      return symbol;

    default:
      // USD, EUR, JPY, INR (return standard symbol)
      return symbol;
  }
};

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

  const currencyPrefix = getDisplayPrefix(currency);
  const genericPrefix = symbol;

  const prefix = currency ? currencyPrefix : genericPrefix;

  const sliderValue = Number(value) || 0;
  const effectiveStep = isDecimal ? step : 1;
  // Helper for small range labels - CRITICAL USAGE OF moneyFormat(..., true)
  const formatRangeLabel = (val) => {
    // If a currency is provided, use moneyFormat with compact=true
    if (currency) {
      return moneyFormat(val, currency, true);
    }
    // Otherwise, just return the raw number
    return val;
  };


  return (
    <div className="mb-4">
      {/* Label and Badge Container */}
      <div className="flex justify-between items-end mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
          {currency
            ? moneyFormat(sliderValue, currency, true) // Use compact format (e.g., ₹5.49L)
            : `${sliderValue.toLocaleString('en-IN')}${symbol === "%" ? "%" : ""}` // Fallback for non-currency (e.g., %)
          }
        </span>
      </div>

      {/* Input Box Container */}
      <div className="relative">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 sm:px-4 rounded-l-xl bg-gray-100 border border-r-0 border-gray-300 h-full">
            <span className="text-gray-600 font-semibold text-sm">{prefix}</span>
          </div>
        )}

        <FormattedInput
          value={value}
          onChange={onChange}
          currency={currency}
          isDecimal={isDecimal}
          min={min}
          max={max}
          className={`
            w-full py-2.5 sm:py-3 pr-4 border border-gray-300 rounded-xl outline-none 
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all
            font-semibold text-gray-900
            text-base sm:text-lg
            ${prefix ? "pl-16 sm:pl-20" : "pl-4"} 
          `}
        />
      </div>

      {/* Slider and Min/Max Labels */}
      <div className="mt-3 flex items-center gap-2 sm:gap-4">
        {/* Min Label */}
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
            w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer 
            accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300
          "
        />
        {/* Max Label */}
        <span className="text-xs text-gray-400 font-medium min-w-[20px] sm:min-w-[30px] text-right">
          {formatRangeLabel(max)}
        </span>
      </div>
    </div>
  );
}