import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { calculateRebalancing } from '../../utils/finance';
import { moneyFormat } from '../../utils/formatting';
import { FinancialDoughnutChart } from '../common/FinancialCharts';
import { downloadPDF } from '../../utils/export';
import { CHART_COLORS, LABELS, MAX_AMOUNT } from '../../utils/constants';

export default function AssetAllocation({ currency }) {
    const [equity, setEquity] = useState(600000);
    const [debt, setDebt] = useState(200000);
    const [targetEquityPercent, setTargetEquityPercent] = useState(60);

    const result = useMemo(() => calculateRebalancing({
        equity, debt, targetEquityPercent
    }), [equity, debt, targetEquityPercent]);

    const chartData = {
        labels: [LABELS.EQUITY, LABELS.DEBT],
        datasets: [
            {
                data: [equity, debt],
                backgroundColor: [CHART_COLORS.SECONDARY, CHART_COLORS.ACCENT],
                borderWidth: 0,
            }
        ]
    };

    const inputs = (
        <>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Current Portfolio</h3>
                </div>

                <InputWithSlider
                    label="Equity Value"
                    value={equity}
                    onChange={setEquity}
                    min={0} max={MAX_AMOUNT} step={10000}
                    currency={currency}
                />
                <InputWithSlider
                    label="Debt / Fixed Income"
                    value={debt}
                    onChange={setDebt}
                    min={0} max={MAX_AMOUNT} step={10000}
                    currency={currency}
                />
                <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Portfolio</span>
                    <span className="text-lg font-bold text-gray-900">{moneyFormat(equity + debt, currency)}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Target Allocation</h3>
                </div>

                <div className="mb-8">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Desired Split</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 text-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <span className="block text-xl font-bold text-blue-700">{targetEquityPercent}%</span>
                            <span className="text-xs text-blue-600 uppercase font-semibold">{LABELS.EQUITY}</span>
                        </div>
                        <span className="text-gray-400 font-bold">:</span>
                        <div className="flex-1 text-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <span className="block text-xl font-bold text-amber-700">{100 - targetEquityPercent}%</span>
                            <span className="text-xs text-amber-600 uppercase font-semibold">{LABELS.DEBT}</span>
                        </div>
                    </div>
                </div>

                <InputWithSlider
                    label="Adjust Equity Target %"
                    value={targetEquityPercent}
                    onChange={setTargetEquityPercent}
                    min={0} max={100}
                    symbol="%"
                />
            </div>
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            </span>
                            Rebalancing Action Plan
                        </h3>
                        <button
                            onClick={() => {
                                const headers = ['Category', 'Current Value', 'Target %', 'Action', 'Amount'];
                                const rows = [
                                    [LABELS.EQUITY, Math.round(equity), `${targetEquityPercent}%`, result.equityAction > 0 ? 'BUY' : 'SELL', Math.round(Math.abs(result.equityAction))],
                                    [LABELS.DEBT, Math.round(debt), `${100 - targetEquityPercent}%`, result.debtAction > 0 ? 'BUY' : 'SELL', Math.round(Math.abs(result.debtAction))]
                                ];
                                downloadPDF(rows, headers, 'asset_allocation_rebalancing.pdf');
                            }}
                            className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Export PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Equity Action Card */}
                        <div className={`relative overflow-hidden p-6 rounded-xl border-l-4 shadow-sm ${result.equityAction > 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div className="relative z-10">
                                <span className="text-sm font-bold tracking-wide uppercase text-gray-500">{LABELS.EQUITY}</span>
                                <div className="flex items-baseline gap-3 mt-1">
                                    <span className={`text-3xl font-extrabold ${result.equityAction > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {result.equityAction > 0 ? 'BUY' : 'SELL'}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-800">
                                        {moneyFormat(Math.abs(result.equityAction), currency)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {result.equityAction > 0
                                        ? "Your equity allocation is below target. Purchase new units."
                                        : "Your equity exposure is too high. Book profits to rebalance."}
                                </p>
                            </div>
                        </div>

                        {/* Debt Action Card */}
                        <div className={`relative overflow-hidden p-6 rounded-xl border-l-4 shadow-sm ${result.debtAction > 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="relative z-10">
                                <span className="text-sm font-bold tracking-wide uppercase text-gray-500">{LABELS.DEBT}</span>
                                <div className="flex items-baseline gap-3 mt-1">
                                    <span className={`text-3xl font-extrabold ${result.debtAction > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {result.debtAction > 0 ? 'BUY' : 'SELL'}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-800">
                                        {moneyFormat(Math.abs(result.debtAction), currency)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {result.debtAction > 0
                                        ? "Increase stability by adding to fixed income."
                                        : "Reduce debt holdings to reallocate to growth assets."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
            pieChart={
                <div className="h-full flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-gray-700 font-bold mb-4">Current Allocation</h4>
                    <div className="relative w-full h-48">
                        <FinancialDoughnutChart
                            data={chartData}
                            currency={currency}
                            height={192}
                            options={{ plugins: { legend: { position: 'bottom' } } }}
                        />
                    </div>
                    <div className="mt-6 w-full space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{LABELS.EQUITY} ({((equity / (equity + debt)) * 100).toFixed(1)}%)</span>
                            <span className="font-semibold">{moneyFormat(equity, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{LABELS.DEBT} ({((debt / (equity + debt)) * 100).toFixed(1)}%)</span>
                            <span className="font-semibold">{moneyFormat(debt, currency)}</span>
                        </div>
                    </div>
                </div>
            }
        />
    );
}

