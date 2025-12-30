import React, { useMemo } from "react";
import { downloadPDF } from "../../utils/export";

// --- IMPORTS ---
import { FinancialCompoundingBarChart } from "../common/FinancialCharts";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import UnifiedSummary from "../common/UnifiedSummary";

import CalculatorLayout from "../common/CalculatorLayout"; // <--- NEW LAYOUT

import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
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
    startDate, setStartDate,
  } = useCalculatorState({
    lumpSum: DEFAULT_LUMP_SUM,
    annualRate: DEFAULT_RATE,
    years: DEFAULT_TENURE_YEARS,
    inflationRate: DEFAULT_INFLATION,
  });


  // Yearly & Monthly Breakdown Calculation
  const result = useMemo(() => {
    return computeYearlySchedule({
      monthlySIP: 0,
      lumpSum: Number(lumpSum),
      annualRate: Number(annualRate),
      totalYears: Number(years),
      calculationMode: 'duration',
      startDate
    });
  }, [lumpSum, annualRate, years, startDate]);

  const { rows: yearlyRows = [], monthlyRows = [] } = result || {};

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
        <UnifiedSummary
          invested={investedTotal}
          gain={gain}
          total={totalFuture}
          currency={currency}
          years={years}
          tax={isTaxApplied ? {
            applied: true,
            postTaxValue: postTaxFuture,
            postTaxGain: postTaxGain,
            taxDeducted: taxDeductedAmount
          } : null}
          inflation={isInflationAdjusted ? {
            applied: true,
            realValue: realValue,
            inflationRate: inflationRate
          } : null}
        />
      }
      charts={<FinancialCompoundingBarChart data={yearlyRows} currency={currency} />}
      table={
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => {
                  const data = yearlyRows.map(r => [
                    `Year ${r.year}`,
                    Math.round(r.totalInvested),
                    Math.round(r.interestEarned),
                    Math.round(r.balance)
                  ]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'lumpsum_schedule.pdf');
                }}
                className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Export PDF
              </button>
              <div className="flex items-center">
                <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                <div className="w-48">
                  <MonthYearPicker
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>
              </div>
            </div>
          </div>
          <CollapsibleInvestmentTable
            yearlyData={yearlyRows}
            monthlyData={monthlyRows}
            currency={currency}
          />
        </div>
      }
    />
  );
}
