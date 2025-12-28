import React, { useState, useMemo, useEffect } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { FinancialBarChart } from '../common/FinancialCharts';
import {
    DEFAULT_RATE,
    DEFAULT_TARGET_AMOUNT,
    MAX_CORPUS,
    STEP_HUGE,
    MAX_YEARS,
    MIN_YEARS,
    STEP_EXPENSE,
    MAX_EXPENSE_LARGE,
    DEFAULT_CORPUS,
    CHART_COLORS,
    MAX_EXPENSE,
    MAX_RATE
} from '../../utils/constants';

/* ============================
   CORRECT SWP ENGINE (MONTHLY)
   ============================ */
function computeStepDownSWP({
    initialCorpus,
    annualReturn,
    phase1Years,
    phase1Expense, // MONTHLY
    phase2Expense, // MONTHLY
    isStepDownEnabled,
    planningHorizon
}) {
    const monthlyRate = annualReturn / 100 / 12;
    const maxMonths = planningHorizon * 12;

    let corpus = initialCorpus;
    let months = 0;
    let yearlyWithdrawal = 0;
    let yearlyInterest = 0;
    let yearOpening = initialCorpus;

    const yearlyData = [
        {
            year: 0,
            corpus: initialCorpus,
            annualWithdrawal: 0,
            interestEarned: 0,
            openingBalance: initialCorpus
        }
    ];

    while (corpus > 0 && months < maxMonths) {
        const year = Math.ceil((months + 1) / 12);

        // Reset counters at start of new year
        if (months % 12 === 0) {
            yearOpening = corpus;
            yearlyWithdrawal = 0;
            yearlyInterest = 0;
        }

        const monthlyExpense =
            isStepDownEnabled && year > phase1Years
                ? phase2Expense
                : phase1Expense;

        const interest = corpus * monthlyRate;
        corpus += interest;
        corpus -= monthlyExpense;

        yearlyInterest += interest;
        yearlyWithdrawal += monthlyExpense;
        months++;

        if (months % 12 === 0 || corpus <= 0) {
            yearlyData.push({
                year,
                corpus: Math.max(0, corpus),
                annualWithdrawal: yearlyWithdrawal,
                interestEarned: yearlyInterest,
                openingBalance: yearOpening
            });
        }
    }

    return {
        yearsLasted: months / 12,
        yearlyData,
        finalCorpus: Math.max(0, corpus)
    };
}

