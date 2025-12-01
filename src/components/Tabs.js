import React from "react";

// The 'id' here must match the 'case' strings in your App.js switch statement exactly.
const tabs = [
  { id: "SIP + LumpSum", label: "SIP + Lump Sum" },
  { id: "Pure SIP", label: "Pure SIP" },
  { id: "Lump Sum Only", label: "Lump Sum Only" },
  { id: "Step-Up SIP", label: "Step-Up SIP" },
  { id: "Step-Up + LumpSum", label: "Step-Up + Lump Sum" },
];

// Destructure 'activeTab' and 'setActiveTab' to match what App.js passes
export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8 mb-8 px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`
            px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200
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