// src/components/calculators/StepUpSIPWithLump.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";

import { useLimitedPay } from "../../hooks/useLimitedPay"; // <--- IMPORT HOOK
import { downloadCSV } from "../../utils/export";
import { 
  DEFAULT_MONTHLY_SIP,
  DEFAULT_LUMP_SUM,
  DEFAULT_RATE,
  DEFAULT_TENURE_YEARS,
  DEFAULT_STEP_UP,
  MIN_SIP,
  MIN_RATE,
  MIN_YEARS,
  MAX_AMOUNT,MIN_AMOUNT,
  MAX_SIP,
  MAX_RATE,
  MAX_YEARS,
  MAX_STEP_UP
} from "../../utils/constants"; // <--- NEW CONSTANTS

// --- UPDATED LOGIC (Now includes totalYears and sipYears) ---
function computeStepUpWithLumpSchedule({ initialSIP, lumpSum, stepUpPercent, annualRate, totalYears, sipYears }) {
  const r_m = annualRate / 12 / 100;
  const totalMonths = totalYears * 12;
  const sipMonths = sipYears * 12; // How long contributions last

  let balance = lumpSum;
  let totalInvested = lumpSum;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const currentMonthlySIP = Number(initialSIP) * Math.pow(1 + stepUpPercent / 100, yearIndex);

    // 1. Only contribute SIP if within the SIP Duration
    if (m <= sipMonths) {
      balance += currentMonthlySIP;
      totalInvested += currentMonthlySIP;
    }

    // 2. Apply Interest
    balance = balance * (1 + r_m);

    // 3. Snapshot at year end
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: totalInvested,
        sipInvested: totalInvested - lumpSum,
        lumpSum: lumpSum,
        stepUpAppliedPercent: stepUpPercent,
        growth: balance - totalInvested,
        overallValue: balance,
      });
    }
  }
  return rows;
}

export default function StepUpSIPWithLump({ currency, setCurrency }) {
  // --- STATE FIX: Use Default Constants ---
  const [initialSIP, setInitialSIP] = useState(DEFAULT_MONTHLY_SIP);
  const [lumpSum, setLumpSum] = useState(DEFAULT_LUMP_SUM);
  const [stepUpPercent, setStepUpPercent] = useState(DEFAULT_STEP_UP);
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);

  // --- USE LIMITED PAY HOOK ---
  const { 
    totalYears, 
    sipYears, 
    setSipYears, 
    isLimitedPay, 
    handleTotalYearsChange, 
    handleLimitedPayToggle 
  } = useLimitedPay(DEFAULT_TENURE_YEARS);

  // Calculations
  const yearlyRows = useMemo(
    () =>
      computeStepUpWithLumpSchedule({ 
        initialSIP: Number(initialSIP), 
        lumpSum: Number(lumpSum), 
        stepUpPercent: Number(stepUpPercent), 
        annualRate: Number(annualRate), 
        totalYears: Number(totalYears), 
        sipYears: Number(sipYears) 
      }),
    [initialSIP, lumpSum, stepUpPercent, annualRate, totalYears, sipYears]
  );

  const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested;
  const totalFuture = lastRow.overallValue;
  const gain = totalFuture - investedTotal;

  function handleExport() {
    const header = ["Year", "Total Invested", "SIP Invested", "Lump Sum", "Step-up %", "Growth", "Overall Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.sipInvested), Math.round(r.lumpSum), `${r.stepUpAppliedPercent}%`, Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadCSV(rows, header, "stepup_sip_lumpsum_table.csv");
  }

  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        
        {/* Initial SIP */}
        <InputWithSlider
          label="Initial Monthly SIP"
          value={initialSIP}
          onChange={setInitialSIP}
          min={MIN_SIP} max={MAX_SIP} step={500}
          currency={currency}
        />

        {/* Lump Sum */}
        <InputWithSlider
          label="Initial Lump Sum"
          value={lumpSum}
          onChange={setLumpSum}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={1000}
          currency={currency}
        />

        {/* Step Up % */}
        <InputWithSlider
          label="Annual Step-up (%)"
          value={stepUpPercent}
          onChange={setStepUpPercent}
          min={MIN_RATE} max={MAX_STEP_UP} symbol="%"
        />

        {/* Investment Tenure (With Limited Pay Toggle) */}
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
                Stop contributions after a few years but let the money grow.
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

        {/* Rate */}
        <div className="md:col-span-1">
          <InputWithSlider
            label="Expected Annual Return (%)"
            value={annualRate}
            onChange={setAnnualRate}
            min={MIN_RATE} max={MAX_RATE} symbol="%"
          />
        </div>
      </div>

      <SummaryCards totalValue={totalFuture} invested={investedTotal} gain={gain} currency={currency} />
      <CompoundingBarChart data={yearlyRows} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-start">
        <div className="lg:col-span-1">
          <InvestmentPieChart invested={investedTotal} gain={gain} total={totalFuture} currency={currency} years={totalYears} />
        </div>
        <div className="lg:col-span-2 h-full">
          <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}