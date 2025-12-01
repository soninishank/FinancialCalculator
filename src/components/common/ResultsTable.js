import React from "react";
import { moneyFormat } from "../../utils/formatting"; // Ensure path is correct

export default function ResultsTable({ data, currency, onExport }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header with Export Button */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-700">Yearly Breakdown</h3>
        <button
          onClick={onExport}
          className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-auto flex-grow max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Year</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Invested</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Growth</th>
              <th className="py-3 px-4 text-xs font-semibold text-teal-700 uppercase tracking-wider bg-teal-50/50 border-b border-teal-100 text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-gray-50 transition-colors group">
                {/* Year Column */}
                <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">
                   {row.year}
                </td>

                {/* Invested */}
                <td className="py-3 px-4 text-gray-600 text-right tabular-nums">
                  {moneyFormat(row.totalInvested, currency)}
                </td>

                {/* Growth */}
                <td className="py-3 px-4 text-green-600 text-right tabular-nums">
                  +{moneyFormat(row.growth, currency)}
                </td>

                {/* Total Value (Highlighted) */}
                <td className="py-3 px-4 text-gray-900 font-bold text-right tabular-nums bg-teal-50/10 group-hover:bg-teal-50/30">
                  {moneyFormat(row.overallValue, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}