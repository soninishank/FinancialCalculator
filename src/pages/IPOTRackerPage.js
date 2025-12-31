'use client';

// src/pages/IPOTrackerPage.js
import React, { useState } from "react";
import { useIpoData } from "../hooks/useIpoData";
import IpoListTable from "../components/ipo/IPOListTable";
import IpoStatusTabs from "../components/ipo/IPOStatusTabs";

const TABS = ['Open', 'Upcoming', 'Closed']; // Changed order to prioritize Open
const FILTERS = ['All', 'Equity', 'SME'];

export default function IPOTracker() {
    const [activeTab, setActiveTab] = useState('Open'); // Default to Open
    const [securityFilter, setSecurityFilter] = useState('All');

    const { categorizedData, isLoading } = useIpoData();

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="text-xl font-semibold text-indigo-600">Loading Live IPO Data...</div>
                <p className="text-gray-500 mt-2">Fetching latest data from NSE...</p>
            </div>
        );
    }

    // Get data for active tab
    const rawData = categorizedData ? (categorizedData[activeTab.toLowerCase()] || []) : [];

    // Apply Filters
    const filteredData = rawData.filter(ipo => {
        if (securityFilter === 'All') return true;
        // Check for loose match (e.g. "SME" inside "SME Emerge")
        const type = (ipo.type || "").toUpperCase();
        if (securityFilter === 'SME') return type.includes('SME');
        if (securityFilter === 'Equity') return !type.includes('SME'); // Assume non-SME is generic Equity
        return true;
    });

    return (
        <div className="animate-fade-in w-full px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Status Overview</div>
                </div>

                {/* Security Type Filter */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setSecurityFilter(filter)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${securityFilter === filter
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation */}
            <IpoStatusTabs
                tabs={TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* List Table View */}
            <IpoListTable
                data={filteredData}
                status={activeTab}
            />

            <p className="text-xs text-gray-400 mt-6 text-center">
                *Data fetched directly from NSE. Dates and GMP are subject to market changes.
                <br />Displaying {filteredData.length} of {rawData.length} items.
            </p>
        </div>
    );
}