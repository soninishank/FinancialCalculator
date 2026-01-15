import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';
import { computeStepUpLoanAmortization } from '../../../utils/finance';
import MonthYearPicker from '../../common/MonthYearPicker';
import { downloadPDF } from '../../../utils/export';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { FinancialLineChart } from '../../common/FinancialCharts';
import { TrendingDown, Clock, Banknote, Percent } from 'lucide-react';
// removed direct ChartJS registration

export default function StepUpLoanEMI({ currency = 'INR' }) {
    // 1. Basic Loan
    const [principal, setPrincipal] = useState(5000000);
    const [rate, setRate] = useState(9);
    const [tenure, setTenure] = useState(20);

    const [tenureMode, setTenureMode] = useState('Years'); // 'Years' | 'Months'
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7));

    const handleTenureModeChange = (mode) => {
        if (mode === tenureMode) return;
        setTenureMode(mode);
        if (mode === 'Months') {
            setTenure((prev) => Math.round(prev * 12));
        } else {
            setTenure((prev) => Number((prev / 12).toFixed(1)));
        }
    };

    // Derived tenure in years for calculation
    const effectiveTenureYears = tenureMode === 'Months' ? tenure / 12 : tenure;

    // 2. Step Up Strategy
    const [stepUpType, setStepUpType] = useState('percent'); // 'percent' | 'amount'
    const [stepUpValue, setStepUpValue] = useState(5); // 5% increase per year

    // 3. Rate Change Strategy
    const [enableRateChange, setEnableRateChange] = useState(false);
    const [rateChangeYear, setRateChangeYear] = useState(2);
    const [newRate, setNewRate] = useState(8.5); // Lower rate

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        // A. Regular Scenario (No step up, constant rate)
        const regular = computeStepUpLoanAmortization({
            principal,
            annualRate: rate,
            years: effectiveTenureYears,
            stepUpType: 'amount',
            stepUpValue: 0
        });

        // B. Smart Scenario (Step Up + Rate Change)
        const smart = computeStepUpLoanAmortization({
            principal,
            annualRate: rate,
            years: tenure,
            stepUpType,
            stepUpValue,
            rateChangeYear: enableRateChange ? rateChangeYear : null,
            newRate: enableRateChange ? newRate : null
        });

        return { regular, smart };
    }, [principal, rate, tenure, effectiveTenureYears, stepUpType, stepUpValue, enableRateChange, rateChangeYear, newRate]);

    const { regular, smart } = results;

    const savingsInterest = regular.finalTotalInterest - smart.finalTotalInterest;
    const timeSavedMonths = regular.monthsTaken - smart.monthsTaken;
    const timeSavedYears = (timeSavedMonths / 12).toFixed(1);

    // Helper to calc end date
    const getEndDate = (months) => {
        const d = new Date(startDate);
        // Reset to first day to avoid overflow
        d.setDate(1);
        d.setMonth(d.getMonth() + months);
        // Format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const regularEndDate = getEndDate(regular.monthsTaken);
    const smartEndDate = getEndDate(smart.monthsTaken);

    // --- CHART DATA ---
    // --- CHART DATA ---
    // Normalized for FinancialLineChart
    const labels = regular.monthlyRows.filter((_, i) => i % 12 === 0).map(r => `Year ${Math.ceil(r.month / 12)}`);
    const regularBalance = regular.monthlyRows.filter((_, i) => i % 12 === 0).map(r => r.balance);
    const smartBalance = smart.monthlyRows.filter((_, i) => i % 12 === 0).map(r => r.balance);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Regular Loan Balance',
                data: regularBalance,
                borderColor: '#94a3b8', // Gray
                backgroundColor: 'rgba(148, 163, 184, 0.0)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Smart Step-Up Balance',
                data: smartBalance,
                borderColor: '#10b981', // Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <h2 className="text-xl font-bold text-emerald-900">Step-Up Loan Repayment</h2>
                <p className="text-sm text-emerald-700">See how increasing your EMI annually or getting a lower interest rate accelerates your loan freedom.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INPUTS */}
                <div className="space-y-6">
                    {/* 1. Base Loan */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-teal-600" /> Loan Details
                        </h3>
                        <InputWithSlider label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={50000000} step={50000} currency={currency} />
                        <InputWithSlider label="Interest Rate (%)" value={rate} onChange={setRate} min={1} max={20} step={0.1} symbol="%" />
                        <InputWithSlider
                            label={`Tenure (${tenureMode})`}
                            value={tenure}
                            onChange={setTenure}
                            min={tenureMode === 'Months' ? 6 : 1}
                            max={tenureMode === 'Months' ? 360 : 30}
                            step={tenureMode === 'Months' ? 1 : 0.5}
                            rightElement={
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {['Years', 'Months'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => handleTenureModeChange(mode)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureMode === mode
                                                ? 'bg-white text-teal-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            }
                        />


                        <div className="mt-4">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-tight block mb-2">Loan Start Date</label>
                            <MonthYearPicker value={startDate} onChange={setStartDate} />
                        </div>
                    </div>

                    {/* 2. Step Up */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-emerald-600" /> Annual Step-Up Strategy
                        </h3>

                        <div className="flex bg-gray-100 p-1 rounded-lg mb-4 w-fit">
                            <button onClick={() => setStepUpType('percent')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${stepUpType === 'percent' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>% Percentage</button>
                            <button onClick={() => setStepUpType('amount')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${stepUpType === 'amount' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>₹ Fixed Amount</button>
                        </div>

                        {stepUpType === 'percent' ? (
                            <InputWithSlider label="Increase EMI Yearly By (%)" value={stepUpValue} onChange={setStepUpValue} min={0} max={50} step={1} symbol="%" />
                        ) : (
                            <InputWithSlider label="Increase EMI Yearly By (₹)" value={stepUpValue} onChange={setStepUpValue} min={0} max={20000} step={500} currency={currency} />
                        )}
                    </div>

                    {/* 3. Rate Change (Optional) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-indigo-600" /> Interest Rate Drop?
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <span className="sr-only">Enable Rate Change</span>
                                <div
                                    onClick={() => setEnableRateChange(!enableRateChange)}
                                    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${enableRateChange ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out shadow-sm ${enableRateChange ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>

                        {enableRateChange && (
                            <div className="animate-fade-in space-y-4">
                                <InputWithSlider label="Rate drops after (Year)" value={rateChangeYear} onChange={setRateChangeYear} min={1} max={effectiveTenureYears - 1} suffix="Year" />
                                <InputWithSlider label="New Interest Rate (%)" value={newRate} onChange={setNewRate} min={1} max={rate - 0.1} step={0.1} symbol="%" />
                            </div>
                        )}
                    </div>
                </div>

                {/* OUTPUTS */}
                <div className="space-y-6">
                    {/* SAVINGS CARD */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Total Savings</p>
                            <h3 className="text-4xl font-extrabold mb-1">{moneyFormat(savingsInterest, currency)}</h3>
                            <p className="text-emerald-300 font-bold flex items-center gap-2 mt-2">
                                <Clock className="w-4 h-4" /> Paid off {timeSavedYears} years earlier
                            </p>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                    </div>

                    {/* COMPARISON GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Regular Total Interest</p>
                            <p className="text-lg font-bold text-gray-700">{moneyFormat(regular.finalTotalInterest, currency)}</p>

                            <div className="flex justify-between items-center mt-2 border-t border-gray-200 pt-2">
                                <p className="text-xs text-gray-400">Tenure: {effectiveTenureYears} Years</p>
                                <p className="text-xs font-bold text-gray-500">Ends: {regularEndDate}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Step-Up Total Interest</p>
                            <p className="text-lg font-bold text-emerald-700">{moneyFormat(smart.finalTotalInterest, currency)}</p>
                            <div className="flex justify-between items-center mt-2 border-t border-emerald-200 pt-2">
                                <p className="text-xs text-emerald-600">Tenure: {(smart.monthsTaken / 12).toFixed(1)} Years</p>
                                <p className="text-xs font-bold text-emerald-700">Ends: {smartEndDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-80">
                        <h4 className="text-sm font-bold text-gray-700 mb-4">Loan Balance Projection</h4>
                        <FinancialLineChart data={chartData} currency={currency} height={280} />
                    </div>

                    {/* AMORTIZATION TABLE (Smart Strategy) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-gray-700">Detailed Schedule (Smart Strategy)</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const data = smart.monthlyRows.map(r => [
                                            `Month ${r.month}`,
                                            Math.round(r.principal),
                                            Math.round(r.interest),
                                            Math.round(r.balance)
                                        ]);
                                        const headers = ['Month', 'Principal', 'Interest', 'Balance'];
                                        downloadPDF(data, headers, 'step_up_loan_schedule.pdf');
                                    }}
                                    className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors"
                                >
                                    Export PDF
                                </button>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full flex items-center">Reduced Tenure</span>
                            </div>
                        </div>
                        <CollapsibleAmortizationTable
                            yearlyData={smart.yearlyRows}
                            monthlyData={smart.monthlyRows}
                            currency={currency}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
