import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from "../common/FinancialCharts";
import ResultsTable from "../common/ResultsTable";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import CalculatorLayout from "../common/CalculatorLayout";
import { calculateCAGR } from "../../utils/finance";
import { downloadPDF } from "../../utils/export";
import {
  MIN_AMOUNT,
  MIN_YEARS,
  MAX_AMOUNT,
  MAX_YEARS,
  DEFAULT_LUMP_SUM,
  STEP_AMOUNT
} from "../../utils/constants";

export default function CAGRCalculator({ currency, setCurrency }) {
  // Inputs
  const [beginningValue, setBeginningValue] = useState(DEFAULT_LUMP_SUM);
  const [endingValue, setEndingValue] = useState(200000);
  const [years, setYears] = useState(5);

  // Calculation
  const cagr = useMemo(
    () => calculateCAGR(Number(beginningValue), Number(endingValue), Number(years)),
    [beginningValue, endingValue, years]
  );

  // --- YEARLY BREAKDOWN ---
  const yearlyRows = useMemo(() => {
    const rows = [];
    const rate = cagr / 100;
    const P = Number(beginningValue);

    for (let i = 1; i <= years; i++) {
      const value = P * Math.pow(1 + rate, i);
      rows.push({
        year: i,
        totalInvested: P,
        growth: value - P,
        overallValue: value
      });
    }
    return rows;
  }, [beginningValue, cagr, years]);

  function handleExport() {
    const header = ["Year", "Initial Value", "Growth", "Final Value"];
    const rows = yearlyRows.map((r) => [
      `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.growth), Math.round(r.overallValue),
    ]);
    downloadPDF(rows, header, "cagr_report.pdf");
  }

  // --- UI PARTS ---
  const inputsSection = (
    <>
      <InputWithSlider
        label="Beginning Investment Value"
        value={beginningValue}
        onChange={setBeginningValue}
        min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
        currency={currency}
      />

      <InputWithSlider
        label="Ending Investment Value"
        value={endingValue}
        onChange={setEndingValue}
        min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
        currency={currency}
      />

      <div className="md:col-span-2">
        <InputWithSlider
          label="Investment Period (Years)"
          value={years}
          onChange={setYears}
          min={MIN_YEARS} max={MAX_YEARS}
        />
        <RateQualityGuard rate={cagr} />
      </div>
    </>
  );

  const summarySection = (
    <div className="mt-8">
      <div className="bg-white border-l-8 border-teal-500 rounded-2xl p-8 shadow-sm text-center md:text-left">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Compound Annual Growth Rate
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`text-6xl font-black text-teal-600`}>
            {cagr.toFixed(2)}%
          </div>
          <p className="text-gray-500 text-sm max-w-md font-medium leading-relaxed">
            This means your investment grew by an average of <strong>{cagr.toFixed(2)}%</strong> every year over the {years} year period.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      inputs={inputsSection}
      summary={summarySection}
      charts={<FinancialCompoundingBarChart data={yearlyRows} currency={currency} />}
      pieChart={
        <FinancialInvestmentPieChart
          invested={Number(beginningValue)}
          gain={Number(endingValue) - Number(beginningValue)}
          total={Number(endingValue)}
          currency={currency}
          years={years}
        />
      }
      table={
        <ResultsTable data={yearlyRows} currency={currency} onExport={handleExport} />
      }
    />
  );
}