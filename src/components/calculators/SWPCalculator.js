// src/components/calculators/SWPCalculator.js
import React, { useMemo } from "react";

// --- IMPORTS ---
import InputWithSlider from "../common/InputWithSlider";
import { FinancialLineChart } from "../common/FinancialCharts";
import { moneyFormat } from "../../utils/formatting";
import { computeSWPPlan } from "../../utils/finance";
import { calculatorDetails } from "../../data/calculatorDetails";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import CalculatorLayout from "../common/CalculatorLayout";
import UnifiedSummary from "../common/UnifiedSummary";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import {
  DEFAULT_RATE,
  MIN_YEARS,
  MAX_YEARS,
  MIN_RATE,
  MAX_RATE,
  MAX_CORPUS,
  STEP_LARGE,
  STEP_SIP,
  MAX_EXPENSE
} from "../../utils/constants";

const DEFAULT_WITHDRAWAL = 5000;
const MIN_WITHDRAWAL = 1000;
const MIN_SWP_CORPUS = 100000;

export default function SWPCalculator({ currency = 'INR' }) {
  const {
    lumpSum: initialCorpus, setLumpSum: setInitialCorpus,
    monthlySIP: monthlyWithdrawal, setMonthlySIP: setMonthlyWithdrawal,
    years, setYears,
    annualRate, setAnnualRate,
    startDate, setStartDate,
  } = useCalculatorState({
    lumpSum: 1000000,
    monthlySIP: DEFAULT_WITHDRAWAL,
    years: 15,
    annualRate: DEFAULT_RATE,
  });

  // --- CALCULATION ---
  const result = useMemo(() => {
    return computeSWPPlan({
      initialCorpus: Number(initialCorpus),
      annualRate: Number(annualRate),
      totalYears: Number(years),
      monthlyWithdrawal: Number(monthlyWithdrawal),
      calculationMode: 'duration',
      startDate
    });
  }, [initialCorpus, annualRate, years, monthlyWithdrawal, startDate]);

  const {
    rows: yearlyRows = [],
    monthlyRows = [],
    finalCorpus = 0,
    totalWithdrawn = 0,
    totalInterest = 0,
    depletionYear = 0,
    depletionMonth = 0
  } = result || {};

  const inputs = (
    <div className="space-y-6">
      <InputWithSlider
        label="Initial Corpus Amount"
        value={initialCorpus}
        onChange={setInitialCorpus}
        min={MIN_SWP_CORPUS}
        max={MAX_CORPUS}
        step={STEP_LARGE}
        currency={currency}
      />
      <InputWithSlider
        label="Total Withdrawal Period (Years)"
        value={years}
        onChange={setYears}
        min={MIN_YEARS} max={MAX_YEARS}
      />
      <InputWithSlider
        label="Monthly Withdrawal Amount"
        value={monthlyWithdrawal}
        onChange={setMonthlyWithdrawal}
        min={MIN_WITHDRAWAL}
        max={MAX_EXPENSE}
        step={STEP_SIP}
        currency={currency}
        allowManualInput={true}
      />
      <InputWithSlider
        label="Expected Annual Return (%)"
        value={annualRate}
        onChange={setAnnualRate}
        min={MIN_RATE}
        max={MAX_RATE}
        step={0.1}
        isDecimal={true}
        symbol="%"
      />
    </div>
  );

  const summary = (
    <UnifiedSummary
      invested={initialCorpus}
      gain={totalInterest}
      total={finalCorpus}
      currency={currency}
      years={years}
      customCards={[
        {
          label: "Total Withdrawn",
          value: moneyFormat(Math.round(totalWithdrawn), currency),
          color: "text-rose-600",
          subtext: `Interest Earned: ${moneyFormat(Math.round(totalInterest), currency)}`
        },
        {
          label: "Portfolio Status",
          value: finalCorpus > 0 ? "Surplus Remaining" : "Corpus Depleted",
          color: finalCorpus > 0 ? "text-emerald-600" : "text-rose-600",
          subtext: depletionYear > 0 ? `Depleted in ${depletionMonth}/${depletionYear}` : "Lasts full tenure"
        }
      ]}
    />
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      summary={summary}
      charts={
        <div className="mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Balance Depletion Projection</h3>
          <FinancialLineChart
            data={{
              labels: yearlyRows.map(r => r.year),
              datasets: [
                {
                  label: 'Remaining Balance',
                  data: yearlyRows.map(r => r.closingBalance),
                  borderColor: '#8B5CF6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                }
              ]
            }}
            currency={currency}
            height={350}
          />
        </div>
      }
      table={
        <div className="mt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800">Withdrawal Schedule</h3>
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
            yearlyData={yearlyRows.map(r => ({
              ...r,
              totalInvested: r.totalWithdrawal || r.withdrawal,
              growth: r.interestEarned,
              balance: r.closingBalance
            }))}
            monthlyData={monthlyRows.map(m => ({
              ...m,
              invested: m.withdrawal,
              interest: m.interestEarned,
              balance: m.closingBalance
            }))}
            currency={currency}
          />
        </div>
      }
      details={
        <div className="mt-12">
          {calculatorDetails.swp.render()}
        </div>
      }
    />
  );
}
