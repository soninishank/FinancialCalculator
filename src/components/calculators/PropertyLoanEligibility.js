import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import { FinancialDoughnutChart } from "../common/FinancialCharts";
import InputWithSlider from "../common/InputWithSlider";
import CalculatorLayout from "./CalculatorLayout";
import { moneyFormat } from "../../utils/formatting";
import {
    DEFAULT_LOAN_RATE,
    DEFAULT_LOAN_TENURE,
    MIN_RATE,
    MAX_RATE,
    MAX_LOAN
} from "../../utils/constants";

export default function PropertyLoanEligibility({ currency }) {
    // --- INPUT STATES ---
    const [propertyValue, setPropertyValue] = useState(5000000); // 50L Default
    const [selfIncome, setSelfIncome] = useState(75000);
    const [coIncome, setCoIncome] = useState(0);
    const [existingEmi, setExistingEmi] = useState(0);
    const [years, setYears] = useState(DEFAULT_LOAN_TENURE);
    const [rate, setRate] = useState(DEFAULT_LOAN_RATE);
    const [foir] = useState(50);

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        const propVal = Number(propertyValue);
        const totalIncome = Number(selfIncome) + Number(coIncome);
        const oldEmi = Number(existingEmi);
        const f = Number(foir) / 100;
        const R = Number(rate) / 12 / 100;
        const n = Number(years) * 12;

        // 1. LTV Limit (Bank Rule)
        // < 30L: 90%, 30-75: 80%, > 75: 75%
        let ltvPercent = 75;
        if (propVal <= 3000000) ltvPercent = 90;
        else if (propVal <= 7500000) ltvPercent = 80;

        const maxLtvLoan = propVal * (ltvPercent / 100);

        // 2. Income Limit
        const totalMaxEmi = totalIncome * f;
        const eligibleEmi = Math.max(0, totalMaxEmi - oldEmi);

        let maxIncomeLoan = 0;
        if (eligibleEmi > 0 && R > 0) {
            maxIncomeLoan = eligibleEmi * (1 - Math.pow(1 + R, -n)) / R;
        } else if (eligibleEmi > 0 && R === 0) {
            maxIncomeLoan = eligibleEmi * n;
        }

        // 3. Final Eligibility (Min of both)
        const finalLoan = Math.min(maxLtvLoan, maxIncomeLoan);
        const downpaymentNeeded = propVal - finalLoan;

        // 4. Analysis
        const isFundingPropLimited = maxLtvLoan < maxIncomeLoan;
        const shortfall = maxIncomeLoan < maxLtvLoan ? (maxLtvLoan - maxIncomeLoan) : 0;

        return {
            propVal,
            ltvPercent,
            maxLtvLoan,
            maxIncomeLoan,
            finalLoan,
            downpaymentNeeded,
            isFundingPropLimited,
            shortfall,
            eligibleEmi
        };
    }, [propertyValue, selfIncome, coIncome, existingEmi, years, rate, foir]);

    const {
        propVal, ltvPercent, maxLtvLoan, maxIncomeLoan, finalLoan,
        downpaymentNeeded, isFundingPropLimited, shortfall, eligibleEmi
    } = results;

    // --- UI SECTIONS ---
    const inputsSection = (
        <div className="space-y-6">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Property Details
                </h4>
                <InputWithSlider
                    label="Property Value"
                    value={propertyValue}
                    onChange={setPropertyValue}
                    min={500000} max={MAX_LOAN} step={100000}
                    currency={currency}
                />
                <div className="mt-2 text-[11px] text-indigo-600 font-medium italic">
                    *Bank Funding Limit (LTV): {ltvPercent}% of property value
                </div>
            </div>

            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                <h4 className="text-sm font-bold text-teal-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Income Details
                </h4>
                <InputWithSlider
                    label="Primary Applicant Income (Monthly)"
                    value={selfIncome}
                    onChange={setSelfIncome}
                    min={5000} max={1000000} step={5000}
                    currency={currency}
                />
                <InputWithSlider
                    label="Co-Applicant Income (Optional)"
                    value={coIncome}
                    onChange={setCoIncome}
                    min={0} max={1000000} step={5000}
                    currency={currency}
                />
                <InputWithSlider
                    label="Existing EMIs"
                    value={existingEmi}
                    onChange={setExistingEmi}
                    min={0} max={500000} step={1000}
                    currency={currency}
                />
            </div>

            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithSlider
                    label="Rate (%)"
                    value={rate}
                    onChange={setRate}
                    min={MIN_RATE} max={MAX_RATE} step={0.1}
                    symbol="%" isDecimal={true}
                />
                <InputWithSlider
                    label="Tenure (Y)"
                    value={years}
                    onChange={setYears}
                    min={1} max={30} step={1}
                />
            </div>
        </div>
    );

    const summarySection = (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Max Funding</div>
                    <div className="text-2xl font-black text-teal-600">{moneyFormat(finalLoan, currency)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Based on Min(Income, LTV)</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Downpayment</div>
                    <div className="text-2xl font-black text-indigo-600">{moneyFormat(downpaymentNeeded, currency)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Total Cash Needed</div>
                </div>
            </div>

            {/* RM Dashboard / Insight Box */}
            <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-400 mb-4 italic">RM Deal Insight</h3>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-gray-700 pb-3">
                            <div>
                                <div className="text-xs text-gray-400">Funding Limit (LTV)</div>
                                <div className="text-lg font-bold">{moneyFormat(maxLtvLoan, currency)} <span className="text-[10px] font-normal text-gray-500">@{ltvPercent}%</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400">Repayment Capacity</div>
                                <div className="text-lg font-bold">{moneyFormat(maxIncomeLoan, currency)}</div>
                            </div>
                        </div>

                        {isFundingPropLimited ? (
                            <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl">
                                <p className="text-xs leading-relaxed text-teal-100">
                                    <span className="font-bold text-teal-400">Deal Status: High Surplus.</span> The client's income allows for a higher loan, but the physical property value limits the funding. Suggest a more expensive property!
                                </p>
                            </div>
                        ) : (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                <p className="text-xs leading-relaxed text-rose-100">
                                    <span className="font-bold text-rose-400">Funding Shortfall: {moneyFormat(shortfall, currency)}.</span> The property qualifies for more, but the client's current income is insufficient.
                                    <strong className="block mt-1 text-white underline">RM Action: Add Co-applicant or Increase Tenure.</strong>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputsSection}
            summary={summarySection}
            charts={
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-8">
                    <h3 className="text-gray-800 font-bold text-lg mb-8 italic">Eligibility Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="h-64 relative flex items-center justify-center">
                            <div className="w-56 h-56">
                                <FinancialDoughnutChart
                                    data={{
                                        labels: ['Loan Funding', 'Your Contribution'],
                                        datasets: [{
                                            data: [finalLoan, downpaymentNeeded],
                                            backgroundColor: ['#14B8A6', '#6366F1'],
                                            borderWidth: 0,
                                            hoverOffset: 15
                                        }]
                                    }}
                                    options={{
                                        plugins: { legend: { display: false } },
                                        cutout: '80%'
                                    }}
                                />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan %</span>
                                <span className="text-xl font-black text-gray-800">{Math.round((finalLoan / propVal) * 100)}%</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-teal-500 shadow-lg shadow-teal-500/20"></div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 font-bold uppercase">Authorized Loan</div>
                                    <div className="text-xl font-bold text-gray-800">{moneyFormat(finalLoan, currency)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20"></div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 font-bold uppercase">Upfront Cash</div>
                                    <div className="text-xl font-bold text-gray-800">{moneyFormat(downpaymentNeeded, currency)}</div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">EMI Breakdown</div>
                                <div className="text-2xl font-black text-teal-600 italic">
                                    {moneyFormat(eligibleEmi, currency)} <span className="text-xs font-normal text-gray-400">/ month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
