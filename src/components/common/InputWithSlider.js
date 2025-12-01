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
  let prefix = null;
  if (currency) {
    prefix = getCurrencySymbol(currency);
  } else if (symbol) {
    prefix = symbol;
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {/* Badge: Shows exact value (e.g., 99,99,99,999) */}
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
          {currency ? prefix : ""} {Number(value).toLocaleString("en-IN")} {symbol === "%" ? "%" : ""}
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
          // Allow typing beyond the slider max (up to Global Safe Limit of 100Cr+)
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
          {currency ? moneyFormat(min, currency, true) : min}
        </span>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          // If value exceeds max, stick slider to the end (100%)
          value={value > max ? max : value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
            accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300
          "
        />

        {/* Max Label */}
        <span className="text-xs text-gray-400 font-medium min-w-[30px] text-right">
          {currency ? moneyFormat(max, currency, true) : max}
        </span>
      </div>
    </div>
  );
}