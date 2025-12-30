// src/components/common/InflationToggle.js
import React from 'react';
import InputWithSlider from './InputWithSlider';
import ToggleSwitch from './ToggleSwitch';
import { MAX_INFLATION } from '../../utils/constants';


export default function InflationToggle({
  isAdjusted,
  setIsAdjusted,
  rate,
  setRate,
  showInput = true
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all duration-300">

      <div className="flex items-center h-6">
        <ToggleSwitch
          checked={isAdjusted}
          onChange={setIsAdjusted}
        />
      </div>

      <div className="flex-1 w-full min-w-0">
        <label className="font-bold text-gray-700 text-sm block mb-1">
          Adjust for Inflation
        </label>

        <p className="text-xs text-gray-500 mb-3">
          {isAdjusted
            ? "Calculations will use the inflation-adjusted (real) rate of return."
            : "Calculations assume money retains its current purchasing power."}
        </p>

        {isAdjusted && showInput && (
          <div className="animate-fade-in w-full">
            <InputWithSlider
              label="Expected Inflation Rate (%)"
              value={rate}
              onChange={setRate}
              min={0}
              max={MAX_INFLATION}
              step={0.1}
              symbol="%"
              isDecimal
            />
          </div>
        )}
      </div>
    </div>
  );
}
