
import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialLineChart, FinancialPieChart } from '../common/FinancialCharts';
import { CHART_COLORS, LABELS, MAX_SIP } from '../../utils/constants';

export default function RecurringDeposit({ currency }) {
    const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(5);

    const result = useMemo(() => {
        const P = Number(monthlyDeposit);
        const R = Number(rate);
        const N = Number(years) * 12; // Total months

        let totalInvestment = 0;
        const yearlyData = [{ year: 0, balance: 0, investment: 0 }];

        // Simulate month by month
        // Standard RD compounding: Interest is compounded quarterly.
        // Assuming the start of the tenure aligns with a quarter for simplicity.
        // Or strictly following the formula A = P * (1 + R/400)^(n)

        // Let's use the explicit Future Value summation for each installment
        // considering quarterly compounding frequency.
        // Formula per installment: A = P * (1 + R/400)^(4 * (remaining_months / 12))

        let finalMaturity = 0;

        for (let i = 0; i < N; i++) {
            const monthsRemaining = N - i;
            const installmentValue = P * Math.pow(1 + R / 400, 4 * (monthsRemaining / 12));
            finalMaturity += installmentValue;
        }

        totalInvestment = P * N;
        const interestEarned = finalMaturity - totalInvestment;

        // Generate yearly data for chart basically by checking the accrued value at each year end
        // This is slightly expensive (O(N^2)) but for N=360 (30 years) it's tiny.
        for (let y = 1; y <= years; y++) {
            let currentMaturity = 0;
            const monthsPassed = y * 12;
            // Calculate value of investments made SO FAR, at year Y
            for (let i = 0; i < monthsPassed; i++) {
                const monthsRemaining = monthsPassed - i;
                const val = P * Math.pow(1 + R / 400, 4 * (monthsRemaining / 12));
                currentMaturity += val;
            }
            yearlyData.push({
                year: y,
                balance: currentMaturity,
                investment: P * monthsPassed
            });
        }

        return {
            totalInvestment,
            maturityValue: finalMaturity,
            interestEarned,
            yearlyData
        };
    }, [monthlyDeposit, rate, years]);

    // --- CHART CONFIG ---
    const pieData = {
        labels: [LABELS.INVESTED_AMOUNT, LABELS.INTEREST_EARNED],
        datasets: [
            {
                data: [result.totalInvestment, result.interestEarned],
                backgroundColor: [CHART_COLORS.NEUTRAL, CHART_COLORS.PRIMARY],
                borderWidth: 0
            }
        ]
    };

    const lineData = {
        labels: result.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            {
                label: LABELS.MATURITY_VALUE,
                data: result.yearlyData.map(d => d.balance),
                borderColor: CHART_COLORS.PRIMARY,
                backgroundColor: CHART_COLORS.BACKGROUND_LIGHT,
                fill: true,
                tension: 0.1
            },
            {
                label: LABELS.INVESTED_AMOUNT,
                data: result.yearlyData.map(d => d.investment),
                borderColor: CHART_COLORS.TEXT_LIGHT,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                pointRadius: 0,
                tension: 0.1
            }
        ]
    };

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
                label="Time Period (Years)"
                value={years}
                onChange={setYears}
                min={1}
                max={10} // RDs usually have max tenure of 10 years
            />
        </>
    );

    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-gray-500 text-sm">Total Investment</p>
                <p className="text-xl font-bold text-gray-800">{moneyFormat(result.totalInvestment, currency)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-gray-500 text-sm">Interest Earned</p>
                <p className="text-xl font-bold text-teal-600">{moneyFormat(result.interestEarned, currency)}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <p className="text-gray-500 text-sm">Maturity Value</p>
                <p className="text-xl font-bold text-gray-800">{moneyFormat(result.maturityValue, currency)}</p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="h-64 mt-8 bg-white p-4 rounded-xl border">
                    <FinancialLineChart data={lineData} currency={currency} height={250} />
                </div>
            }
            pieChart={
                <div className="h-64 flex justify-center items-center bg-white p-4 rounded-xl border">
                    <FinancialPieChart data={pieData} currency={currency} height={240} />
                </div>
            }
            table={null}
        />
    );
}

