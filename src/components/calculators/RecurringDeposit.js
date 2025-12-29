
import React, { useState, useMemo } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
// moneyFormat import removed
import { getActualYearAndMonth } from '../../utils/calculatorUtils';
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import UnifiedSummary from '../common/UnifiedSummary';
import CalculatorLayout from '../common/CalculatorLayout';
import { MAX_SIP } from '../../utils/constants';

export default function RecurringDeposit({ currency }) {
    const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(5);
    const [tenureMode, setTenureMode] = useState('Years'); // 'Years' | 'Months'
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7)); // Default "YYYY-MM"

    const handleTenureModeChange = (mode) => {
        if (mode === tenureMode) return;
        setTenureMode(mode);
        // Convert value
        if (mode === 'Months') {
            setYears((prev) => Math.round(prev * 12));
        } else {
            setYears((prev) => Number((prev / 12).toFixed(1)));
        }
    };

    const result = useMemo(() => {
        const P = Number(monthlyDeposit);
        const R = Number(rate);


        // Effective years based on mode
        const effectiveYears = tenureMode === 'Months' ? years / 12 : years;
        const N = Math.round(effectiveYears * 12);

        const yearlyData = [];
        const monthlyData = [];

        // Parse start date (used in getActualYearAndMonth)

        // Generate month-by-month data
        for (let month = 1; month <= N; month++) {
            // Calculate balance at this month
            let balanceAtMonth = 0;

            // Sum up all deposits made up to this month with their compounded interest
            for (let k = 1; k <= month; k++) {
                const monthsHeld = month - k + 1;
                const value = P * Math.pow(1 + R / 400, 4 * (monthsHeld / 12));
                balanceAtMonth += value;
            }

            const totalInvestedAtMonth = P * month;
            const interestAtMonth = balanceAtMonth - totalInvestedAtMonth;

            const { year: actualYear, monthName: actualMonthName } = getActualYearAndMonth(startDate, month);
            const monthInYear = ((month - 1) % 12) + 1;

            // Add to monthly data
            monthlyData.push({
                year: actualYear,
                month: monthInYear,
                monthName: actualMonthName,
                invested: totalInvestedAtMonth,
                interest: interestAtMonth,
                balance: balanceAtMonth
            });

            // Add to yearly data at the end of each year or at the last month
            if (actualMonthName === 'Dec' || month === N) {
                yearlyData.push({
                    year: actualYear,
                    totalInvested: totalInvestedAtMonth,
                    growth: interestAtMonth,
                    balance: balanceAtMonth,
                    investment: totalInvestedAtMonth
                });
            }
        }

        // Calculate final values from the last entry
        const finalData = monthlyData[monthlyData.length - 1] || { invested: 0, balance: 0 };
        const totalInvestment = finalData.invested;
        const finalMaturity = finalData.balance;
        const interestEarned = finalMaturity - totalInvestment;

        return {
            totalInvestment,
            maturityValue: finalMaturity,
            interestEarned,
            yearlyData,
            monthlyData
        };
    }, [monthlyDeposit, rate, years, tenureMode, startDate]);


    // --- CHART CONFIG ---
    // Removed old chart configs as we use new components

    // Note: Tooltip label customization is handled by common component if labels match context.dataset.label

    const inputs = (
        <>
            <InputWithSlider
                label="Monthly Deposit"
                value={monthlyDeposit}
                onChange={setMonthlyDeposit}
                min={500}
                max={MAX_SIP}
                step={500}
                currency={currency}
            />
            <InputWithSlider
                label="Rate of Interest (p.a)"
                value={rate}
                onChange={setRate}
                min={1}
                max={15}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />
            <InputWithSlider
                label={`Time Period (${tenureMode})`}
                value={years}
                onChange={setYears}
                min={tenureMode === 'Months' ? 6 : 1}
                max={tenureMode === 'Months' ? 120 : 10}
                step={tenureMode === 'Months' ? 1 : 1}
                rightElement={
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Years', 'Months'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleTenureModeChange(mode)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureMode === mode
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                }
            />
        </>
    );

    const summary = (
        <UnifiedSummary
            invested={result.totalInvestment}
            gain={result.interestEarned}
            total={result.maturityValue}
            currency={currency}
            years={tenureMode === 'Months' ? `${years} Months` : `${years} Years`}
        />
    );

    const pieChart = (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h4 className="text-gray-800 font-bold text-lg mb-6 self-start w-full">Break-up of Maturity Value</h4>
            <div className="w-full h-80 flex justify-center">
                <FinancialInvestmentPieChart
                    invested={result.totalInvestment}
                    gain={result.interestEarned}
                    total={result.maturityValue}
                    currency={currency}
                    years={tenureMode === 'Months' ? `${years} Months` : years}
                />
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="mt-8">
                    <FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />
                </div>
            }
            pieChart={pieChart}
            table={
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                        <div className="flex items-center w-full md:w-auto">
                            <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                            <div className="w-48">
                                <MonthYearPicker
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                            </div>
                        </div>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={result.yearlyData}
                        monthlyData={result.monthlyData}
                        currency={currency}
                    />
                </div>
            }
        />
    );
}

