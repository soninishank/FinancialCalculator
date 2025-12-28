// src/components/calculators/SWPCalculator.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import AmortizationTableWrapper from "../common/AmortizationTableWrapper";
import { FinancialLineChart } from "../common/FinancialCharts"; // <--- Import Chart

import { moneyFormat } from "../../utils/formatting";
import { computeSWPPlan } from "../../utils/finance";
import { calculatorDetails } from "../../data/calculatorDetails";
import { downloadPDF } from "../../utils/export";
import {
  DEFAULT_RATE,
  MIN_YEARS,
  MAX_YEARS,
  MIN_RATE,
  MAX_RATE,
  MAX_CORPUS,
  STEP_LARGE, // 100k
  STEP_SIP, // 500
  MAX_EXPENSE // 500k (Max Withdrawal)
} from "../../utils/constants";

const DEFAULT_WITHDRAWAL = 5000;
const MIN_WITHDRAWAL = 1000;
const MIN_SWP_CORPUS = 100000;

export default function SWPCalculator({ currency }) {
  // Simple Inputs Only
  const [initialCorpus, setInitialCorpus] = useState(1000000); // 10L
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(DEFAULT_WITHDRAWAL);
  const [years, setYears] = useState(15);
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);

  const [viewFrequency, setViewFrequency] = useState('yearly');

  // --- CALCULATION ---
  const { rows: yearlyRows, monthlyRows, finalCorpus, totalWithdrawn, totalInterest, depletionYear, depletionMonth } = useMemo(
    () =>
      computeSWPPlan({
        initialCorpus: Number(initialCorpus),
        annualRate: Number(annualRate),
        years: Number(years),
        monthlyWithdrawal: Number(monthlyWithdrawal),
        annualWithdrawalIncrease: 0, // No annual increase for simplicity
      }),
    [initialCorpus, annualRate, years, monthlyWithdrawal]
  );

  // --- DERIVE ADDITIONAL UX FIELDS LOCALLY (no change needed in computeSWPPlan util) ---
  // Total elapsed months until depletion (0 if not depleted)
  const depletionTotalMonths = depletionYear > 0 ? (depletionYear - 1) * 12 + depletionMonth : 0;

  const formatDurationFromMonths = (totalMonths) => {
    if (!totalMonths || totalMonths <= 0) return "";
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;

    const parts = [];
    if (yearsPart > 0) parts.push(`${yearsPart} ${yearsPart === 1 ? "year" : "years"}`);
    if (monthsPart > 0) parts.push(`${monthsPart} ${monthsPart === 1 ? "month" : "months"}`);

    return parts.join(" ");
  };

  const depletionYearMsg =
    depletionYear > 0
      ? `Corpus depleted after ${formatDurationFromMonths(
        depletionTotalMonths
      )} (Year ${depletionYear}, Month ${depletionMonth})`
      : "Corpus remained after requested period";

  const annualizedWithdrawalRate = initialCorpus > 0 ? ((monthlyWithdrawal * 12) / initialCorpus) * 100 : 0;

  // Export Handler
  const handleExport = () => {
    const isMonthly = viewFrequency === 'monthly';
    const dataToExport = isMonthly ? monthlyRows : yearlyRows;
    const filename = isMonthly ? "swp_report_monthly.pdf" : "swp_report_yearly.pdf";
    const periodLabel = isMonthly ? "Month" : "Year";

    const headers = [periodLabel, "Opening Balance", "Total Withdrawal", "Interest Earned", "Closing Balance"];

    const data = dataToExport.map((r) => [
      isMonthly ? `Month ${r.month} (Yr ${r.year})` : `Year ${r.year}`,
      Math.round(r.openingBalance),
      Math.round(r.days === undefined ? r.totalWithdrawal : r.withdrawal), // Use correct withdrawal field
      Math.round(r.interestEarned),
      Math.round(r.closingBalance),
    ]);
    downloadPDF(data, headers, filename);
  };

  // Render Table Content
  const renderSWPTableContent = () => (
    <>
      <thead className="bg-white sticky top-0 z-10 shadow-sm">
        <tr>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            {viewFrequency === 'monthly' ? 'Month' : 'Year'}
          </th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 text-right">
            Opening Balance
          </th>
          <th className="py-3 px-4 text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50/50 border-b border-rose-100 text-right">
            Withdrawal
          </th>
          <th className="py-3 px-4 text-xs font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50/50 border-b border-emerald-100 text-right">
            Interest Earned
          </th>
          <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-100 text-right">
            Closing Balance
          </th>
        </tr>
      </thead>
      <tbody className="text-sm divide-y divide-gray-100">
        {(viewFrequency === 'monthly' ? monthlyRows : yearlyRows).map((r, idx) => (
          <tr
            key={idx}
            className={`${r.closingBalance <= 0 ? "bg-rose-50" : "hover:bg-gray-50"} transition-colors`}
          >
            <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">
              {viewFrequency === 'monthly' ?
                <span className="text-xs">M{r.month} <span className="text-gray-400 font-normal">/ Yr {r.year}</span></span>
                : `Year ${r.year}`
              }
            </td>
            <td className="py-3 px-4 text-gray-600 text-right tabular-nums">
              {moneyFormat(Math.round(r.openingBalance), currency, true)}
            </td>
            <td className="py-3 px-4 text-rose-600 font-bold text-right tabular-nums">
              {moneyFormat(Math.round(r.withdrawal !== undefined ? r.withdrawal : r.totalWithdrawal), currency)}
            </td>
            <td className="py-3 px-4 text-emerald-600 text-right tabular-nums">
              {moneyFormat(Math.round(r.interestEarned), currency)}
            </td>
            <td className="py-3 px-4 text-gray-800 font-bold text-right tabular-nums">
              {moneyFormat(Math.round(r.closingBalance), currency, true)}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div className="animate-fade-in">
      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        <InputWithSlider
          label="Initial Corpus Amount"
          value={initialCorpus}
          onChange={setInitialCorpus}
          min={MIN_SWP_CORPUS}
          max={MAX_CORPUS}
          step={STEP_LARGE}
          currency={currency}
        />

        <InputWithSlider
          label="Total Withdrawal Period (Years)"
          value={years}
          onChange={setYears}
          min={MIN_YEARS}
          max={MAX_YEARS}
        />

        <InputWithSlider
          label="Monthly Withdrawal Amount"
          value={monthlyWithdrawal}
          onChange={setMonthlyWithdrawal}
          min={MIN_WITHDRAWAL}
          max={MAX_EXPENSE}
          step={STEP_SIP}
          currency={currency}
          allowManualInput={true}
        />

        <InputWithSlider
          label="Expected Annual Return (%)"
          value={annualRate}
          onChange={setAnnualRate}
          min={MIN_RATE}
          max={MAX_RATE}
          step={0.1}
          isDecimal={true}
          symbol="%"
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {/* Card 1: Initial Withdrawal / Annualized Rate */}
        <div className="bg-white border-l-4 border-violet-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly Withdrawal</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">{moneyFormat(Math.round(monthlyWithdrawal), currency)}</div>
          <p className="text-xs text-gray-500 mt-2">{annualizedWithdrawalRate.toFixed(2)}% of initial corpus annually</p>
        </div>

        {/* Card 2: Final Remaining Corpus */}
        <div
          className={`border-l-4 rounded-xl p-6 shadow-sm ${depletionYear > 0 ? "bg-rose-50 border-rose-500" : "bg-emerald-50 border-emerald-500"
            }`}
        >
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Final Corpus</div>
          <div
            className={`text-2xl font-extrabold ${depletionYear > 0 ? "text-rose-600" : "text-emerald-700"} mt-2`}
          >
            {moneyFormat(Math.round(finalCorpus), currency)}
          </div>
          <p className={`text-xs font-medium mt-2 ${depletionYear > 0 ? "text-rose-700" : "text-gray-500"}`}>
            {depletionYearMsg}
          </p>
        </div>

        {/* Card 3: Total Withdrawn */}
        <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Withdrawn</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">{moneyFormat(Math.round(totalWithdrawn), currency)}</div>
          <p className="text-xs text-gray-500 mt-2">Interest Earned: {moneyFormat(Math.round(totalInterest), currency)}</p>
        </div>
      </div>

      <div className="mt-12">
        {/* CHART SECTION */}
        <div className="mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Balance Depletion Projection</h3>
          <FinancialLineChart
            data={{
              labels: yearlyRows.map(r => `Year ${r.year}`),
              datasets: [
                {
                  label: 'Remaining Balance',
                  data: yearlyRows.map(r => r.closingBalance),
                  borderColor: '#8B5CF6', // Violet-500
                  backgroundColor: 'rgba(139, 92, 246, 0.1)', // Violet-500 with opacity
                  fill: true,
                  tension: 0.4
                }
              ]
            }}
            currency={currency}
            height={350}
          />
        </div>

        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setViewFrequency('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewFrequency === 'yearly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setViewFrequency('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewFrequency === 'monthly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <AmortizationTableWrapper
          title={`SWP Schedule (${viewFrequency === 'yearly' ? 'Yearly' : 'Monthly'})`}
          renderTableContent={renderSWPTableContent}
          onExport={handleExport}
          rowCount={(viewFrequency === 'monthly' ? monthlyRows : yearlyRows).length}
        />
      </div>

      {/* EXPLANATORY DETAILS */}
      <div className="mt-12">
        {calculatorDetails.swp.render()}
      </div>

    </div>
  );
}

