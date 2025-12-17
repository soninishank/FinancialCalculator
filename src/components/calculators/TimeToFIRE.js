import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { FinancialLineChart } from '../common/FinancialCharts';
// SummaryCards unused
import { calculateTimeToFIRE } from '../../utils/finance';
import {
    DEFAULT_SWR,
    DEFAULT_EXPENSE,
    DEFAULT_RATE,
    MAX_CORPUS,
    STEP_LARGE,
    MAX_EXPENSE,
    STEP_AMOUNT,
    MAX_SIP,
    MIN_AMOUNT,
    MAX_RATE,
    MIN_SWR,
    MAX_SWR,
    MIN_RATE
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MIN_EXPENSE = 5000;

export default function TimeToFIRE({ currency }) {
    const [currentCorpus, setCurrentCorpus] = useState(1000000); // 10 Lakh
    const [monthlyExpenses, setMonthlyExpenses] = useState(DEFAULT_EXPENSE);
    const [monthlyInvestment, setMonthlyInvestment] = useState(20000); // 20k
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);
    const [swr, setSwr] = useState(DEFAULT_SWR);

    const result = useMemo(() => calculateTimeToFIRE({
        currentCorpus,
        monthlyExpenses,
        monthlyInvestment,
        annualReturn,
        swr
    }), [currentCorpus, monthlyExpenses, monthlyInvestment, annualReturn, swr]);

    const inputs = (
        <>
            <InputWithSlider
                label="Current Portfolio Value"
                value={currentCorpus}
                onChange={setCurrentCorpus}
                min={MIN_AMOUNT}
                max={MAX_CORPUS}
                step={STEP_LARGE}
                currency={currency}
            />
            <InputWithSlider
                label="Monthly Expenses"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                min={LOC_MIN_EXPENSE}
                max={MAX_EXPENSE}
                step={STEP_AMOUNT}
                currency={currency}
            />
            <InputWithSlider
                label="Monthly Investment"
                value={monthlyInvestment}
                onChange={setMonthlyInvestment}
                min={MIN_AMOUNT}
                max={MAX_SIP}
                step={STEP_AMOUNT}
                currency={currency}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <InputWithSlider
                    label="Expected Annual Return (%)"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    min={MIN_RATE}
                    max={MAX_RATE}
                    step={0.1}
                    symbol="%"
                />
                <InputWithSlider
                    label="Withdrawal Rate (SWR %)"
                    value={swr}
                    onChange={setSwr}
                    min={MIN_SWR}
                    max={MAX_SWR}
                    step={0.1}
                    symbol="%"
                />
            </div>
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <>
                    <div className="p-6 bg-teal-50 rounded-xl border border-teal-100 text-center animate-fade-in shadow-sm">
                        <h3 className="text-lg font-semibold text-teal-800">Time to Financial Independence</h3>
                        <div className="text-4xl font-bold text-teal-600 mt-2 mb-1">
                            {result.years} <span className="text-xl font-medium">Years</span> {result.months} <span className="text-xl font-medium">Months</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            You need a corpus of <span className="font-bold">{currency} {Math.round(result.targetCorpus).toLocaleString()}</span> to retire comfortably.
                        </p>
                    </div>

                    {/* CHART */}
                    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block">
                        <h3 className="text-gray-800 font-bold text-lg mb-4">Path to FIRE</h3>
                        <FinancialLineChart
                            data={{
                                labels: Array.from({ length: Math.ceil(result.years + 2) }, (_, i) => `Year ${i}`),
                                datasets: [
                                    {
                                        label: 'Portfolio Value',
                                        data: Array.from({ length: Math.ceil(result.years + 2) }, (_, i) => {
                                            // Simple yearly projection for chart
                                            // FV = PV*(1+r)^n + PMT * ...
                                            const r = annualReturn / 100;
                                            const months = i * 12;
                                            const monthlyRate = r / 12;

                                            // FV of Corpus
                                            const valCorpus = currentCorpus * Math.pow(1 + monthlyRate, months);
                                            // FV of SIP
                                            const valSIP = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

                                            return Math.round(valCorpus + valSIP);
                                        }),
                                        borderColor: '#0D9488', // Teal-600
                                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                                        fill: true,
                                        tension: 0.4
                                    },
                                    {
                                        label: 'FIRE Target',
                                        data: Array.from({ length: Math.ceil(result.years + 2) }, () => result.targetCorpus),
                                        borderColor: '#EF4444', // Red-500
                                        borderDash: [5, 5],
                                        fill: false,
                                        pointRadius: 0
                                    }
                                ]
                            }}
                            currency={currency}
                            height={300}
                        />
                    </div>
                </>
            }
        />
    );
}

