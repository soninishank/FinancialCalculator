import React, { useMemo } from "react";
import CalculatorLayout from "../common/CalculatorLayout";
import MonthYearPicker from "../common/MonthYearPicker";
import CollapsibleInvestmentTable from "../common/CollapsibleInvestmentTable";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import { calculatorDetails } from "../../data/calculatorDetails";
import {
  getRequiredLumpSum,
  getRequiredSIP,
  getRequiredStepUpSIP,
  calculateRealRate,
  computeYearlySchedule
} from "../../utils/finance";
import { downloadPDF } from "../../utils/export";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";
import { FinancialLineChart } from "../common/FinancialCharts";
import {
  DEFAULT_TARGET_AMOUNT,
  DEFAULT_TENURE_YEARS,
  DEFAULT_RATE,
  DEFAULT_STEP_UP,
  DEFAULT_INFLATION,
  MIN_AMOUNT,
  MIN_YEARS,
  MAX_YEARS,
  MIN_RATE,
  MAX_RATE,
  MAX_STEP_UP,
  TARGET_MAX_AMOUNT_GOAL_PLANNER
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MIN_STEP_UP = 0;

export default function GoalPlanner({ currency, setCurrency }) {
  const {
    targetAmount, setTargetAmount,
    years, setYears,
    annualRate, setAnnualRate,
    stepUpPercent, setStepUpPercent,
    isInflationAdjusted, setIsInflationAdjusted,
    inflationRate, setInflationRate,
    startDate, setStartDate,
    // Tax State
    isTaxApplied, setIsTaxApplied,
    ltcgRate, setLtcgRate,
    isExemptionApplied, setIsExemptionApplied,
    exemptionLimit, setExemptionLimit,
  } = useCalculatorState({
    targetAmount: DEFAULT_TARGET_AMOUNT,
    years: DEFAULT_TENURE_YEARS,
    annualRate: DEFAULT_RATE,
    stepUpPercent: DEFAULT_STEP_UP,
    isInflationAdjusted: false,
    inflationRate: DEFAULT_INFLATION,
  });

  // --- CRITICAL LOGIC: Calculate the Effective Rate ---
  const effectiveRate = isInflationAdjusted
    ? calculateRealRate(Number(annualRate), Number(inflationRate))
    : Number(annualRate);

  // Calculations

  // --- TAX LOGIC: Gross Up Target Amount ---
  // If tax is applied, we need to aim for a higher corpus (Pre-Tax) so that Post-Tax = Target.
  const getPreTaxTarget = (baseTarget, type) => {
    if (!isTaxApplied) return baseTarget;

    const rateDec = (Number(ltcgRate) || 0) / 100;
    const exemption = isExemptionApplied ? (Number(exemptionLimit) || 0) : 0;
    const effRate = effectiveRate;
    const tYears = Number(years);

    // If tax rate is 0, no adjustment
    if (rateDec <= 0) return baseTarget;

    // 1. Calculate K (Ratio of Invested / Maturity)
    // We use a dummy target to find the ratio for the given parameters
    const DUMMY_TARGET = 10000;
    let dummyInv = 0;
    let dummyInvestedTotal = 0;

    if (type === 'lump') {
      dummyInv = getRequiredLumpSum(DUMMY_TARGET, effRate, tYears);
      dummyInvestedTotal = dummyInv;
    } else if (type === 'sip') {
      dummyInv = getRequiredSIP(DUMMY_TARGET, effRate, tYears);
      dummyInvestedTotal = dummyInv * tYears * 12;
    } else if (type === 'stepUp') {
      dummyInv = getRequiredStepUpSIP(DUMMY_TARGET, effRate, tYears, stepUpPercent);
      // For StepUp, we need total invested from the schedule
      const { rows } = computeYearlySchedule({
        lumpSum: 0,
        monthlySIP: dummyInv,
        stepUpPercent: stepUpPercent,
        annualRate: effRate,
        totalYears: tYears,
      });
      dummyInvestedTotal = rows[rows.length - 1].totalInvested;
    }

    const K = dummyInvestedTotal / DUMMY_TARGET;

    // 2. Solve for Pre-Tax Maturity (M)
    // M - Tax = Target
    // Tax = Rate * (Gain - Exemption)
    // Gain = M - Invested = M - K*M = M(1-K)
    // M - Rate * (M(1-K) - Exemption) = Target
    // M * (1 - Rate * (1 - K)) = Target - Rate * Exemption
    // M = (Target - Rate * Exemption) / (1 - Rate + Rate * K)

    const numerator = baseTarget - (rateDec * exemption);
    const denominator = 1 - rateDec + (rateDec * K);

    if (denominator === 0) return baseTarget; // Safety

    let preTaxMaturity = numerator / denominator;

    // 3. Verify Gain > Exemption
    // If Gain <= Exemption, Tax is 0, so PreTax = Target
    const impliedGain = preTaxMaturity * (1 - K);
    if (impliedGain <= exemption) {
      return baseTarget;
    }

    return preTaxMaturity;
  };

  // Calculate adjusted targets for each method
  const targetLump = getPreTaxTarget(targetAmount, 'lump');
  const targetSIP = getPreTaxTarget(targetAmount, 'sip');
  const targetStepUp = getPreTaxTarget(targetAmount, 'stepUp');

  // Calculations (Using Adjusted Targets)
  const requiredLump = getRequiredLumpSum(targetLump, effectiveRate, years);
  const requiredSIP = getRequiredSIP(targetSIP, effectiveRate, years);
  const requiredStepUp = getRequiredStepUpSIP(targetStepUp, effectiveRate, years, stepUpPercent);
  const isNegativeRealRate = effectiveRate <= 0 && isInflationAdjusted;

  // --- Generate Table Data ---
  const { lumpSumData, lumpSumMonthly, sipData, sipMonthly, stepUpData, stepUpMonthly } = useMemo(() => {
    // 1. Lump Sum
    const { rows: lData, monthlyRows: lDataMonthly } = computeYearlySchedule({
      lumpSum: requiredLump,
      monthlySIP: 0,
      stepUpPercent: 0,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    // 2. SIP
    const { rows: sData, monthlyRows: sDataMonthly } = computeYearlySchedule({
      lumpSum: 0,
      monthlySIP: requiredSIP,
      stepUpPercent: 0,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    // 3. Step-Up SIP
    const { rows: suData, monthlyRows: suDataMonthly } = computeYearlySchedule({
      lumpSum: 0,
      monthlySIP: requiredStepUp,
      stepUpPercent: stepUpPercent,
      annualRate: effectiveRate,
      totalYears: years,
      startDate
    });

    return {
      lumpSumData: lData, lumpSumMonthly: lDataMonthly,
      sipData: sData, sipMonthly: sDataMonthly,
      stepUpData: suData, stepUpMonthly: suDataMonthly
    };
  }, [years, effectiveRate, requiredLump, requiredSIP, requiredStepUp, stepUpPercent, startDate]);

  const inputs = (
    <div className="space-y-8">
      <InputWithSlider
        label="Target Amount"
        value={targetAmount}
        onChange={setTargetAmount}
        min={MIN_AMOUNT} max={TARGET_MAX_AMOUNT_GOAL_PLANNER} step={100000}
        currency={currency}
      />
      <InputWithSlider
        label="Time Period (Years)"
        value={years}
        onChange={setYears}
        min={MIN_YEARS} max={MAX_YEARS} step={1}
      />
      <InputWithSlider
        label="Expected Return (%)"
        value={annualRate}
        onChange={setAnnualRate}
        min={MIN_RATE} max={MAX_RATE} symbol="%"
      />
      <InputWithSlider
        label="Step-Up Percentage (%)"
        value={stepUpPercent}
        onChange={setStepUpPercent}
        min={LOC_MIN_STEP_UP} max={MAX_STEP_UP} symbol="%"
      />
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
      <InflationToggle
        isAdjusted={isInflationAdjusted}
        setIsAdjusted={setIsInflationAdjusted}
        rate={inflationRate}
        setRate={setInflationRate}
      />
      {isInflationAdjusted && isNegativeRealRate && (
        <div className="text-sm font-medium text-red-500 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
          ⚠️ Cannot reach goal: Real return is zero or negative.
        </div>
      )}
    </div>
  );

  const summary = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-indigo-600 uppercase">Option 1: One-time investment</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredLump), currency)}
          </div>
        </div>
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">Option 2: Monthly SIP</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredSIP), currency)}
          </div>
        </div>
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-rose-600 uppercase">Option 3: Step-Up SIP</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {moneyFormat(Math.round(requiredStepUp), currency)}
          </div>
          {stepUpPercent > 0 && (
            <p className="text-xs text-rose-700 mt-1 font-medium">Increases by {stepUpPercent}% every year</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      summary={summary}
      charts={
        <div className="mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Investment Path Comparison</h3>
          <FinancialLineChart
            data={{
              labels: lumpSumData.map(r => `Year ${r.year}`),
              datasets: [
                {
                  label: 'One-time Path',
                  data: lumpSumData.map(r => r.balance),
                  borderColor: '#6366F1',
                  backgroundColor: 'transparent',
                  tension: 0.4
                },
                {
                  label: 'SIP Path',
                  data: sipData.map(r => r.balance),
                  borderColor: '#10B981',
                  backgroundColor: 'transparent',
                  tension: 0.4
                },
                {
                  label: 'Step-Up Path',
                  data: stepUpData.map(r => r.balance),
                  borderColor: '#F43F5E',
                  backgroundColor: 'transparent',
                  tension: 0.4,
                  borderDash: [5, 5]
                }
              ]
            }}
            currency={currency}
            height={350}
          />
        </div>
      }
      table={
        <div className="mt-12 space-y-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Growth Schedules</h3>
            <div className="flex items-center">
              <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
              <div className="w-48">
                <MonthYearPicker
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-bold text-indigo-700">Option 1: Lump Sum Schedule</h4>
              <button
                onClick={() => {
                  const data = lumpSumData.map(r => [`Year ${r.year}`, Math.round(r.invested), Math.round(r.interestEarned), Math.round(r.balance)]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'goal_lumpsum_schedule.pdf');
                }}
                className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition-colors"
              >
                Export PDF
              </button>
            </div>
            <CollapsibleInvestmentTable
              yearlyData={lumpSumData}
              monthlyData={lumpSumMonthly}
              currency={currency}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-bold text-emerald-700">Option 2: SIP Schedule</h4>
              <button
                onClick={() => {
                  const data = sipData.map(r => [`Year ${r.year}`, Math.round(r.invested), Math.round(r.interestEarned), Math.round(r.balance)]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'goal_sip_schedule.pdf');
                }}
                className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors"
              >
                Export PDF
              </button>
            </div>
            <CollapsibleInvestmentTable
              yearlyData={sipData}
              monthlyData={sipMonthly}
              currency={currency}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-bold text-rose-700">Option 3: Step-Up SIP</h4>
              <button
                onClick={() => {
                  const data = stepUpData.map(r => [`Year ${r.year}`, Math.round(r.invested), Math.round(r.interestEarned), Math.round(r.balance)]);
                  downloadPDF(data, ['Year', 'Invested', 'Interest', 'Balance'], 'goal_stepup_schedule.pdf');
                }}
                className="text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-lg transition-colors"
              >
                Export PDF
              </button>
            </div>
            <CollapsibleInvestmentTable
              yearlyData={stepUpData}
              monthlyData={stepUpMonthly}
              currency={currency}
            />
          </div>
        </div>
      }
    />
  );
}