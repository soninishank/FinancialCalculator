// src/components/calculators/PureSIP.js
import React, { useMemo } from "react";
import { downloadCSV, downloadPDF } from "../../../utils/export";

// --- IMPORTS ---
import { FinancialCompoundingBarChart } from "../../common/FinancialCharts";
import ToggleSwitch from "../../common/ToggleSwitch";
import InputWithSlider from "../../common/InputWithSlider";
import RateQualityGuard from "../../common/RateQualityGuard";
import TaxToggle from "../../common/TaxToggle";
import InflationToggle from "../../common/InflationToggle";
import LimitedPayTip from "../../common/LimitedPayTip";
import MonthYearPicker from "../../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../../common/CollapsibleInvestmentTable";
import UnifiedSummary from "../../common/UnifiedSummary";
import CalculatorLayout from "../../common/CalculatorLayout";
import ScenarioComparison from "../../common/ScenarioComparison";
import InvestmentInsights from "../../common/InvestmentInsights";
import InvestmentGoalTracker from "../../common/InvestmentGoalTracker";
import { calculatorDetails } from "../../../data/calculatorDetails";

import { useLimitedPay } from "../../../hooks/useLimitedPay";
import { useCalculatorState } from "../../../hooks/useCalculatorState";
import { computeYearlySchedule, calculateRealValue } from "../../../utils/finance";
import { calculateLTCG } from "../../../utils/tax";
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
} from "../../../utils/constants";

export default function PureSIP({ currency, setCurrency }) {
  const {
    monthlySIP, setMonthlySIP,
    annualRate, setAnnualRate,
    targetAmount, setTargetAmount,
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
    startDate, setStartDate,
  } = useCalculatorState({
    monthlySIP: DEFAULT_MONTHLY_SIP,
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
      monthlySIP: Number(monthlySIP),
      annualRate: Number(annualRate),
      totalYears: Number(totalYears),
      sipYears: isLimitedPay ? Number(sipYears) : Number(totalYears),
      calculationMode: 'duration',
      startDate
    });
  }, [monthlySIP, annualRate, totalYears, sipYears, startDate, isLimitedPay]);

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

  const scenarios = useMemo(() => {
    const currentRate = Number(annualRate) || 0;
    const scenarioRates = [
      { type: "conservative", label: "Conservative", rate: Math.max(0, currentRate - 2) },
      { type: "base", label: "Base Case", rate: currentRate },
      { type: "aggressive", label: "Aggressive", rate: currentRate + 2 },
    ];

    return scenarioRates.map((scenario) => {
      const schedule = computeYearlySchedule({
        monthlySIP: Number(monthlySIP),
        annualRate: scenario.rate,
        totalYears: Number(totalYears),
        sipYears: isLimitedPay ? Number(sipYears) : Number(totalYears),
        calculationMode: "duration",
        startDate,
      });
      const scenarioRows = schedule?.rows || [];
      const finalRow = scenarioRows[scenarioRows.length - 1] || { totalInvested: 0, overallValue: 0 };
      const scenarioTotal = finalRow.overallValue || 0;
      const scenarioInvested = finalRow.totalInvested || 0;

      return {
        ...scenario,
        total: scenarioTotal,
        gain: scenarioTotal - scenarioInvested,
      };
    });
  }, [annualRate, monthlySIP, totalYears, isLimitedPay, sipYears, startDate]);

  const inputsSection = (
    <div className="space-y-6">
      <InputWithSlider
        label="Monthly SIP Amount"
        value={monthlySIP}
        onChange={setMonthlySIP}
        min={MIN_SIP} max={MAX_SIP} step={STEP_SIP}
        currency={currency}
      />
      <InputWithSlider
        label="Total Investment Tenure (Years)"
        value={totalYears}
        onChange={handleTotalYearsChange}
        min={MIN_YEARS} max={MAX_YEARS}
      />
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <ToggleSwitch
              checked={isLimitedPay}
              onChange={handleLimitedPayToggle}
            />
          </div>
          <div className="flex-1 w-full min-w-0">
            <label className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-sm block mb-1 cursor-pointer" onClick={handleLimitedPayToggle}>
              Stop SIP early? (Limited Pay)
            </label>
            <p className="text-gray-500 text-xs mt-1">
              Stop contributing after a few years but let the money grow.
            </p>
            <LimitedPayTip show={isLimitedPay} />
            {isLimitedPay && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 animate-slide-down">
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
        min={MIN_RATE} max={MAX_RATE} step={0.1} symbol="%"
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

      {/* Warning: Inflation exceeds returns */}
      {isInflationAdjusted && Number(inflationRate) >= Number(annualRate) && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Inflation Exceeds Returns</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                Your inflation rate ({inflationRate}%) is equal to or higher than your expected returns ({annualRate}%).
                This means your <strong>real returns will be zero or negative</strong>. Consider investments with higher expected returns to maintain purchasing power.
              </p>
            </div>
          </div>
        </div>
      )}
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
          <ScenarioComparison scenarios={scenarios} currency={currency} />
          <InvestmentInsights
            currency={currency}
            yearlyRows={yearlyRows}
            monthlyRows={monthlyRows}
            invested={investedTotal}
            total={totalFuture}
            postTaxValue={isTaxApplied ? netFutureValue : null}
          />
          <InvestmentGoalTracker
            currency={currency}
            targetAmount={targetAmount}
            setTargetAmount={setTargetAmount}
            finalValue={totalFuture}
            monthlyRows={monthlyRows}
            annualRate={annualRate}
            years={totalYears}
            strategy="sip"
            currentMonthlySIP={monthlySIP}
            sipYears={isLimitedPay ? sipYears : totalYears}
            limitedPay={isLimitedPay}
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Growth Schedule</h3>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => {
                  const data = yearlyRows.map(r => [
                    `Year ${r.year}`,
                    Math.round(r.totalInvested),
                    Math.round(r.growth),
                    Math.round(r.balance ?? r.overallValue)
                  ]);
                  downloadCSV(data, ['Year', 'Invested', 'Interest', 'Balance'], 'sip_schedule.csv');
                }}
                className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  const data = yearlyRows.map(r => [
                    `Year ${r.year}`,
                    Math.round(r.totalInvested),
                    Math.round(r.growth),
                    Math.round(r.balance ?? r.overallValue)
                  ]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'sip_schedule.pdf');
                }}
                className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Export PDF
              </button>
              <div className="flex items-center">
                <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mr-2 whitespace-nowrap">Schedule starts:</label>
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
      details={calculatorDetails['pure-sip'].render()}
    />
  );
}