export default function StepDownWithdrawal({ currency }) {
    const [corpus, setCorpus] = useState(DEFAULT_TARGET_AMOUNT);
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);

    /* Planning Horizon — HARD CAPPED */
    const [planningHorizon, setPlanningHorizon] = useState(30);
    const safePlanningHorizon = Math.min(planningHorizon, MAX_YEARS);

    /* Step-down */
    const [isStepDownEnabled, setIsStepDownEnabled] = useState(false);
    const [phase1Years, setPhase1Years] = useState(10);

    // Clamp Phase 1 years if planning horizon shrinks
    useEffect(() => {
        if (phase1Years >= safePlanningHorizon) {
            setPhase1Years(safePlanningHorizon - 1);
        }
    }, [safePlanningHorizon, phase1Years]);

    /* Monthly expenses */
    const [phase1Expense, setPhase1Expense] = useState(100000); // 1L
    const [phase2Expense, setPhase2Expense] = useState(60000);

    const result = useMemo(
        () =>
            computeStepDownSWP({
                initialCorpus: corpus,
                annualReturn,
                phase1Years,
                phase1Expense,
                phase2Expense,
                isStepDownEnabled,
                planningHorizon: safePlanningHorizon
            }),
        [
            corpus,
            annualReturn,
            phase1Years,
            phase1Expense,
            phase2Expense,
            isStepDownEnabled,
            safePlanningHorizon
        ]
    );

    /* ============================
       CHART CONFIG (FIXED)
       ============================ */
    const chartData = {
        labels: result.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            {
                type: 'line',
                label: 'Corpus Balance',
                data: result.yearlyData.map(d => d.corpus),
                borderColor: CHART_COLORS.SECONDARY,
                backgroundColor: CHART_COLORS.SECONDARY,
                yAxisID: 'y',
                pointRadius: 0,
                tension: 0.3
            },
            {
                type: 'bar',
                label: 'Annual Withdrawal',
                data: result.yearlyData.map(d =>
                    d.year === 0 ? null : d.annualWithdrawal
                ),
                yAxisID: 'y1',
                backgroundColor: ctx => {
                    if (!isStepDownEnabled) return `${CHART_COLORS.SECONDARY}45`; // Adding opacity via hex? No. 

                    const year = result.yearlyData[ctx.dataIndex]?.year || 0;
                    if (year === 0) return 'transparent';

                    return year <= phase1Years
                        ? CHART_COLORS.ACCENT // Phase 1 is high expense
                        : CHART_COLORS.SUCCESS; // Phase 2 is lower (Step down)
                },
                barThickness: 10,
                maxBarThickness: 12
            }
        ]
    };

    const chartOptions = {
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                position: 'left',
                title: { display: true, text: 'Corpus Balance' },
                ticks: { callback: v => moneyFormat(v, currency, true) }
            },
            y1: {
                position: 'right',
                grid: { display: false },
                title: { display: true, text: 'Annual Withdrawal' },
                ticks: {
                    callback: v => moneyFormat(v, currency),
                    maxTicksLimit: 6
                },
                beginAtZero: true
            }

        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: ctx => {
                        let val = ctx.raw;
                        if (typeof val !== 'number') return '';
                        return `${ctx.dataset.label}: ${moneyFormat(val, currency)}`;
                    },
                    afterBody: (tooltipItems) => {
                        const dataIndex = tooltipItems[0].dataIndex;
                        const yearData = result.yearlyData[dataIndex];
                        if (!yearData || yearData.year === 0) return [];

                        return [
                            '', // Spacer
                            `Opening Balance: ${moneyFormat(yearData.openingBalance, currency)}`,
                            `Interest Earned: +${moneyFormat(yearData.interestEarned, currency)}`,
                            `Total Withdrawal: -${moneyFormat(yearData.annualWithdrawal, currency)}`,
                            `Closing Balance: ${moneyFormat(yearData.corpus, currency)}`
                        ];
                    }
                }
            }
        }
    };

    const isSuccess = result.yearsLasted >= safePlanningHorizon;

    /* ============================
       INPUT UI
       ============================ */
    const inputs = (
        <>
            <InputWithSlider
                label="Retirement Corpus"
                value={corpus}
                onChange={setCorpus}
                min={DEFAULT_CORPUS} // 20L
                max={MAX_CORPUS}
                step={STEP_HUGE}
                currency={currency}
            />

            <InputWithSlider
                label="Expected Return (%)"
                value={annualReturn}
                onChange={setAnnualReturn}
                min={5}
                max={MAX_RATE} // 15 originally, MAX_RATE is 30. Using MAX_RATE ok?
                step={0.1}
            />

            <div className="my-6 pt-4 border-t">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                        How long should this last?
                    </span>
                    <span className="font-bold text-blue-600">
                        {safePlanningHorizon} Years
                    </span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={MAX_YEARS}
                    value={safePlanningHorizon}
                    onChange={e =>
                        setPlanningHorizon(Number(e.target.value))
                    }
                    className="w-full"
                />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
                <InputWithSlider
                    label="Monthly Expense"
                    value={phase1Expense}
                    onChange={(val) => setPhase1Expense(Number(val))}
                    min={20000} // Hardcoded min acceptable
                    max={MAX_EXPENSE_LARGE}
                    step={STEP_EXPENSE}
                    currency={currency}
                />

                <div className="flex items-center mt-4">
                    <input
                        type="checkbox"
                        checked={isStepDownEnabled}
                        onChange={e =>
                            setIsStepDownEnabled(e.target.checked)
                        }
                    />
                    <label className="ml-2 text-sm">
                        I anticipate expenses dropping later
                    </label>
                </div>

                {isStepDownEnabled && (
                    <>
                        <InputWithSlider
                            label="Phase 1 Duration (Years)"
                            value={phase1Years}
                            onChange={(val) => setPhase1Years(Number(val))}
                            min={MIN_YEARS}
                            max={safePlanningHorizon - 1}
                            step={1}
                        />
                        <InputWithSlider
                            label={
                                <div className="flex justify-between w-full">
                                    <span>
                                        Phase 2 Monthly Expense
                                        <span className="text-xs text-gray-500 ml-1 font-normal">
                                            (starting Year {phase1Years + 1})
                                        </span>
                                    </span>
                                </div>
                            }
                            value={phase2Expense}
                            onChange={(val) => setPhase2Expense(Number(val))}
                            min={10000}
                            max={MAX_EXPENSE}
                            step={STEP_EXPENSE}
                            currency={currency}
                        />
                    </>
                )}
            </div>
        </>
    );


    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div
                    className={`p-6 rounded-xl text-center border ${isSuccess
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-rose-50 border-rose-200'
                        }`}
                >
                    <h3 className="font-medium mb-1">
                        {isSuccess ? 'Plan Successful' : 'Plan At Risk'}
                    </h3>
                    <div className="text-4xl font-extrabold">
                        {isSuccess
                            ? 'On Track'
                            : `${result.yearsLasted.toFixed(1)} Years`}
                    </div>
                    <p className="text-sm mt-2">
                        {isSuccess
                            ? `Corpus lasts at least ${safePlanningHorizon} years`
                            : 'Corpus depletes before target'}
                    </p>
                </div>
            }
            charts={
                <div className="h-[400px] bg-white p-4 rounded-xl border">
                    <FinancialBarChart
                        data={chartData}
                        options={chartOptions}
                        currency={currency}
                        height={400}
                    />
                </div>
            }
        />
    );
}
