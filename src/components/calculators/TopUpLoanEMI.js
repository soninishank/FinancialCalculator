// src/components/calculators/TopUpLoanEMI.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import CollapsibleAmortizationTable from "../common/CollapsibleAmortizationTable";
import { FinancialCompoundingBarChart, FinancialLoanPieChart } from "../common/FinancialCharts";
import { moneyFormat } from "../../utils/formatting";
import { computeDualAmortization } from "../../utils/finance";
import { calculatorDetails } from "../../data/calculatorDetails";
import { downloadPDF } from "../../utils/export";

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
  STEP_LARGE,
  MAX_PROCESSING_FEE_PERCENT,
  STEP_PROCESSING_FEE_PERCENT
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

  const [topUpFeePercent, setTopUpFeePercent] = useState(0);

  // --- CALCULATIONS ---
  const { rows: yearlyRows, monthlyRows, finalTotalInterest, finalTotalPaid, monthlyEMI } = useMemo(
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

  const topUpFeeAmount = topUpPrincipal * (topUpFeePercent / 100);

  const handleExport = () => {
    // Default to monthly export
    const isMonthly = true;
    const dataToExport = isMonthly ? monthlyRows : yearlyRows;
    const filename = isMonthly ? "topup_loan_amortization_monthly.pdf" : "topup_loan_amortization_yearly.pdf";
    const periodLabel = isMonthly ? "Month" : "Year";

    const headers = [periodLabel, "Opening Balance", "Principal Paid", "Interest Paid", "Closing Balance"];

    const data = dataToExport.map((r) => [
      isMonthly ? `Month ${r.month} (Yr ${r.year})` : `Year ${r.year}`,
      Math.round(r.openingBalance),
      Math.round(r.principalPaid),
      Math.round(r.interestPaid),
      Math.round(r.closingBalance),
    ]);
    downloadPDF(data, headers, filename);
  };

  // renderAmortizationTableContent removed

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
        <div className="md:col-span-1 border-r border-gray-100 pr-6">
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
          <InputWithSlider
            label="Top-Up Processing Fee (%)"
            value={topUpFeePercent} onChange={setTopUpFeePercent}
            min={0} max={MAX_PROCESSING_FEE_PERCENT} step={STEP_PROCESSING_FEE_PERCENT} symbol="%" isDecimal={true}
          />
          <p className="text-xs text-right text-gray-500 mt-1">
            <span className="font-medium">Fee Amount:</span> <span className="font-bold text-gray-700">{moneyFormat(topUpFeeAmount, currency)}</span>
          </p>
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

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* PIE CHART */}
        <div className="lg:col-span-1 h-full">
          <FinancialLoanPieChart
            principal={basePrincipal + topUpPrincipal}
            totalInterest={finalTotalInterest}
            currency={currency}
            years={Math.max(baseYears, 0)} // Just a label
          />
        </div>

        {/* BAR CHART */}
        <div className="lg:col-span-2">
          <FinancialCompoundingBarChart data={yearlyRows} currency={currency} type="loan" />
        </div>
      </div>

      {/* AMORTIZATION TABLE */}
      <div className="mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-gray-800">Amortization Schedule</h3>
          <button
            onClick={handleExport}
            className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors w-full md:w-auto"
          >
            Export PDF
          </button>
        </div>
        <CollapsibleAmortizationTable
          yearlyData={yearlyRows}
          monthlyData={monthlyRows}
          currency={currency}
        />
      </div>

      {/* EXPLANATORY DETAILS */}
      <div className="mt-12">
        {calculatorDetails.topUpLoan.render()}
      </div>

    </div>
  );
}