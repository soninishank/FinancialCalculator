// src/components/calculators/LoanEMI.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import CollapsibleAmortizationTable from "../common/CollapsibleAmortizationTable";
import { FinancialCompoundingBarChart, FinancialLoanPieChart } from "../common/FinancialCharts";
import MonthYearPicker from "../common/MonthYearPicker";
import { moneyFormat } from "../../utils/formatting";
import { calculatorDetails } from "../../data/calculatorDetails";
import { calculateEMI, calculateLoanAmountFromEMI, computeLoanAmortization, calculateLoanTenure, calculateLoanInterestRate } from "../../utils/finance";
import { downloadPDF } from "../../utils/export";

import { Coins, Wallet, CalendarDays, Percent, Info } from "lucide-react";
import {
  DEFAULT_LOAN_PRINCIPAL,
  DEFAULT_LOAN_RATE,
  DEFAULT_LOAN_TENURE,
  MIN_RATE,
  MAX_LOAN,
  MAX_RATE,
  MAX_YEARS,
  MIN_LOAN,
  STEP_LARGE,
  MAX_PROCESSING_FEE_PERCENT,
  STEP_PROCESSING_FEE_PERCENT,
  MAX_FEE_AMOUNT
} from "../../utils/constants";
import { calculateAPR } from "../../utils/finance"; // Import APR helper

