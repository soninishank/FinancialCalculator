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

export default function CompoundingBarChart({ data, currency }) {
  const chartData = {
    labels: data.map((row) => `Year ${row.year}`),
    datasets: [
      {
        label: "Invested Amount",
        data: data.map((row) => row.totalInvested),
        // Darker Slate Blue - Represents the solid foundation
        backgroundColor: "#6366F1", 
        hoverBackgroundColor: "#4F46E5",
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        stack: "Stack 0",
      },
      {
        label: "Interest Gained",
        data: data.map((row) => row.growth),
         backgroundColor: "#14B8A6", 
        hoverBackgroundColor: "#0D9488",
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
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
          maxTicksLimit: 8, // Reduce labels to prevent clutter
          font: { size: 11, family: "'Inter', sans-serif" },
          color: "#64748B", // Slate-500 text
        },
        border: { display: false }, // Hides the bottom axis line for a cleaner look
      },
      y: {
        grid: { 
          color: "#F1F5F9", // Very light gray grid lines (Slate-100)
          borderDash: [4, 4], // Dashed lines look more modern
        },
        stacked: true,
        ticks: {
          callback: (value) => moneyFormat(value, currency, true),
          font: { size: 11, weight: "500", family: "'Inter', sans-serif" },
          color: "#64748B",
          padding: 10,
        },
        border: { display: false }, // Hides the left axis line
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: { size: 12, weight: "500" },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF", // White card tooltip
        titleColor: "#1E293B",
        bodyColor: "#334155",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${moneyFormat(context.raw, currency)}`;
          },
          footer: (tooltipItems) => {
            const total = tooltipItems.reduce((a, b) => a + b.raw, 0);
            return `Total Value: ${moneyFormat(total, currency)}`;
          },
        },
        // Custom styling for the Total Value footer
        footerFont: { weight: "bold" },
        footerColor: "#0F766E", // Dark Teal
        footerMarginTop: 8,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-700 font-bold text-lg">Wealth Compounding Projection</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Visualizing how your principal amount and interest grow over time.
      </p>
      
      <div className="h-[350px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}