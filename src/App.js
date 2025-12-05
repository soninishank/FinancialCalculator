import React, { useState } from "react";

// --- Imports corrected for new folder structure ---
import Tabs from "./components/Tabs";
import CurrencySelector from "./components/common/CurrencySelector"; // Assuming it's in common
import SIPWithLumpSum from "./components/calculators/SIPWithLumpSum";
import PureSIP from "./components/calculators/PureSIP";
import LumpSumOnly from "./components/calculators/LumpSumOnly";
import StepUpSIP from "./components/calculators/StepUpSIP";
import StepUpSIPWithLump from "./components/calculators/StepUpSIPWithLump";
import GoalPlanner from "./components/calculators/GoalPlanner";
import LoanEMI from "./components/calculators/LoanEMI"; 
import CAGRCalculator from "./components/calculators/CAGRCalculator";
import TopUpLoanEMI from "./components/calculators/TopUpLoanEMI";

export default function App() {
  const [activeTab, setActiveTab] = useState("SIP + LumpSum");
  
  // LIFT STATE UP: Currency
  const [currency, setCurrency] = useState("INR");

  const renderContent = () => {
    const props = { currency, setCurrency };

    switch (activeTab) {
      case "SIP + LumpSum":
        return <SIPWithLumpSum {...props} />;
      case "Pure SIP":
        return <PureSIP {...props} />;
      case "Lump Sum Only":
        return <LumpSumOnly {...props} />;
      case "Step-Up SIP":
        return <StepUpSIP {...props} />;
      case "Step-Up + LumpSum":
        return <StepUpSIPWithLump {...props} />;
      case "Goal Planner":
        return <GoalPlanner {...props} />;
      case "Loan EMI":
        return <LoanEMI {...props} />;
      case "CAGR Calculator":
        return <CAGRCalculator {...props} />;
      case "Top-Up Loan EMI":
        return <TopUpLoanEMI {...props} />;
      default:
        return <SIPWithLumpSum {...props} />;
    }
  };

  return (
    // P-2 on mobile, p-4 on desktop
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-2 sm:p-4">
      <div className="max-w-5xl w-full bg-white rounded-xl sm:rounded-3xl shadow-xl overflow-hidden mt-4 sm:mt-10">
        
        {/* --- HEADER (Mobile-First Compact Layout) --- */}
        {/* Use space-between layout for mobile for title and currency selector */}
        <div className="bg-teal-700 p-4 sm:p-6 text-white flex justify-between items-start">
          
          {/* Title - Adjust font sizes for mobile (text-xl sm:text-2xl) */}
          <div className="text-left pr-4 flex-grow">
            <h1 className="text-xl sm:text-2xl font-bold">Investment Calculator</h1>
            <p className="text-teal-100 opacity-90 text-xs sm:text-sm">
              Plan your financial goals with precision
            </p>
          </div>
          
          {/* Currency Selector - Fixed Width for Compact Look */}
          <div className="w-2/5 sm:w-1/4 max-w-[150px] mt-[-6px] mr-[-6px]"> 
            {/* The CurrencySelector needs to be mobile-optimized to look good here */}
            <CurrencySelector currency={currency} setCurrency={setCurrency} compactHeader={true} />
          </div>
        </div>
        {/* ----------------------------------------------------------------- */}
        
        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />


        {/* Main Content Area - Reduced mobile padding */}
        <div className="p-4 sm:p-8 md:p-12">
          {renderContent()}
        </div>
      </div>

      <div className="mt-8 text-gray-400 text-sm mb-10">
        © 2025 Finance Planner. Built for investors.
      </div>
    </div>
  );
}