// src/components/ipo/IpoStatusTabs.js
import React from 'react';

// Tabs are passed as an array of strings: ['Upcoming', 'Open', 'Closed']
export default function IpoStatusTabs({ tabs, activeTab, setActiveTab }) {

    return (
        <div className="flex flex-wrap justify-start gap-2 mb-6 border-b border-gray-100 w-full pb-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-6 py-2.5 text-sm font-medium transition-all duration-200 border-b-2
                            ${isActive
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        {tab}
                    </button>
                );
            })}
        </div>
    );
}