import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { calculateRealValue } from '../../utils/finance';
import { moneyFormat } from '../../utils/formatting';
import { downloadPDF } from '../../utils/export';
import { FinancialLineChart } from '../common/FinancialCharts';
import ResultsTable from '../common/ResultsTable';
import {
    DEFAULT_INFLATION,
    DEFAULT_TARGET_AMOUNT,
    DEFAULT_INVESTMENT_YEARS,
    MIN_AMOUNT,
    MAX_AMOUNT,
    STEP_AMOUNT,
    MIN_YEARS,
    MAX_YEARS,
    MIN_RATE,
    CHART_COLORS
} from '../../utils/constants';

export default function InflationImpact({ currency }) {
    const [amount, setAmount] = useState(DEFAULT_TARGET_AMOUNT); // 1 Crore
    const [years, setYears] = useState(DEFAULT_INVESTMENT_YEARS);
    const [inflation, setInflation] = useState(DEFAULT_INFLATION);

    const realValue = calculateRealValue(amount, inflation, years);

    // --- CHART DATA GENERATION ---
    const chartData = useMemo(() => {
        const labels = [];
        const dataPoints = [];

        for (let i = 0; i <= years; i++) {
            labels.push(`Year ${i}`);
            dataPoints.push(calculateRealValue(amount, inflation, i));
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Purchasing Power',
                    data: dataPoints,
                    borderColor: CHART_COLORS.DANGER, // Red to indicate loss/danger
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    }, [amount, years, inflation]);

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
            },
        }
    };

    // --- HELPER FOR TEXT DISPLAY ---
    const formatFullAndCompact = (val) => {
        const full = moneyFormat(val, currency);
        const compact = moneyFormat(val, currency, true);
        // Avoid redundancy if compact is same as full (small numbers)
        if (full === compact) return full;
        return `${full} (${compact})`;
    };

    const inputs = (
        <>
            <InputWithSlider
                label="Amount (in today's money)"
                value={amount}
                onChange={setAmount}
                min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP_AMOUNT}
                currency={currency}
            />
            <InputWithSlider
                label="Number of Years from Now"
                value={years}
                onChange={setYears}
                min={MIN_YEARS} max={MAX_YEARS}
            />
            <InputWithSlider
                label="Expected Inflation Rate (%)"
                value={inflation}
                onChange={setInflation}
                min={MIN_RATE} max={15} step={0.1} // Using 15 as hard max for inflation?
            />
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="p-8 rounded-xl bg-slate-800 text-white text-center shadow-lg">
                    <p className="text-slate-300 text-sm uppercase tracking-wide font-semibold mb-2">Purchasing Power in {years} Years</p>
                    <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
                        {moneyFormat(realValue, currency)}
                    </div>
                    <p className="text-slate-400 text-sm px-4 leading-relaxed">
                        An amount of <span className="text-white font-semibold">{formatFullAndCompact(amount)}</span> today will only buy you goods worth <span className="text-yellow-400 font-semibold">{formatFullAndCompact(realValue)}</span> in {years} years due to {inflation}% inflation.
                    </p>
                </div>
            }
            charts={
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                    <h3 className="text-gray-700 font-bold text-lg mb-2">Purchasing Power Erosion</h3>
                    <FinancialLineChart data={chartData} options={chartOptions} currency={currency} height={300} />
                </div>
            }
            table={
                <div className="mt-8">
                    <ResultsTable
                        data={chartData.labels.map((yearLabel, i) => ({
                            year: i,
                            amount: amount,
                            realValue: chartData.datasets[0].data[i]
                        }))}
                        columns={[
                            { key: 'year', label: 'Year', align: 'left' },
                            { key: 'amount', label: 'Nominal Amount', align: 'right', format: 'money' },
                            { key: 'realValue', label: 'Purchasing Power', align: 'right', format: 'money', highlight: true }
                        ]}
                        onExport={() => {
                            const rows = chartData.labels.map((yearLabel, i) => [
                                `Year ${i}`,
                                Math.round(amount),
                                Math.round(chartData.datasets[0].data[i])
                            ]);
                            downloadPDF(rows, ['Year', 'Nominal Amount', 'Purchasing Power'], 'inflation_impact.pdf');
                        }}
                        currency={currency}
                    />
                </div>
            }
        />
    );
}
