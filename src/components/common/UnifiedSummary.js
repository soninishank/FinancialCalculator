import React from 'react';
import { moneyFormat } from '../../utils/formatting';
import { FinancialInvestmentPieChart } from './FinancialCharts';

export default function UnifiedSummary({
    invested,
    gain,
    total,
    currency,
    years,
    title = "Break-up of Maturity Value",
    customMetrics = [],
    tax = null,
    inflation = null
}) {
    // Default metrics if none provided
    let metrics = customMetrics.length > 0 ? customMetrics : [
        { label: "Total Investment", value: invested, color: "text-gray-800", bgColor: "" },
        { label: "Interest Earned", value: gain, color: "text-teal-700", bgColor: "bg-teal-50/30" },
        { label: "Maturity Value", value: total, color: "text-indigo-700", bgColor: "bg-indigo-50/30", subtext: `After ${years} Years` }
    ];

    if (tax && tax.applied) {
        metrics.push({
            label: "Post-Tax Value",
            value: tax.postTaxValue,
            color: "text-rose-700",
            bgColor: "bg-rose-50/30",
            subtext: `Tax: ${moneyFormat(tax.taxDeducted, currency)}`
        });
    }

    if (inflation && inflation.applied) {
        metrics.push({
            label: "Real Value",
            value: inflation.realValue,
            color: "text-amber-700",
            bgColor: "bg-amber-50/30",
            subtext: `${inflation.inflationRate}% Inflation`
        });
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-gray-100">
                {/* LEFT: METRICS (2/5 width) */}
                <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
                    {metrics.map((m, idx) => (
                        <div key={idx} className={`p-6 text-center ${m.bgColor}`}>
                            <p className="text-sm font-semibold text-gray-500 mb-1">{m.label}</p>
                            {m.subtext && (
                                <p className="text-xs text-gray-400 mb-2 font-medium opacity-80">{m.subtext}</p>
                            )}
                            <p className={`text-2xl sm:text-3xl font-extrabold ${m.color} tracking-tight`}>
                                {moneyFormat(m.value, currency)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* RIGHT: PIE CHART (3/5 width) */}
                <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center bg-gray-50/30">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 self-start">{title}</h4>
                    <div className="w-full h-80">
                        <FinancialInvestmentPieChart
                            invested={invested}
                            gain={gain}
                            total={total}
                            currency={currency}
                            years={years}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
