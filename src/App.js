import React, { useState } from "react";
import Tabs from "./components/Tabs";
import CurrencySelector from "./components/common/CurrencySelector";


// Import calculators
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
  
  // 1. LIFT STATE UP: Define currency here so it persists across tabs
  const [currency, setCurrency] = useState("INR");

  const renderContent = () => {
    // 2. PASS PROPS: Pass currency and setCurrency to every component
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden mt-10">
        
        {/* --- HEADER (New Compact Flex Structure) --- */}
        <div className="bg-teal-700 p-6 pt-4 pb-4 text-white flex justify-between items-center relative"> {/* Reduced p-8 to p-6/p-4 */}
          
          {/* Title on the left */}
          <div className="text-left pr-4">
            <h1 className="text-2xl font-bold">Investment Calculator</h1>
            <p className="text-teal-100 opacity-90 text-sm">
              Plan your financial goals with precision
            </p>
          </div>
          
          {/* Currency Selector on the right */}
          {/* CRITICAL: Reduced width to fit compact style */}
          <div className="w-full sm:w-1/3 md:w-1/5 max-w-[150px]"> 
            <CurrencySelector currency={currency} setCurrency={setCurrency} compactHeader={true} />
          </div>
        </div>
        {/* ----------------------------------------------------------------- */}
        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />


        {/* Main Content Area */}
        <div className="p-8 md:p-12">
          {renderContent()}
        </div>
      </div>

      <div className="mt-8 text-gray-400 text-sm mb-10">
        © 2025 Finance Planner. Built for investors.
      </div>
    </div>
  );
}