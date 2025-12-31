import React, { useState, useMemo, useEffect } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import CalculatorLayout from '../common/CalculatorLayout';
import UnifiedSummary from '../common/UnifiedSummary';
import MonthYearPicker from '../common/MonthYearPicker';
import { moneyFormat } from '../../utils/formatting';
import { downloadPDF } from '../../utils/export';
import { computeFixedDeposit } from '../../utils/finance';
import { getActualYearAndMonth } from '../../utils/calculatorUtils';
import { FinancialCompoundingBarChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
import { calculatorDetails } from '../../data/calculatorDetails';
import { PiggyBank } from 'lucide-react';

export default function FixedDeposit({ currency = 'INR' }) {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(6.5);
    const [tenureValue, setTenureValue] = useState(1);
    const [tenureMode, setTenureMode] = useState('Years'); // Years | Months | Days
    const [payoutType, setPayoutType] = useState('cumulative'); // cumulative | monthly | quarterly | half-yearly | yearly
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7));

    // Auto-select cumulative when Days is chosen (short-term FDs don't support payouts)
    useEffect(() => {
        if (tenureMode === 'Days' && payoutType !== 'cumulative') {
            setPayoutType('cumulative');
        }
    }, [tenureMode, payoutType]);

    const result = useMemo(() => {
        const basic = computeFixedDeposit({
            principal,
            rate,
            tenureValue,
            tenureMode,
            payoutType
        });

        // Generate yearly and monthly data for table/chart
        const P = Number(principal);
        const R = Number(rate) / 100;
        // removed unused startYear extraction

        let totalMonths = 0;
        if (tenureMode === 'Years') totalMonths = tenureValue * 12;
        else if (tenureMode === 'Months') totalMonths = tenureValue;
        else if (tenureMode === 'Days') totalMonths = Math.ceil(tenureValue / 30);

        const yearlyData = [];
        const monthlyData = [];

        // removed unused totalYears calculation

        // Monthly breakdown
        for (let month = 1; month <= totalMonths; month++) {
            const { year: actualYear, monthName: actualMonthName } = getActualYearAndMonth(startDate, month);
            const monthInYear = ((month - 1) % 12) + 1;

            let balance = P;
            let interest = 0;

            if (payoutType === 'cumulative') {
                // Quarterly compounding
                const quarters = month / 3;
                balance = P * Math.pow(1 + R / 4, quarters);
                interest = balance - P;
            } else {
                // For payout schemes, interest accrues but is paid out
                const monthlyRate = R / 12;
                interest = P * monthlyRate * month;
                balance = P; // Principal remains
            }

            monthlyData.push({
                year: actualYear,
                month: monthInYear,
                monthName: actualMonthName,
                invested: P,
                interest,
                balance
            });
        }

        // Yearly summary (derived from monthly data for calendar accuracy)
        monthlyData.forEach((m, index) => {
            const isDec = m.monthName === 'Dec';
            const isLast = index === monthlyData.length - 1;

            if (isDec || isLast) {
                yearlyData.push({
                    year: m.year,
                    totalInvested: m.invested,
                    growth: m.interest,
                    balance: m.balance,
                    investment: m.invested
                });
            }
        });

        return {
            ...basic,
            yearlyData,
            monthlyData
        };
    }, [principal, rate, tenureValue, tenureMode, payoutType, startDate]);

    const inputs = (
        <div className="space-y-6">
            {/* Deposit Amount */}
            <InputWithSlider
                label="Total Investment"
                value={principal}
                onChange={setPrincipal}
                min={5000}
                max={10000000}
                step={5000}
                currency={currency}
            />

            {/* Interest Rate */}
            <InputWithSlider
                label="Interest Rate (% p.a)"
                value={rate}
                onChange={setRate}
                min={1}
                max={15}
                step={0.1}
                symbol="%"
                isDecimal={true}
            />

            {/* Tenure */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-tight">Tenure</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Years', 'Months', 'Days'].map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setTenureMode(m);
                                    if (m === 'Days') setTenureValue(90);
                                    else if (m === 'Months') setTenureValue(12);
                                    else setTenureValue(1);
                                }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureMode === m
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <InputWithSlider
                    label=""
                    value={tenureValue}
                    onChange={setTenureValue}
                    min={tenureMode === 'Days' ? 7 : 1}
                    max={tenureMode === 'Days' ? 1000 : (tenureMode === 'Months' ? 300 : 10)}
                    step={1}
                    hideLabel={true}
                    suffix={tenureMode}
                />
            </div>

            {/* Payout Type */}
            <div>
                <label className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 block">Deposit Type / Payout</label>
                <div className="grid grid-cols-3 gap-2">
                    {['cumulative', 'monthly', 'quarterly', 'half-yearly', 'yearly'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setPayoutType(type)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === type
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="capitalize">{type === 'cumulative' ? 'Cumulative' : type}</span>
                            <span className="block text-[10px] opacity-75 font-normal">
                                {type === 'cumulative' ? 'Maturity Payment' : 'Regular Payout'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Payout Info */}
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                    {payoutType === 'cumulative' && (
                        <>
                            <strong className="text-gray-900">Cumulative FD:</strong> Interest is compounded quarterly and paid at maturity along with principal. Maximum returns.
                        </>
                    )}
                    {payoutType !== 'cumulative' && (
                        <>
                            <strong className="text-gray-900 capitalize">{payoutType} Payout:</strong> Interest is paid every {payoutType === 'monthly' ? 'month' : payoutType === 'quarterly' ? '3 months' : payoutType === 'half-yearly' ? '6 months' : 'year'}. Principal returned at maturity.
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* INFO BANNER */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" /> Fixed Deposit (FD) Calculator
                </h2>
                <p className="text-sm text-indigo-700 mt-1">Calculate FD returns with flexible options: <strong>Cumulative</strong> (reinvestment with compounding), <strong>Regular Payouts</strong> (monthly, quarterly, half-yearly, yearly income), or <strong>Short-Term</strong> (days-based simple interest). Compare maturity values and periodic payouts instantly.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-8">
                        <UnifiedSummary
                            invested={principal}
                            gain={result.totalInterest}
                            total={result.maturityValue}
                            currency={currency}
                            years={tenureMode === 'Years' ? tenureValue.toFixed(1) : (tenureValue / 12).toFixed(1)}
                        />
                        {result.payoutAmount > 0 && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
                                    Estimated {payoutType} Payout
                                </p>
                                <p className="text-2xl font-black text-indigo-700">
                                    {moneyFormat(result.payoutAmount, currency)}
                                </p>
                            </div>
                        )}
                    </div>
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                table={
                    <div className="mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        const data = result.yearlyData.map(r => [
                                            `Year ${r.year}`,
                                            Math.round(r.totalInvested),
                                            Math.round(r.growth),
                                            Math.round(r.balance)
                                        ]);
                                        downloadPDF(data, ['Year', 'Principal', 'Interest', 'Balance'], 'fd_schedule.pdf');
                                    }}
                                    className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    Export PDF
                                </button>
                                <div className="flex items-center">
                                    <label className="text-sm font-black text-slate-900 uppercase tracking-tight mr-2 whitespace-nowrap">Schedule starts:</label>
                                    <div className="w-48">
                                        <MonthYearPicker
                                            value={startDate}
                                            onChange={setStartDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CollapsibleInvestmentTable
                            yearlyData={result.yearlyData}
                            monthlyData={result.monthlyData}
                            currency={currency}
                        />
                    </div>
                }
                details={calculatorDetails['fixed-deposit'].render()}
            />
        </div>
    );
}
