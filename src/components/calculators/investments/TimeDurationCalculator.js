import React, { useMemo, useState } from "react";
import CalculatorLayout from "../../common/CalculatorLayout";
import { useCalculatorState } from "../../../hooks/useCalculatorState";
import InputWithSlider from "../../common/InputWithSlider";
import { moneyFormat } from "../../../utils/formatting";
import { FinancialCompoundingBarChart, FinancialLineChart } from "../../common/FinancialCharts";
import UnifiedSummary from "../../common/UnifiedSummary";
import { calculatorDetails } from "../../../data/calculatorDetails";
import {
    DEFAULT_LUMP_SUM,
    DEFAULT_TARGET_AMOUNT,
    DEFAULT_RATE,
    MIN_AMOUNT,
    MAX_AMOUNT,
    MIN_RATE,
    MAX_RATE,
    MIN_SIP,
    MAX_SIP,
    STEP_SIP
} from "../../../utils/constants";
import { computeYearlySchedule, calculateInvestmentDuration } from "../../../utils/finance";

// Specialized constant for this calc if needed, otherwise reuse
const DEFAULT_PRINCIPAL = 500000;
const DEFAULT_TARGET = 1000000;

export default function TimeDurationCalculator({ currency }) {
    const {
        lumpSum: principal, setLumpSum: setPrincipal,
        targetAmount: target, setTargetAmount: setTarget,
        annualRate: rate, setAnnualRate: setRate,
        monthlySIP: sipAmount, setMonthlySIP: setSipAmount,
    } = useCalculatorState({
        lumpSum: DEFAULT_PRINCIPAL,
        targetAmount: DEFAULT_TARGET,
        annualRate: DEFAULT_RATE,
        monthlySIP: 5000
    });

    const [frequency, setFrequency] = useState('monthly'); // 'monthly', 'quarterly', 'half-yearly', 'yearly'

    // Calculate Durations Side-by-Side
    const results = useMemo(() => {
        // Strategy A: Lumpsum Only
        const durationA = calculateInvestmentDuration({
            principal,
            contribution: 0,
            target,
            annualRate: rate,
            frequency: 'monthly'
        });

        // Strategy B: SIP Only (No Lumpsum principal? Or Combined? User Said "Comparison", implying Alternatives)
        // Usually, SIP is an alternative to Lumpsum.
        // We calculate Pure SIP duration (assuming 0 Lumpsum).
        // OR should we allow mixing? "Lumpsum vs SIP".
        // Let's assume Comparison means: "Scenario A: I invest X Lumpsum. Scenario B: I invest Y SIP."
        const durationB = calculateInvestmentDuration({
            principal: 0, // Pure SIP comparison
            contribution: sipAmount,
            target,
            annualRate: rate,
            frequency
        });

        const formatDuration = (yearsDec) => {
            const years = Math.floor(yearsDec);
            const months = Math.round((yearsDec - years) * 12);
            return { years, months, totalYearsDec: yearsDec };
        };

        return {
            lumpsum: formatDuration(durationA),
            sip: formatDuration(durationB)
        };
    }, [principal, sipAmount, target, rate, frequency]);

    // Comparison Logic
    const comparisonText = useMemo(() => {
        const timeA = results.lumpsum.totalYearsDec;
        const timeB = results.sip.totalYearsDec;

        // If both are already reached or both are unreachable, don't show a winner
        if ((timeA === 0 && timeB === 0) || (timeA >= 999 && timeB >= 999)) return null;

        // If one is unreachable but the other is reachable, the reachable one wins
        if (timeA >= 999 && timeB < 999) return `SIP Strategy achieves the goal! Lumpsum cannot.`;
        if (timeB >= 999 && timeA < 999) return `Lumpsum Strategy achieves the goal! SIP cannot.`;

        // If both reachable, compare
        const diff = Math.abs(timeA - timeB);
        const diffYears = Math.floor(diff);
        const diffMonths = Math.round((diff - diffYears) * 12);

        const diffStr = `${diffYears > 0 ? `${diffYears} Yr` : ''} ${diffMonths} Mo`.trim();

        if (timeB < timeA) {
            return `SIP Strategy is faster by ${diffStr}!`;
        } else if (timeA < timeB) {
            return `Lumpsum Strategy is faster by ${diffStr}!`;
        } else {
            return `Both strategies take the same time.`;
        }

    }, [results]);


    // Generate chart data based on the LONGER duration to show full path
    const chartData = useMemo(() => {
        const duration = Math.max(results.lumpsum.totalYearsDec, results.sip.totalYearsDec);
        const safeDuration = (duration > 50 ? 50 : duration) || 1; // Cap at 50 to see reasonable chart

        // Ensure minimal duration for chart visualization even if goal is met immediately
        const processingDuration = Math.max(safeDuration, 1);

        // Curve A: Lumpsum
        const { rows: rowsA } = computeYearlySchedule({
            lumpSum: Number(principal),
            monthlySIP: 0,
            annualRate: Number(rate),
            totalYears: processingDuration,
        });

        // Curve B: SIP
        let equivalentMonthlySIP = Number(sipAmount);
        if (frequency === 'quarterly') equivalentMonthlySIP = Number(sipAmount) / 3;
        if (frequency === 'half-yearly') equivalentMonthlySIP = Number(sipAmount) / 6;
        if (frequency === 'yearly') equivalentMonthlySIP = Number(sipAmount) / 12;

        const { rows: rowsB } = computeYearlySchedule({
            lumpSum: 0,
            monthlySIP: equivalentMonthlySIP,
            annualRate: Number(rate),
            totalYears: processingDuration,
        });

        // Merge Data safely
        const length = Math.max(rowsA.length, rowsB.length);
        const merged = [];
        for (let i = 0; i < length; i++) {
            const year = (rowsA[i]?.year) || (rowsB[i]?.year) || (i + 1);
            // Default to starting values (Principal or 0) if row missing
            const valA = rowsA[i] ? rowsA[i].overallValue : (Number(principal) * Math.pow(1 + Number(rate) / 100, i + 1));
            const valB = rowsB[i] ? rowsB[i].overallValue : 0;

            merged.push({
                year,
                lumpSumValue: valA,
                sipValue: valB
            });
        }
        return merged;

    }, [principal, sipAmount, rate, results, frequency]);

    const inputs = (
        <div className="space-y-8">
            <InputWithSlider
                label="Target Future Value"
                value={target}
                onChange={setTarget}
                min={MAX_AMOUNT / 10}
                max={MAX_AMOUNT * 5}
                step={10000}
                currency={currency}
            />
            <InputWithSlider
                label="Expected Return (%)"
                value={rate}
                onChange={setRate}
                min={MIN_RATE}
                max={MAX_RATE}
                symbol="%"
                step={0.1}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Strategy A */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-3">Strategy A: Lumpsum</span>
                    <InputWithSlider
                        label="Lumpsum Amount"
                        value={principal}
                        onChange={setPrincipal}
                        min={MIN_AMOUNT}
                        max={MAX_AMOUNT}
                        step={1000}
                        currency={currency}
                    />
                </div>

                {/* Strategy B */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-3">Strategy B: SIP</span>
                    <InputWithSlider
                        label="SIP Amount"
                        value={sipAmount}
                        onChange={setSipAmount}
                        min={MIN_SIP}
                        max={MAX_SIP}
                        step={STEP_SIP}
                        currency={currency}
                    />
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1 pointer-events-none">Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="half-yearly">Half-Yearly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>
    );

    const summary = (
        <div className="space-y-4">
            <div className={`p-4 rounded-xl text-center border-2 ${results.lumpsum.totalYearsDec < results.sip.totalYearsDec ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
                <div className="text-xs font-bold text-gray-400 uppercase">Strategy A (Lumpsum)</div>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                    {results.lumpsum.totalYearsDec >= 999 ? "Goal Unreachable" : `${results.lumpsum.years}y ${results.lumpsum.months}m`}
                </div>
            </div>
            <div className={`p-4 rounded-xl text-center border-2 ${results.sip.totalYearsDec < results.lumpsum.totalYearsDec ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
                <div className="text-xs font-bold text-gray-400 uppercase">Strategy B ({frequency} SIP)</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {results.sip.totalYearsDec >= 999 ? "Goal Unreachable" : `${results.sip.years}y ${results.sip.months}m`}
                </div>
            </div>

            {comparisonText && (
                <div className="mt-4 p-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center rounded-lg shadow-sm text-sm font-bold animate-fade-in">
                    🚀 {comparisonText}
                </div>
            )}
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Growth Comparison</h3>
                    <FinancialLineChart
                        data={{
                            labels: chartData.map(r => `Year ${r.year}`),
                            datasets: [
                                {
                                    label: 'Lumpsum Path',
                                    data: chartData.map(r => r.lumpSumValue),
                                    borderColor: '#3B82F6', // Secondary (Blue)
                                    backgroundColor: '#3B82F6',
                                    borderWidth: 3,
                                    pointRadius: 2,
                                    tension: 0.4,
                                    fill: false
                                },
                                {
                                    label: `SIP Path`,
                                    data: chartData.map(r => r.sipValue),
                                    borderColor: '#0f766e', // Primary (Teal)
                                    backgroundColor: '#0f766e',
                                    borderWidth: 3,
                                    pointRadius: 2,
                                    tension: 0.4,
                                    fill: false
                                },
                                {
                                    label: 'Target Goal',
                                    data: chartData.map(() => target),
                                    borderColor: '#EF4444', // Danger (Red) - High Visibility
                                    borderWidth: 3,
                                    pointRadius: 0,
                                    fill: false,
                                    labelOffset: 10
                                }
                            ]
                        }}
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grace: '10%' // Adds 10% space above the max value to ensure Target line is visible
                                }
                            }
                        }}
                        currency={currency}
                    />
                </div>
            }
            details={calculatorDetails['time-to-goal']?.render?.()}
        />
    );
}
