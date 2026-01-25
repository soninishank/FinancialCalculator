import {
  computeYearlySchedule,
  getRequiredLumpSum,
  getRequiredSIP,
  getRequiredStepUpSIP,
} from "./finance";

export const DEFAULT_GOAL_MILESTONES = [0.25, 0.5, 0.75, 1];

export function formatGoalMonthYear(month, year) {
  if (!month || !year) return "Not reached";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[Math.max(0, Math.min(11, month - 1))]} ${year}`;
}

export function findFirstBalanceAtOrAbove(monthlyRows = [], targetAmount = 0) {
  if (!Array.isArray(monthlyRows) || targetAmount <= 0) return null;
  return monthlyRows.find((row) => (Number(row.balance) || 0) >= Number(targetAmount)) || null;
}

export function buildGoalMilestones(monthlyRows = [], targetAmount = 0, milestonePercents = DEFAULT_GOAL_MILESTONES) {
  if (targetAmount <= 0) return [];

  return milestonePercents.map((percent) => {
    const threshold = Number(targetAmount) * Number(percent);
    const row = findFirstBalanceAtOrAbove(monthlyRows, threshold);

    return {
      percent,
      label: `${Math.round(percent * 100)}%`,
      threshold,
      achieved: Boolean(row),
      month: row?.month || null,
      year: row?.year || null,
      dateLabel: row ? formatGoalMonthYear(row.month, row.year) : "Not reached",
    };
  });
}

function getRequiredContribution({
  strategy,
  targetAmount,
  annualRate,
  years,
  currentMonthlySIP = 0,
  currentLumpSum = 0,
  stepUpPercent = 0,
  currentInitialSIP = currentMonthlySIP,
}) {
  const safeTarget = Number(targetAmount) || 0;
  const safeRate = Number(annualRate) || 0;
  const safeYears = Number(years) || 0;

  switch (strategy) {
    case "lumpSum": {
      const required = getRequiredLumpSum(safeTarget, safeRate, safeYears);
      return {
        type: "lumpSum",
        label: "Required upfront investment",
        required,
        delta: Math.max(0, required - (Number(currentLumpSum) || 0)),
      };
    }
    case "stepUpSip": {
      const required = getRequiredStepUpSIP(safeTarget, safeRate, safeYears, Number(stepUpPercent) || 0);
      return {
        type: "monthlySip",
        label: "Required starting SIP",
        required,
        delta: Math.max(0, required - (Number(currentInitialSIP) || 0)),
      };
    }
    case "sip": {
      const required = getRequiredSIP(safeTarget, safeRate, safeYears);
      return {
        type: "monthlySip",
        label: "Required monthly SIP",
        required,
        delta: Math.max(0, required - (Number(currentMonthlySIP) || 0)),
      };
    }
    default:
      return null;
  }
}

function getTopUpRequirement(shortfall = 0, annualRate = 0, years = 0) {
  const required = getRequiredLumpSum(Math.max(0, Number(shortfall) || 0), Number(annualRate) || 0, Number(years) || 0);
  return {
    type: "topUp",
    label: "Extra upfront top-up needed",
    required,
    delta: required,
  };
}

function estimateYearsToTarget({
  targetAmount,
  annualRate,
  years,
  monthlySIP = 0,
  lumpSum = 0,
  stepUpPercent = 0,
  sipYears,
  limitedPay = false,
}) {
  const baseYears = Math.max(1, Math.ceil(Number(years) || 0));
  const safeTarget = Number(targetAmount) || 0;

  for (let candidateYears = baseYears; candidateYears <= 100; candidateYears += 1) {
    const schedule = computeYearlySchedule({
      monthlySIP: Number(monthlySIP) || 0,
      lumpSum: Number(lumpSum) || 0,
      annualRate: Number(annualRate) || 0,
      totalYears: candidateYears,
      sipYears: limitedPay ? Number(sipYears) || baseYears : candidateYears,
      stepUpPercent: Number(stepUpPercent) || 0,
      calculationMode: "duration",
    });

    const rows = schedule?.rows || [];
    const finalRow = rows[rows.length - 1];
    if ((Number(finalRow?.overallValue) || 0) >= safeTarget) {
      return candidateYears;
    }
  }

  return null;
}

export function analyzeInvestmentGoal({
  monthlyRows = [],
  targetAmount = 0,
  finalValue = 0,
  annualRate = 0,
  years = 0,
  strategy = "sip",
  currentMonthlySIP = 0,
  currentLumpSum = 0,
  stepUpPercent = 0,
  currentInitialSIP = currentMonthlySIP,
  sipYears = years,
  limitedPay = false,
}) {
  const safeTarget = Number(targetAmount) || 0;
  const safeFinalValue = Number(finalValue) || 0;

  if (safeTarget <= 0) {
    return {
      status: "idle",
      coverageRatio: 0,
      targetHit: null,
      milestones: [],
      shortfall: 0,
      surplus: 0,
      requiredContribution: null,
      yearsToTarget: null,
      additionalYearsNeeded: null,
    };
  }

  const targetHit = findFirstBalanceAtOrAbove(monthlyRows, safeTarget);
  const milestones = buildGoalMilestones(monthlyRows, safeTarget);
  const shortfall = Math.max(0, safeTarget - safeFinalValue);
  const surplus = Math.max(0, safeFinalValue - safeTarget);

  const requiredContribution = shortfall > 0
    ? (
      strategy === "sipPlusLump" || strategy === "stepUpSipPlusLump"
        ? getTopUpRequirement(shortfall, annualRate, years)
        : getRequiredContribution({
          strategy,
          targetAmount: safeTarget,
          annualRate,
          years,
          currentMonthlySIP,
          currentLumpSum,
          stepUpPercent,
          currentInitialSIP,
        })
    )
    : null;

  const yearsToTarget = shortfall > 0
    ? estimateYearsToTarget({
      targetAmount: safeTarget,
      annualRate,
      years,
      monthlySIP: strategy === "stepUpSip" || strategy === "stepUpSipPlusLump" ? currentInitialSIP : currentMonthlySIP,
      lumpSum: currentLumpSum,
      stepUpPercent,
      sipYears,
      limitedPay,
    })
    : Number(years) || 0;

  return {
    status: shortfall > 0 ? "behind" : "ahead",
    coverageRatio: safeFinalValue / safeTarget,
    targetHit: targetHit ? {
      month: targetHit.month,
      year: targetHit.year,
      dateLabel: formatGoalMonthYear(targetHit.month, targetHit.year),
    } : null,
    milestones,
    shortfall,
    surplus,
    requiredContribution,
    yearsToTarget,
    additionalYearsNeeded: yearsToTarget ? Math.max(0, yearsToTarget - (Number(years) || 0)) : null,
  };
}

export function buildGoalActionPlan({
  analysis,
  currency,
  targetAmount,
  finalValue,
}) {
  if (!analysis || (Number(targetAmount) || 0) <= 0) return [];

  const plan = [];
  const safeTarget = Number(targetAmount) || 0;
  const safeFinalValue = Number(finalValue) || 0;

  if (analysis.status === "ahead") {
    plan.push(`This plan is ahead of target by ${safeFinalValue - safeTarget} ${currency || ""}`.trim());
    if (analysis.targetHit?.dateLabel) {
      plan.push(`Target is projected to be reached by ${analysis.targetHit.dateLabel}.`);
    }
    plan.push("You can either keep the same pace for a larger buffer or reduce contributions and still remain on track.");
    return plan;
  }

  if (analysis.requiredContribution?.delta > 0) {
    plan.push(`${analysis.requiredContribution.label} should increase by about ${Math.round(analysis.requiredContribution.delta)} ${currency || ""}`.trim());
  }

  if (analysis.additionalYearsNeeded > 0) {
    plan.push(`If contributions stay unchanged, the target is reached in about ${analysis.additionalYearsNeeded} extra years.`);
  }

  const nextMilestone = analysis.milestones.find((milestone) => !milestone.achieved);
  if (nextMilestone) {
    plan.push(`The next missing milestone is ${nextMilestone.label} of goal corpus, or ${Math.round(nextMilestone.threshold)} ${currency || ""}`.trim());
  }

  plan.push("Review assumptions on return rate and goal size before materially increasing monthly commitments.");
  return plan;
}

export function composeGoalShareText({
  analysis,
  currency,
  targetAmount,
  finalValue,
}) {
  if (!analysis || (Number(targetAmount) || 0) <= 0) return "";

  const parts = [
    `Goal target: ${Math.round(Number(targetAmount) || 0)} ${currency || ""}`.trim(),
    `Projected corpus: ${Math.round(Number(finalValue) || 0)} ${currency || ""}`.trim(),
    analysis.status === "ahead"
      ? `Status: ahead by ${Math.round(Number(analysis.surplus) || 0)} ${currency || ""}`.trim()
      : `Status: short by ${Math.round(Number(analysis.shortfall) || 0)} ${currency || ""}`.trim(),
    analysis.targetHit?.dateLabel
      ? `Projected hit date: ${analysis.targetHit.dateLabel}`
      : "Projected hit date: not within current term",
  ];

  if (analysis.requiredContribution?.label && analysis.requiredContribution?.required) {
    parts.push(`${analysis.requiredContribution.label}: ${Math.round(Number(analysis.requiredContribution.required) || 0)} ${currency || ""}`.trim());
  }

  if (analysis.additionalYearsNeeded > 0) {
    parts.push(`Same plan needs about ${analysis.additionalYearsNeeded} extra years.`);
  }

  return parts.join("\n");
}
