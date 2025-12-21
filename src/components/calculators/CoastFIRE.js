import React, { useState, useMemo } from 'react';
import CalculatorLayout from './CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { FinancialLineChart } from '../common/FinancialCharts';
import { calculateCoastFIRE } from '../../utils/finance';
import {
    DEFAULT_CURRENT_AGE,
    DEFAULT_RETIREMENT_AGE,
    DEFAULT_EXPENSE,
    DEFAULT_SWR,
    DEFAULT_RATE,
    DEFAULT_INFLATION,
    DEFAULT_CORPUS,
    MIN_AGE,
    MAX_WORK_AGE,
    MAX_AGE,
    MAX_EXPENSE,
    MAX_CORPUS,
    MAX_RATE
} from '../../utils/constants';

// Local constants if not present globally yet (To be safe)
const MIN_EXPENSE = 5000;
const STEP_EXPENSE = 1000;
const STEP_CORPUS = 50000;
const LOC_MAX_INFLATION = 15;
const LOC_MIN_SWR = 2;
const LOC_MAX_SWR = 10;

export default function CoastFIRE({ currency }) {
    const [currentAge, setCurrentAge] = useState(DEFAULT_CURRENT_AGE);
    const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE);
    const [monthlyExpenses, setMonthlyExpenses] = useState(DEFAULT_EXPENSE);
    const [currentInvested, setCurrentInvested] = useState(DEFAULT_CORPUS);
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);
    const [inflation, setInflation] = useState(DEFAULT_INFLATION);
    const [swr, setSwr] = useState(DEFAULT_SWR);

    const result = useMemo(() => calculateCoastFIRE({
        currentAge,
        retirementAge,
        monthlyExpenses,
        swr,
        annualReturn,
        inflation
    }), [currentAge, retirementAge, monthlyExpenses, swr, annualReturn, inflation]);

    const isCoasted = currentInvested >= result.neededToday;
    const shortfall = result.neededToday - currentInvested;

    const inputs = (
        <>
            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Current Age"
                    value={currentAge}
                    onChange={setCurrentAge}
                    min={MIN_AGE} max={MAX_WORK_AGE}
                />
                <InputWithSlider
                    label="Retirement Age"
                    value={retirementAge}
                    onChange={setRetirementAge}
                    min={currentAge + 1} max={MAX_AGE}
                />
            </div>

            <InputWithSlider
                label="Monthly Expenses (Today's Value)"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                min={MIN_EXPENSE} max={MAX_EXPENSE} step={STEP_EXPENSE}
                currency={currency}
            />

            <InputWithSlider
                label="Current Invested Corpus"
                value={currentInvested}
                onChange={setCurrentInvested}
                min={0} max={MAX_CORPUS} step={STEP_CORPUS}
                currency={currency}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <InputWithSlider
                    label="Return Rate (%)"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    min={0} max={MAX_RATE} step={0.1} symbol="%"
                />
                <InputWithSlider
                    label="Inflation (%)"
                    value={inflation}
                    onChange={setInflation}
                    min={0} max={LOC_MAX_INFLATION} step={0.1} symbol="%"
                />
                <InputWithSlider
                    label="SWR (%)"
                    value={swr}
                    onChange={setSwr}
                    min={LOC_MIN_SWR} max={LOC_MAX_SWR} step={0.1} symbol="%"
                />
            </div>
        </>
    );

    return (
        <div className="animate-fade-in">
            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className={`p-6 rounded-xl border shadow-sm animate-fade-in ${isCoasted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <h3 className={`text-lg font-semibold ${isCoasted ? 'text-green-800' : 'text-orange-800'}`}>
                            {isCoasted ? "🎉 You are Coast FIRE!" : "💪 Keep Investing!"}
                        </h3>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Coast FIRE Number (Needed Today)</p>
                                <p className="text-2xl font-bold text-gray-800">{currency} {Math.round(result.neededToday).toLocaleString()}</p>
                            </div>
                            {!isCoasted && (
                                <div>
                                    <p className="text-sm text-gray-500">Shortfall</p>
                                    <p className="text-2xl font-bold text-red-600">{currency} {Math.round(shortfall).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                            At age {retirementAge}, you will need <b>{currency} {Math.round(result.fiNumberAtRetirement).toLocaleString()}</b> to cover inflation-adjusted monthly expenses of <b>{currency} {Math.round(result.futureMonthlyExpenses).toLocaleString()}</b>.
                        </div>
                    </div>
                }
            />

            {/* CHART SECTION */}
            <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Coast FIRE Projection</h3>
                <FinancialLineChart
                    data={{
                        labels: Array.from({ length: retirementAge - currentAge + 1 }, (_, i) => `Age ${currentAge + i}`),
                        datasets: [
                            {
                                label: 'Your Projected Corpus',
                                data: Array.from({ length: retirementAge - currentAge + 1 }, (_, i) => {
                                    const rate = annualReturn / 100;
                                    return Math.round(currentInvested * Math.pow(1 + rate, i));
                                }),
                                borderColor: '#10B981', // Emerald
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                fill: false,
                                tension: 0.4
                            },
                            {
                                label: 'Required Coast Path',
                                data: Array.from({ length: retirementAge - currentAge + 1 }, (_, i) => {
                                    const rate = annualReturn / 100;
                                    return Math.round(result.neededToday * Math.pow(1 + rate, i));
                                }),
                                borderColor: '#6366F1', // Indigo
                                borderDash: [5, 5],
                                backgroundColor: 'transparent',
                                fill: false,
                                tension: 0.4
                            }
                        ]
                    }}
                    currency={currency}
                    height={350}
                />
                <p className="text-xs text-gray-500 mt-4 text-center">
                    The <span className="text-emerald-600 font-bold">Green Line</span> shows how your current money will grow.<br />
                    The <span className="text-indigo-500 font-bold">Dashed Line</span> shows where you need to be to coast to retirement.
                </p>
            </div>
        </div >
    );
}

