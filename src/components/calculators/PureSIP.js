// src/components/calculators/PureSIP.js
import React, { useMemo, useState } from "react";

// --- IMPORTS FROM COMMON ---
import CurrencySelector from "../common/CurrencySelector";
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider"; // <--- NEW IMPORT

// --- IMPORTS FROM UTILS ---
import { calcSIPFutureValue } from "../../utils/finance";
import { downloadCSV } from "../../utils/export";

// Business Logic
function computeYearlySchedule({ monthlySIP, annualRate, years }) {
  const r_m = annualRate / 12 / 100;
  const months = years * 12;

  let balance = 0;
  let monthlyInvested = 0;
  const rows = [];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r_m) + monthlySIP;
    monthlyInvested += monthlySIP;

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: monthlyInvested,
        growth: balance - monthlyInvested,
        overallValue: balance,
      });
    }
  }
  return rows;
}

export default function PureSIP({ currency, setCurrency }) {
  const [monthlySIP, setMonthlySIP] = useState(5000);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);

  const n = years * 12;
  const r_m = annualRate / 12 / 100;

  const fvSIP = useMemo(() => calcSIPFutureValue(Number(monthlySIP), r_m, n), [monthlySIP, r_m, n]);
  const investedTotal = Number(monthlySIP) * n;
  const totalFuture = fvSIP;
  const gain = totalFuture - investedTotal;

  const yearlyRows = useMemo(
    () => computeYearlySchedule({ monthlySIP: Number(monthlySIP), annualRate: Number(annualRate), years: Number(years) }),
    [monthlySIP, annualRate, years]
  );

  const handleExport = () => {
    const headers = ["Year", "Total Invested", "Growth", "Total Value"];
    const data = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadCSV(data, headers, "pure_sip_table.csv");
  };

  return (
    <div className="animate-fade-in">
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      {/* INPUTS SECTION - Cleaned up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        <InputWithSlider
          label="Monthly SIP Amount"
          value={monthlySIP}
          onChange={setMonthlySIP}
          min={500} max={1000000} step={500}
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