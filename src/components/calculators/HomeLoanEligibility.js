import React, { useMemo, useState } from "react";

// --- IMPORTS ---
import SummaryCards from "../common/SummaryCards";
import { FinancialDoughnutChart, FinancialBarChart } from "../common/FinancialCharts";
import CollapsibleAmortizationTable from "../common/CollapsibleAmortizationTable";
import InputWithSlider from "../common/InputWithSlider";
import CalculatorLayout from "../common/CalculatorLayout";
import { moneyFormat } from "../../utils/formatting";
import { downloadPDF } from "../../utils/export";
import {
    MIN_RATE,
    MAX_RATE,
    DEFAULT_RATE
} from "../../utils/constants";

const DEFAULT_SALARY = 100000;
const DEFAULT_EXISTING_EMI = 0;
const DEFAULT_TENURE = 20;

export default function HomeLoanEligibility({ currency, setCurrency }) {
    // Inputs (Using a mix of custom local state and defaults)
    const [salary, setSalary] = useState(DEFAULT_SALARY);
    const [existingEmi, setExistingEmi] = useState(DEFAULT_EXISTING_EMI);
    const [years, setYears] = useState(DEFAULT_TENURE);
    const [annualRate, setAnnualRate] = useState(DEFAULT_RATE);
    const [foir, setFoir] = useState(50); // Fixed Obligation to Income Ratio (50% default)

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        const S = Number(salary);
        const E_old = Number(existingEmi);
        const f = Number(foir) / 100;
        const R = Number(annualRate) / 12 / 100;
        const n = Number(years) * 12;

        const maxTotalEmi = S * f;
        const eligibleEmi = Math.max(0, maxTotalEmi - E_old);

        let maxLoan = 0;
        if (eligibleEmi > 0 && R > 0) {
            maxLoan = eligibleEmi * (1 - Math.pow(1 + R, -n)) / R;
        } else if (eligibleEmi > 0 && R === 0) {
            maxLoan = eligibleEmi * n;
        }

        // Generate Amortization for the eligible loan
        const yearlyRows = [];
        if (maxLoan > 0) {
            let balance = maxLoan;
            for (let y = 1; y <= Number(years); y++) {
                let yearlyInterest = 0;
                let yearlyPrincipal = 0;
                let openingBalance = balance;

                for (let m = 1; m <= 12; m++) {
                    const interest = balance * R;
                    const principal = eligibleEmi - interest;

                    yearlyInterest += interest;
                    yearlyPrincipal += Math.min(balance, principal);
                    balance -= Math.min(balance, principal);
                }

                yearlyRows.push({
                    year: y,
                    openingBalance: openingBalance,
                    principalPaid: yearlyPrincipal,
                    interestPaid: yearlyInterest,
                    totalPaid: yearlyPrincipal + yearlyInterest,
                    remainingBalance: Math.max(0, balance),
                    closingBalance: Math.max(0, balance) // Alias for compatibility
                });
            }
        }

        return {
            salary: S,
            eligibleEmi,
            existingEmi: E_old,
            maxLoan,
            yearlyRows,
            totalInterest: yearlyRows.reduce((sum, r) => sum + r.interestPaid, 0)
        };
    }, [salary, existingEmi, years, annualRate, foir]);

    const { salary: numSalary, eligibleEmi, existingEmi: numExistingEmi, maxLoan, yearlyRows, totalInterest } = results;

    // --- PDF EXPORT ---
    function handleExport() {
        const header = ["Year", "Principal Paid", "Interest Paid", "Total Payment", "Balance"];
        const rows = yearlyRows.map((r) => [
            `Year ${r.year}`,
            moneyFormat(r.principalPaid, currency),
            moneyFormat(r.interestPaid, currency),
            moneyFormat(r.totalPaid, currency),
            moneyFormat(r.remainingBalance, currency),
        ]);
        downloadPDF(rows, header, "home_loan_eligibility_report.pdf");
    }

    // --- CHART DATA ---
    const allocationData = useMemo(() => ({
        labels: ["Eligible EMI", "Existing EMIs", "Remaining Disposable Income"],
        datasets: [{
            data: [
                eligibleEmi,
                numExistingEmi,
                Math.max(0, numSalary - eligibleEmi - numExistingEmi)
            ],
            backgroundColor: ["#14B8A6", "#F43F5E", "#FBBF24"],
            borderWidth: 0,
        }]
    }), [eligibleEmi, numExistingEmi, numSalary]);

    const growthData = useMemo(() => ({
        labels: yearlyRows.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: "Principal Paid",
                data: yearlyRows.map(r => r.principalPaid),
                backgroundColor: "#818CF8",
            },
            {
                label: "Interest Paid",
                data: yearlyRows.map(r => r.interestPaid),
                backgroundColor: "#F87171",
            }
        ]
    }), [yearlyRows]);

    // --- UI PARTS ---
    const inputsSection = (
        <>
            <InputWithSlider
                label="Monthly Salary"
                value={salary}
                onChange={setSalary}
                min={10000} max={1000000} step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Existing Monthly EMIs"
                value={existingEmi}
                onChange={setExistingEmi}
                min={0} max={500000} step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Interest Rate (%)"
                value={annualRate}
                onChange={setAnnualRate}
                min={MIN_RATE} max={MAX_RATE} step={0.1}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Loan Tenure (Years)"
                value={years}
                onChange={setYears}
                min={1} max={30} step={1}
            />

            <div className="md:col-span-2">
                <InputWithSlider
                    label="Bank's FOIR Limit (%)"
                    value={foir}
                    onChange={setFoir}
                    min={30} max={70} step={5}
                    symbol="%"
                />
                <p className="text-[11px] text-gray-500 mt-2 italic">
                    *FOIR (Fixed Obligation to Income Ratio) is the percentage of your salary that banks allow for all EMIs. 50% is standard.
                </p>
            </div>
        </>
    );

    const summarySection = (
        <SummaryCards
            invested={maxLoan}
            totalValue={maxLoan + totalInterest}
            gain={totalInterest}
            currency={currency}
            // Overriding labels for clarity in a loan context
            customLabels={{
                invested: "Max Eligible Loan",
                totalValue: "Total Repayment",
                gain: "Total Interest Paid"
            }}
        />
    );

    return (
        <CalculatorLayout
            inputs={inputsSection}
            summary={summarySection}
            charts={
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                    <h3 className="text-gray-800 font-bold text-lg mb-6">Repayment Schedule</h3>
                    <FinancialBarChart
                        data={growthData}
                        currency={currency}
                        options={{
                            scales: {
                                x: { stacked: true },
                                y: { stacked: true }
                            }
                        }}
                    />
                </div>
            }
            pieChart={
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <h3 className="text-gray-500 font-medium mb-6 text-sm uppercase tracking-wide self-start pl-2">
                        Income Allocation
                    </h3>

                    <div className="relative h-64 w-64 mb-8">
                        <FinancialDoughnutChart
                            data={allocationData}
                            currency={currency}
                            height={256}
                            options={{
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { enabled: true }
                                },
                                cutout: "82%"
                            }}
                        />

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Eligible EMI
                            </span>
                            <span className="text-2xl font-extrabold text-teal-600">
                                {moneyFormat(eligibleEmi, currency, true)}
                            </span>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#14B8A6]"></div>
                            <div className="flex-1 flex justify-between text-sm">
                                <span className="text-gray-500">Eligible EMI</span>
                                <span className="font-bold text-gray-800">{moneyFormat(eligibleEmi, currency)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#F43F5E]"></div>
                            <div className="flex-1 flex justify-between text-sm">
                                <span className="text-gray-500">Existing EMIs</span>
                                <span className="font-bold text-gray-800">{moneyFormat(numExistingEmi, currency)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div>
                            <div className="flex-1 flex justify-between text-sm">
                                <span className="text-gray-500">Remaining</span>
                                <span className="font-bold text-gray-800">{moneyFormat(Math.max(0, numSalary - eligibleEmi - numExistingEmi), currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
            table={
                <div className="mt-8">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleExport}
                            className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            Download PDF report
                        </button>
                    </div>
                    <CollapsibleAmortizationTable
                        yearlyData={yearlyRows}
                        monthlyData={[]} // No monthly breakdown in this eligible calc
                        currency={currency}
                    />
                </div>
            }
        />
    );
}
