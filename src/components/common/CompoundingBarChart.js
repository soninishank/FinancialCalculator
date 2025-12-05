// src/components/common/CompoundingBarChart.js
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { moneyFormat } from "../../utils/formatting";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Add 'type' prop to distinguish between Loan and Investment
export default function CompoundingBarChart({ data, currency, type = 'investment' }) {
  
  // --- DYNAMIC LABELS AND COLORS BASED ON TYPE ---
  let chartConfig = {};
  if (type === 'loan') {
    chartConfig = {
      title: "Principal vs. Interest Repayment",
      subtitle: "Visualizing the components of your annual payments.",
      labels: ["Principal Paid", "Interest Paid"],
      color1: "#3B82F6", // Blue for Principal (Solid Money)
      color2: "#EF4444", // Red for Interest (The Cost)
      data1Key: 'principalPaid', 
      data2Key: 'interestPaid',  
      stackLabel: "Annual Payment"
    };
  } else {
    chartConfig = {
      title: "Wealth Compounding Projection",
      subtitle: "Visualizing how your principal amount and interest grow over time.",
      labels: ["Invested Amount", "Interest Gained"],
      color1: "#6366F1", // Indigo for Invested
      color2: "#14B8A6", // Teal for Interest
      data1Key: 'totalInvested', 
      data2Key: 'growth',        
      stackLabel: "Total Value"
    };
  }

  const chartData = {
    labels: data.map((row) => `Year ${row.year}`),
    datasets: [
      {
        label: chartConfig.labels[0],
        data: data.map((row) => row[chartConfig.data1Key]),
        backgroundColor: chartConfig.color1, 
        hoverBackgroundColor: chartConfig.color1,
        barPercentage: 0.8, // Slightly wider bars for mobile readability
        categoryPercentage: 0.9,
        stack: "Stack 0",
      },
      {
        label: chartConfig.labels[1],
        data: data.map((row) => row[chartConfig.data2Key]),
        backgroundColor: chartConfig.color2,
        hoverBackgroundColor: chartConfig.color2,
        borderRadius: { topLeft: 4, topRight: 4 },
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        stack: "Stack 0",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          maxTicksLimit: 6, // FIX: Reduce X-axis label density for mobile
          font: { size: 10 }, // FIX: Smaller font for mobile
          color: "#64748B" 
        },
        border: { display: false },
      },
      y: {
        grid: { color: "#F1F5F9", borderDash: [4, 4] },
        stacked: true,
        ticks: {
          callback: (value) => moneyFormat(value, currency, true),
          font: { size: 10, weight: "500" }, // FIX: Smaller font for mobile
          color: "#64748B", padding: 8,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom", // FIX: Move legend to bottom to save vertical space
        align: "center",
        labels: { 
          usePointStyle: true, 
          boxWidth: 8, 
          padding: 10, // Reduce padding
          font: { size: 10, weight: "500" }, // Smaller font
          color: "#475569" 
        },
      },
      tooltip: {
        // ... (keep tooltip styles the same, they are already compact) ...
        backgroundColor: "#FFFFFF", titleColor: "#1E293B", bodyColor: "#334155", borderColor: "#E2E8F0", borderWidth: 1,
        padding: 12, cornerRadius: 8, displayColors: true, boxPadding: 4,
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${moneyFormat(context.raw, currency)}`;
          },
          footer: (tooltipItems) => {
            const total = tooltipItems.reduce((a, b) => a + b.raw, 0);
            return `${chartConfig.stackLabel}: ${moneyFormat(total, currency)}`;
          },
        },
        footerFont: { weight: "bold", size: 11 }, // Smaller footer font
        footerColor: chartConfig.color2, 
        footerMarginTop: 8,
      },
    },
  };

  return (
    // Height remains flexible due to h-[350px] w-full
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-700 font-bold text-base sm:text-lg">{chartConfig.title}</h3>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
        {chartConfig.subtitle}
      </p>
      
      <div className="h-[300px] sm:h-[350px] w-full"> {/* Slightly reduced height for mobile */}
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}