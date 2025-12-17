import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import { FinancialLineChart } from "../common/FinancialCharts";
import { calculateCAGR } from "../../utils/finance";
import {
  MIN_AMOUNT,
  MIN_YEARS,
  MAX_AMOUNT,
  MAX_YEARS,
  DEFAULT_LUMP_SUM,
  STEP_AMOUNT
} from "../../utils/constants";

// We only use the initial state values for fields that are not passed via props (like annualRate, which is not used here)
export default function CAGRCalculator({ currency, setCurrency }) {
  // Inputs
  const [beginningValue, setBeginningValue] = useState(DEFAULT_LUMP_SUM);
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

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    const dataPoints = [];
    const rate = cagr / 100;

    for (let i = 0; i <= years; i++) {
      const value = beginningValue * Math.pow(1 + rate, i);
      dataPoints.push({
        year: i,
        amount: Math.round(value)
      });
    }

    return {
      labels: dataPoints.map(d => `Year ${d.year}`),
      datasets: [
        {
          label: 'Investment Value',
          data: dataPoints.map(d => d.amount),
          borderColor: isCagrPositive ? '#10B981' : '#F43F5E', // emerald-500 or rose-500
          backgroundColor: isCagrPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [beginningValue, cagr, years, isCagrPositive]);

  return (
    <div className="animate-fade-in">

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">

        {/* Beginning Value */}
        <InputWithSlider
          label="Beginning Investment Value"
          value={beginningValue}
          onChange={setBeginningValue}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
          currency={currency}
        />

        {/* Ending Value */}
        <InputWithSlider
          label="Ending Investment Value"
          value={endingValue}
          onChange={setEndingValue}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
          currency={currency}
        />

        {/* Years */}
        <div className="md:col-span-2">
          <InputWithSlider
            label="Investment Period (Years)"
            value={years}
            onChange={setYears}
            min={MIN_YEARS} max={MAX_YEARS}
          />
        </div>
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

      {/* CHART SECTION */}
      <div className="mt-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Growth Visualization</h3>
          <FinancialLineChart data={chartData} currency={currency} height={350} />
        </div>
      </div>
    </div>
  );
}