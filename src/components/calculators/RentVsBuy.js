import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
import { computeRentVsBuyLedger } from '../../utils/finance';
import { moneyFormat } from '../../utils/formatting';
import { downloadPDF } from '../../utils/export';
import { FinancialLineChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import {
    DEFAULT_LOAN_RATE,
    DEFAULT_INFLATION,
    DEFAULT_RATE,
    DEFAULT_HOME_PRICE,
    DEFAULT_DOWN_PAYMENT,
    DEFAULT_RENT,
    MIN_RENT,
    MAX_RENT,
    MAX_AMOUNT, // Using MAX_AMOUNT (10Cr) or MAX_HOME_PRICE? Using MAX_AMOUNT for now.
    // MAX_LOAN unused
    STEP_LARGE,
    STEP_MEDIUM,
    CHART_COLORS,
    STEP_AMOUNT
} from '../../utils/constants';

export default function RentVsBuy({ currency }) {
    // Buy Inputs
    const [homePrice, setHomePrice] = useState(DEFAULT_HOME_PRICE);
    const [downPayment, setDownPayment] = useState(DEFAULT_DOWN_PAYMENT);
    const [loanRate, setLoanRate] = useState(DEFAULT_LOAN_RATE);
    const [loanTenure, setLoanTenure] = useState(20);
    const [appreciation, setAppreciation] = useState(5); // 5% property growth

    // Rent Inputs
    const [monthlyRent, setMonthlyRent] = useState(DEFAULT_RENT);
    const [rentInflation, setRentInflation] = useState(DEFAULT_INFLATION);
    const [investmentReturn, setInvestmentReturn] = useState(DEFAULT_RATE);
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7));

    const { yearlyLedger, monthlyLedger } = useMemo(() => {
        const result = computeRentVsBuyLedger({
            homePrice,
            downPayment,
            loanRate,
            loanTenureYears: loanTenure,
            monthlyRent,
            investReturnRate: investmentReturn,
            propertyAppreciationRate: appreciation,
            rentInflationRate: rentInflation,
            startDate // Pass start date
        });

        // Post-process for UI needs (diff calculation for diff column)
        const activeYearly = result.yearlyLedger.map(r => ({
            ...r,
            diff: Math.abs(r.netWorthBuy - r.netWorthRent)
        }));

        return {
            yearlyLedger: activeYearly,
            monthlyLedger: result.monthlyLedger
        };
    }, [homePrice, downPayment, loanRate, loanTenure, appreciation, monthlyRent, rentInflation, investmentReturn, startDate]);

    const finalYear = yearlyLedger[yearlyLedger.length - 1]; // Use new yearlyLedger name
    const isBuyBetter = finalYear ? finalYear.netWorthBuy > finalYear.netWorthRent : false;
    const difference = finalYear ? Math.abs(finalYear.netWorthBuy - finalYear.netWorthRent) : 0;

    const chartData = {
        labels: yearlyLedger.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Net Worth (Buying)',
                data: yearlyLedger.map(r => r.netWorthBuy),
                borderColor: CHART_COLORS.SUCCESS,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Net Worth (Renting + Investing)',
                data: yearlyLedger.map(r => r.netWorthRent),
                borderColor: CHART_COLORS.SECONDARY,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: { ticks: { maxTicksLimit: 6 } }
        },
        plugins: {
            tooltip: { // Extending common tooltip
                callbacks: {
                    label: (context) => ` ${context.dataset.label}: ${moneyFormat(context.raw, currency)}`
                }
            }
        }
    };

    const inputs = (
        <>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                <h4 className="text-teal-700 font-bold mb-4">🏠 Buying Scenario</h4>
                <div className="mb-6">
                    <MonthYearPicker
                        label="Start Month & Year"
                        value={startDate}
                        onChange={setStartDate}
                    />
                </div>
                <InputWithSlider
                    label="Property Price"
                    value={homePrice}
                    onChange={setHomePrice}
                    min={2000000} max={MAX_AMOUNT} step={STEP_LARGE}
                    currency={currency}
                />
                <InputWithSlider
                    label="Down Payment"
                    value={downPayment}
                    onChange={setDownPayment}
                    min={0} max={homePrice} step={STEP_MEDIUM}
                    currency={currency}
                />
                <div className="grid grid-cols-2 gap-4">
                    <InputWithSlider
                        label="Loan Rate (%)"
                        value={loanRate}
                        onChange={setLoanRate}
                        min={5} max={15} step={0.1}
                    />
                    <InputWithSlider
                        label="Tenure (Years)"
                        value={loanTenure}
                        onChange={setLoanTenure}
                        min={5} max={30} step={1}
                    />
                </div>
                <InputWithSlider
                    label="Property Appreciation (%)"
                    value={appreciation}
                    onChange={setAppreciation}
                    min={0} max={12} step={0.1}
                />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-indigo-700 font-bold mb-4">💼 Renting Scenario</h4>
                <InputWithSlider
                    label="Monthly Rent"
                    value={monthlyRent}
                    onChange={setMonthlyRent}
                    min={MIN_RENT} max={MAX_RENT} step={STEP_AMOUNT}
                    currency={currency}
                />
                <div className="grid grid-cols-2 gap-4">
                    <InputWithSlider
                        label="Rent Inflation (%)"
                        value={rentInflation}
                        onChange={setRentInflation}
                        min={0} max={10} step={0.1}
                    />
                    <InputWithSlider
                        label="Investment Return (%)"
                        value={investmentReturn}
                        onChange={setInvestmentReturn}
                        min={5} max={20} step={0.1}
                    />
                </div>
            </div>
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className={`p-6 rounded-xl border shadow-sm animate-fade-in text-center ${isBuyBetter ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200'}`}>
                    <h3 className="text-xl font-bold mb-2">
                        {isBuyBetter ? "🏡 Buying is Financially Better" : "📈 Renting & Investing is Better"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        After <span className="font-bold">{yearlyLedger.length} years</span>, {isBuyBetter ? 'Buying' : 'Renting'} leaves you richer by:
                    </p>
                    <div className={`text-3xl font-extrabold ${isBuyBetter ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {moneyFormat(difference, currency)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Buy Net Worth: {finalYear ? moneyFormat(finalYear.netWorthBuy, currency) : 0} | Rent Net Worth: {finalYear ? moneyFormat(finalYear.netWorthRent, currency) : 0}
                    </p>
                </div>
            }
            charts={
                <div className="h-[350px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-8">
                    <FinancialLineChart data={chartData} options={options} currency={currency} height={350} />
                </div>
            }
            table={
                <div className="mt-8">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => {
                                const rows = yearlyLedger.map(r => [
                                    `Year ${r.year}`,
                                    Math.round(r.netWorthBuy),
                                    Math.round(r.netWorthRent),
                                    Math.round(Math.abs(r.netWorthBuy - r.netWorthRent))
                                ]);
                                downloadPDF(rows, ['Year', 'Buy Net Worth', 'Rent Net Worth', 'Difference'], 'rent_vs_buy_comparison.pdf');
                            }}
                            className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            Download PDF report
                        </button>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={yearlyLedger.map(r => ({
                            year: r.year,
                            totalInvested: r.netWorthBuy, // Using 'totalInvested' slot for Buy Net Worth
                            growth: r.netWorthRent,       // Using 'growth' slot for Rent Net Worth (Green)
                            balance: r.diff,              // Using 'balance' slot for Difference (Blue)
                        }))}
                        monthlyData={monthlyLedger.map(r => ({
                            year: r.year,
                            month: r.month,
                            monthName: r.monthName,
                            invested: r.netWorthBuy,
                            interest: r.netWorthRent,
                            balance: r.diff
                        }))}
                        currency={currency}
                        labels={{
                            invested: "Buy Net Worth",
                            interest: "Rent Net Worth",
                            balance: "Difference"
                        }}
                    />
                </div>
            }
        />
    );
}

