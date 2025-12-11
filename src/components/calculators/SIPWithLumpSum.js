
import React, { useMemo } from "react";

import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";
import TaxToggle from "../common/TaxToggle";

import CalculatorLayout from "./CalculatorLayout"; // <--- NEW LAYOUT

import { calculateLTCG } from "../../utils/tax";
import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState"; // <--- NEW HOOK
import { computeYearlySchedule, calculateRealValue } from "../../utils/finance"; // <--- SHARED LOGIC
import { downloadCSV } from "../../utils/export";
import {
  DEFAULT_MONTHLY_SIP,
  DEFAULT_LUMP_SUM,
  MIN_RATE,
  DEFAULT_RATE,
  DEFAULT_TENURE_YEARS,
  MIN_YEARS,
  MIN_SIP,
  MIN_AMOUNT,
  MAX_AMOUNT,
  MAX_SIP,
  MAX_YEARS,
  MAX_RATE,
} from "../../utils/constants";

export default function SIPWithLumpSum({ currency, setCurrency }) {
  // --- LOCAL STATE ---
  const {
    monthlySIP, setMonthlySIP,
    lumpSum, setLumpSum,
    annualRate, setAnnualRate,
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
  } = useCalculatorState({
    monthlySIP: DEFAULT_MONTHLY_SIP,
    lumpSum: DEFAULT_LUMP_SUM,
    annualRate: DEFAULT_RATE,
  });

  // --- HOOK STATE (Tenure Inputs) ---
  const {
    totalYears,
    sipYears,
    setSipYears,
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle,
  } = useLimitedPay(DEFAULT_TENURE_YEARS);

  // --- CALCULATIONS ---
  const yearlyRows = useMemo(
    () =>
      computeYearlySchedule({
        monthlySIP: Number(monthlySIP),
        lumpSum: Number(lumpSum),
        annualRate: Number(annualRate),
        totalYears: Number(totalYears),
        sipYears: Number(sipYears),
      }),
    [monthlySIP, lumpSum, annualRate, totalYears, sipYears]
  );

  const lastRow =
    yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested;
  const totalFuture = lastRow.overallValue;
  const gain = totalFuture - investedTotal;

  const result = calculateLTCG(gain, investedTotal, isTaxApplied, {
    taxRate: Number(ltcgRate), // allow utils to normalize (percent or decimal)
    currency,
    exemptionApplied: Boolean(isExemptionApplied),
    exemptionLimit: Number(exemptionLimit) || 0,
  });

  // derive named outputs for clarity
  const taxAmount = result?.taxAmount ?? 0;
  const netGain = result?.netGain ?? (gain - (result?.taxAmount ?? 0));
  const netFutureValue = result?.netFutureValue ?? (totalFuture - (result?.taxAmount ?? 0));

  // these are the values we will pass to SummaryCards when tax is applied
  const postTaxFuture = netFutureValue;
  const postTaxGain = netGain;
  const taxDeductedAmount = taxAmount;

  // --- INFLATION CALCULATION ---
  const realValue = useMemo(() => {
    return calculateRealValue(totalFuture, inflationRate, totalYears);
  }, [totalFuture, inflationRate, totalYears]);


  const handleExport = () => {
    const headers = [
      "Year",
      "Total Invested",
      "SIP Invested",
      "Lump Sum",
      "Growth",
      "Overall Value",
    ];
    const data = yearlyRows.map((r) => [
      `Year ${r.year} `,
      Math.round(r.totalInvested),
      Math.round(r.sipInvested),
      Math.round(r.lumpSum),
      Math.round(r.growth),
      Math.round(r.overallValue),
    ]);
    downloadCSV(data, headers, "sip_lumpsum_table.csv");
  };

  // --- UI PARTS ---
  const inputsSection = (
    <>
      {/* Left column */}
      <InputWithSlider
        label="Monthly SIP Amount"
        value={monthlySIP}
        onChange={setMonthlySIP}
        min={MIN_SIP}
        max={MAX_SIP}
        step={500}
        currency={currency}
      />

      {/* Right column */}
      <div className="md:col-span-1">
        <InputWithSlider
          label="Expected Annual Return (%)"
          value={annualRate}
          onChange={setAnnualRate}
          min={MIN_RATE}
          max={MAX_RATE}
          step={0.1}
          symbol="%"
          isDecimal={true}
        />

        {/* --- Apply LTCG AFTER Expected Annual Return (%) --- */}
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
                <input type="checkbox" name="toggle" id="inflation-toggle-sip-lump"
                  checked={isInflationAdjusted}
                  onChange={() => setIsInflationAdjusted(!isInflationAdjusted)}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-sky-500 transition-all duration-300"
                  style={{ right: isInflationAdjusted ? "0" : "auto", left: isInflationAdjusted ? "auto" : "0" }}
                />
                <label htmlFor="inflation-toggle-sip-lump" className={`toggle - label block overflow - hidden h - 5 rounded - full cursor - pointer ${isInflationAdjusted ? "bg-sky-500" : "bg-gray-300"} `}></label>
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

      <InputWithSlider
        label="Initial Lump Sum"
        value={lumpSum}
        onChange={setLumpSum}
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        step={1000}
        currency={currency}
      />

      {/* Investment Tenure + Limited Pay */}
      <div>
        <InputWithSlider
          label="Total Investment Tenure (Years)"
          value={totalYears}
          onChange={handleTotalYearsChange}
          min={MIN_YEARS}
          max={MAX_YEARS}
          step={0.1}
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
            <label
              htmlFor="limitedPay"
              className="font-medium text-gray-700 cursor-pointer"
            >
              Stop SIP early? (Limited Pay)
            </label>
            <p className="text-gray-500 text-xs mt-1">
              Enable this if you want to stop monthly contributions after a
              few years but let the money grow.
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
              step={0.1}
              isDecimal={true}
            />
          </div>
        )}
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
          // pass tax object only when tax is applied
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
        <ResultsTable
          data={yearlyRows}
          currency={currency}
          onExport={handleExport}
        />
      }
    />
  );
}
