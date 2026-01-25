import React from "react";
import { moneyFormat } from "../../utils/formatting";

export default function ScenarioComparison({ currency, scenarios = [] }) {
  if (!Array.isArray(scenarios) || scenarios.length === 0) return null;

  const colorMap = {
    conservative: {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50/70 dark:bg-amber-900/20",
      title: "text-amber-800 dark:text-amber-300",
      gain: "text-amber-700 dark:text-amber-400",
    },
    base: {
      border: "border-indigo-200 dark:border-indigo-800",
      bg: "bg-indigo-50/70 dark:bg-indigo-900/20",
      title: "text-indigo-800 dark:text-indigo-300",
      gain: "text-indigo-700 dark:text-indigo-400",
    },
    aggressive: {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50/70 dark:bg-emerald-900/20",
      title: "text-emerald-800 dark:text-emerald-300",
      gain: "text-emerald-700 dark:text-emerald-400",
    },
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Return Scenarios</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">See how corpus changes with +/-2% return assumptions.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {scenarios.map((scenario) => {
          const theme = colorMap[scenario.type] || colorMap.base;
          return (
            <div
              key={scenario.type}
              className={`rounded-lg border p-4 ${theme.border} ${theme.bg}`}
            >
              <p className={`text-xs uppercase tracking-wide font-extrabold ${theme.title}`}>
                {scenario.label}
              </p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {Number(scenario.rate).toFixed(1)}% annual return
              </p>
              <p className="mt-3 text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {moneyFormat(scenario.total, currency, "word")}
              </p>
              <p className={`text-xs font-semibold mt-1 ${theme.gain}`}>
                Gain: {moneyFormat(scenario.gain, currency, "word")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
