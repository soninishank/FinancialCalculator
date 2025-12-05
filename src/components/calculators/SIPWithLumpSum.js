// src/components/calculators/SIPWithLumpSum.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";

import { useLimitedPay } from "../../hooks/useLimitedPay"; 
import { downloadCSV } from "../../utils/export";
import { 
  DEFAULT_MONTHLY_SIP, 
  DEFAULT_LUMP_SUM, MIN_RATE,
  DEFAULT_RATE, 
  DEFAULT_TENURE_YEARS,
  MIN_YEARS,
  MIN_SIP,
  MIN_AMOUNT,
  MAX_AMOUNT, 
  MAX_SIP,
  MAX_YEARS,
  MAX_RATE
} from "../../utils/constants"; 

// --- LOGIC ---
function computeYearlySchedule({ monthlySIP, lumpSum, annualRate, totalYears, sipYears }) {
  const r_m = annualRate / 12 / 100;
  // Use Math.ceil to ensure calculations cover the partial final month if needed
  const totalMonths = Math.ceil(totalYears * 12); 
  const sipMonths = Math.ceil(sipYears * 12);

  let balance = lumpSum;
  let monthlyInvested = 0;
  const rows = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Only add SIP if within the contribution period
    if (m <= sipMonths) {
      balance += monthlySIP;
      monthlyInvested += monthlySIP;
    }

    // Apply interest every month
    balance = balance * (1 + r_m);

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        totalInvested: monthlyInvested + lumpSum,
        sipInvested: monthlyInvested,
        lumpSum: lumpSum,
        growth: balance - (monthlyInvested + lumpSum),
        overallValue: balance,
      });
    }
  }
  return rows;
}

export default function SIPWithLumpSum({ currency, setCurrency }) {
   // --- LOCAL STATE (Non-Tenure Inputs) ---
  const [monthlySIP, setMonthlySIP] = useState(DEFAULT_MONTHLY_SIP);
  const [lumpSum, setLumpSum] = useState(DEFAULT_LUMP_SUM);
  
  // --- HOOK STATE (Tenure Inputs) ---
  const { 
    totalYears, 
    sipYears, 
    setSipYears, 
    isLimitedPay, 
    handleTotalYearsChange, 
    handleLimitedPayToggle 
  } = useLimitedPay(DEFAULT_TENURE_YEARS); // Hook handles totalYears/sipYears state

  // Use decimal for rate input
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE.toFixed(1)); 


  // --- CALCULATIONS ---
  const yearlyRows = useMemo(
    () =>
      computeYearlySchedule({
        monthlySIP: Number(monthlySIP),
        lumpSum: Number(lumpSum),
        annualRate: Number(annualRate),
        totalYears: Number(totalYears),
        sipYears: Number(sipYears),
      }),
    [monthlySIP, lumpSum, annualRate, totalYears, sipYears]
  );

  const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
  const investedTotal = lastRow.totalInvested;
  const totalFuture = lastRow.overallValue;
  const gain = totalFuture - investedTotal;

  const handleExport = () => {
    const headers = ["Year", "Total Invested", "SIP Invested", "Lump Sum", "Growth", "Overall Value"];
    const data = yearlyRows.map((r) => [
      `Year ${r.year}`,
      Math.round(r.totalInvested),
      Math.round(r.sipInvested),
      Math.round(r.lumpSum),
      Math.round(r.growth),
      Math.round(r.overallValue),
    ]);
    downloadCSV(data, headers, "sip_lumpsum_table.csv");
  };

  return (
    <div className="animate-fade-in">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        
        {/* Standard Inputs */}
        <InputWithSlider
          label="Monthly SIP Amount"
          value={monthlySIP}
          onChange={setMonthlySIP}
          min={MIN_SIP} max={MAX_SIP} step={500}
          currency={currency}
        />

        <InputWithSlider
          label="Initial Lump Sum"
          value={lumpSum}
          onChange={setLumpSum}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={1000}
          currency={currency}
        />

        {/* Investment Tenure (Now Decimal) */}
        <div>
          <InputWithSlider
            label="Total Investment Tenure (Years)"
            value={totalYears}
            onChange={handleTotalYearsChange}
            min={MIN_YEARS} max={MAX_YEARS} step={0.1} // <--- DECIMAL STEP
            isDecimal={true} // <--- CRITICAL
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
                Enable this if you want to stop monthly contributions after a few years but let the money grow.
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
                max={totalYears} // Max is now the current totalYears
                step={0.1} // <--- DECIMAL STEP
                isDecimal={true} // <--- CRITICAL
              />
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <InputWithSlider
            label="Expected Annual Return (%)"
            value={annualRate}
            onChange={setAnnualRate}
            min={MIN_RATE} max={MAX_RATE} step={0.1} // <--- DECIMAL STEP
            symbol="%"
            isDecimal={true} // <--- CRITICAL
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