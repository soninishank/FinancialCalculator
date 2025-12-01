// src/components/calculators/LumpSumOnly.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import CurrencySelector from "../common/CurrencySelector";
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider"; // <--- NEW IMPORT

import { calcLumpFutureValue } from "../../utils/finance";
import { downloadCSV } from "../../utils/export";

function computeYearlyLump({ lumpSum, annualRate, years }) {
  const r_m = annualRate / 12 / 100;
  const months = years * 12;
  const rows = [];
  let currentBalance = lumpSum;

  for (let m = 1; m <= months; m++) {
    currentBalance = currentBalance * (1 + r_m);
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: lumpSum,
        lumpSum: lumpSum,
        growth: currentBalance - lumpSum,
        overallValue: currentBalance,
      });
    }
  }
  return rows;
}

export default function LumpSumOnly({ currency, setCurrency }) {
  const [lumpSum, setLumpSum] = useState(100000);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);

  const n = years * 12;
  const r_m = annualRate / 12 / 100;

  const fvLump = useMemo(() => calcLumpFutureValue(Number(lumpSum), r_m, n), [lumpSum, r_m, n]);
  const investedTotal = Number(lumpSum);
  const totalFuture = fvLump;
  const gain = totalFuture - investedTotal;

  const yearlyRows = useMemo(
    () => computeYearlyLump({ lumpSum: Number(lumpSum), annualRate: Number(annualRate), years: Number(years) }),
    [lumpSum, annualRate, years]
  );

  function handleExport() {
    const header = ["Year", "Total Invested", "Lump Sum", "Growth", "Overall Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.lumpSum), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadCSV(rows, header, "lump_sum_table.csv");
  }

  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        <InputWithSlider
          label="Initial Lump Sum"
          value={lumpSum}
          onChange={setLumpSum}
          min={5000} max={10000000} step={1000}
          currency={currency}
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
            min={1} max={30}
            symbol="%"
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