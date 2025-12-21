
import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialLineChart, FinancialPieChart } from '../common/FinancialCharts';
import { CHART_COLORS, LABELS, MAX_AMOUNT } from '../../utils/constants';

export default function SimpleInterest({ currency }) {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(6);
    const [time, setTime] = useState(5);

    const result = useMemo(() => {
        const p = Number(principal);
        const r = Number(rate);
        const t = Number(time);

        const interest = (p * r * t) / 100;
        const totalAmount = p + interest;

        // Yearly data for chart
        const yearlyData = [];
        for (let i = 0; i <= t; i++) {
            const yearlyInterest = (p * r * i) / 100;
            yearlyData.push({
                year: i,
                amount: p + yearlyInterest
            });
        }

        return {
            interest,
            totalAmount,
            yearlyData
        };
    }, [principal, rate, time]);

    // --- CHART CONFIG ---
    const pieData = {
        labels: [LABELS.PRINCIPAL_AMOUNT, LABELS.INTEREST_EARNED],
        datasets: [
            {
                data: [principal, result.interest],
                backgroundColor: ["#6366F1", CHART_COLORS.PRIMARY], // Indigo-500, Teal-700
                borderWidth: 0
            }
        ]
    };

    const lineData = {
        labels: result.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            {
                label: LABELS.TOTAL_VALUE,
                data: result.yearlyData.map(d => d.amount),
                borderColor: CHART_COLORS.PRIMARY,
                backgroundColor: CHART_COLORS.BACKGROUND_LIGHT,
                fill: true,
                tension: 0.1
            }
        ]
    };

    const lineOptions = {
        plugins: {
            legend: { display: false }
        }
    };

    // --- UI SECTIONS ---
    const inputs = (
        <>
            <InputWithSlider
                label="Principal Amount"
                value={principal}
                onChange={setPrincipal}
                min={1000}
                max={MAX_AMOUNT}
                step={1000}
                currency={currency}
            />
            <InputWithSlider
                label="Rate of Interest (p.a)"
                value={rate}
                onChange={setRate}
                min={1}
                max={30}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />
            <InputWithSlider
                label="Time Period (Years)"
                value={time}
                onChange={setTime}
                min={1}
                max={30}
            />
        </>
    );

    const summary = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-gray-500 text-sm">Principal Amount</p>
                <p className="text-xl font-bold text-gray-800">{moneyFormat(principal, currency)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-gray-500 text-sm">Total Interest</p>
                <p className="text-xl font-bold text-teal-600">{moneyFormat(result.interest, currency)}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <p className="text-gray-500 text-sm">Total Amount</p>
                <p className="text-xl font-bold text-gray-800">{moneyFormat(result.totalAmount, currency)}</p>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            charts={
                <div className="h-64 mt-8 bg-white p-4 rounded-xl border">
                    <FinancialLineChart data={lineData} options={lineOptions} currency={currency} height={250} />
                </div>
            }
            pieChart={
                <div className="h-64 flex justify-center items-center bg-white p-4 rounded-xl border">
                    <FinancialPieChart data={pieData} currency={currency} height={240} />
                </div>
            }
            table={null} // Table omitted for simplicity or can act as Yearly Breakdown
        />
    );
}

