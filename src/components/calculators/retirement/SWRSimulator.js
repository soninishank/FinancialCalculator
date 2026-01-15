import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { computeSWPPlan } from '../../../utils/finance';
import { moneyFormat } from '../../../utils/formatting';
import { FinancialLineChart } from '../../common/FinancialCharts';
import {
    DEFAULT_RATE,
    DEFAULT_INFLATION,
    DEFAULT_TARGET_AMOUNT, // 1Cr
    MAX_YEARS,
    MAX_CORPUS,
    STEP_HUGE,
    MAX_RATE,
    MAX_INFLATION,
    CHART_COLORS,
    MIN_LOAN // 100k
} from '../../../utils/constants';

export default function SWRSimulator({ currency }) {
    const [corpus, setCorpus] = useState(DEFAULT_TARGET_AMOUNT); // 1 Crore
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE); // 12%
    const [inflation, setInflation] = useState(DEFAULT_INFLATION); // 6%
    const [years, setYears] = useState(30);

    // We simulate 3 scenarios
    const scenarios = useMemo(() => [3, 4, 5], []); // 3%, 4%, 5% SWR

    const results = useMemo(() => {
        return scenarios.map(rate => {
            const startWithdrawal = corpus * (rate / 100) / 12;
            return {
                rate,
                data: computeSWPPlan({
                    initialCorpus: Number(corpus),
                    annualRate: Number(annualReturn),
                    years: Number(years),
                    monthlyWithdrawal: startWithdrawal,
                    annualWithdrawalIncrease: Number(inflation)
                })
            };
        });
    }, [corpus, annualReturn, inflation, years, scenarios]);

    const chartData = {
        labels: Array.from({ length: years }, (_, i) => `Year ${i + 1}`),
        datasets: results.map((res, index) => {
            // Emerald (Success), Amber (Accent/Warning), Red (Danger)
            const colors = [CHART_COLORS.SUCCESS, CHART_COLORS.ACCENT, CHART_COLORS.DANGER];
            return {
                label: `${res.rate}% Withdrawal`,
                data: res.data.rows.map(r => r.closingBalance),
                borderColor: colors[index],
                backgroundColor: colors[index],
                tension: 0.4,
                pointRadius: 2,
            };
        })
    };

    const options = {
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                grid: { display: false }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.dataset.label}: ${moneyFormat(context.raw, currency)}`
                }
            }
        }
    };

    const inputs = (
        <>
            <InputWithSlider
                label="Initial Portfolio Corpus"
                value={corpus}
                onChange={setCorpus}
                min={MIN_LOAN} // 100k
                max={MAX_CORPUS}
                step={STEP_HUGE}
                currency={currency}
            />
            <InputWithSlider
                label="Investment Duration (Years)"
                value={years}
                onChange={setYears}
                min={10}
                max={MAX_YEARS}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <InputWithSlider
                    label="Expected Returns (%)"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    min={5} max={MAX_RATE} step={0.1} symbol="%"
                />
                <InputWithSlider
                    label="Inflation (Annual Withdrawal Hike %)"
                    value={inflation}
                    onChange={setInflation}
                    min={0} max={MAX_INFLATION} step={0.1} symbol="%"
                />
            </div>
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in mb-8">
                    {results.map((res, idx) => {
                        const isDepleted = res.data.depletionYear > 0;
                        const colorClass = idx === 0 ? 'border-emerald-500 bg-emerald-50' : idx === 1 ? 'border-amber-500 bg-amber-50' : 'border-rose-500 bg-rose-50';
                        const textClass = idx === 0 ? 'text-emerald-800' : idx === 1 ? 'text-amber-800' : 'text-rose-800';

                        return (
                            <div key={res.rate} className={`border-l-4 p-4 rounded-lg shadow-sm ${colorClass}`}>
                                <h4 className={`font-bold ${textClass} mb-2`}>{res.rate}% Withdrawal Rate</h4>
                                <div className="text-sm text-gray-600 mb-1">
                                    Start Monthly: <span className="font-semibold">{moneyFormat(corpus * (res.rate / 100) / 12, currency)}</span>
                                </div>
                                <div className={`text-lg font-bold ${isDepleted ? 'text-red-600' : 'text-gray-800'}`}>
                                    {isDepleted
                                        ? `Depleted in Year ${res.data.depletionYear}`
                                        : `Lasts > ${years} Years`}
                                </div>
                                {!isDepleted && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Final Balance: {moneyFormat(res.data.finalCorpus, currency, true)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            }
            charts={
                <div className="h-[350px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <FinancialLineChart data={chartData} options={options} currency={currency} height={350} />
                </div>
            }
        />
    );
}

