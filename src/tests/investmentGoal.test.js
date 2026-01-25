import {
  analyzeInvestmentGoal,
  buildGoalMilestones,
  composeGoalShareText,
  formatGoalMonthYear,
} from "../utils/investmentGoal";
import { computeYearlySchedule } from "../utils/finance";

describe("investment goal analysis", () => {
  test("builds milestone dates from the schedule", () => {
    const schedule = computeYearlySchedule({
      monthlySIP: 10000,
      annualRate: 12,
      totalYears: 5,
      startDate: "2026-01",
    });

    const milestones = buildGoalMilestones(schedule.monthlyRows, 500000, [0.5, 1]);

    expect(milestones).toHaveLength(2);
    expect(milestones[0].achieved).toBe(true);
    expect(typeof milestones[0].dateLabel).toBe("string");
    expect(milestones[1].threshold).toBe(500000);
  });

  test("reports shortfall and extra SIP needed when a SIP goal is behind", () => {
    const schedule = computeYearlySchedule({
      monthlySIP: 5000,
      annualRate: 10,
      totalYears: 10,
      startDate: "2026-01",
    });
    const finalValue = schedule.rows[schedule.rows.length - 1].overallValue;

    const result = analyzeInvestmentGoal({
      monthlyRows: schedule.monthlyRows,
      targetAmount: finalValue * 1.5,
      finalValue,
      annualRate: 10,
      years: 10,
      strategy: "sip",
      currentMonthlySIP: 5000,
    });

    expect(result.status).toBe("behind");
    expect(result.shortfall).toBeGreaterThan(0);
    expect(result.requiredContribution.label).toBe("Required monthly SIP");
    expect(result.requiredContribution.delta).toBeGreaterThan(0);
    expect(result.additionalYearsNeeded).toBeGreaterThanOrEqual(0);
  });

  test("reports goal hit date when plan is already ahead", () => {
    const schedule = computeYearlySchedule({
      lumpSum: 100000,
      annualRate: 12,
      totalYears: 10,
      startDate: "2026-01",
    });
    const finalValue = schedule.rows[schedule.rows.length - 1].overallValue;

    const result = analyzeInvestmentGoal({
      monthlyRows: schedule.monthlyRows,
      targetAmount: 150000,
      finalValue,
      annualRate: 12,
      years: 10,
      strategy: "lumpSum",
      currentLumpSum: 100000,
    });

    expect(result.status).toBe("ahead");
    expect(result.targetHit.dateLabel).toBe(formatGoalMonthYear(result.targetHit.month, result.targetHit.year));
    expect(result.surplus).toBeGreaterThan(0);
  });

  test("builds a shareable plan summary", () => {
    const schedule = computeYearlySchedule({
      monthlySIP: 7000,
      annualRate: 11,
      totalYears: 8,
      startDate: "2026-01",
    });
    const finalValue = schedule.rows[schedule.rows.length - 1].overallValue;
    const analysis = analyzeInvestmentGoal({
      monthlyRows: schedule.monthlyRows,
      targetAmount: finalValue * 1.2,
      finalValue,
      annualRate: 11,
      years: 8,
      strategy: "sip",
      currentMonthlySIP: 7000,
    });

    const summary = composeGoalShareText({
      analysis,
      currency: "INR",
      targetAmount: finalValue * 1.2,
      finalValue,
    });

    expect(summary).toContain("Goal target:");
    expect(summary).toContain("Projected corpus:");
    expect(summary).toContain("Status:");
  });
});
