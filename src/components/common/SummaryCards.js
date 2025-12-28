// src/components/common/SummaryCards.js
import React from "react";
import { moneyFormat } from "../../utils/formatting";

export default function SummaryCards({
  totalValue,
  invested,
  gain,
  currency,
  // optional tax object:
  // { applied: true, postTaxValue, postTaxGain, taxDeducted }
  tax = null,
  // optional inflation object
  // { applied: true, realValue, inflationRate }
  inflation = null,
  customLabels = {},
}) {
  const showTax = tax && tax.applied === true;
  const showInflation = inflation && inflation.applied === true;

  // (1) Total Invested
  const cards = [
    {
      key: "invested",
      label: customLabels.invested || "Total Invested",
      value: invested,
      color: "indigo",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  // (2) Wealth Generated
  cards.push({
    key: "wealth",
    label: customLabels.gain || "Wealth Generated",
    value: gain,
    color: "emerald",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  });

  // (3) Future Value (Nominal)
  cards.push({
    key: "totalFuture",
    label: customLabels.totalValue || (showInflation ? "Estimated Future Value" : "Total Future Value"),
    value: totalValue,
    color: "sky",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  });

  // (4) Post-Tax Value
  if (showTax) {
    cards.push({
      key: "postTax",
      label: customLabels.postTax || "Post-Tax Value",
      value: tax.postTaxValue ?? 0,
      color: "rose",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2v4a3 3 0 006 0v-4c0-1.105-1.343-2-3-2zM12 4v2M12 18v2" />
        </svg>
      ),
      metaLines: [
        tax.postTaxGain !== undefined ? `Post-Tax Gain: ${moneyFormat(tax.postTaxGain, currency, true)}` : null,
        tax.taxDeducted !== undefined ? `Tax Deducted: ${moneyFormat(tax.taxDeducted, currency, true)}` : null,
      ].filter(Boolean),
    });
  }

  // (5) Real Future Value (Inflation Adjusted)
  if (showInflation) {
    cards.push({
      key: "realFuture",
      label: "Real Future Value",
      value: inflation.realValue,
      color: "amber",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      metaLines: [`(Adjusted for ${inflation.inflationRate}% Inflation)`]
    });
  }

  // grid layout logic: be more conservative to prevent narrow cards
  const gridColsClass =
    cards.length >= 5 ? "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" :
      cards.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" :
        "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-4 sm:gap-6 mt-6 sm:mt-10`}>
      {cards.map((c) => (
        <Card
          key={c.key}
          label={c.label}
          value={c.value}
          currency={currency}
          color={c.color}
          icon={c.icon}
          metaLines={c.metaLines}
        />
      ))}
    </div>
  );
}

function Card({ label, value, currency, color, icon, metaLines = [] }) {
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
    rose: {
      border: "border-l-rose-500",
      bgIcon: "bg-rose-50",
      textIcon: "text-rose-600",
    },
    amber: {
      border: "border-l-amber-500",
      bgIcon: "bg-amber-50",
      textIcon: "text-amber-600",
    },
  };

  const theme = colorClasses[color] || colorClasses.sky;

  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]
        border border-gray-100 border-l-4 ${theme.border}
        flex flex-col transition-transform hover:-translate-y-1
        min-w-0 h-full
      `}
      title={moneyFormat(value, currency, false)}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight leading-tight mr-2">
          {label}
        </p>
        <div className={`p-1.5 rounded-full shrink-0 ${theme.bgIcon} ${theme.textIcon}`}>
          <div className="w-4 h-4 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-lg sm:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-extrabold text-gray-900 leading-tight mb-1 whitespace-nowrap">
          {moneyFormat(value, currency, true)}
        </h3>

        {metaLines.length > 0 && (
          <div className="space-y-0.5 mt-1">
            {metaLines.map((line, idx) => (
              <p key={idx} className="text-gray-400 text-[10px] sm:text-xs leading-tight">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

