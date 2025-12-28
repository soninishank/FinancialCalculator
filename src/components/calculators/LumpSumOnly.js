import React, { useMemo } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from "../common/FinancialCharts";
import ResultsTable from "../common/ResultsTable";

import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";

import CalculatorLayout from "./CalculatorLayout"; // <--- NEW LAYOUT

import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
import { downloadPDF } from "../../utils/export";
import { computeYearlySchedule, calculateRealValue } from "../../utils/finance"; // <--- SHARED LOGIC
import { calculateLTCG } from "../../utils/tax";
import {
  DEFAULT_LUMP_SUM,
  DEFAULT_TENURE_YEARS,
  DEFAULT_RATE,
  MIN_AMOUNT,
  MIN_YEARS,
  MIN_RATE,
  MAX_AMOUNT,
  MAX_YEARS,
  MAX_RATE,
  STEP_AMOUNT,
  DEFAULT_INFLATION
} from "../../utils/constants";

export default function LumpSumOnly({ currency, setCurrency }) {
  // --- STATE ---
  const {
    lumpSum, setLumpSum,
    annualRate, setAnnualRate,
    years, setYears,
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
  } = useCalculatorState({
    lumpSum: DEFAULT_LUMP_SUM,
    annualRate: DEFAULT_RATE,
    years: DEFAULT_TENURE_YEARS,
    inflationRate: DEFAULT_INFLATION,
  });

  // --- CALCULATIONS ---
  const yearlyRows = useMemo(
    () => computeYearlySchedule({
      monthlySIP: 0,
      lumpSum: Number(lumpSum),
      annualRate: Number(annualRate),
      totalYears: Number(years)
    }),
    [lumpSum, annualRate, years]
  );

  const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested; // Should constitute only lump sum
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
    return calculateRealValue(totalFuture, inflationRate, years);
  }, [totalFuture, inflationRate, years]);


  function handleExport() {
    const header = ["Year", "Total Invested", "Lump Sum", "Growth", "Overall Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.lumpSum), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadPDF(rows, header, "lump_sum_report.pdf");
  }

  // --- UI PARTS ---
  const inputsSection = (
    <>
      <InputWithSlider
        label="Initial Lump Sum"
        value={lumpSum}
        onChange={setLumpSum}
        min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT} // Use MAX_AMOUNT
        currency={currency}
      />

      <InputWithSlider
        label="Total Investment Tenure (Years)"
        value={years}
        onChange={setYears}
        min={MIN_YEARS} max={MAX_YEARS}
      />

      <div className="md:col-span-2">
        <InputWithSlider
          label="Expected Annual Return (%)"
          value={annualRate}
          onChange={setAnnualRate}
          min={MIN_RATE} max={MAX_RATE} step={0.1}
          symbol="%"
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
          years={years}
        />
      }
      table={
        <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
      }
    />
  );
}
