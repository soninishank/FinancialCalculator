
import React, { useState, useMemo } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
import { moneyFormat } from '../../utils/formatting';
import { getActualYearAndMonth } from '../../utils/calculatorUtils';
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
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

    return (
        <div className="animate-fade-in">
            {/* INPUTS SECTION */}
            <div className="space-y-6 mt-8">
                {inputs}
            </div>

            {/* SUMMARY SECTION & PIE CHART - Side by Side like LoanEMI */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-gray-100">

                    {/* LEFT: METRICS (2/5 width) */}
                    <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
                        <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Investment</p>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {moneyFormat(result.totalInvestment, currency, "word")}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-teal-50/30">
                            <p className="text-sm font-semibold text-teal-900 mb-1">Interest Earned</p>
                            <p className="text-2xl font-bold text-teal-700 tracking-tight">
                                {moneyFormat(result.interestEarned, currency, "word")}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-indigo-50/30">
                            <p className="text-sm font-semibold text-indigo-900 mb-1">Maturity Value</p>
                            <p className="text-xs text-indigo-600 mb-2 font-medium opacity-80">
                                After {tenureMode === 'Months' ? `${years} Months` : `${years} Years`}
                            </p>
                            <p className="text-2xl font-bold text-indigo-700 tracking-tight">
                                {moneyFormat(result.maturityValue, currency, "word")}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: PIE CHART (3/5 width) */}
                    <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center bg-gray-50/30">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 self-start">Break-up of Maturity Value</h4>
                        <div className="w-full h-80">
                            <FinancialInvestmentPieChart
                                invested={result.totalInvestment}
                                gain={result.interestEarned}
                                total={result.maturityValue}
                                currency={currency}
                                years={tenureMode === 'Months' ? `${years} Months` : years}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BAR CHART */}
            <div className="mt-8">
                <FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />
            </div>

            {/* TABLE */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
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
                <CollapsibleInvestmentTable
                    yearlyData={result.yearlyData}
                    monthlyData={result.monthlyData}
                    currency={currency}
                />
            </div>
        </div>
    );
}

