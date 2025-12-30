import React from "react";
import { moneyFormat } from "../../utils/formatting";

export default function MetricCard({
    label,
    value,
    subtext,
    currency,
    color = "indigo",
    icon,
    isCurrency = false
}) {
    const colorClasses = {
        sky: { border: "border-l-sky-500", bgIcon: "bg-sky-50", textIcon: "text-sky-600", text: "text-sky-900" },
        indigo: { border: "border-l-indigo-500", bgIcon: "bg-indigo-50", textIcon: "text-indigo-600", text: "text-indigo-900" },
        emerald: { border: "border-l-emerald-500", bgIcon: "bg-emerald-50", textIcon: "text-emerald-600", text: "text-emerald-900" },
        green: { border: "border-l-emerald-500", bgIcon: "bg-emerald-50", textIcon: "text-emerald-600", text: "text-emerald-900" }, // Alias for emerald
        teal: { border: "border-l-teal-500", bgIcon: "bg-teal-50", textIcon: "text-teal-600", text: "text-teal-900" },
        rose: { border: "border-l-rose-500", bgIcon: "bg-rose-50", textIcon: "text-rose-600", text: "text-rose-900" },
        red: { border: "border-l-red-500", bgIcon: "bg-red-50", textIcon: "text-red-600", text: "text-red-900" },
        amber: { border: "border-l-amber-500", bgIcon: "bg-amber-50", textIcon: "text-amber-600", text: "text-amber-900" },
    };

    const theme = colorClasses[color] || colorClasses.indigo;
    const displayValue = isCurrency ? moneyFormat(value, currency, true) : value;

    return (
        <div className={`
            p-4 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${theme.border}
            flex items-start gap-4 transition-all hover:shadow-md min-w-0
        `}>
            {icon && (
                <div className={`p-3 rounded-lg ${theme.bgIcon} ${theme.textIcon} shrink-0`}>
                    {icon}
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1 truncate">{label}</p>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight truncate" title={typeof displayValue === 'string' ? displayValue : ''}>
                    {displayValue}
                </div>
                {subtext && <p className={`text-xs mt-1 font-medium ${theme.textIcon}`}>{subtext}</p>}
            </div>
        </div>
    );
}
