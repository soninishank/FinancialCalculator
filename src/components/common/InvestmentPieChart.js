import React, { useState, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { moneyFormat } from "../../utils/formatting";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function InvestmentPieChart({ invested, gain, total, currency, years }) {
  const [hoveredData, setHoveredData] = useState(null);
  const chartRef = useRef(null);

  // --- NEW VIBRANT COLORS ---
  const COLOR_INVESTED = "#6366F1"; // Indigo-500 (Vibrant Blue-Purple)
  const COLOR_RETURNS = "#14B8A6";  // Teal-500   (Bright Growth Green)
  
  // Hover versions (slightly darker)
  const HOVER_INVESTED = "#4F46E5"; // Indigo-600
  const HOVER_RETURNS = "#0D9488";  // Teal-600

  const data = {
    labels: ["Invested Amount", "Est. Returns"],
    datasets: [
      {
        data: [invested, Math.max(0, gain)],
        backgroundColor: [COLOR_INVESTED, COLOR_RETURNS],
        hoverBackgroundColor: [HOVER_INVESTED, HOVER_RETURNS],
        borderWidth: 0,
        hoverOffset: 10,
        cutout: "82%", // Made the ring slightly thinner for a sleeker look
      },
    ],
  };

  const options = {
    layout: { padding: 20 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    animation: { animateScale: true, animateRotate: true },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        const index = chartElement[0].index;
        setHoveredData({
          label: data.labels[index],
          value: data.datasets[0].data[index],
          color: data.datasets[0].backgroundColor[index],
        });
      } else {
        setHoveredData(null);
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full">
      <h3 className="text-gray-500 font-medium mb-6 text-sm uppercase tracking-wide self-start pl-2">
        Asset Allocation
      </h3>

      <div className="relative h-64 w-64 mb-8">
        <Doughnut ref={chartRef} data={data} options={options} />

        {/* DYNAMIC CENTER TEXT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center transition-all duration-200">
          {hoveredData ? (
            <>
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                {hoveredData.label}
              </span>
              <span
                className="text-2xl font-extrabold"
                // Dynamically match the color of the text to the segment
                style={{ color: hoveredData.color }}
              >
                {moneyFormat(hoveredData.value, currency, true)}
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-500 text-xs font-medium leading-tight">
                After <strong className="text-gray-800">{years} years</strong>, <br />
                you will have
              </span>
              <span className="text-3xl font-extrabold text-gray-800 mt-2">
                {moneyFormat(total, currency, true)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* LEGEND SECTION */}
      <div className="w-full px-4 space-y-6">
        
        {/* Item 1: Invested */}
        <div className="flex items-start gap-4">
          {/* Dot Color */}
          <div 
            className="w-4 h-4 rounded-full mt-1 shrink-0" 
            style={{ backgroundColor: COLOR_INVESTED }}
          ></div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-sm">
              Invested Amount
            </span>
            {/* Value Color matching the chart */}
            <span 
              className="text-xl font-bold"
              style={{ color: COLOR_INVESTED }}
            >
              {moneyFormat(invested, currency)}
            </span>
          </div>
        </div>

        {/* Item 2: Returns */}
        <div className="flex items-start gap-4">
          {/* Dot Color */}
          <div 
            className="w-4 h-4 rounded-full mt-1 shrink-0"
            style={{ backgroundColor: COLOR_RETURNS }}
          ></div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-sm">
              Est. Returns
            </span>
            {/* Value Color matching the chart */}
            <span 
              className="text-xl font-bold"
              style={{ color: COLOR_RETURNS }}
            >
              {moneyFormat(gain, currency)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}