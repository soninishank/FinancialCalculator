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
}) {
  const showTax = tax && tax.applied === true;
  const showInflation = inflation && inflation.applied === true;

  // grid: 3 cols normally, 4 cols when tax card present
  const gridColsClass = showTax ? "md:grid-cols-4" : "md:grid-cols-3";

  // Build cards in Flow-first order:
  // (1) Total Invested, (2) Total Future Value, (3) Wealth Generated, (4) Post-Tax (conditional)
  const cards = [
    {
      key: "invested",
      label: "Total Invested",
      value: invested,
      color: "indigo",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      key: "totalFuture",
      label: showInflation ? "Nominal Future Value" : "Total Future Value",
      value: totalValue,
      color: "sky",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      metaLines: showInflation ? [
        `Real Value: ${moneyFormat(inflation.realValue, currency, true)}`,
        `(Adjusted for ${inflation.inflationRate}% Inflation)`
      ] : []
    },
    {
      key: "wealth",
      label: showInflation ? "Nominal Wealth Gain" : "Wealth Generated",
      value: gain,
      color: "emerald",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  if (showTax) {
    const taxCard = {
      key: "postTax",
      label: "Post-Tax Value",
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
    };

    // place Post-Tax last (Flow-first approach)
    cards.push(taxCard);
  }

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
  };

  const theme = colorClasses[color] || colorClasses.sky;

  return (
    <div
      className={`
        bg-white rounded-xl p-4 sm:p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]
        border border-gray-100 border-l-4 ${theme.border}
        flex items-center justify-between transition-transform hover:-translate-y-1
      `}
      title={moneyFormat(value, currency, false)}
    >
      <div>
        <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
          {label}
        </p>

        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
          {moneyFormat(value, currency, true)}
        </h3>

        {metaLines.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {metaLines.map((line, idx) => (
              <p key={idx} className="text-gray-400 text-xs">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className={`p-2 sm:p-3 rounded-full ${theme.bgIcon} ${theme.textIcon}`}>
        {icon}
      </div>
    </div>
  );
}

