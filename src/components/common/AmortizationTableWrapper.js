// src/components/common/AmortizationTableWrapper.js
import React, { useState } from 'react';

/**
 * A reusable component that handles the visual shell, sticky header, 
 * and "Show All / Collapse" toggle for any yearly breakdown.
 * 
 * @param {string} title - The title of the table (e.g., "Yearly Breakdown")
 * @param {function} renderTableContent - A function that returns the <table> element's content (thead/tbody)
 * @param {function} onExport - Function to handle CSV download
 * @param {number} rowCount - The total number of rows (used to decide if we need the toggle button)
 */
export default function AmortizationTableWrapper({
  title,
  renderTableContent,
  onExport,
  rowCount,
}) {
  // Local state to manage the scroll/collapse behavior
  const [showAllRows, setShowAllRows] = useState(false);
  
  // Rule: If there are more than 10 rows, offer the toggle
  const showToggleButton = rowCount > 10;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Table Header with Export Button */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <button
          onClick={onExport}
          className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Table Container - Dynamic Height */}
      <div className={`overflow-auto flex-grow ${showAllRows ? 'max-h-full' : 'max-h-[400px]'}`}>
        <table className="w-full text-left border-collapse">
          {/* Renders the specific <thead> and <tbody> provided by the parent calculator */}
          {renderTableContent()}
        </table>
      </div>

      {/* Conditional Toggle Button */}
      {showToggleButton && (
        <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors shadow-md"
          >
            {showAllRows ? "Collapse Table (Show Scroll)" : `Show All ${rowCount} Years`}
          </button>
        </div>
      )}
    </div>
  );
}