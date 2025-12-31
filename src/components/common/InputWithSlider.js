// src/components/common/InputWithSlider.js
import React from "react";
import PropTypes from 'prop-types';
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
  onChange = () => { },
  min,
  max,
  step = 1,
  currency,
  symbol,
  isDecimal = false,
  rightElement = null,
  id,
}) {

  // Defensive check: Ensure onChange is actually a function
  const safeOnChange = (val) => {
    if (typeof onChange === 'function') {
      onChange(val);
    } else {
      console.warn(`InputWithSlider: onChange is not a function. It is ${typeof onChange}. Value attempted:`, val);
    }
  };

  // Safe Fallback Logic
  let effectiveMin = Number(min);
  let effectiveMax = Number(max);

  if (process.env.NODE_ENV !== 'production') {
    if (Number.isNaN(effectiveMin)) {
      console.warn(`InputWithSlider Fix: 'min' is NaN for "${label}". Defaulting to 0.`);
      effectiveMin = 0;
    }
    if (Number.isNaN(effectiveMax)) {
      console.warn(`InputWithSlider Fix: 'max' is NaN for "${label}". Defaulting to 100.`);
      effectiveMax = 100;
    }
  }

  // Ensure production safety regardless of env
  if (Number.isNaN(effectiveMin)) effectiveMin = 0;
  if (Number.isNaN(effectiveMax)) effectiveMax = 100;

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
      <div className="flex justify-between items-end mb-2">
        <label htmlFor={id} className="text-sm font-black text-slate-900 uppercase tracking-tight cursor-pointer">{label}</label>
        {rightElement ? (
          rightElement
        ) : (
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg shadow-sm">
            {currency
              ? moneyFormat(sliderValue, currency, true)
              : `${sliderValue.toLocaleString('en-IN')}${symbol === "%" ? "%" : ""}`
            }
          </span>
        )}
      </div>

      {/* Input Box Container */}
      <div className="relative">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 sm:px-5 rounded-l-xl bg-slate-100 border border-r-0 border-slate-300 h-full">
            <span className="text-slate-900 font-black text-sm">{prefix}</span>
          </div>
        )}

        <FormattedInput
          id={id}
          value={value}
          onChange={safeOnChange}
          currency={currency}
          isDecimal={isDecimal}
          min={effectiveMin}
          max={effectiveMax}
          className={`
            w-full py-3 pr-4 border-2 border-slate-200 rounded-xl outline-none 
            focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all
            font-black text-slate-950
            text-lg
            ${prefix ? "pl-16 sm:pl-20" : "pl-5"} 
          `}
        />
      </div>

      {/* Slider and Min/Max Labels */}
      <div className="mt-4 flex items-center gap-4">
        {/* Min Label */}
        <span className="text-[10px] text-slate-900 font-black min-w-[30px]">
          {formatRangeLabel(effectiveMin)}
        </span>

        <input
          type="range"
          min={effectiveMin}
          max={effectiveMax}
          step={effectiveStep}
          value={sliderValue > effectiveMax ? effectiveMax : sliderValue}
          onChange={(e) => safeOnChange(Number(e.target.value))}
          className="
            w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer 
            accent-indigo-600 hover:accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300
          "
        />
        {/* Max Label */}
        <span className="text-[10px] text-slate-900 font-black min-w-[30px] text-right">
          {formatRangeLabel(effectiveMax)}
        </span>
      </div>
    </div>
  );
}

InputWithSlider.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  currency: PropTypes.string,
  symbol: PropTypes.string,
  isDecimal: PropTypes.bool,
  rightElement: PropTypes.node,
  id: PropTypes.string,
};