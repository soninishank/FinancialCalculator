// src/components/calculators/TopUpLoanEMI.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import AmortizationTableWrapper from "../common/AmortizationTableWrapper";
import { FinancialCompoundingBarChart } from "../common/FinancialCharts";
import { moneyFormat } from "../../utils/formatting";
import { computeDualAmortization } from "../../utils/finance";

import {
  DEFAULT_LOAN_PRINCIPAL,
  DEFAULT_LOAN_RATE,
  DEFAULT_LOAN_TENURE,
  MIN_YEARS,
  MIN_RATE,
  MAX_LOAN,
  MAX_RATE,
  MAX_YEARS,
  MIN_LOAN,
  STEP_LARGE
} from "../../utils/constants";

export default function TopUpLoanEMI({ currency }) {
  // --- BASE LOAN STATE (Loan A) ---
  const [basePrincipal, setBasePrincipal] = useState(DEFAULT_LOAN_PRINCIPAL);
  const [baseRate, setBaseRate] = useState(DEFAULT_LOAN_RATE);
  const [baseYears, setBaseYears] = useState(DEFAULT_LOAN_TENURE);

  // --- TOP-UP LOAN STATE (Loan B) ---
  const [topUpPrincipal, setTopUpPrincipal] = useState(1000000); // 10 Lakhs Top Up
  const [topUpRate, setTopUpRate] = useState(9); // 9% Top Up Rate
  const [topUpYear, setTopUpYear] = useState(5); // Top Up taken in Year 5

  // --- CALCULATIONS ---
  const { rows: yearlyRows, finalTotalInterest, finalTotalPaid, monthlyEMI } = useMemo(
    () =>
      computeDualAmortization({
        basePrincipal,
        baseRate,
        baseYears,
        topUpPrincipal,
        topUpRate,
        topUpYear,
      }),
    [basePrincipal, baseRate, baseYears, topUpPrincipal, topUpRate, topUpYear]
  );

  const handleExport = () => {
    window.print();
  };

  // --- RENDER FUNCTION for AmortizationTableWrapper ---
  const renderAmortizationTableContent = () => (
    <>
      <thead className="bg-white sticky top-0 z-10 shadow-sm">
        <tr>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Year</th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Opening Balance</th>
          <th className="py-3 px-4 text-xs font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50/50 border-b border-emerald-100 text-right">Principal Paid</th>
          <th className="py-3 px-4 text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50/50 border-b border-rose-100 text-right">Interest Paid</th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-200 text-right">Closing Balance</th>
        </tr>
      </thead>
      <tbody className="text-sm divide-y divide-gray-100">
        {yearlyRows.length === 0 ? (
          <tr className="text-center text-gray-500">
            <td colSpan="5" className="py-4">No data available</td>
          </tr>
        ) : (
          yearlyRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-700">
                Year {row.year}
                {row.year === topUpYear && (
                  <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Top-Up</span>
                )}
              </td>
              <td className="py-3 px-4 text-right text-gray-600">
                {moneyFormat(Math.round(row.openingBalance), currency)}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                {moneyFormat(Math.round(row.principalPaid), currency)}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-rose-600">
                {moneyFormat(Math.round(row.interestPaid), currency)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-700">
                {moneyFormat(Math.round(row.closingBalance), currency)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </>
  );

  // FIX: Clamp topUpYear if baseYears reduces below it
  const handleBaseYearsChange = (newVal) => {
    const val = Number(newVal);
    setBaseYears(val);
    if (topUpYear >= val) {
      setTopUpYear(Math.max(1, val - 1));
    }
  };

  return (
    <div className="animate-fade-in">
      {/* INPUTS SECTION: Split into two clear blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">

        {/* --- BLOCK 1: BASE LOAN (LEFT) --- */}
        <div className="md:col-span-1 border-r border-gray-200 pr-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Base Loan (Original)</h3>

          <InputWithSlider
            label="Original Principal"
            value={basePrincipal} onChange={setBasePrincipal}
            min={MIN_LOAN} max={MAX_LOAN} step={STEP_LARGE} currency={currency}
          />
          <InputWithSlider
            label="Original Tenure (Years)"
            value={baseYears} onChange={handleBaseYearsChange}
            min={MIN_YEARS} max={MAX_YEARS} step={1}
          />
          <InputWithSlider
            label="Original Rate (%)"
            value={baseRate} onChange={setBaseRate}
            min={MIN_RATE} max={MAX_RATE} symbol="%" isDecimal={true}
          />
        </div>

        {/* --- BLOCK 2: TOP-UP LOAN (RIGHT) --- */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top-Up Loan (New)</h3>

          <InputWithSlider
            label="Top-Up Amount"
            value={topUpPrincipal} onChange={setTopUpPrincipal}
            min={MIN_LOAN} max={MAX_LOAN / 2} step={STEP_LARGE} currency={currency}
          />
          <InputWithSlider
            label="Top-Up Year"
            value={topUpYear} onChange={setTopUpYear}
            min={MIN_YEARS} max={baseYears - 1} step={1}
          />
          <InputWithSlider
            label="Top-Up Rate (%)"
            value={topUpRate} onChange={setTopUpRate}
            min={MIN_RATE} max={MAX_RATE} symbol="%" isDecimal={true}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white border-l-4 border-violet-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Combined Monthly EMI</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(monthlyEMI), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">After top-up is taken</p>
        </div>

        <div className="bg-white border-l-4 border-rose-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Interest Paid</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            {moneyFormat(Math.round(finalTotalInterest), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Base loan + Top-up combined</p>
        </div>

        <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payment</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(finalTotalPaid), currency)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Principal + Interest combined</p>
        </div>
      </div>

      {/* LOAN AMORTIZATION BAR CHART */}
      <FinancialCompoundingBarChart data={yearlyRows} currency={currency} type="loan" />

      {/* AMORTIZATION TABLE */}
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