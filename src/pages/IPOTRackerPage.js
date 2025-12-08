// src/pages/IPOTrackerPage.js
import React, { useState } from "react";
import { useIpoData } from "../components/ipo/useIpoData"; // <--- FIX 2: Import the hook
import IpoListTable from "../components/ipo/IPOListTable";     // <--- FIX 3: Import the List Table
import IpoStatusTabs from "../components/ipo/IPOStatusTabs";   // <--- FIX 4: Import the Tabs
const TABS = ['Upcoming', 'Open', 'Closed'];

export default function IPOTracker() {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const { categorizedData, isLoading } = useIpoData();

    // --- FIX 1: Show Loading State First ---
    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="text-xl font-semibold text-indigo-600">Loading Live IPO Data...</div>
                <p className="text-gray-500 mt-2">Connecting to data feed. This is the future automation point!</p>
            </div>
        );
    }
    
    // --- FIX 2: Safely access current data (default to empty array) ---
    // If categorizedData is still undefined/null, or if the key is missing, default to [].
    const currentData = categorizedData[activeTab] || []; 

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">IPO & GMP Tracker (Unofficial)</h2>
            <p className="text-gray-500 mb-6">Live status and grey market premium for mainboard and SME IPOs.</p>

            {/* Tab Navigation */}
            <IpoStatusTabs 
                tabs={TABS} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
            />

            {/* List Table View */}
            <IpoListTable 
                data={currentData} // This is now guaranteed to be an array or [].
                status={activeTab} 
            />
            
            <p className="text-xs text-gray-400 mt-4">
                *GMP (Grey Market Premium) is unofficial data and should be used for informational purposes only.
            </p>
        </div>
    );
}