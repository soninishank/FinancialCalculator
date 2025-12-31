import React, { useMemo } from "react";
import CalculatorLayout from "../common/CalculatorLayout";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import InputWithSlider from "../common/InputWithSlider";
import { moneyFormat } from "../../utils/formatting";
import { FinancialCompoundingBarChart } from "../common/FinancialCharts";
import UnifiedSummary from "../common/UnifiedSummary";
import { calculatorDetails } from "../../data/calculatorDetails";
import {
    DEFAULT_LUMP_SUM,
    DEFAULT_TARGET_AMOUNT,
    DEFAULT_RATE,
    MIN_AMOUNT,
    MAX_AMOUNT,
    MIN_RATE,
    MAX_RATE
} from "../../utils/constants";
import { computeYearlySchedule } from "../../utils/finance";

// Specialized constant for this calc if needed, otherwise reuse
const DEFAULT_PRINCIPAL = 100000;
const DEFAULT_TARGET = 500000;

export default function TimeDurationCalculator({ currency }) {
    const {
        lumpSum: principal, setLumpSum: setPrincipal,
        targetAmount: target, setTargetAmount: setTarget,
        annualRate: rate, setAnnualRate: setRate
    } = useCalculatorState({
        lumpSum: DEFAULT_PRINCIPAL,
        targetAmount: DEFAULT_TARGET,
        annualRate: DEFAULT_RATE
    });

    // Calculate Duration
    const calculationResult = useMemo(() => {
        const P = Number(principal);
        const A = Number(target);
        const r = Number(rate) / 100;

        if (P >= A) return { years: 0, months: 0, totalYearsDec: 0 };
        if (r <= 0) return { years: 999, months: 0, totalYearsDec: 999 }; // Avoid infinity

        // A = P * (1+r)^t
        // A/P = (1+r)^t
        // ln(A/P) = t * ln(1+r)
        // t = ln(A/P) / ln(1+r)

        const t = Math.log(A / P) / Math.log(1 + r);

        const years = Math.floor(t);
        const months = Math.round((t - years) * 12);

        return { years, months, totalYearsDec: t };
    }, [principal, target, rate]);

    // Generate chart data based on the calculated time
    const chartData = useMemo(() => {
        const duration = Math.ceil(calculationResult.totalYearsDec);
        // Cap duration for chart performance if it's crazy high (e.g. > 100 years)
        const safeDuration = duration > 100 ? 100 : duration;

        const { rows } = computeYearlySchedule({
            monthlySIP: 0,
            lumpSum: Number(principal),
            annualRate: Number(rate),
            totalYears: safeDuration,
        });
        return rows;
    }, [principal, rate, calculationResult.totalYearsDec]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Present Principal Amount"
                value={principal}
                onChange={setPrincipal}
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={1000}
                currency={currency}
            />
            <InputWithSlider
                label="Target Future Value"
                value={target}
                onChange={setTarget}
                min={(Number(principal) || 0) + 1000} // Target must be > Principal
                max={MAX_AMOUNT * 10} // Allow larger targets
                step={10000}
                currency={currency}
            />
            <InputWithSlider
                label="Expected Annual Return (%)"
                value={rate}
                onChange={setRate}
                min={MIN_RATE}
                max={MAX_RATE}
                symbol="%"
                step={0.1}
            />
            {Number(target) <= Number(principal) && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                    Target amount must be greater than the principal amount to calculate duration.
                </div>
            )}
        </div>
    );

    const summary = (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Time to Reach Goal
            </div>
            <div className="text-4xl font-extrabold text-teal-600 mb-2">
                {calculationResult.years} <span className="text-2xl text-teal-500 font-bold">Years</span> {calculationResult.months > 0 && <>{calculationResult.months} <span className="text-2xl text-teal-500 font-bold">Months</span></>}
            </div>
            <div className="text-gray-600 mt-4 text-sm">
                To grow <span className="font-bold text-gray-900">{moneyFormat(principal, currency, "word")}</span> to <span className="font-bold text-gray-900">{moneyFormat(target, currency, "word")}</span> at <span className="font-bold text-gray-900">{rate}%</span> per year.
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Projected Growth Path</h3>
                    <FinancialCompoundingBarChart data={chartData} currency={currency} />
                </div>
            }
            details={calculatorDetails['time-to-goal']?.render?.()}
        />
    );
}
