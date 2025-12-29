// src/components/calculators/PureSIP.js
import React, { useMemo } from "react";

// --- IMPORTS ---
import { FinancialCompoundingBarChart } from "../common/FinancialCharts";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";
import LimitedPayTip from "../common/LimitedPayTip";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import UnifiedSummary from "../common/UnifiedSummary";
import CalculatorLayout from "../common/CalculatorLayout";

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import { computeYearlySchedule, calculateRealValue } from "../../utils/finance";
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
  const {
    monthlySIP, setMonthlySIP,
    annualRate, setAnnualRate,
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
          <LimitedPayTip show={isLimitedPay} />
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
            <div className="flex items-center w-full md:w-auto">
              <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
              <div className="w-48">
                <MonthYearPicker
                  value={startDate}
                  onChange={setStartDate}
                />
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