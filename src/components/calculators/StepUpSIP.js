// src/components/calculators/StepUpSIP.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { downloadCSV } from "../../utils/export";

// --- UPDATED LOGIC ---
function computeStepUpSchedule({ initialSIP, stepUpPercent, annualRate, totalYears, sipYears }) {
  const r_m = annualRate / 12 / 100;
  const totalMonths = totalYears * 12;
  const sipMonths = sipYears * 12;

  let balance = 0;
  let totalInvested = 0;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    // 1. Calculate what the SIP *would* be for this year (Step-up logic)
    const yearIndex = Math.floor((m - 1) / 12);
    const currentMonthlySIP = Number(initialSIP) * Math.pow(1 + stepUpPercent / 100, yearIndex);

    // 2. Only contribute if within the SIP Duration
    if (m <= sipMonths) {
      balance += currentMonthlySIP;
      totalInvested += currentMonthlySIP;
    }

    // 3. Apply Interest (Always happens)
    balance = balance * (1 + r_m);

    // 4. Snapshot at year end
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: totalInvested,
        sipInvested: totalInvested, // Pure StepUp has no lump sum
        stepUpAppliedPercent: stepUpPercent,
        growth: balance - totalInvested,
        overallValue: balance,
      });
    }
  }
  return rows;
}

export default function StepUpSIP({ currency, setCurrency }) {
  // --- STATE ---
  const [initialSIP, setInitialSIP] = useState(5000);
  const [stepUpPercent, setStepUpPercent] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);

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

  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        
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
          min={0} max={50} symbol="%"
        />

        {/* Investment Tenure (With Advanced Toggle) */}
        <div>
          <InputWithSlider
            label="Total Investment Tenure (Years)"
            value={totalYears}
            onChange={handleTotalYearsChange}
            min={1} max={40}
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
            min={1} max={30} symbol="%"
          />
        </div>
      </div>

      <SummaryCards totalValue={totalFuture} invested={investedTotal} gain={gain} currency={currency} />
      <CompoundingBarChart data={yearlyRows} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-start">
        <div className="lg:col-span-1">
          <InvestmentPieChart 
            invested={investedTotal} 
            gain={gain} 
            total={totalFuture} 
            currency={currency} 
            years={totalYears} 
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}