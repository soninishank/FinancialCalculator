// src/components/calculators/PureSIP.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";

import { useLimitedPay } from "../../hooks/useLimitedPay";
import { downloadCSV } from "../../utils/export";
import { calcSIPFutureValue } from "../../utils/finance";
import { 
  DEFAULT_MONTHLY_SIP,
  DEFAULT_RATE,
  MIN_SIP,
  MIN_RATE,
  MIN_YEARS,
  MAX_SIP,
  MAX_RATE,
  MAX_YEARS,DEFAULT_TENURE_YEARS
} from "../../utils/constants"; // <--- NEW IMPORTS

// Business Logic for Pure SIP
function computeYearlySchedule({ monthlySIP, annualRate, totalYears, sipYears }) {
  const r_m = annualRate / 12 / 100;
  const totalMonths = totalYears * 12;
  const sipMonths = sipYears * 12;

  let balance = 0;
  let monthlyInvested = 0;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Only add SIP if within duration
    if (m <= sipMonths) {
      balance += monthlySIP;
      monthlyInvested += monthlySIP;
    }
    
    // Always compound
    balance = balance * (1 + r_m);

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
  // --- STATE FIX: Use Default Constants ---
  const [monthlySIP, setMonthlySIP] = useState(DEFAULT_MONTHLY_SIP);
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);

  // Use Limited Pay Hook (which has its own default years)
  const { 
    totalYears, 
    sipYears, 
    setSipYears, 
    isLimitedPay, 
    handleTotalYearsChange, 
    handleLimitedPayToggle 
  } = useLimitedPay(DEFAULT_TENURE_YEARS); // Passing the default years

  // Calculations
  const n = totalYears * 12;
  const r_m = annualRate / 12 / 100;

  const fvSIP = useMemo(
    () => calcSIPFutureValue(Number(monthlySIP), r_m, n),
    [monthlySIP, r_m, n]
  );

  const investedTotal = Number(monthlySIP) * n;
  const totalFuture = fvSIP;
  const gain = totalFuture - investedTotal;

  // Yearly Breakdown Calculation
  const yearlyRows = useMemo(
    () =>
      computeYearlySchedule({
        monthlySIP: Number(monthlySIP),
        annualRate: Number(annualRate),
        totalYears: Number(totalYears),
        sipYears: Number(sipYears)
      }),
    [monthlySIP, annualRate, totalYears, sipYears]
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

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        
        {/* Monthly SIP - Use MAX/MIN constants */}
        <InputWithSlider
          label="Monthly SIP Amount"
          value={monthlySIP}
          onChange={setMonthlySIP}
          min={MIN_SIP} max={MAX_SIP} step={500}
          currency={currency}
        />

        {/* Investment Tenure (With Advanced Toggle) */}
        <div>
          <InputWithSlider
            label="Total Investment Tenure (Years)"
            value={totalYears}
            onChange={handleTotalYearsChange}
            min={MIN_YEARS} max={MAX_YEARS} step={0.1} isDecimal={true}// Use MAX_YEARS
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

        {/* Return Rate Slider - Use MAX/MIN constants */}
        <div className="md:col-span-2">
          <InputWithSlider
            label="Expected Annual Return (%)"
            value={annualRate}
            onChange={setAnnualRate}
            min={MIN_RATE} max={MAX_RATE} step={0.1} symbol="%"
            isDecimal={true}
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