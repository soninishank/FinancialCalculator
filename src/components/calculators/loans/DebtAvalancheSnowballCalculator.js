import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import FormattedInput from '../../common/FormattedInput';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { CreditCard, TrendingDown, Zap, BarChart3, Clock, DollarSign, Info } from 'lucide-react';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { moneyFormat } from '../../../utils/formatting';

export default function DebtAvalancheSnowballCalculator({ currency = 'USD' }) {
    const [monthlyBudget, setMonthlyBudget] = useState(1500);
    const [debts, setDebts] = useState([
        { id: 1, name: 'Credit Card 1', balance: 5000, rate: 18.99, minPayment: 150 },
        { id: 2, name: 'Credit Card 2', balance: 3200, rate: 22.99, minPayment: 96 },
        { id: 3, name: 'Personal Loan', balance: 8000, rate: 11.5, minPayment: 250 },
        { id: 4, name: 'Car Loan', balance: 12000, rate: 6.5, minPayment: 280 }
    ]);

    const addDebt = () => {
        setDebts([...debts, {
            id: Date.now(),
            name: `Debt ${debts.length + 1}`,
            balance: 1000,
            rate: 15,
            minPayment: 50
        }]);
    };

    const removeDebt = (id) => {
        if (debts.length > 1) {
            setDebts(debts.filter(d => d.id !== id));
        }
    };

    const updateDebt = (id, field, value) => {
        setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const result = useMemo(() => {
        const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
        const extraPayment = Math.max(0, monthlyBudget - totalMinPayment);

        // ========== AVALANCHE METHOD (Highest Interest First) ==========
        const avalancheDebts = [...debts].sort((a, b) => b.rate - a.rate);
        let avalancheMonths = 0;
        let avalancheTotalInterest = 0;
        const avalanchePayoffOrder = [];
        let avalancheBalances = avalancheDebts.map(d => ({ ...d, remaining: d.balance }));

        while (avalancheBalances.some(d => d.remaining > 0)) {
            avalancheMonths++;
            let monthlyExtra = extraPayment;

            // Pay minimum on all debts
            avalancheBalances = avalancheBalances.map(debt => {
                if (debt.remaining <= 0) return debt;

                const interest = (debt.remaining * (debt.rate / 100)) / 12;
                avalancheTotalInterest += interest;
                const principal = debt.minPayment - interest;

                return {
                    ...debt,
                    remaining: Math.max(0, debt.remaining - principal)
                };
            });

            // Apply extra to highest rate debt
            for (let i = 0; i < avalancheBalances.length && monthlyExtra > 0; i++) {
                if (avalancheBalances[i].remaining > 0) {
                    const extraApplied = Math.min(monthlyExtra, avalancheBalances[i].remaining);
                    avalancheBalances[i].remaining -= extraApplied;
                    monthlyExtra -= extraApplied;

                    if (avalancheBalances[i].remaining === 0 && !avalanchePayoffOrder.find(d => d.id === avalancheBalances[i].id)) {
                        avalanchePayoffOrder.push({
                            ...avalancheBalances[i],
                            payoffMonth: avalancheMonths
                        });
                    }
                }
            }

            if (avalancheMonths > 600) break; // Safety limit
        }

        // ========== SNOWBALL METHOD (Smallest Balance First) ==========
        const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
        let snowballMonths = 0;
        let snowballTotalInterest = 0;
        const snowballPayoffOrder = [];
        let snowballBalances = snowballDebts.map(d => ({ ...d, remaining: d.balance }));

        while (snowballBalances.some(d => d.remaining > 0)) {
            snowballMonths++;
            let monthlyExtra = extraPayment;

            // Pay minimum on all debts
            snowballBalances = snowballBalances.map(debt => {
                if (debt.remaining <= 0) return debt;

                const interest = (debt.remaining * (debt.rate / 100)) / 12;
                snowballTotalInterest += interest;
                const principal = debt.minPayment - interest;

                return {
                    ...debt,
                    remaining: Math.max(0, debt.remaining - principal)
                };
            });

            // Apply extra to smallest balance debt
            for (let i = 0; i < snowballBalances.length && monthlyExtra > 0; i++) {
                if (snowballBalances[i].remaining > 0) {
                    const extraApplied = Math.min(monthlyExtra, snowballBalances[i].remaining);
                    snowballBalances[i].remaining -= extraApplied;
                    monthlyExtra -= extraApplied;

                    if (snowballBalances[i].remaining === 0 && !snowballPayoffOrder.find(d => d.id === snowballBalances[i].id)) {
                        snowballPayoffOrder.push({
                            ...snowballBalances[i],
                            payoffMonth: snowballMonths
                        });
                    }
                }
            }

            if (snowballMonths > 600) break;
        }

        const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
        const interestSaved = snowballTotalInterest - avalancheTotalInterest;
        const monthsSaved = snowballMonths - avalancheMonths;

        return {
            totalDebt,
            totalMinPayment,
            extraPayment,
            avalanche: {
                months: avalancheMonths,
                years: !isNaN(avalancheMonths) ? (avalancheMonths / 12).toFixed(1) : "0.0",
                totalInterest: avalancheTotalInterest,
                payoffOrder: avalanchePayoffOrder
            },
            snowball: {
                months: snowballMonths,
                years: !isNaN(snowballMonths) ? (snowballMonths / 12).toFixed(1) : "0.0",
                totalInterest: snowballTotalInterest,
                payoffOrder: snowballPayoffOrder
            },
            interestSaved,
            monthsSaved
        };
    }, [debts, monthlyBudget]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Total Monthly Budget for Debts"
                value={monthlyBudget}
                onChange={setMonthlyBudget}
                min={result.totalMinPayment}
                max={10000}
                step={50}
                currency={currency}
                helperText={`Min payment: $${!isNaN(result.totalMinPayment) ? result.totalMinPayment.toFixed(0) : "0"} | Extra: $${!isNaN(result.extraPayment) ? result.extraPayment.toFixed(0) : "0"}`}
            />

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-700">Your Debts</label>
                    {debts.length < 10 && (
                        <button
                            onClick={addDebt}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Add Debt
                        </button>
                    )}
                </div>

                {debts.map((debt, index) => (
                    <div key={debt.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                value={debt.name}
                                onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                className="font-medium text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none px-1 w-full"
                                placeholder="Debt Name"
                            />
                            {debts.length > 1 && (
                                <button
                                    onClick={() => removeDebt(debt.id)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <label className="text-gray-500 block mb-1">Balance</label>
                                <FormattedInput
                                    value={debt.balance}
                                    onChange={(val) => updateDebt(debt.id, 'balance', val)}
                                    type="currency"
                                    currency={currency}
                                />
                            </div>
                            <div>
                                <label className="text-gray-500 block mb-1">Rate (%)</label>
                                <FormattedInput
                                    value={debt.rate}
                                    onChange={(val) => updateDebt(debt.id, 'rate', val)}
                                    type="percentage"
                                />
                            </div>
                            <div>
                                <label className="text-gray-500 block mb-1">Min Pay</label>
                                <FormattedInput
                                    value={debt.minPayment}
                                    onChange={(val) => updateDebt(debt.id, 'minPayment', val)}
                                    type="currency"
                                    currency={currency}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">


            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Total Debt Balance</p>
                                <p className="text-5xl font-black">{moneyFormat(result.totalDebt, currency)}</p>
                                <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-wider opacity-90">
                                    <span className="bg-white/20 px-2 py-0.5 rounded">{debts.length} active debts</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded">{moneyFormat(result.extraPayment, currency)}/mo extra budget</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${result.interestSaved >= 0 ? 'bg-indigo-50 border-indigo-100 ring-4 ring-indigo-500/5' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-indigo-600" />
                                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Avalanche</h4>
                                    </div>
                                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Mathematical Opt.</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">Debt-Free In</p>
                                        <p className="text-3xl font-black text-indigo-900">{result.avalanche.years} <span className="text-sm font-medium opacity-60">Years</span></p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-indigo-100 pt-3">
                                        <p className="text-[10px] text-indigo-600 font-bold">Total Interest</p>
                                        <p className="font-bold text-indigo-900">{moneyFormat(result.avalanche.totalInterest, currency)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${result.interestSaved < 0 ? 'bg-emerald-50 border-emerald-100 ring-4 ring-emerald-500/5' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5 text-emerald-600" />
                                        <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Snowball</h4>
                                    </div>
                                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Psychological Win</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Debt-Free In</p>
                                        <p className="text-3xl font-black text-emerald-900">{result.snowball.years} <span className="text-sm font-medium opacity-60">Years</span></p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-emerald-100 pt-3">
                                        <p className="text-[10px] text-emerald-600 font-bold">Total Interest</p>
                                        <p className="font-bold text-emerald-900">{moneyFormat(result.snowball.totalInterest, currency)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.interestSaved > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-700 shadow-sm"><Info size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-0.5">Avalanche Advantage</p>
                                    <p className="text-sm text-purple-700 leading-relaxed">
                                        Using the Avalanche method will save you <strong className="text-purple-900">{moneyFormat(result.interestSaved, currency)}</strong> in interest and get you debt-free <strong className="text-purple-900">{Math.abs(result.monthsSaved)} months</strong> sooner.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                }
                charts={
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Payoff visualization chart */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <BarChart3 size={16} /> Payoff Duration Comparison
                                </h4>
                                <div className="h-[300px]">
                                    <FinancialCompoundingBarChart
                                        data={[
                                            { year: "Avalanche", balance: result.avalanche.months },
                                            { year: "Snowball", balance: result.snowball.months }
                                        ]}
                                        currency={currency}
                                        type="investment" // Using this type to avoid loan-specific formatting if needed
                                        customData={[
                                            { name: "Avalanche", value: result.avalanche.months, color: "#4f46e5" },
                                            { name: "Snowball", value: result.snowball.months, color: "#10b981" }
                                        ]}
                                    />
                                    <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest font-bold">(Total Months to Payoff)</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign size={16} /> Total Interest Cost
                                </h4>
                                <div className="h-[300px]">
                                    <FinancialCompoundingBarChart
                                        data={[
                                            { year: "Avalanche", balance: result.avalanche.totalInterest },
                                            { year: "Snowball", balance: result.snowball.totalInterest }
                                        ]}
                                        currency={currency}
                                        type="loan"
                                        customData={[
                                            { name: "Avalanche", value: result.avalanche.totalInterest, color: "#4f46e5" },
                                            { name: "Snowball", value: result.snowball.totalInterest, color: "#10b981" }
                                        ]}
                                    />
                                    <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest font-bold">(Lower is better)</p>
                                </div>
                            </div>
                        </div>

                        {/* Payoff Order Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-black text-xs text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={14} className="fill-indigo-500 text-indigo-500" /> Avalanche Strategy
                                </h3>
                                <div className="space-y-3">
                                    {result.avalanche.payoffOrder.map((debt, idx) => (
                                        <div key={debt.id} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-[10px] text-white flex items-center justify-center font-bold">{idx + 1}</span>
                                                        <p className="font-bold text-sm text-gray-900">{debt.name}</p>
                                                    </div>
                                                    <p className="text-[10px] font-medium text-gray-500 ml-7">{moneyFormat(debt.balance, currency)} @ {debt.rate}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase">Month {debt.payoffMonth}</p>
                                                    <p className="text-[9px] text-gray-400">{!isNaN(debt.payoffMonth) ? (debt.payoffMonth / 12).toFixed(1) : "0.0"} Years</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-black text-xs text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingDown size={14} className="text-emerald-500" /> Snowball Strategy
                                </h3>
                                <div className="space-y-3">
                                    {result.snowball.payoffOrder.map((debt, idx) => (
                                        <div key={debt.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] text-white flex items-center justify-center font-bold">{idx + 1}</span>
                                                        <p className="font-bold text-sm text-gray-900">{debt.name}</p>
                                                    </div>
                                                    <p className="text-[10px] font-medium text-gray-500 ml-7">{moneyFormat(debt.balance, currency)} @ {debt.rate}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase">Month {debt.payoffMonth}</p>
                                                    <p className="text-[9px] text-gray-400">{!isNaN(debt.payoffMonth) ? (debt.payoffMonth / 12).toFixed(1) : "0.0"} Years</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                table={
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h4 className="text-lg font-bold text-gray-800">Methods Side-by-Side</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Strategy Metric</th>
                                        <th className="px-6 py-4 text-indigo-700">Avalanche</th>
                                        <th className="px-6 py-4 text-emerald-700">Snowball</th>
                                        <th className="px-6 py-4 text-gray-900">Winner</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td className="px-6 py-5 font-bold text-gray-700 flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" /> Payoff Duration
                                        </td>
                                        <td className="px-6 py-5 font-black text-indigo-900">{result.avalanche.years} Years</td>
                                        <td className="px-6 py-5 font-black text-emerald-900">{result.snowball.years} Years</td>
                                        <td className="px-6 py-5 italic font-bold text-purple-600">
                                            {result.monthsSaved > 0 ? 'Snowball' : result.monthsSaved < 0 ? 'Avalanche' : 'Tie'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-5 font-bold text-gray-700 flex items-center gap-2">
                                            <DollarSign size={14} className="text-gray-400" /> Total Interest Paid
                                        </td>
                                        <td className="px-6 py-5 font-bold font-mono text-indigo-900">{moneyFormat(result.avalanche.totalInterest, currency)}</td>
                                        <td className="px-6 py-5 font-bold font-mono text-emerald-900">{moneyFormat(result.snowball.totalInterest, currency)}</td>
                                        <td className="px-6 py-5 italic font-bold text-indigo-600">
                                            {result.avalanche.totalInterest < result.snowball.totalInterest ? 'Avalanche' : 'Snowball'}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50/30">
                                        <td className="px-6 py-5 font-bold text-gray-900">Psychological Motivation</td>
                                        <td className="px-6 py-5 text-gray-500">Moderate</td>
                                        <td className="px-6 py-5 text-gray-900 font-bold">High (Early Wins)</td>
                                        <td className="px-6 py-5">–</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
                details={calculatorDetails['debt-avalanche-snowball']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
