// src/components/common/InflationToggle.js
import React from 'react';
import InputWithSlider from './InputWithSlider';

export default function InflationToggle({
  isAdjusted,
  setIsAdjusted,
  rate,
  setRate,
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-6 transition-all duration-300">
      
      {/* Checkbox Toggle */}
      <div className="flex items-center gap-3">
        <input
          id="inflationToggle"
          type="checkbox"
          checked={isAdjusted}
          onChange={(e) => setIsAdjusted(e.target.checked)}
          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="inflationToggle" className="font-bold text-gray-700 text-sm cursor-pointer">
          Adjust for Inflation
        </label>
      </div>

      {/* Conditional Slider */}
      {isAdjusted && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <InputWithSlider
            label="Expected Inflation Rate (%)"
            value={rate}
            onChange={setRate}
            min={1}
            max={15}
            symbol="%"
          />
        </div>
      )}

      {/* Info Note */}
      <p className="text-xs text-gray-500 mt-2">
        {isAdjusted
          ? "Calculations will use the inflation-adjusted (real) rate of return."
          : "Calculations assume money retains its current purchasing power."}
      </p>
    </div>
  );
}