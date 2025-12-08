// src/components/ipo/IpoListTable.js
import React from 'react';
import { moneyFormat } from "../../utils/formatting"; // Ensure this path is correct

// Helper function to render table headers (omitted for brevity)
const HeaderCell = ({ label, align = 'left' }) => (
    <th className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 text-${align}`}>
        {label}
    </th>
);

// Reusable Table Row Component
const Row = ({ ipo }) => {
    const isNegative = ipo.gmp < 0;
    const gmpColor = isNegative ? 'text-rose-600' : 'text-emerald-600';
    const typeTheme = ipo.type === 'SME' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800';

    // --- CRITICAL FIX ---
    // 1. Get the gain (safely default to 0 if it was undefined/null from the hook)
    const gain = ipo.gainPercentage || 0;
    
    // 2. Check if the number is valid (not NaN or Infinity from a division error)
    const displayGain = isFinite(gain) ? gain.toFixed(2) : 'N/A';
    // --------------------

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            {/* Company & Type */}
            <td className="py-3 px-4 whitespace-nowrap">
                <p className="font-semibold text-gray-900">{ipo.name}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeTheme}`}>
                    {ipo.type}
                </span>
            </td>

            {/* Dates */}
            <td className="py-3 px-4">
                <p className="text-xs text-gray-700">Open: {ipo.openDate}</p>
                <p className="text-xs text-gray-700">Close: {ipo.closeDate}</p>
            </td>

            {/* Issue Price */}
            <td className="py-3 px-4 text-right tabular-nums text-gray-800 font-medium">
                {moneyFormat(ipo.issuePrice, 'INR')}
            </td>
            
            {/* Issue Size */}
            <td className="py-3 px-4 text-right tabular-nums text-gray-600">
                {moneyFormat(ipo.issueSize, 'INR', true)}
            </td>

            {/* GMP (Est. Price) */}
            <td className={`py-3 px-4 text-right tabular-nums ${gmpColor}`}>
                <p className="font-semibold">{ipo.gmp > 0 ? '+' : ''}{moneyFormat(ipo.gmp, 'INR')}</p>
                {/* FIX: Ensure estimatedPrice is a valid number before formatting */}
                {isFinite(ipo.estimatedPrice) && ipo.estimatedPrice !== null ? (
                    <p className="text-xs text-gray-500">({moneyFormat(ipo.estimatedPrice, 'INR')})</p>
                ) : (
                    <p className="text-xs text-gray-500">(Est. Price N/A)</p>
                )}
            </td>
            {/* Est. Gain (%) */}
            <td className={`py-3 px-4 text-right tabular-nums ${gmpColor} font-bold`}>
                {displayGain}% {/* Use the safe display variable */}
            </td>
        </tr>
    );
};

// Main Component
export default function IpoListTable({ data, status }) {
    const listData = data || []; // Use empty array if data is null/undefined
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Use listData for length check */}
            {listData.length > 0 ? (
                <table className="min-w-full text-left text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <HeaderCell label="Company/Type" />
                            <HeaderCell label="Dates" />
                            <HeaderCell label="Issue Price" align="right" />
                            <HeaderCell label="Issue Size" align="right" />
                            <HeaderCell label="GMP (Est. Price)" align="right" />
                            <HeaderCell label="Est. Gain (%)" align="right" />
                        </tr>
                    </thead>
                    <tbody>
                        {/* Use listData for mapping */}
                        {listData.map(ipo => (
                            <Row key={ipo.id} ipo={ipo} />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-10 text-center">
                    <p className="text-lg font-medium text-gray-600">No {status} IPOs are currently available.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later or view the 'All' status for previous listings.</p>
                </div>
            )}
        </div>
    );
}