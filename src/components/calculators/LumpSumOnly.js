// src/components/calculators/LumpSumOnly.js
import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import InvestmentPieChart from "../common/InvestmentPieChart";
import ResultsTable from "../common/ResultsTable";
import CompoundingBarChart from "../common/CompoundingBarChart";
import InputWithSlider from "../common/InputWithSlider";
import TaxToggle from "../common/TaxToggle"; // <-- added

import { calcLumpFutureValue } from "../../utils/finance";
import { downloadCSV } from "../../utils/export";
import { calculateLTCG, DEFAULT_LTCG_TAX_RATE_DECIMAL } from "../../utils/tax"; // <-- added
import { 
  DEFAULT_LUMP_SUM,
  DEFAULT_TENURE_YEARS,
  DEFAULT_RATE,
  MIN_AMOUNT,
  MIN_YEARS,
  MIN_RATE,
  MAX_AMOUNT,
  MAX_YEARS,
  MAX_RATE
} from "../../utils/constants"; // <--- NEW IMPORTS

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
  // --- STATE FIX: Use Default Constants ---
  const [lumpSum, setLumpSum] = useState(DEFAULT_LUMP_SUM);
  const [years, setYears] = useState(DEFAULT_TENURE_YEARS);
  const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);

  // --- TAX STATE (added) ---
  const [isTaxApplied, setIsTaxApplied] = useState(false);
  const [ltcgRate, setLtcgRate] = useState(DEFAULT_LTCG_TAX_RATE_DECIMAL * 100); // percent (e.g. 10)
  const [isExemptionApplied, setIsExemptionApplied] = useState(false);
  const [exemptionLimit, setExemptionLimit] = useState(100000);

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

  // --- TAX CALCULATION (added) ---
  const taxResult = calculateLTCG(gain, investedTotal, isTaxApplied, {
    taxRate: Number(ltcgRate),
    currency,
    exemptionApplied: Boolean(isExemptionApplied),
    exemptionLimit: Number(exemptionLimit) || 0,
  });

  const taxAmount = taxResult?.taxAmount ?? 0;
  const netGain = taxResult?.netGain ?? gain - (taxResult?.taxAmount ?? 0);
  const netFutureValue = taxResult?.netFutureValue ?? totalFuture - (taxResult?.taxAmount ?? 0);

  const postTaxFuture = netFutureValue;
  const postTaxGain = netGain;
  const taxDeductedAmount = taxAmount;

  function handleExport() {
    const header = ["Year", "Total Invested", "Lump Sum", "Growth", "Overall Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.lumpSum), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadCSV(rows, header, "lump_sum_table.csv");
  }

  return (
    <div className="animate-fade-in">

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
        <InputWithSlider
          label="Initial Lump Sum"
          value={lumpSum}
          onChange={setLumpSum}
          min={MIN_AMOUNT} max={MAX_AMOUNT} step={1000} // Use MAX_AMOUNT
          currency={currency}
        />

        <InputWithSlider
          label="Total Investment Tenure (Years)"
          value={years}
          onChange={setYears}
          min={MIN_YEARS} max={MAX_YEARS} step={0.1}
          isDecimal={true} 
        />

        <div className="md:col-span-2">
          <InputWithSlider
            label="Expected Annual Return (%)"
            value={annualRate}
            onChange={setAnnualRate}
            min={MIN_RATE} max={MAX_RATE} step={0.1}
            symbol="%"
            isDecimal={true} 
          />

          {/* --- Apply LTCG AFTER Expected Annual Return (%) --- */}
          <div className="mt-6">
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
          </div>
        </div>
      </div>

      <SummaryCards
        totalValue={totalFuture}
        invested={investedTotal}
        gain={gain}
        currency={currency}
        {...(isTaxApplied
          ? {
              tax: {
                applied: true,
                postTaxValue: postTaxFuture,
                postTaxGain: postTaxGain,
                taxDeducted: taxDeductedAmount,
              },
            }
          : {})}
      />
      <CompoundingBarChart data={yearlyRows} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-start">
        <div className="lg:col-span-1">
          <InvestmentPieChart 
            invested={investedTotal} 
            gain={gain} 
            total={totalFuture} 
            currency={currency} 
            years={years}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}
