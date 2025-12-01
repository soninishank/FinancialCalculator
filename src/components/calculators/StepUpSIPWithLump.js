// src/components/calculators/SIPWithLumpSum.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider"; // <--- NEW IMPORT

import { downloadCSV } from "../../utils/export";

function computeStepUpWithLumpSchedule({ initialSIP, lumpSum, stepUpPercent, annualRate, years }) {
  const r_m = annualRate / 12 / 100;
  const months = years * 12;

  let balance = lumpSum;
  let monthly = Number(initialSIP);
  let totalInvested = lumpSum;
  const rows = [];

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    monthly = Number(initialSIP) * Math.pow(1 + stepUpPercent / 100, yearIndex);

    balance = balance * (1 + r_m) + monthly;
    totalInvested += monthly;

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
  const [initialSIP, setInitialSIP] = useState(5000);
  const [lumpSum, setLumpSum] = useState(100000);
  const [stepUpPercent, setStepUpPercent] = useState(5);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);

  const yearlyRows = useMemo(
    () => computeStepUpWithLumpSchedule({ initialSIP: Number(initialSIP), lumpSum: Number(lumpSum), stepUpPercent: Number(stepUpPercent), annualRate: Number(annualRate), years: Number(years) }),
    [initialSIP, lumpSum, stepUpPercent, annualRate, years]
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
        <InputWithSlider
          label="Initial Monthly SIP"
          value={initialSIP}
          onChange={setInitialSIP}
          min={500} max={500000} step={500}
          currency={currency}
        />

        <InputWithSlider
          label="Initial Lump Sum"
          value={lumpSum}
          onChange={setLumpSum}
          min={5000} max={10000000} step={1000}
          currency={currency}
        />

        <InputWithSlider
          label="Annual Step-up (%)"
          value={stepUpPercent}
          onChange={setStepUpPercent}
          min={0} max={50} symbol="%"
        />

        <InputWithSlider
          label="Investment Tenure (Years)"
          value={years}
          onChange={setYears}
          min={1} max={40}
        />

        <div className="md:col-span-2">
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
          <InvestmentPieChart invested={investedTotal} gain={gain} total={totalFuture} currency={currency} years={years} />
        </div>
        <div className="lg:col-span-2 h-full">
          <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}