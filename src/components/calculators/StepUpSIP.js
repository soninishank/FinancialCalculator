// src/components/calculators/StepUpSIP.js
import React, { useMemo } from "react";
import { downloadPDF } from "../../utils/export";

// --- IMPORTS ---
import { FinancialCompoundingBarChart } from "../common/FinancialCharts";
import ToggleSwitch from "../common/ToggleSwitch";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";
import LimitedPayTip from "../common/LimitedPayTip";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import UnifiedSummary from "../common/UnifiedSummary";
import CalculatorLayout from "../common/CalculatorLayout";
import { calculatorDetails } from "../../data/calculatorDetails";

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import { computeYearlySchedule, calculateRealValue } from "../../utils/finance";
import { calculateLTCG } from "../../utils/tax";
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
    startDate, setStartDate,
  } = useCalculatorState({
    initialSIP: DEFAULT_MONTHLY_SIP,
    stepUpPercent: DEFAULT_STEP_UP,
    annualRate: DEFAULT_RATE,
    years: DEFAULT_TENURE_YEARS,
    inflationRate: DEFAULT_INFLATION,
  });

  const {
    totalYears,
    sipYears,
    setSipYears,
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle
  } = useLimitedPay(DEFAULT_TENURE_YEARS);

  const result = useMemo(() => {
    return computeYearlySchedule({
      monthlySIP: Number(initialSIP),
      stepUpPercent: Number(stepUpPercent),
      annualRate: Number(annualRate),
      totalYears: Number(totalYears),
      sipYears: isLimitedPay ? Number(sipYears) : Number(totalYears),
      calculationMode: 'duration',
      startDate
    });
  }, [initialSIP, stepUpPercent, annualRate, totalYears, sipYears, startDate, isLimitedPay]);

  const { rows: yearlyRows = [], monthlyRows = [] } = result || {};
  const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested;
  const totalFuture = lastRow.overallValue;
  const gain = totalFuture - investedTotal;

  const taxResult = calculateLTCG(gain, investedTotal, isTaxApplied, {
    taxRate: Number(ltcgRate),
    currency,
    exemptionApplied: Boolean(isExemptionApplied),
    exemptionLimit: Number(exemptionLimit) || 0,
  });

  const taxAmount = taxResult?.taxAmount ?? 0;
  const netFutureValue = taxResult?.netFutureValue ?? totalFuture - taxAmount;
  const netGain = taxResult?.netGain ?? gain - taxAmount;

  const realValue = useMemo(() => {
    return calculateRealValue(totalFuture, inflationRate, totalYears);
  }, [totalFuture, inflationRate, totalYears]);

  const inputsSection = (
    <div className="space-y-6">
      <InputWithSlider
        label="Initial Monthly SIP"
        value={initialSIP}
        onChange={setInitialSIP}
        min={MIN_SIP} max={MAX_SIP} step={500}
        currency={currency}
      />
      <InputWithSlider
        label="Annual Step-up (%)"
        value={stepUpPercent}
        onChange={setStepUpPercent}
        min={0} max={MAX_STEP_UP} symbol="%" isDecimal={true}
      />
      <InputWithSlider
        label="Total Investment Tenure (Years)"
        value={totalYears}
        onChange={handleTotalYearsChange}
        min={MIN_YEARS} max={MAX_YEARS}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <ToggleSwitch
              checked={isLimitedPay}
              onChange={handleLimitedPayToggle}
            />
          </div>
          <div className="flex-1 w-full min-w-0">
            <label className="font-black text-slate-900 uppercase tracking-tight text-sm block mb-1 cursor-pointer" onClick={handleLimitedPayToggle}>
              Stop SIP early? (Limited Pay)
            </label>
            <p className="text-gray-500 text-xs mt-1">
              Stop contributing after a few years but let the money grow.
            </p>
            <LimitedPayTip show={isLimitedPay} />
            {isLimitedPay && (
              <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-down">
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
        </div>
      </div>
      <InputWithSlider
        label="Expected Annual Return (%)"
        value={annualRate}
        onChange={setAnnualRate}
        min={MIN_RATE} max={MAX_RATE} symbol="%"
        isDecimal={true}
      />
      <RateQualityGuard rate={annualRate} />
      <div className="mt-6 space-y-6">
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
        <InflationToggle
          isAdjusted={isInflationAdjusted}
          setIsAdjusted={setIsInflationAdjusted}
          rate={inflationRate}
          setRate={setInflationRate}
        />
      </div>
    </div>
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
          years={totalYears}
          tax={isTaxApplied ? {
            applied: true,
            postTaxValue: netFutureValue,
            postTaxGain: netGain,
            taxDeducted: taxAmount
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
                    Math.round(r.maturityValue)
                  ]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'step_up_sip_schedule.pdf');
                }}
                className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Export PDF
              </button>
              <div className="flex items-center">
                <label className="text-sm font-black text-slate-900 uppercase tracking-tight mr-2 whitespace-nowrap">Schedule starts:</label>
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
      details={calculatorDetails['step-up-sip'].render()}
    />
  );
}