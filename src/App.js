import React, { useState } from "react";
import Tabs from "./components/Tabs";


// Import calculators
import SIPWithLumpSum from "./components/calculators/SIPWithLumpSum";
import PureSIP from "./components/calculators/PureSIP";
import LumpSumOnly from "./components/calculators/LumpSumOnly";
import StepUpSIP from "./components/calculators/StepUpSIP";
import StepUpSIPWithLump from "./components/calculators/StepUpSIPWithLump";
import GoalPlanner from "./components/calculators/GoalPlanner";
import LoanEMI from "./components/calculators/LoanEMI"; 




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
      default:
        return <SIPWithLumpSum {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden mt-10">
        
        {/* Header */}
        <div className="bg-teal-700 p-8 text-center text-white">
          <h1 className="text-3xl font-bold">Investment Calculator</h1>
          <p className="mt-2 text-teal-100 opacity-90">
            Plan your financial goals with precision
          </p>
        </div>

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