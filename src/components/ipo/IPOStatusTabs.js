// src/components/ipo/IpoStatusTabs.js
import React from 'react';

// Tabs are passed as an array of strings: ['Upcoming', 'Open', 'Closed']
export default function IpoStatusTabs({ tabs, activeTab, setActiveTab }) {
    
    const themeColor = (tab) => {
        if (tab === 'Upcoming') return 'text-gray-600 bg-gray-100 hover:bg-gray-200';
        if (tab === 'Open') return 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200';
        if (tab === 'Closed') return 'text-rose-700 bg-rose-100 hover:bg-rose-200';
        return 'text-gray-700 bg-gray-100';
    };

    return (
        <div className="flex flex-wrap justify-start gap-3 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                        ${
                            activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-md'
                                : themeColor(tab)
                        }
                    `}
                >
                    {tab} ({tab === 'Upcoming' ? 'Pre-Open' : tab})
                </button>
            ))}
        </div>
    );
}