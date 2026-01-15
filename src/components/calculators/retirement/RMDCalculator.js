import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { CalendarClock } from 'lucide-react';

const UNIFORM_LIFETIME_TABLE = {
    72: 27.5, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
    80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
    88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
    96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2,
    104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4,
    112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9
};

export default function RMDCalculator({ currency = 'USD' }) {
    const [age, setAge] = useState(73);
    const [balance, setBalance] = useState(500000);
    const [annualGrowth, setAnnualGrowth] = useState(5); // %

    const result = useMemo(() => {
        if (age < 73) {
            return {
                currentRMD: 0,
                factor: 0,
                yearlyData: []
            };
        }

        const factor = UNIFORM_LIFETIME_TABLE[age] || 2.9;
        const currentRMD = balance / factor;

        // Project next 20 years
        const yearlyData = [];
        let curBalance = balance;
        let curAge = age;

        for (let i = 0; i < 20; i++) {
            if (curAge > 115) break;

            const curFactor = UNIFORM_LIFETIME_TABLE[curAge] || 2.9;
            const rmd = curBalance / curFactor;

            // Interest earned during the year (simplified: on remaining balance)
            const growthAmount = (curBalance - rmd) * (annualGrowth / 100);

            // End of year balance
            const endBalance = (curBalance - rmd) + growthAmount;

            yearlyData.push({
                year: curAge,
                rmd: rmd,
                balance: endBalance,
                // Matching chart data keys
                totalInvested: endBalance, // abusing keys for chart visualization
                growth: rmd
            });

            curBalance = endBalance;
            curAge++;
        }

        return {
            currentRMD,
            factor,
            yearlyData
        };
    }, [age, balance, annualGrowth]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Your Age"
                value={age}
                onChange={setAge}
                min={50}
                max={100}
                step={1}
                suffix=" Years"
                helperText="RMDs start at age 73."
            />

            <InputWithSlider
                label="Account Balance (Dec 31 last year)"
                value={balance}
                onChange={setBalance}
                min={10000}
                max={5000000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Estimated Annual Growth (%)"
                value={annualGrowth}
                onChange={setAnnualGrowth}
                min={0}
                max={15}
                step={0.5}
                symbol="%"
                isDecimal={true}
                helperText="Project future RMDs."
            />
        </div>
    );

    const chartConfigOverride = {
        plugins: {
            title: { display: true, text: 'Projected RMD & Remaining Balance' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label;
                        const val = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(context.raw);
                        return `${label}: ${val}`;
                    }
                }
            }
        }
    };

    // Custom data mapping for the chart to show Balance vs RMD
    const chartData = useMemo(() => {
        if (!result.yearlyData.length) return [];
        return result.yearlyData.map(d => ({
            year: d.year,
            totalInvested: d.balance, // Blue bar (Balance)
            growth: d.rmd // Green bar (RMD Payout)
        }));
    }, [result.yearlyData]);


    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5" /> Required Minimum Distribution (RMD)
                </h2>
                <p className="text-sm text-blue-800">Calculate your mandatory withdrawals from retirement accounts starting age 73.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        {age < 73 ? (
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center font-bold">
                                You do not need to take RMDs until age 73.
                            </div>
                        ) : (
                            <>
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                                    <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Current Year RMD</p>
                                    <p className="text-3xl font-bold text-indigo-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.currentRMD)}
                                    </p>
                                    <p className="text-xs text-indigo-500 mt-2">
                                        Divisor Factor: {result.factor}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-500 text-center">
                                    This amount must be withdrawn by Dec 31 to avoid penalties (up to 25%).
                                </div>
                            </>
                        )}
                    </div>
                }
                charts={
                    age >= 73 && (
                        <div className="mt-8">
                            <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">20-Year Projection</h3>
                            <FinancialCompoundingBarChart
                                data={chartData}
                                currency={currency}
                                type="wealth" // To get the Balance/Growth colors, though somewhat appropriated
                            />
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Note: "Invested Amount" represents Account Balance, "Interest Gained" represents RMD Payout.
                            </p>
                        </div>
                    )
                }
                details={calculatorDetails['rmd-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
