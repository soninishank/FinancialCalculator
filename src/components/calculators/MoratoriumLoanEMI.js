import React, { useState, useMemo } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import { moneyFormat } from '../../utils/formatting';
import { downloadPDF } from '../../utils/export';
import { computeMoratoriumLoanAmortization } from '../../utils/finance';
import CollapsibleAmortizationTable from '../common/CollapsibleAmortizationTable';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MoratoriumLoanEMI({ currency = 'INR' }) {
    const [principal, setPrincipal] = useState(1000000); // 10 Lakhs
    const [rate, setRate] = useState(10); // 10%
    const [tenure, setTenure] = useState(10); // 10 Years
    const [moratoriumMonths, setMoratoriumMonths] = useState(6);
    const [payInterest, setPayInterest] = useState(false); // Capitalize by default

    const results = useMemo(() => {
        return computeMoratoriumLoanAmortization({
            principal,
            annualRate: rate,
            totalTenureYears: tenure,
            moratoriumMonths,
            payInterestDuringMoratorium: payInterest
        });
    }, [principal, rate, tenure, moratoriumMonths, payInterest]);

    // Chart Data
    const labels = results.monthlyRows.filter((_, i) => i % 6 === 0).map(r => `M${r.month}`);
    const dataPoints = results.monthlyRows.filter((_, i) => i % 6 === 0).map(r => r.balance);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Loan Balance',
                data: dataPoints,
                borderColor: '#f59e0b', // Amber
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = { responsive: true, scales: { y: { ticks: { callback: val => moneyFormat(val, currency, true) } } } };

    const emiIncrease = results.emiAfter - results.emiBefore;
    // If negative (impossible usually unless prepaying), handle gracefully


    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <h2 className="text-xl font-bold text-amber-900">Moratorium Impact Calculator</h2>
                <p className="text-sm text-amber-700">See how taking a "EMI Holiday" affects your future payments and total loan cost.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INPUTS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Loan Details</h3>
                        <InputWithSlider label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={10000000} step={50000} currency={currency} />
                        <InputWithSlider label="Interest Rate (%)" value={rate} onChange={setRate} min={1} max={20} step={0.1} symbol="%" />
                        <InputWithSlider label="Total Tenure (Years)" value={tenure} onChange={setTenure} min={1} max={30} />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-amber-500">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Moratorium Period</h3>
                        <InputWithSlider label="Moratorium Months" value={moratoriumMonths} onChange={setMoratoriumMonths} min={0} max={36} suffix="Months" />

                        <div className="flex items-center justify-between mt-4 bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-semibold text-gray-700">Pay Interest during Moratorium?</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={payInterest} onChange={(e) => setPayInterest(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {payInterest
                                ? "✅ Simple Interest paid monthly. Principal does NOT increase."
                                : "⚠️ Interest is added to Principal (Compound effect). Costly!"}
                        </p>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="space-y-6">
                    {/* HIGHLIGHT CARD */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl relative overflow-hidden">
                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Original EMI</p>
                                <p className="text-2xl font-bold text-gray-800">{moneyFormat(results.emiBefore, currency)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase">New EMI (Post-Moratorium)</p>
                                <p className="text-3xl font-extrabold text-amber-600">{moneyFormat(results.emiAfter, currency)}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-red-700">Cost of Moratorium</p>
                                    <p className="text-sm text-red-600 mt-1">
                                        Your EMI increases by <strong>{moneyFormat(emiIncrease, currency)}</strong>/month. <br />
                                        You pay roughly <strong>{moneyFormat(results.finalTotalPaid - (results.emiBefore * tenure * 12), currency)}</strong> extra over the loan term.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64">
                        <Line data={chartData} options={options} />
                    </div>
                </div>

                {/* TABLE */}
                <div className="md:col-span-2 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Amortization Schedule</h3>
                        <button
                            onClick={() => {
                                const data = results.monthlyRows.map(r => [
                                    `Month ${r.month}`,
                                    Math.round(r.principalPaid),
                                    Math.round(r.interestPaid),
                                    Math.round(r.balance)
                                ]);
                                downloadPDF(data, ['Month', 'Principal', 'Interest', 'Balance'], 'moratorium_schedule.pdf');
                            }}
                            className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Export PDF
                        </button>
                    </div>
                    <CollapsibleAmortizationTable
                        yearlyData={results.yearlyData}
                        monthlyData={results.monthlyRows}
                        currency={currency}
                    />
                </div>
            </div>
        </div>
    );
}
