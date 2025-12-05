// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CurrencyProvider } from './contexts/CurrencyContext';


import CurrencySelector from "./components/common/CurrencySelector";
import HomePage from "./components/home/HomePage.js";       // we'll add this next
import CalculatorPage from "./pages/CalculatorPage";    // you already added

export default function App() {
  return (
    <BrowserRouter>
      <CurrencyProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-2 sm:p-4">
        <div className="max-w-5xl w-full bg-white rounded-xl sm:rounded-3xl shadow-xl overflow-hidden mt-4 sm:mt-10">
          
          {/* Header */}
          <header className="bg-teal-700 p-4 sm:p-6 text-white flex justify-between items-start">
            <div className="text-left pr-4 flex-grow">
              <Link to="/" className="text-xl sm:text-2xl font-bold">Investment Calculator</Link>
              <p className="text-teal-100 opacity-90 text-xs sm:text-sm">Plan your financial goals with precision</p>
            </div>

            <div className="w-2/5 sm:w-1/4 max-w-[150px] mt-[-6px] mr-[-6px]">
              <CurrencySelector compactHeader={true} />
            </div>
          </header>

          {/* Routing area */}
          <main className="p-4 sm:p-8 md:p-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculator/:slug" element={<CalculatorPage />} />
              {/* optional: add 404 route later */}
            </Routes>
          </main>
        </div>

        <div className="mt-8 text-gray-400 text-sm mb-10">© 2025 Finance Planner. Built for investors.</div>
      </div>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
