import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import FormattedInput from '../../common/FormattedInput';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { CreditCard, TrendingDown, Zap } from 'lucide-react';

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
                years: (avalancheMonths / 12).toFixed(1),
                totalInterest: avalancheTotalInterest,
                payoffOrder: avalanchePayoffOrder
            },
            snowball: {
                months: snowballMonths,
                years: (snowballMonths / 12).toFixed(1),
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
                helperText={`Min payment: $${result.totalMinPayment.toFixed(0)} | Extra: $${result.extraPayment.toFixed(0)}`}
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
                                className="font-medium text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none px-1"
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
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Debt Avalanche vs Snowball Calculator
                </h2>
                <p className="text-sm text-red-800">Compare two proven debt payoff strategies side-by-side.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Total Debt</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalDebt)}</p>
                            <p className="text-xs mt-2 opacity-90">{debts.length} debts • ${result.extraPayment.toFixed(0)}/mo extra payment</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs text-blue-900 font-bold uppercase">Avalanche Method</p>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Highest interest first (saves most money)</p>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-[10px] text-blue-600">Debt-Free In</p>
                                        <p className="text-xl font-bold text-blue-700">{result.avalanche.years} years</p>
                                        <p className="text-[9px] text-gray-500">{result.avalanche.months} months</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-600">Total Interest</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.avalanche.totalInterest)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                                    <p className="text-xs text-emerald-900 font-bold uppercase">Snowball Method</p>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Smallest balance first (builds momentum)</p>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-[10px] text-emerald-600">Debt-Free In</p>
                                        <p className="text-xl font-bold text-emerald-700">{result.snowball.years} years</p>
                                        <p className="text-[9px] text-gray-500">{result.snowball.months} months</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-600">Total Interest</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.snowball.totalInterest)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.interestSaved > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
                                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Avalanche Advantage</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.interestSaved)}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    Interest saved • {Math.abs(result.monthsSaved)} months faster
                                </p>
                            </div>
                        )}
                    </div>
                }
                charts={
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-sm text-blue-900 mb-3">🔵 Avalanche Payoff Order</h3>
                            <div className="space-y-2">
                                {result.avalanche.payoffOrder.map((debt, idx) => (
                                    <div key={debt.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{idx + 1}. {debt.name}</p>
                                                <p className="text-xs text-gray-600">${debt.balance.toLocaleString()} @ {debt.rate}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-600">Month {debt.payoffMonth}</p>
                                                <p className="text-[10px] text-gray-500">{(debt.payoffMonth / 12).toFixed(1)} yrs</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-sm text-emerald-900 mb-3">🟢 Snowball Payoff Order</h3>
                            <div className="space-y-2">
                                {result.snowball.payoffOrder.map((debt, idx) => (
                                    <div key={debt.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{idx + 1}. {debt.name}</p>
                                                <p className="text-xs text-gray-600">${debt.balance.toLocaleString()} @ {debt.rate}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-emerald-600">Month {debt.payoffMonth}</p>
                                                <p className="text-[10px] text-gray-500">{(debt.payoffMonth / 12).toFixed(1)} yrs</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
                details={calculatorDetails['debt-avalanche-snowball']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
