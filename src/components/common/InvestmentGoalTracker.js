import React, { useMemo, useState } from "react";
import InputWithSlider from "./InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import {
  analyzeInvestmentGoal,
  buildGoalActionPlan,
  composeGoalShareText,
} from "../../utils/investmentGoal";
import { STEP_HUGE, TARGET_MAX_AMOUNT_GOAL_PLANNER } from "../../utils/constants";

export default function InvestmentGoalTracker({
  currency,
  targetAmount,
  setTargetAmount,
  finalValue,
  monthlyRows,
  annualRate,
  years,
  strategy,
  currentMonthlySIP = 0,
  currentLumpSum = 0,
  stepUpPercent = 0,
  currentInitialSIP = 0,
  sipYears = years,
  limitedPay = false,
}) {
  const [copied, setCopied] = useState(false);
  const analysis = useMemo(() => analyzeInvestmentGoal({
    monthlyRows,
    targetAmount,
    finalValue,
    annualRate,
    years,
    strategy,
    currentMonthlySIP,
    currentLumpSum,
    stepUpPercent,
    currentInitialSIP,
    sipYears,
    limitedPay,
  }), [
    monthlyRows,
    targetAmount,
    finalValue,
    annualRate,
    years,
    strategy,
    currentMonthlySIP,
    currentLumpSum,
    stepUpPercent,
    currentInitialSIP,
    sipYears,
    limitedPay,
  ]);
  const actionPlan = useMemo(() => buildGoalActionPlan({
    analysis,
    currency,
    targetAmount,
    finalValue,
  }), [analysis, currency, targetAmount, finalValue]);

  const handleCopyPlan = async () => {
    const text = composeGoalShareText({
      analysis,
      currency,
      targetAmount,
      finalValue,
    });

    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const statusTheme = analysis.status === "ahead"
    ? {
      shell: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/15",
      label: "text-emerald-800 dark:text-emerald-300",
      sub: "text-emerald-700 dark:text-emerald-400",
    }
    : {
      shell: "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/15",
      label: "text-amber-800 dark:text-amber-300",
      sub: "text-amber-700 dark:text-amber-400",
    };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Goal Tracker</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set a target corpus and see whether this plan reaches it on time.
          </p>
        </div>
        <div className="w-full lg:max-w-md">
          <InputWithSlider
            label="Target Corpus"
            value={targetAmount}
            onChange={setTargetAmount}
            min={0}
            max={TARGET_MAX_AMOUNT_GOAL_PLANNER}
            step={STEP_HUGE}
            currency={currency}
          />
          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={handleCopyPlan}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "Plan copied" : "Copy plan"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className={`rounded-lg border p-4 ${statusTheme.shell}`}>
          <p className={`text-[11px] uppercase font-extrabold tracking-wide ${statusTheme.label}`}>Plan Status</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">
            {analysis.status === "ahead" ? "Target reached" : "Below target"}
          </p>
          <p className={`text-xs mt-1 ${statusTheme.sub}`}>
            {analysis.status === "ahead"
              ? `Buffer: ${moneyFormat(analysis.surplus, currency, "word")}`
              : `Shortfall: ${moneyFormat(analysis.shortfall, currency, "word")}`}
          </p>
        </div>
        <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-sky-800 dark:text-sky-300">Target Date</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">
            {analysis.targetHit?.dateLabel || "Not in term"}
          </p>
          <p className="text-xs text-sky-700 dark:text-sky-400 mt-1">
            Coverage: {(analysis.coverageRatio * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-indigo-800 dark:text-indigo-300">Needed In Same Timeline</p>
          <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">
            {analysis.requiredContribution
              ? moneyFormat(analysis.requiredContribution.required, currency, "word")
              : "Current plan works"}
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
            {analysis.requiredContribution
              ? `${analysis.requiredContribution.label}: +${moneyFormat(analysis.requiredContribution.delta, currency, "word")}`
              : "No extra contribution needed"}
          </p>
        </div>
        <div className="rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50/70 dark:bg-fuchsia-900/20 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-fuchsia-800 dark:text-fuchsia-300">Same Plan Timeline</p>
          <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">
            {analysis.additionalYearsNeeded > 0 ? `+${analysis.additionalYearsNeeded} yrs` : "On schedule"}
          </p>
          <p className="text-xs text-fuchsia-700 dark:text-fuchsia-400 mt-1">
            {analysis.yearsToTarget ? `Goal year: ${analysis.yearsToTarget}` : "Target not reached within 100 years"}
          </p>
        </div>
      </div>

      {analysis.milestones.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Milestones
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analysis.milestones.map((milestone) => (
              <div
                key={milestone.label}
                className={`rounded-lg border p-3 ${milestone.achieved
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40"
                  }`}
              >
                <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{milestone.label}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                  {moneyFormat(milestone.threshold, currency, "word")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{milestone.dateLabel}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {actionPlan.length > 0 && (
        <div className="mt-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4">
          <p className="text-[11px] uppercase font-extrabold tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            Action Plan
          </p>
          <div className="space-y-2">
            {actionPlan.map((item) => (
              <p key={item} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
