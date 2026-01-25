import React, { useMemo } from "react";
import { moneyFormat } from "../../utils/formatting";

function formatMonthYear(month, year) {
  if (!month || !year) return "Not reached";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[Math.max(0, Math.min(11, month - 1))]} ${year}`;
}

export default function InvestmentInsights({
  currency,
  yearlyRows = [],
  monthlyRows = [],
  invested = 0,
  total = 0,
  postTaxValue = null,
}) {
  const insights = useMemo(() => {
    const safeInvested = Number(invested) || 0;
    const safeTotal = Number(total) || 0;
    const corpusMultiple = safeInvested > 0 ? safeTotal / safeInvested : 0;
    const monthlyIncome4 = safeTotal * (0.04 / 12);
    const monthlyIncomePostTax4 = postTaxValue ? Number(postTaxValue) * (0.04 / 12) : null;

    let bestYear = null;
    let bestGrowth = -Infinity;
    let prevGrowth = 0;
    for (let i = 0; i < yearlyRows.length; i += 1) {
      const row = yearlyRows[i];
      const currentGrowth = Number(row.growth) || 0;
      const growthInYear = i === 0 ? currentGrowth : currentGrowth - prevGrowth;
      if (growthInYear > bestGrowth) {
        bestGrowth = growthInYear;
        bestYear = row.year;
      }
      prevGrowth = currentGrowth;
    }

    const doubleMonth = monthlyRows.find((row) => (Number(row.balance) || 0) >= 2 * (Number(row.invested) || 0));

    return {
      corpusMultiple,
      monthlyIncome4,
      monthlyIncomePostTax4,
      bestYear,
      bestGrowth: bestGrowth > 0 ? bestGrowth : 0,
      doubleAt: doubleMonth ? formatMonthYear(doubleMonth.month, doubleMonth.year) : "Not reached",
    };
  }, [yearlyRows, monthlyRows, invested, total, postTaxValue]);

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Investment Insights</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-sky-800 dark:text-sky-300">Corpus Multiple</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{insights.corpusMultiple.toFixed(2)}x</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total value vs invested capital</p>
        </div>
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-emerald-800 dark:text-emerald-300">Monthly Income (4%)</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">{moneyFormat(insights.monthlyIncome4, currency, "word")}</p>
          {insights.monthlyIncomePostTax4 !== null && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Post-tax: {moneyFormat(insights.monthlyIncomePostTax4, currency, "word")}</p>
          )}
        </div>
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-indigo-800 dark:text-indigo-300">Strongest Growth Year</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">{insights.bestYear || "-"}</p>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">Growth: {moneyFormat(insights.bestGrowth, currency, "word")}</p>
        </div>
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-amber-800 dark:text-amber-300">2x Milestone</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">{insights.doubleAt}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">When value first reaches 2x invested</p>
        </div>
      </div>
    </div>
  );
}
