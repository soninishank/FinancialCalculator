import React from "react";
import { moneyFormat } from "../../utils/formatting"; // Ensure path is correct

export default function ResultsTable({ data, currency, onExport, columns }) {
  if (!data || data.length === 0) return null;



  // Map 'growth' to standard key if needed or handle flexible keys
  // Note: Previous code used row.growth. We should stick to that key in default.
  const displayColumns = columns || [
    { key: 'year', label: 'Year', align: 'left' },
    { key: 'totalInvested', label: 'Invested', align: 'right', format: 'money' },
    { key: 'growth', label: 'Growth', align: 'right', format: 'money', color: 'green' },
    { key: 'overallValue', label: 'Total Value', align: 'right', format: 'money', highlight: true }
  ];

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
              {displayColumns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 whitespace-nowrap
                     ${col.align === 'right' ? 'text-right' : 'text-left'}
                     ${col.highlight ? 'text-teal-700 bg-teal-50/50 border-teal-100' : 'text-gray-500 bg-gray-50'}
                   `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {data.map((row, rIdx) => (
              <tr key={row.year || rIdx} className="hover:bg-gray-50 transition-colors group">
                {displayColumns.map((col, cIdx) => {
                  const val = row[col.key];

                  // Styling Logic
                  let cellClass = "py-3 px-4 whitespace-nowrap tabular-nums ";
                  cellClass += col.align === 'right' ? 'text-right ' : 'text-left ';

                  if (col.highlight) {
                    cellClass += "text-gray-900 font-bold bg-teal-50/10 group-hover:bg-teal-50/30 ";
                  } else if (col.color === 'green') {
                    cellClass += "text-green-600 ";
                  } else {
                    cellClass += "text-gray-600 font-medium ";
                  }

                  // Formatting Logic
                  let displayVal = val;
                  if (col.format === 'money') {
                    displayVal = moneyFormat(val, currency);
                    if (col.color === 'green' && val > 0) displayVal = "+" + displayVal;
                  } else if (col.format === 'percent') {
                    displayVal = val + '%';
                  }

                  return (
                    <td key={col.key || cIdx} className={cellClass}>
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}