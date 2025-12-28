import React, { useMemo } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import ResultsTable from "../common/ResultsTable";
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from "../common/FinancialCharts";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";

import CalculatorLayout from "./CalculatorLayout"; // <--- NEW LAYOUT

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
import { downloadPDF } from "../../utils/export";
import { calculateLTCG } from "../../utils/tax";
import { computeStepUpSchedule, calculateRealValue } from "../../utils/finance"; // <--- SHARED LOGIC
import {
  DEFAULT_MONTHLY_SIP,
  DEFAULT_STEP_UP,
  DEFAULT_RATE,
  DEFAULT_INFLATION,
  DEFAULT_TENURE_YEARS,
  MIN_SIP,
  MAX_SIP,
  MIN_RATE,
  MAX_RATE,
  MIN_YEARS,
  MAX_YEARS,
  MAX_STEP_UP
} from "../../utils/constants";

export default function StepUpSIP({ currency, setCurrency }) {
  // --- STATE ---
  const {
    initialSIP, setInitialSIP,
    stepUpPercent, setStepUpPercent,
    annualRate, setAnnualRate,
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
  } = useCalculatorState({
    initialSIP: DEFAULT_MONTHLY_SIP,
    stepUpPercent: DEFAULT_STEP_UP,
    annualRate: DEFAULT_RATE,
    isInflationAdjusted: false,
    inflationRate: DEFAULT_INFLATION,
  });

  // --- USE LIMITED PAY HOOK ---
  const {
    totalYears,
    sipYears,
    setSipYears,
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle
  } = useLimitedPay(DEFAULT_TENURE_YEARS);

  // --- CALCULATIONS ---
  const yearlyRows = useMemo(
    () =>
      computeStepUpSchedule({
        initialSIP: Number(initialSIP),
        stepUpPercent: Number(stepUpPercent),
        annualRate: Number(annualRate),
        totalYears: Number(totalYears),
        sipYears: Number(sipYears),
      }),
    [initialSIP, stepUpPercent, annualRate, totalYears, sipYears]
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

  // --- INFLATION CALCULATION ---
  const realValue = useMemo(() => {
    return calculateRealValue(totalFuture, inflationRate, totalYears);
  }, [totalFuture, inflationRate, totalYears]);


  function handleExport() {
    const header = ["Year", "Total Invested", "SIP Invested", "Step-up %", "Growth", "Overall Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`,
      Math.round(r.totalInvested),
      Math.round(r.sipInvested),
      `${r.stepUpAppliedPercent}%`,
      Math.round(r.growth),
      Math.round(r.overallValue),
    ]);
    downloadPDF(rows, header, "stepup_sip_report.pdf");
  }

  // --- UI PARTS ---
  const inputsSection = (
    <>
      {/* Initial SIP */}
      <InputWithSlider
        label="Initial Monthly SIP"
        value={initialSIP}
        onChange={setInitialSIP}
        min={MIN_SIP} max={MAX_SIP} step={500}
        currency={currency}
      />

      {/* Step Up % */}
      <InputWithSlider
        label="Annual Step-up (%)"
        value={stepUpPercent}
        onChange={setStepUpPercent}
        min={0} max={MAX_STEP_UP} symbol="%" isDecimal={true}
      />

      {/* Investment Tenure (With Advanced Toggle) */}
      <div>
        <InputWithSlider
          label="Total Investment Tenure (Years)"
          value={totalYears}
          onChange={handleTotalYearsChange}
          min={MIN_YEARS} max={MAX_YEARS}
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
              Enable this if you want to stop contributions after a few years but let the money grow.
            </p>
          </div>
        </div>

        {isLimitedPay && (
          <div className="mt-4 pl-4 border-l-2 border-teal-100 animate-slide-down">
            <InputWithSlider
              label="SIP Contribution Period (Years)"
              value={sipYears}
              onChange={setSipYears}
              min={1}
              max={totalYears}
            />
          </div>
        )}
      </div>

      {/* Rate */}
      <div className="md:col-span-1">
        <InputWithSlider
          label="Expected Annual Return (%)"
          value={annualRate}
          onChange={setAnnualRate}
          min={MIN_RATE} max={MAX_RATE} symbol="%"
          isDecimal={true}
        />
        <RateQualityGuard rate={annualRate} />

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
        <FinancialInvestmentPieChart
          invested={investedTotal}
          gain={gain}
          total={totalFuture}
          currency={currency}
          years={totalYears}
        />
      }
      table={
        <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
      }
    />
  );
}