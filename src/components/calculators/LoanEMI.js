// src/components/calculators/LoanEMI.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import InputWithSlider from "../common/InputWithSlider";
import AmortizationTableWrapper from "../common/AmortizationTableWrapper"; // <--- NEW IMPORT
import { moneyFormat } from "../../utils/formatting";
import { calculateEMI, computeLoanAmortization } from "../../utils/finance";
import { downloadCSV } from "../../utils/export";
import CompoundingBarChart from "../common/CompoundingBarChart";

export default function LoanEMI({ currency, setCurrency }) {
  // Inputs
  const [principal, setPrincipal] = useState(5000000); // Loan Amount
  const [annualRate, setAnnualRate] = useState(8);    // Annual Interest Rate
  const [years, setYears] = useState(20);             // Loan Tenure

  const R_m = annualRate / 12 / 100;
  const N = years * 12;

  // 1. Calculate Monthly EMI
  const monthlyEMI = calculateEMI(principal, R_m, N);

  // 2. Compute Amortization Schedule
  const { rows: yearlyRows, finalTotalInterest, finalTotalPaid } = useMemo(
    () => computeLoanAmortization({ principal, annualRate, years, emi: monthlyEMI }),
    [principal, annualRate, years, monthlyEMI]
  );
  
  // Handlers
  const handleExport = () => {
    const headers = ["Year", "Opening Balance", "Principal Paid", "Interest Paid", "Closing Balance"];
    const data = yearlyRows.map((r) => [
      `Year ${r.year}`,
      Math.round(r.openingBalance),
      Math.round(r.principalPaid),
      Math.round(r.interestPaid),
      Math.round(r.closingBalance),
    ]);
    downloadCSV(data, headers, "loan_emi_schedule.csv");
  };

  // --- REUSABLE FUNCTION FOR TABLE CONTENT (Passed to the Wrapper) ---
  const renderAmortizationTableContent = () => (
    <>
      <thead className="bg-white sticky top-0 z-10 shadow-sm">
        <tr>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Year</th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Opening Balance</th>
          <th className="py-3 px-4 text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50/50 border-b border-rose-100 text-right">Interest Paid</th>
          <th className="py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50/50 border-b border-indigo-100 text-right">Principal Paid</th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Closing Balance</th>
        </tr>
      </thead>
      <tbody className="text-sm divide-y divide-gray-100">
        {yearlyRows.map((r) => (
          <tr key={r.year} className="hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">Year {r.year}</td>
            <td className="py-3 px-4 text-gray-600 text-right tabular-nums">{moneyFormat(Math.round(r.openingBalance), currency, true)}</td>
            <td className="py-3 px-4 text-rose-600 text-right tabular-nums">{moneyFormat(Math.round(r.interestPaid), currency)}</td>
            <td className="py-3 px-4 text-indigo-600 text-right tabular-nums">{moneyFormat(Math.round(r.principalPaid), currency)}</td>
            <td className="py-3 px-4 text-gray-800 font-bold text-right tabular-nums">{moneyFormat(Math.round(r.closingBalance), currency, true)}</td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      {/* INPUTS SECTION (omitted for brevity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        <InputWithSlider label="Loan Principal Amount" value={principal} onChange={setPrincipal} min={100000} max={50000000} step={100000} currency={currency} />
        <InputWithSlider label="Loan Tenure (Years)" value={years} onChange={setYears} min={1} max={30} />
        <div className="md:col-span-2">
          <InputWithSlider label="Annual Interest Rate (%)" value={annualRate} onChange={setAnnualRate} min={1} max={20} symbol="%" />
        </div>
      </div>
            {/* SUMMARY CARDS (omitted for brevity) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {/* Card 1: Monthly EMI */}
        <div className="bg-white border-l-4 border-violet-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly EMI</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(monthlyEMI), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Paid for {years} years</p>
        </div>

        {/* Card 2: Total Interest Paid */}
        <div className="bg-white border-l-4 border-rose-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Interest Paid</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            {moneyFormat(Math.round(finalTotalInterest), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Total Principal: {moneyFormat(principal, currency)}</p>
        </div>

        {/* Card 3: Total Payment */}
        <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payment</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(finalTotalPaid), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Principal + Interest</p>
        </div>
      </div>

      {/* --- NEW LOAN CHART INTEGRATION --- */}
      <CompoundingBarChart 
        data={yearlyRows} 
        currency={currency} 
        type="loan" // <--- CRITICAL: Tell the chart what kind of data it is rendering
      />

      {/* AMORTIZATION TABLE (Using the Wrapper) */}
      <div className="mt-12">
        <AmortizationTableWrapper
          title="Amortization Schedule (Yearly)"
          renderTableContent={renderAmortizationTableContent}
          onExport={handleExport}
          rowCount={yearlyRows.length}
        />
      </div>
    </div>
  );
}