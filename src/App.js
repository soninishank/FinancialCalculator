// src/App.js — add the /calculators route (minimal change)
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CurrencyProvider } from './contexts/CurrencyContext';

// Import Pages
import CalculatorPage from "./pages/CalculatorPage";
import HomeFrontPage from "./pages/HomeFrontPage";
import IPOTRackerPage from "./pages/IPOTRackerPage"; 
import CurrencySelector from "./components/common/CurrencySelector";
import CalculatorsList from "./pages/CalculatorsList";

export default function App() {
  return (
    <BrowserRouter>
      <CurrencyProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center w-full p-0 sm:p-4">
        <div className="w-full bg-white rounded-xl sm:rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-10">
          <header className="bg-teal-700 p-4 sm:p-6 text-white flex justify-between items-start max-w-5xl mx-auto">
            <div className="text-left pr-4 flex-grow">
              <Link to="/" className="text-xl sm:text-2xl font-bold">Investment Calculator</Link>
              <p className="text-teal-100 opacity-90 text-xs sm:text-sm">Plan your financial goals with precision</p>
            </div>

            <div className="w-2/5 sm:w-1/4 max-w-[150px] mt-[-6px] mr-[-6px]">
              <CurrencySelector compactHeader={true} />
            </div>
          </header>

          {/* Routing area */}
          <Routes>
            <Route path="/" element={<HomeFrontPage />} />

            <Route path="/calculators" element={
               <main className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
               <CalculatorsList />
              </main>
            } />

            <Route path="/ipo" element={
              <main className="p-4 sm:p-8 md:p-12 w-full">
                <IPOTRackerPage />
              </main>
            } /> 
            
            <Route path="/calculator/:slug" element={
              <main className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
                <CalculatorPage />
              </main>
            } />

            {/* Helpful for debugging unknown routes */}
            <Route path="*" element={
              <main className="p-6 max-w-5xl mx-auto">
                <div>Route not found. <Link to="/" className="text-teal-600">Back home</Link></div>
              </main>
            } />
          </Routes>
        </div>

        <div className="mt-8 text-gray-400 text-sm mb-10">© 2025 Finance Planner. Built for investors.</div>
      </div>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
