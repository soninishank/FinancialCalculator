// src/components/common/Tabs.js
import React from "react";

// The 'id' here must match the 'case' strings in your App.js switch statement exactly.
const tabs = [
  { id: "SIP + LumpSum", label: "SIP + Lump Sum" },
  { id: "Pure SIP", label: "Pure SIP" },
  { id: "Lump Sum Only", label: "Lump Sum Only" },
  { id: "Step-Up SIP", label: "Step-Up SIP" },
  { id: "Step-Up + LumpSum", label: "Step-Up + Lump Sum" },
  { id: "Goal Planner", label: "Goal Planner 🎯" },
  { id: "Loan EMI", label: "Loan EMI 🏦" },
  { id: "CAGR Calculator", label: "CAGR Calculator" },
  { id: "Top-Up Loan EMI", label: "Top-Up Loan EMI" },
];

export default function Tabs({ activeTab, setActiveTab }) {
  return (
    // Default to flex-wrap with small gap (mobile). Use larger gap on sm: screens.
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-8 mb-4 sm:mb-8 px-2 sm:px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`
            /* Reduce padding and font size on mobile (text-xs) */
            px-3 py-1.5 text-xs 
            
            /* Increase padding and font size on tablet/desktop (sm:) */
            sm:px-5 sm:py-2.5 sm:text-sm 
            
            rounded-full font-medium transition-all duration-200
            ${
              activeTab === t.id
                ? "bg-teal-700 text-white shadow-md transform scale-105"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
            }
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}