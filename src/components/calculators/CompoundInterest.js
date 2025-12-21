import React, { useMemo } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from "../common/FinancialCharts";
import ResultsTable from "../common/ResultsTable";
import InputWithSlider from "../common/InputWithSlider";
import RateQualityGuard from "../common/RateQualityGuard";
import TaxToggle from "../common/TaxToggle";
import InflationToggle from "../common/InflationToggle";
import CalculatorLayout from "./CalculatorLayout";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import { downloadPDF } from "../../utils/export";
import { calculateRealValue } from "../../utils/finance";
import { calculateLTCG } from "../../utils/tax";
import {
    DEFAULT_LUMP_SUM,
    DEFAULT_TENURE_YEARS,
    DEFAULT_RATE,
    MIN_AMOUNT,
    MIN_YEARS,
    MIN_RATE,
    MAX_AMOUNT,
    MAX_YEARS,
    MAX_RATE,
    STEP_AMOUNT,
    DEFAULT_INFLATION
} from "../../utils/constants";

const COMPOUND_FREQUENCIES = [
    { label: 'Monthly', value: 12 },
    { label: 'Quarterly', value: 4 },
    { label: 'Half-Yearly', value: 2 },
    { label: 'Yearly', value: 1 },
];

export default function CompoundInterest({ currency, setCurrency }) {
    // --- STATE ---
    const {
        lumpSum, setLumpSum,
        annualRate, setAnnualRate,
        years, setYears,
        isTaxApplied, setIsTaxApplied,
        ltcgRate, setLtcgRate,
        isExemptionApplied, setIsExemptionApplied,
        exemptionLimit, setExemptionLimit,
        isInflationAdjusted, setIsInflationAdjusted,
        inflationRate, setInflationRate,
        compoundingFrequency, setCompoundingFrequency,
    } = useCalculatorState({
        lumpSum: DEFAULT_LUMP_SUM,
        annualRate: DEFAULT_RATE,
        years: DEFAULT_TENURE_YEARS,
        inflationRate: DEFAULT_INFLATION,
        compoundingFrequency: 1, // Default to yearly
    });

    // --- CALCULATIONS ---
    const yearlyRows = useMemo(() => {
        const P = Number(lumpSum);
        const r = Number(annualRate) / 100;
        const n = Number(compoundingFrequency);
        const t_total = Number(years);

        const rows = [];
        const fullYears = Math.floor(t_total);

        for (let y = 1; y <= fullYears; y++) {
            // Amount A = P(1 + r/n)^(n*t)
            const amount = P * Math.pow(1 + r / n, n * y);
            rows.push({
                year: y,
                totalInvested: P,
                lumpSum: P,
                growth: amount - P,
                overallValue: amount,
            });
        }

        // Handle partial last year if any
        if (t_total > fullYears) {
            const amount = P * Math.pow(1 + r / n, n * t_total);
            rows.push({
                year: parseFloat(t_total.toFixed(1)),
                totalInvested: P,
                lumpSum: P,
                growth: amount - P,
                overallValue: amount,
            });
        }

        return rows;
    }, [lumpSum, annualRate, years, compoundingFrequency]);

    const lastRow = yearlyRows[yearlyRows.length - 1] || { totalInvested: 0, overallValue: 0 };
    const investedTotal = lastRow.totalInvested;
    const totalFuture = lastRow.overallValue;
    const gain = totalFuture - investedTotal;

    // --- TAX CALCULATION ---
    const taxResult = calculateLTCG(gain, investedTotal, isTaxApplied, {
        taxRate: Number(ltcgRate),
        currency,
        exemptionApplied: Boolean(isExemptionApplied),
        exemptionLimit: Number(exemptionLimit) || 0,
    });

    const taxAmount = taxResult?.taxAmount ?? 0;
    const netGain = taxResult?.netGain ?? gain - (taxResult?.taxAmount ?? 0);
    const netFutureValue = taxResult?.netFutureValue ?? totalFuture - (taxResult?.taxAmount ?? 0);

    // --- INFLATION CALCULATION ---
    const realValue = useMemo(() => {
        return calculateRealValue(totalFuture, inflationRate, years);
    }, [totalFuture, inflationRate, years]);

    function handleExport() {
        const header = ["Year", "Total Invested", "Principal", "Interest Earned", "Total Value"];
        const rows = yearlyRows.map((r) => [
            `Year ${r.year}`, Math.round(r.totalInvested), Math.round(r.lumpSum), Math.round(r.growth), Math.round(r.overallValue),
        ]);
        downloadPDF(rows, header, "compound_interest_report.pdf");
    }

    // --- UI PARTS ---
    const inputsSection = (
        <>
            <InputWithSlider
                label="Principal Amount"
                value={lumpSum}
                onChange={setLumpSum}
                min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
                currency={currency}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                <InputWithSlider
                    label="Tenure (Years)"
                    value={years}
                    onChange={setYears}
                    min={MIN_YEARS} max={MAX_YEARS} step={0.5}
                    isDecimal={true}
                />

                <div className="flex flex-col">
                    {/* Consistent label height to match sibling InputWithSlider */}
                    <div className="flex justify-between items-end mb-1 h-7">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Compounding Frequency</label>
                    </div>
                    <div className="relative">
                        <select
                            value={compoundingFrequency}
                            onChange={(e) => setCompoundingFrequency(Number(e.target.value))}
                            className="w-full py-2.5 sm:py-3 pl-4 pr-10 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-semibold text-gray-900 text-base sm:text-lg bg-white appearance-none cursor-pointer"
                        >
                            {COMPOUND_FREQUENCIES.map((freq) => (
                                <option key={freq.value} value={freq.value}>
                                    {freq.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {/* Visual spacer to match the slider height in the sibling component */}
                    <div className="mt-3 h-[24px] sm:h-[32px] hidden md:block"></div>
                </div>
            </div>

            <div className="md:col-span-2">
                <InputWithSlider
                    label="Interest Rate (%)"
                    value={annualRate}
                    onChange={setAnnualRate}
                    min={MIN_RATE} max={MAX_RATE} step={0.1}
                    symbol="%"
                    isDecimal={true}
                />
                <RateQualityGuard rate={annualRate} />

                <div className="mt-6 flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
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
                    <div className="flex-1">
                        <InflationToggle
                            isAdjusted={isInflationAdjusted}
                            setIsAdjusted={setIsInflationAdjusted}
                            rate={inflationRate}
                            setRate={setInflationRate}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputsSection}
            summary={
                <SummaryCards
                    totalValue={totalFuture}
                    invested={investedTotal}
                    gain={gain}
                    currency={currency}
                    {...(isTaxApplied
                        ? {
                            tax: {
                                applied: true,
                                postTaxValue: netFutureValue,
                                postTaxGain: netGain,
                                taxDeducted: taxAmount,
                            },
                        }
                        : {})}
                    {...(isInflationAdjusted
                        ? {
                            inflation: {
                                applied: true,
                                realValue: realValue,
                                inflationRate: inflationRate,
                            },
                        }
                        : {})}
                />
            }
            charts={<FinancialCompoundingBarChart data={yearlyRows} currency={currency} />}
            pieChart={
                <FinancialInvestmentPieChart
                    invested={investedTotal}
                    gain={gain}
                    total={totalFuture}
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
