import React from "react";
import FormattedInput from "./FormattedInput";

export default function InputWithSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  currency, // optional: if passed, shows currency symbol
  symbol,   // optional: if passed (like %), shows that instead
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      </div>

      <div className="flex items-center gap-3">
        {/* Input Box */}
        <div className="flex-1 flex items-center">
          {currency && (
            <span className="px-3 py-3 bg-gray-50 rounded-l-xl font-medium text-gray-500 border border-r-0 border-gray-200">
              {symbol}
            </span>
          )}
          <FormattedInput
            value={value}
            onChange={onChange}
            currency={currency}
            className={`w-full p-3 border border-gray-200 text-gray-800 font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-all
              ${currency ? "rounded-r-xl" : "rounded-xl"}
            `}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="mt-3 relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 transition-all"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}