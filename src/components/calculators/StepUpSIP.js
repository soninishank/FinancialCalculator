import React, { useMemo } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";
import TaxToggle from "../common/TaxToggle";

import CalculatorLayout from "./CalculatorLayout"; // <--- NEW LAYOUT

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
import { downloadCSV } from "../../utils/export";
import { calculateLTCG } from "../../utils/tax";
import { computeStepUpSchedule, calculateRealValue } from "../../utils/finance"; // <--- SHARED LOGIC

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
    initialSIP: 5000,
    stepUpPercent: 10,
    annualRate: 12,
    isInflationAdjusted: false,
    inflationRate: 6,
  });

  // --- USE LIMITED PAY HOOK ---
  const {
    totalYears,
    sipYears,
    setSipYears,
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle
  } = useLimitedPay(10);

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
    downloadCSV(rows, header, "stepup_sip_table.csv");
  }

  // --- UI PARTS ---
  const inputsSection = (
    <>
      {/* Initial SIP */}
      <InputWithSlider
        label="Initial Monthly SIP"
        value={initialSIP}
        onChange={setInitialSIP}
        min={500} max={500000} step={500}
        currency={currency}
      />

      {/* Step Up % */}
      <InputWithSlider
        label="Annual Step-up (%)"
        value={stepUpPercent}
        onChange={setStepUpPercent}
        min={0} max={50} symbol="%" isDecimal={true}
      />

      {/* Investment Tenure (With Advanced Toggle) */}
      <div>
        <InputWithSlider
          label="Total Investment Tenure (Years)"
          value={totalYears}
          onChange={handleTotalYearsChange}
          min={1} max={40} step={0.1}
          isDecimal={true}
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
              max={totalYears} step={0.1}
              isDecimal={true}
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
          min={1} max={30} symbol="%"
          isDecimal={true}
        />

        <div className="mt-6 flex flex-col md:flex-row gap-6">
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
          <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Adjust for Inflation</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="inflation-toggle-step"
                  checked={isInflationAdjusted}
                  onChange={() => setIsInflationAdjusted(!isInflationAdjusted)}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-sky-500 transition-all duration-300"
                  style={{ right: isInflationAdjusted ? "0" : "auto", left: isInflationAdjusted ? "auto" : "0" }}
                />
                <label htmlFor="inflation-toggle-step" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isInflationAdjusted ? "bg-sky-500" : "bg-gray-300"}`}></label>
              </div>
            </div>

            {isInflationAdjusted && (
              <div className="mt-3 animate-fade-in">
                <InputWithSlider
                  label="Inflation Rate (%)"
                  value={inflationRate}
                  onChange={setInflationRate}
                  min={0} max={15} step={0.1} symbol="%"
                  isDecimal={true}
                />
              </div>
            )}
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
      charts={<CompoundingBarChart data={yearlyRows} currency={currency} />}
      pieChart={
        <InvestmentPieChart
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