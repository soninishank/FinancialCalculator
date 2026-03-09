import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const InflationAdjustedReturnCalculator = ({ currency }) => {
    const [investment, setInvestment] = useState(500000);
    const [nominalReturn, setNominalReturn] = useState(12);
    const [inflationRate, setInflationRate] = useState(6);
    const [years, setYears] = useState(10);

    const result = useMemo(() => {
        const principal = parseFloat(investment) || 0;
        const nominal = parseFloat(nominalReturn) || 0;
        const inflation = parseFloat(inflationRate) || 0;
        const n = parseFloat(years) || 1;

        // Real rate of return using Fisher equation
        const realRate = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;

        const nominalFV = principal * Math.pow(1 + nominal / 100, n);
        const realFV = principal * Math.pow(1 + realRate / 100, n);
        const nominalGain = nominalFV - principal;
        const realGain = realFV - principal;
        const purchasingPowerLoss = nominalFV - realFV;

        // Year-by-year schedule
        const schedule = [];
        for (let y = 1; y <= n; y++) {
            schedule.push({
                year: y,
                nominal: principal * Math.pow(1 + nominal / 100, y),
                real: principal * Math.pow(1 + realRate / 100, y),
            });
        }

        return { realRate, nominalFV, realFV, nominalGain, realGain, purchasingPowerLoss, schedule };
    }, [investment, nominalReturn, inflationRate, years]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Investment Amount"
                value={investment}
                onChange={setInvestment}
                min={10000}
                max={10000000}
                step={10000}
                currency={currency}
            />
            <InputWithSlider
                label="Expected Nominal Return"
                value={nominalReturn}
                onChange={setNominalReturn}
                min={1}
                max={30}
                step={0.5}
                suffix="%"
                helperText="Gross annual return (before adjusting for inflation)"
            />
            <InputWithSlider
                label="Expected Inflation Rate"
                value={inflationRate}
                onChange={setInflationRate}
                min={1}
                max={15}
                step={0.5}
                suffix="%"
                helperText="Average annual inflation rate"
            />
            <InputWithSlider
                label="Time Period"
                value={years}
                onChange={setYears}
                min={1}
                max={40}
                step={1}
                suffix=" years"
            />
        </div>
    );

    const summary = (
        <div className="space-y-4">
            {/* Real Rate Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Real Rate of Return</p>
                <h2 className={`text-5xl font-bold ${result.realRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.realRate.toFixed(2)}%
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                    Nominal {nominalReturn}% − Inflation {inflationRate}% (Fisher equation)
                </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/40">
                    <p className="text-xs font-semibold text-indigo-500 uppercase mb-1">Nominal Future Value</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                        {moneyFormat(result.nominalFV, currency)}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        Gain: {moneyFormat(result.nominalGain, currency)}
                    </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-xs font-semibold text-emerald-500 uppercase mb-1">Real Future Value</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {moneyFormat(result.realFV, currency)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Real Gain: {moneyFormat(result.realGain, currency)}
                    </p>
                </div>
            </div>

            {/* Purchasing Power Loss */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                    🔥 Inflation Erosion: <strong>{moneyFormat(result.purchasingPowerLoss, currency)}</strong>
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This is how much purchasing power you lose over {years} years
                </p>
            </div>
        </div>
    );

    const table = result.schedule.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-700/50">
                            <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Year</th>
                            <th className="px-4 py-3 text-right font-bold text-indigo-700 dark:text-indigo-400">Nominal Value</th>
                            <th className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">Real Value</th>
                            <th className="px-4 py-3 text-right font-bold text-red-700 dark:text-red-400">Inflation Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.schedule.map((row) => (
                            <tr key={row.year} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{row.year}</td>
                                <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">{moneyFormat(row.nominal, currency)}</td>
                                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{moneyFormat(row.real, currency)}</td>
                                <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{moneyFormat(row.nominal - row.real, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : null;

    const details = (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Why Inflation-Adjusted Returns Matter</h3>
            <div className="prose prose-teal max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-4">
                    Earning 12% per year sounds great — until you realize inflation at 6% is silently eating half your gains. The <strong>Real Rate of Return</strong> tells you how much your wealth is <em>actually</em> growing in purchasing power terms.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 my-4">
                    <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">The Fisher Equation</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400 font-mono text-center">
                        Real Rate = ((1 + Nominal) / (1 + Inflation)) − 1
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                        Example: 12% nominal, 6% inflation → Real rate ≈ 5.66% (not 6%).
                    </p>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 mt-6">Key Takeaways</h4>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Beat Inflation First:</strong> If your return doesn't exceed inflation, you're losing money in real terms.</li>
                    <li><strong>Equity Advantage:</strong> Historically, equities (12–15% CAGR) outpace inflation better than FDs (6–7%).</li>
                    <li><strong>Long-Term Impact:</strong> Even a 1% real rate difference compounds into massive wealth gaps over 20+ years.</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                        💡 <strong>Pro Tip:</strong> Always evaluate investment options by their <em>real</em> returns, not nominal. A Fixed Deposit at 7% with 6% inflation gives you only ~0.94% real growth.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            table={table}
            details={details}
            inputLabel="Investment Parameters"
            resultLabel="Year-by-Year Comparison"
        />
    );
};

export default InflationAdjustedReturnCalculator;
