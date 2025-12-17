// src/components/calculators/PureSIP.js
import React, { useMemo } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from "../common/FinancialCharts";
import ResultsTable from "../common/ResultsTable";

import InputWithSlider from "../common/InputWithSlider";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";

import CalculatorLayout from "./CalculatorLayout"; // <--- NEW LAYOUT

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
import { downloadCSV } from "../../utils/export";
import { computeYearlySchedule, calculateRealValue } from "../../utils/finance"; // <--- SHARED LOGIC
import { calculateLTCG } from "../../utils/tax";
import {
  DEFAULT_MONTHLY_SIP,
  DEFAULT_RATE,
  MIN_SIP,
  MIN_RATE,
  MIN_YEARS,
  MAX_SIP,
  MAX_RATE,
  MAX_YEARS,
  DEFAULT_TENURE_YEARS,
  STEP_SIP,
  DEFAULT_INFLATION
} from "../../utils/constants";

export default function PureSIP({ currency, setCurrency }) {
  // --- STATE ---
  const {
    monthlySIP, setMonthlySIP,
    annualRate, setAnnualRate,
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
  } = useCalculatorState({
    monthlySIP: DEFAULT_MONTHLY_SIP,
    annualRate: DEFAULT_RATE,
    years: DEFAULT_TENURE_YEARS,
    inflationRate: DEFAULT_INFLATION,
  });

  // Use Limited Pay Hook checks tenure
  const {
    totalYears,
    sipYears,
    setSipYears,
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle
  } = useLimitedPay(DEFAULT_TENURE_YEARS);

  // Calculations
  // const n = totalYears * 12; // Unused if we depend solely on computeYearlySchedule
  // const r_m = annualRate / 12 / 100; // Unused if we depend solely on computeYearlySchedule

  // fvSIP replaced by yearlyRows last value for accuracy in Limited Pay scenarios


  // NOTE: If using Limited Pay with 0 investment in later years, basic FV formula needs adjustment OR use the scheduled rows.
  // The original component calculated `fvSIP` with formula but then calculated `gain` via `totalFuture` from `yearlyRows`?
  // Let's check original... 
  // Original: const fvSIP = ... calcSIPFutureValue ...
  // Original: const totalFuture = fvSIP; 
  // WAIT. calcSIPFutureValue assumes annuity due for N months.
  // If `isLimitedPay` is true, simple `calcSIPFutureValue` is WRONG because contributions stop early.
  // The original code calculated `fvSIP` using `calcSIPFutureValue` which implies full tenure SIP.
  // BUT the yearly rows calculation handled logic correctly.
  // Original `computeYearlySchedule` was correct.
  // DOES THE ORIGINAL COMPONENT DISPLAY WRONG TOTAL VALUE for Limited Pay?
  // Ah, the original code: 
  // const totalFuture = fvSIP; 
  // AND `computeYearlySchedule` logic. 

  // Actually, if `isLimitedPay` is on, using `calcSIPFutureValue(monthlySIP, r_m, n)` calculates as if SIP continues for N months.
  // So the displayed total number in the card might be wrong in the original code if `isLimitedPay` is used, unless `calcSIPFutureValue` handles it? No, it takes n.
  // Let's rely on `computerYearlySchedule` last row for the true value, which is safer and supports limited pay naturally.

  // Yearly Breakdown Calculation (Source of Truth)
  const yearlyRows = useMemo(
    () =>
      computeYearlySchedule({
        monthlySIP: Number(monthlySIP),
        annualRate: Number(annualRate),
        totalYears: Number(totalYears),
        sipYears: Number(sipYears)
      }),
    [monthlySIP, annualRate, totalYears, sipYears]
  );

  const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested;
  const totalFuture = lastRow.overallValue;
  const gain = totalFuture - investedTotal;

  // --- TAX CALCULATION ---
  const taxResult = calculateLTCG(gain, investedTotal, isTaxApplied, {
    taxRate: Number(ltcgRate),
    currency,
    exemptionApplied: Boolean(isExemptionApplied),
    exemptionLimit: Number(exemptionLimit) || 0,
  });

  const taxAmount = taxResult?.taxAmount ?? 0;
  const netGain = taxResult?.netGain ?? gain - (taxResult?.taxAmount ?? 0);
  const netFutureValue = taxResult?.netFutureValue ?? totalFuture - (taxResult?.taxAmount ?? 0);

  const postTaxFuture = netFutureValue;
  const postTaxGain = netGain;
  const taxDeductedAmount = taxAmount;

  // --- INFLATION CALCULATION (added) ---
  const realValue = useMemo(() => {
    return calculateRealValue(totalFuture, inflationRate, totalYears);
  }, [totalFuture, inflationRate, totalYears]);


  const handleExport = () => {
    const headers = ["Year", "Total Invested", "Growth", "Total Value"];
    const data = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadCSV(data, headers, "pure_sip_table.csv");
  };

  // --- UI PARTS ---

  const inputsSection = (
    <>
      {/* Monthly SIP */}
      <InputWithSlider
        label="Monthly SIP Amount"
        value={monthlySIP}
        onChange={setMonthlySIP}
        min={MIN_SIP} max={MAX_SIP} step={STEP_SIP}
        currency={currency}
      />

      {/* Investment Tenure (With Advanced Toggle) */}
      <div>
        <InputWithSlider
          label="Total Investment Tenure (Years)"
          value={totalYears}
          onChange={handleTotalYearsChange}
          min={MIN_YEARS} max={MAX_YEARS} step={0.1} isDecimal={true}
        />

        <div className="mt-4 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center h-5">
            <input
              id="limitedPay"
              type="checkbox"
              checked={isLimitedPay}
              onChange={handleLimitedPayToggle}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="limitedPay" className="font-medium text-gray-700 cursor-pointer">
              Stop SIP early? (Limited Pay)
            </label>
            <p className="text-gray-500 text-xs mt-1">
              Stop contributing after a few years but let the money grow.
            </p>
          </div>
        </div>

        {isLimitedPay && (
          <div className="mt-4 pl-4 border-l-2 border-teal-100 animate-slide-down">
            <InputWithSlider
              label="SIP Contribution Period (Years)"
              value={sipYears}
              onChange={setSipYears}
              min={MIN_YEARS}
              max={totalYears}
            />
          </div>
        )}
      </div>

      {/* Return Rate & Tax */}
      <div className="md:col-span-2">
        <InputWithSlider
          label="Expected Annual Return (%)"
          value={annualRate}
          onChange={setAnnualRate}
          min={MIN_RATE} max={MAX_RATE} step={0.1} symbol="%"
          isDecimal={true}
        />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <TaxToggle
              currency={currency}
              isTaxApplied={isTaxApplied}
              setIsTaxApplied={setIsTaxApplied}
              taxRate={ltcgRate}
              onTaxRateChange={setLtcgRate}
              isExemptionApplied={isExemptionApplied}
              setIsExemptionApplied={setIsExemptionApplied}
              exemptionLimit={exemptionLimit}
              onExemptionLimitChange={setExemptionLimit}
            />
          </div>

          {/* INFLATION TOGGLE */}
          <div className="flex-1">
            <InflationToggle
              isAdjusted={isInflationAdjusted}
              setIsAdjusted={setIsInflationAdjusted}
              rate={inflationRate}
              setRate={setInflationRate}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <CalculatorLayout
      inputs={inputsSection}
      summary={
        <SummaryCards
          totalValue={totalFuture}
          invested={investedTotal}
          gain={gain}
          currency={currency}
          {...(isTaxApplied
            ? {
              tax: {
                applied: true,
                postTaxValue: postTaxFuture,
                postTaxGain: postTaxGain,
                taxDeducted: taxDeductedAmount,
              },
            }
            : {})}
          {...(isInflationAdjusted
            ? {
              inflation: {
                applied: true,
                realValue: realValue,
                inflationRate: inflationRate,
              },
            }
            : {})}
        />
      }
      charts={<FinancialCompoundingBarChart data={yearlyRows} currency={currency} />}
      pieChart={
        <FinancialInvestmentPieChart invested={investedTotal} gain={gain} total={totalFuture} currency={currency} years={totalYears} />
      }
      table={
        <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
      }
    />
  );
}