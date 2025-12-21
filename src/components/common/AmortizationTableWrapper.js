// src/components/common/AmortizationTableWrapper.js
import React, { useState } from 'react';

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
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden"> {/* Reduced rounded-2xl to rounded-xl on mobile */}

      {/* Table Header with Export Button */}
      {/* FIX: Reduced padding and title size on mobile */}
      <div className="p-3 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-sm sm:text-lg text-gray-700">{title}</h3> {/* Smaller font on mobile */}
        <button
          onClick={onExport}
          // Button styles are already good, maybe make font size tiny on mobile if needed
          className="text-[10px] sm:text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Table Container - Dynamic Height */}
      {/* max-h-[400px] is fine as the default scroll height */}
      <div className={`overflow-auto flex-grow ${showAllRows ? 'max-h-full' : 'max-h-[400px]'}`}>
        <table className="w-full text-left border-collapse">
          {renderTableContent()}
        </table>
      </div>

      {/* Conditional Toggle Button */}
      {showToggleButton && (
        // FIX: Reduced padding on mobile
        <div className="p-2 sm:p-4 border-t border-gray-100 flex justify-center bg-white">
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            // Reduced font size and padding on mobile
            className="text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors shadow-md"
          >
            {showAllRows ? "Collapse Table (Show Scroll)" : `Show All ${rowCount} Years`}
          </button>
        </div>
      )}
    </div>
  );
}