import React, { useState, useMemo, useEffect } from 'react';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
import { moneyFormat } from '../../utils/formatting';
import { computeFixedDeposit } from '../../utils/finance';
import { getActualYearAndMonth } from '../../utils/calculatorUtils';
import { FinancialCompoundingBarChart, FinancialInvestmentPieChart } from '../common/FinancialCharts';
import CollapsibleInvestmentTable from '../common/CollapsibleInvestmentTable';
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
        const [startYear] = startDate.split('-').map(Number);

        let totalMonths = 0;
        if (tenureMode === 'Years') totalMonths = tenureValue * 12;
        else if (tenureMode === 'Months') totalMonths = tenureValue;
        else if (tenureMode === 'Days') totalMonths = Math.ceil(tenureValue / 30);

        const yearlyData = [];
        const monthlyData = [];

        const totalYears = Math.ceil(totalMonths / 12);

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

        // Yearly summary
        for (let year = 1; year <= totalYears; year++) {
            const monthsInYear = Math.min(year * 12, totalMonths);
            const yearsElapsed = year - 1;
            const actualYear = startYear + yearsElapsed;
            let balance = P;
            let interest = 0;

            if (payoutType === 'cumulative') {
                const quarters = monthsInYear / 3;
                balance = P * Math.pow(1 + R / 4, quarters);
                interest = balance - P;
            } else {
                const monthlyRate = R / 12;
                interest = P * monthlyRate * monthsInYear;
                balance = P;
            }

            yearlyData.push({
                year: actualYear,
                totalInvested: P,
                growth: interest,
                balance,
                investment: P
            });
        }

        return {
            ...basic,
            yearlyData,
            monthlyData
        };
    }, [principal, rate, tenureValue, tenureMode, payoutType, startDate]);

    return (
        <div className="animate-fade-in">
            {/* INFO BANNER */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" /> Fixed Deposit (FD) Calculator
                </h2>
                <p className="text-sm text-indigo-700 mt-1">Calculate FD returns with flexible options: <strong>Cumulative</strong> (reinvestment with compounding), <strong>Regular Payouts</strong> (monthly, quarterly, half-yearly, yearly income), or <strong>Short-Term</strong> (days-based simple interest). Compare maturity values and periodic payouts instantly.</p>
            </div>

            {/* INPUTS SECTION */}
            <div className="space-y-6 mt-8">
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
                        <label className="text-sm font-bold text-gray-700">Tenure</label>
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
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Deposit Type / Payout</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setPayoutType('cumulative')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === 'cumulative'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Cumulative
                            <span className="block text-[10px] opacity-75 font-normal">Maturity Payment</span>
                        </button>
                        <button
                            onClick={() => setPayoutType('monthly')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === 'monthly'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Monthly
                            <span className="block text-[10px] opacity-75 font-normal">Regular Payout</span>
                        </button>
                        <button
                            onClick={() => setPayoutType('quarterly')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === 'quarterly'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Quarterly
                            <span className="block text-[10px] opacity-75 font-normal">Regular Payout</span>
                        </button>
                        <button
                            onClick={() => setPayoutType('half-yearly')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === 'half-yearly'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Half-Yearly
                            <span className="block text-[10px] opacity-75 font-normal">Regular Payout</span>
                        </button>
                        <button
                            onClick={() => setPayoutType('yearly')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${payoutType === 'yearly'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Yearly
                            <span className="block text-[10px] opacity-75 font-normal">Annual Payout</span>
                        </button>
                    </div>

                    {/* Payout Info */}
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                        {payoutType === 'cumulative' && (
                            <>
                                <strong className="text-gray-900">Cumulative FD:</strong> Interest is compounded quarterly and paid at maturity along with principal. Maximum returns.
                            </>
                        )}
                        {payoutType === 'monthly' && (
                            <>
                                <strong className="text-gray-900">Monthly Payout:</strong> Interest is paid every month. Principal returned at maturity. Ideal for regular income.
                            </>
                        )}
                        {payoutType === 'quarterly' && (
                            <>
                                <strong className="text-gray-900">Quarterly Payout:</strong> Interest is paid every 3 months. Principal returned at maturity. Balanced option.
                            </>
                        )}
                        {payoutType === 'half-yearly' && (
                            <>
                                <strong className="text-gray-900">Half-Yearly Payout:</strong> Interest is paid every 6 months. Principal returned at maturity. Semi-annual income.
                            </>
                        )}
                        {payoutType === 'yearly' && (
                            <>
                                <strong className="text-gray-900">Yearly Payout:</strong> Interest is paid annually. Principal returned at maturity. Once-a-year income.
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* SUMMARY & PIE CHART - Side by Side */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 md:divide-x divide-gray-100">

                    {/* LEFT: METRICS (2/5) */}
                    <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
                        <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Investment</p>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {moneyFormat(principal, currency)}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-emerald-50/30">
                            <p className="text-sm font-semibold text-emerald-900 mb-1">Total Interest</p>
                            <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                                {moneyFormat(result.totalInterest, currency)}
                            </p>
                        </div>

                        <div className="p-6 text-center bg-indigo-50/30">
                            <p className="text-sm font-semibold text-indigo-900 mb-1">
                                {payoutType === 'cumulative' || tenureMode === 'Days' ? 'Maturity Value' : 'Principal Return'}
                            </p>
                            <p className="text-2xl font-bold text-indigo-700 tracking-tight">
                                {moneyFormat(result.maturityValue, currency)}
                            </p>
                            {result.payoutAmount > 0 && (
                                <div className="mt-3 pt-3 border-t border-indigo-100">
                                    <p className="text-xs text-indigo-600 mb-1">
                                        {payoutType === 'monthly' && 'Monthly'}
                                        {payoutType === 'quarterly' && 'Quarterly'}
                                        {payoutType === 'half-yearly' && 'Half-Yearly'}
                                        {payoutType === 'yearly' && 'Yearly'}
                                        {' '}Payout
                                    </p>
                                    <p className="text-lg font-bold text-teal-600">
                                        {moneyFormat(result.payoutAmount, currency)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: PIE CHART (3/5) */}
                    <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center bg-gray-50/30">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 self-start">
                            Break-up of {payoutType === 'cumulative' ? 'Maturity' : 'Returns'}
                        </h4>
                        <div className="w-full h-80">
                            <FinancialInvestmentPieChart
                                invested={principal}
                                gain={result.totalInterest}
                                total={payoutType === 'cumulative' ? result.maturityValue : principal + result.totalInterest}
                                currency={currency}
                                years={tenureMode === 'Years' ? `${tenureValue} Years` : tenureMode === 'Months' ? `${tenureValue} Months` : `${tenureValue} Days`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BAR CHART */}
            {result.yearlyData && result.yearlyData.length > 0 && (
                <div className="mt-8">
                    <FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />
                </div>
            )}

            {/* COLLAPSIBLE TABLE */}
            {result.monthlyData && result.monthlyData.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Growth Schedule</h3>
                        <div className="flex items-center">
                            <label className="text-sm text-gray-700 mr-2 font-medium whitespace-nowrap">Schedule starts:</label>
                            <div className="w-48">
                                <MonthYearPicker
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                            </div>
                        </div>
                    </div>
                    <CollapsibleInvestmentTable
                        yearlyData={result.yearlyData}
                        monthlyData={result.monthlyData}
                        currency={currency}
                    />
                </div>
            )}

            {/* NOTE */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-sm text-gray-700 space-y-3 mt-8">
                <p><strong className="text-gray-900 text-base">Important Notes:</strong></p>

                <div className="space-y-2">
                    <p>• <strong>Cumulative FD (Reinvestment):</strong> Interest is compounded quarterly and paid along with principal at maturity. This gives you the <strong className="text-indigo-600">maximum returns</strong> due to compounding.</p>

                    <p>• <strong>Short Term (Days Mode):</strong> Simple interest calculation is used instead of compound interest.</p>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="font-semibold text-blue-900 mb-1">💡 Key Point: Total Interest Remains Same</p>
                        <p className="text-blue-800">For all <strong>Regular Payout options</strong> (Monthly, Quarterly, Half-Yearly, Yearly), the <strong>total interest earned is identical</strong>. Only the <strong>payout frequency</strong> changes:</p>
                        <ul className="mt-2 ml-4 space-y-1 text-blue-800">
                            <li>• <strong>Monthly:</strong> Get interest in 60 small installments (for 5 years)</li>
                            <li>• <strong>Quarterly:</strong> Get interest in 20 medium installments</li>
                            <li>• <strong>Half-Yearly:</strong> Get interest in 10 larger installments</li>
                            <li>• <strong>Yearly:</strong> Get interest in 5 annual installments</li>
                        </ul>
                        <p className="mt-2 text-xs text-blue-700 italic">Example: ₹1,00,000 @ 7% for 5 years = ₹35,000 total interest (same for all), but you receive ₹583/month OR ₹7,000/year</p>
                    </div>

                    <p>• <strong>No Compounding in Payouts:</strong> Regular payout FDs do not reinvest interest, so you miss out on compound growth compared to cumulative FDs.</p>

                    <p>• <strong>Best for Regular Income:</strong> Choose payout FDs if you need periodic income (e.g., monthly expenses). Choose cumulative for maximum wealth creation.</p>
                </div>
            </div>
        </div>
    );
}
