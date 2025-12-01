import React from "react";
import { moneyFormat } from "../../utils/formatting";

export default function SummaryCards({ totalValue, invested, gain, currency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      
      {/* 1. Total Future Value -> ROSE (Red/Pink) 
          This creates a strong contrast against the Indigo card. */}
      <Card
        label="Total Future Value"
        value={totalValue}
        currency={currency}
        color="sky"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* 2. Total Invested -> INDIGO (Blue/Purple) 
          Matches the 'Invested' slice in your Pie Chart. */}
      <Card
        label="Total Invested"
        value={invested}
        currency={currency}
        color="indigo"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />

      {/* 3. Wealth Generated -> EMERALD (Green) 
          Matches the 'Interest' slice in your Pie Chart. */}
      <Card
        label="Wealth Generated"
        value={gain}
        currency={currency}
        color="emerald"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
    </div>
  );
}

function Card({ label, value, currency, color, icon }) {
  // Distinct Color Palette
  const colorClasses = {
    sky: {
      border: "border-l-sky-500",
      bgIcon: "bg-sky-50",
      textIcon: "text-sky-600",
    },
    indigo: {
      border: "border-l-indigo-500",
      bgIcon: "bg-indigo-50",
      textIcon: "text-indigo-600",
    },
    emerald: {
      border: "border-l-emerald-500",
      bgIcon: "bg-emerald-50",
      textIcon: "text-emerald-600",
    },
};

  const theme = colorClasses[color];

  return (
    <div 
      className={`
        bg-white rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] 
        border border-gray-100 border-l-4 ${theme.border}
        flex items-center justify-between transition-transform hover:-translate-y-1
      `}
      title={moneyFormat(value, currency, false)}
    >
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-extrabold text-gray-900">
          {moneyFormat(value, currency, true)}
        </h3>
      </div>

      <div className={`p-3 rounded-full ${theme.bgIcon} ${theme.textIcon}`}>
        {icon}
      </div>
    </div>
  );
}