export default function LoanEMI({ currency, setCurrency, defaults }) {
  // Inputs: Use Default Constants or Props
  const [principal, setPrincipal] = useState(defaults?.principal || DEFAULT_LOAN_PRINCIPAL);
  const [annualRate, setAnnualRate] = useState(defaults?.rate || DEFAULT_LOAN_RATE);
  const [years, setYears] = useState(defaults?.tenure || DEFAULT_LOAN_TENURE);
  // viewFrequency state removed as CollapsibleTable handles both views

  const [processingFeePercent, setProcessingFeePercent] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7)); // Default "YYYY-MM"

  // New State for Reverse Calculation
  const [calculationMode, setCalculationMode] = useState('EMI'); // 'EMI' | 'LOAN'
  const [targetEMI, setTargetEMI] = useState(30000);
  const [emiScheme, setEmiScheme] = useState('arrears'); // 'arrears' | 'advance'

  // Fee Mode
  const [feeMode, setFeeMode] = useState('percent'); // 'percent' | 'flat'
  const [processingFeeFlat, setProcessingFeeFlat] = useState(10000); // Default flat fee

  // Tenure Calculation Mode
  const [tenureMode, setTenureMode] = useState('Years'); // 'Years' | 'Months'

  const handleTenureModeChange = (mode) => {
    if (mode === tenureMode) return;
    setTenureMode(mode);
    // Convert value
    if (mode === 'Months') {
      setYears((prev) => Math.round(prev * 12));
    } else {
      setYears((prev) => Number((prev / 12).toFixed(1))); // Keep 1 decimal for years if converting back
    }
  };

  const R_m = annualRate / 12 / 100;
  const N = years * 12;

  // 1. Determine Effective Values based on Mode
  // 1. Determine Effective Values based on Mode
  let effectivePrincipal = principal;
  let effectiveEMI = targetEMI;
  let effectiveRate = annualRate;
  let effectiveYears = tenureMode === 'Months' ? years / 12 : years;

  // Default assignments for display coherence
  if (calculationMode === 'EMI') {
    effectiveEMI = calculateEMI(principal, R_m, N);
    // Adjustment for Advance EMI: EMI_adv = EMI_arr / (1+r)
    if (emiScheme === 'advance' && R_m > 0) {
      effectiveEMI /= (1 + R_m);
    }
  } else if (calculationMode === 'LOAN') {
    // Reverse Calc for Loan: P = EMI * ((1+r)^n - 1) / (r(1+r)^n)
    // If Advance: P_adv = P_arr * (1+r) OR effectively EMI counts as more?
    // Actually, Loan Amount from Allowable EMI changes. 
    effectivePrincipal = Math.round(calculateLoanAmountFromEMI(targetEMI, R_m, N));
    if (emiScheme === 'advance' && R_m > 0) {
      // With same EMI, you get MORE loan because you pay first installment immediately reducing principal?
      // No, simpler logic: Loan Amount = EMI * (Factor). Factor_adv = Factor_arr * (1+r)
      effectivePrincipal *= (1 + R_m);
    }
  } else if (calculationMode === 'TENURE') {
    effectiveYears = calculateLoanTenure(principal, targetEMI, annualRate);
    if (effectiveYears === Infinity) effectiveYears = 0; // Handle error case gracefully in UI
    effectiveEMI = targetEMI;
  } else if (calculationMode === 'RATE') {
    effectiveRate = calculateLoanInterestRate(principal, targetEMI, years);
    effectiveEMI = targetEMI;
  }

  // Derived for chart/table consistency
  const finalAmortizationRate = calculationMode === 'RATE' ? effectiveRate : annualRate;
  const finalAmortizationYears = calculationMode === 'TENURE' ? effectiveYears : years;
  const finalAmortizationPrincipal = calculationMode === 'LOAN' ? effectivePrincipal : principal;
  const finalAmortizationEMI = calculationMode === 'EMI' ? effectiveEMI : targetEMI;

  const processingFeeAmount = feeMode === 'percent'
    ? finalAmortizationPrincipal * (processingFeePercent / 100)
    : processingFeeFlat;

  // 2. Compute Amortization Schedule (Always use effective values)
  const { rows: yearlyRows, monthlyRows, finalTotalInterest, finalTotalPaid } = useMemo(
    () => {
      // Safety check for valid inputs before computing
      if (!finalAmortizationPrincipal || !finalAmortizationRate || !finalAmortizationYears) {
        return { rows: [], monthlyRows: [], finalTotalInterest: 0, finalTotalPaid: 0 };
      }
      return computeLoanAmortization({
        principal: finalAmortizationPrincipal,
        annualRate: finalAmortizationRate,
        years: finalAmortizationYears,
        emi: finalAmortizationEMI,
        startDate
      });
    },
    [finalAmortizationPrincipal, finalAmortizationRate, finalAmortizationYears, finalAmortizationEMI, startDate]
  );

  // Check for calculation error (e.g. Negative Amortization)
  // Relaxed check: Only error if Interest exceeds EMI by a meaningful margin (e.g. 5) to allow for "Rate" mode precision
  const interestPerMonth = finalAmortizationPrincipal * (finalAmortizationRate / 1200);
  const isCalculationValid = !yearlyRows.error && (interestPerMonth < finalAmortizationEMI + 1);

  // --- PDF EXPORT HANDLER ---
  const handleExport = () => {
    // Default to monthly export for detailed view in PDF
    const isMonthly = true;
    const dataToExport = isMonthly ? monthlyRows : yearlyRows;
    const filename = isMonthly ? "loan_amortization_monthly.pdf" : "loan_amortization_yearly.pdf";
    const periodLabel = isMonthly ? "Month" : "Year";

    const headers = [periodLabel, "Opening Balance", "Interest Paid", "Principal Paid", "Closing Balance"];

    const data = dataToExport.map((r) => [
      isMonthly ? `Month ${r.month} (Yr ${r.year})` : `Year ${r.year}`,
      Math.round(r.openingBalance),
      Math.round(r.interestPaid),
      Math.round(r.principalPaid),
      Math.round(r.closingBalance),
    ]);
    downloadPDF(data, headers, filename);
  };

  // renderAmortizationTableContent removed as we use CollapsibleAmortizationTable

  return (
    <div className="animate-fade-in">

      {/* INPUTS SECTION */}

      {/* MODE TOGGLE */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-2 rounded-2xl inline-flex flex-wrap justify-center gap-4 shadow-sm border border-gray-100">
          {[
            { id: 'EMI', label: 'EMI Calculator', icon: Coins, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'LOAN', label: 'Loan Amount', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'TENURE', label: 'Loan Tenure', icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'RATE', label: 'Interest Rate', icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50' }
          ].map(mode => {
            const Icon = mode.icon;
            const isActive = calculationMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setCalculationMode(mode.id)}
                className={`flex flex-col items-center justify-center w-32 h-24 rounded-xl transition-all duration-200 border-2 ${isActive
                  ? `bg-gray-50 border-${mode.color.split('-')[1]}-500 shadow-md transform scale-105`
                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
              >
                <div className={`p-2 rounded-full mb-2 ${isActive ? mode.bg : 'bg-gray-100'} ${isActive ? mode.color : 'text-gray-500'}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold text-center ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-8">
        {/* Principal Input - Show unless calculating Loan Amount */}
        {calculationMode !== 'LOAN' && (
          <InputWithSlider
            label="Loan Principal Amount"
            value={principal}
            onChange={setPrincipal}
            min={MIN_LOAN} max={MAX_LOAN} step={STEP_LARGE}
            currency={currency}
            isDecimal={true}
          />
        )}

        {/* EMI Input - Show unless calculating EMI */}
        {calculationMode !== 'EMI' && (
          <InputWithSlider
            label="Desired Monthly EMI"
            value={targetEMI}
            onChange={setTargetEMI}
            min={1000} max={DEFAULT_LOAN_PRINCIPAL} step={500}
            currency={currency}
            isDecimal={true}
          />
        )}

        {/* Tenure Input - Show unless calculating Tenure */}
        {calculationMode !== 'TENURE' && (
          <InputWithSlider
            label={`Loan Tenure (${tenureMode})`}
            value={years}
            onChange={setYears}
            min={tenureMode === 'Months' ? 1 : 0.5}
            max={tenureMode === 'Months' ? MAX_YEARS * 12 : MAX_YEARS}
            step={tenureMode === 'Months' ? 1 : 0.5}
            isDecimal={tenureMode === 'Years'} // Allow 1.5 years
            rightElement={
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['Years', 'Months'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleTenureModeChange(mode)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureMode === mode
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            }
          />
        )}

        {/* Rate Input - Show unless calculating Rate */}
        {calculationMode !== 'RATE' && (
          <div className="">
            <InputWithSlider
              label="Annual Interest Rate (%)"
              value={annualRate}
              onChange={setAnnualRate}
              min={MIN_RATE} max={MAX_RATE} symbol="%"
            />
          </div>
        )}

        {/* Processing Fee Input with Toggle */}
        <div className="">
          {feeMode === 'percent' ? (
            <>
              <InputWithSlider
                label="Fees & Charges"
                value={processingFeePercent}
                onChange={setProcessingFeePercent}
                min={0} max={MAX_PROCESSING_FEE_PERCENT} step={STEP_PROCESSING_FEE_PERCENT} symbol="%"
                rightElement={
                  <div className="flex bg-gray-100 p-0.5 rounded-lg h-7 self-center">
                    <button onClick={() => setFeeMode('percent')} className="px-3 text-xs font-bold rounded-md bg-white shadow-sm text-teal-700 transition-all">%</button>
                    <button onClick={() => setFeeMode('flat')} className="px-3 text-xs font-medium rounded-md text-gray-400 hover:text-gray-600 transition-all">₹</button>
                  </div>
                }
              />
              <p className="text-xs text-right text-gray-500 mt-1">
                Amount: <span className="font-semibold text-gray-700">{moneyFormat(processingFeeAmount, currency)}</span>
              </p>
            </>
          ) : (
            <InputWithSlider
              label="Fees & Charges"
              value={processingFeeFlat}
              onChange={setProcessingFeeFlat}
              min={0} max={MAX_FEE_AMOUNT} step={1000}
              currency={currency}
              rightElement={
                <div className="flex bg-gray-100 p-0.5 rounded-lg h-7 self-center">
                  <button onClick={() => setFeeMode('percent')} className="px-3 text-xs font-medium rounded-md text-gray-400 hover:text-gray-600 transition-all">%</button>
                  <button onClick={() => setFeeMode('flat')} className="px-3 text-xs font-bold rounded-md bg-white shadow-sm text-teal-700 transition-all">₹</button>
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* EMI SCHEME TOGGLE */}
      <div className="flex justify-center mt-6 mb-10">
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-gray-700 text-sm font-bold tracking-tight">EMI Scheme</span>
            <div className="group relative flex items-center">
              <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />

              {/* Premium Dark Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-200 block mb-0.5">Arrears (Standard):</span>
                    <span className="text-slate-400 leading-relaxed">Pay 1st EMI after 1 month. Better for cash flow.</span>
                  </div>
                  <div className="border-t border-slate-700 pt-1.5">
                    <span className="font-bold text-slate-200 block mb-0.5">Advance:</span>
                    <span className="text-slate-400 leading-relaxed">Pay 1st EMI immediately. <span className="text-emerald-400 font-semibold">Saves Interest Cost.</span></span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>

          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            {['advance', 'arrears'].map((scheme) => (
              <button
                key={scheme}
                onClick={() => setEmiScheme(scheme)}
                className={`
                        px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2
                        ${emiScheme === scheme
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }
                    `}
              >
                {emiScheme === scheme && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {scheme === 'advance' ? 'EMI in Advance' : 'EMI in Arrears'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NEW SUMMARY SECTION & PIE CHART */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-gray-100">

          {/* LEFT: METRICS (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
            {/* 1. Interest Rate */}
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-1">Loan Interest Rate</p>
              <p className="text-3xl font-extrabold text-gray-800">
                {calculationMode === 'RATE' ? Number(finalAmortizationRate).toFixed(2) : Number(annualRate).toFixed(2)} %
              </p>
            </div>

            {/* 2. APR (New) */}
            <div className="p-6 text-center bg-indigo-50/30">
              <div className="flex justify-center items-center gap-1.5 mb-1 group relative">
                <p className="text-sm font-semibold text-indigo-900 border-b border-dashed border-indigo-300 cursor-help">Loan APR</p>
                <Info className="w-3.5 h-3.5 text-indigo-400" />

                {/* APR Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 text-left">
                  <p className="mb-2"><strong className="text-indigo-200">Annual Percentage Rate (APR)</strong> is the real cost of your loan.</p>
                  <p>It includes the Interest Rate <strong>PLUS</strong> Processing Fees & other charges.</p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-indigo-600">
                {calculateAPR(finalAmortizationPrincipal, finalAmortizationEMI, finalAmortizationYears, processingFeeAmount).toFixed(2)} %
              </p>
            </div>

            {/* 3. Total Interest */}
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Interest Payable</p>
              <p className="text-2xl font-bold text-gray-800 tracking-tight">
                {moneyFormat(Math.round(finalTotalInterest), currency)}
              </p>
            </div>

            {/* 4. Total Payment */}
            <div className="p-6 text-center bg-emerald-50/30">
              <p className="text-sm font-semibold text-emerald-900 mb-1">Total Payment</p>
              <p className="text-xs text-emerald-600 mb-2 font-medium opacity-80">(Principal + Interest + Fees)</p>
              <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                {moneyFormat(Math.round(finalTotalPaid + processingFeeAmount), currency)}
              </p>
            </div>
          </div>

          {/* RIGHT: PIE CHART (3/5 width) */}
          <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center bg-gray-50/30">
            <h4 className="text-sm font-bold text-gray-700 mb-4 self-start">Break-up of Total Payment</h4>
            <div className="w-full h-80">
              <FinancialLoanPieChart
                principal={finalAmortizationPrincipal}
                totalInterest={finalTotalInterest}
                fees={processingFeeAmount}
                currency={currency}
                years={finalAmortizationYears}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ERROR / WARNING MESSAGE IF EMI TOO LOW */}
      {/* Use same relaxed check as above for consistency */}
      {finalAmortizationPrincipal * (finalAmortizationRate / 1200) >= finalAmortizationEMI + 1 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-8 rounded-r-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-bold">Loan will never be paid off!</span>
                <br />
                Your Monthly EMI ({moneyFormat(finalAmortizationEMI, currency)}) is lower than the monthly interest ({moneyFormat(finalAmortizationPrincipal * (finalAmortizationRate / 1200), currency)}).
                Please increase EMI or reduce the Loan Amount.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS SECTION - Hide if invalid */}
      {finalAmortizationPrincipal * (finalAmortizationRate / 1200) < finalAmortizationEMI + 1 && (
        <div className="flex flex-col gap-12 mt-12">
          {/* PIE CHART - Moved to Summary Section */}

          {/* BAR CHART - Full Width */}
          <div className="w-full">
            <FinancialCompoundingBarChart
              data={yearlyRows}
              currency={currency}
              type="loan"
            />
          </div>
        </div>
      )}

      {/* AMORTIZATION TABLE (Using the Wrapper) - Only show if valid */}
      {isCalculationValid && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Amortization Schedule</h3>
              <div className="flex items-center mt-2 w-full sm:w-auto">
                <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                <div className="w-48">
                  <MonthYearPicker
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors self-start lg:self-center"
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
      )}

      {/* EXPLANATORY DETAILS */}
      <div className="mt-12">
        {calculatorDetails.loanEmi.render()}
      </div>

    </div>
  );
}