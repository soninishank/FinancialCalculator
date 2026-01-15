import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Wallet, TrendingDown } from 'lucide-react';

export default function FSACalculator({ currency = 'USD' }) {
    const [annualSalary, setAnnualSalary] = useState(75000);
    const [fsaType, setFsaType] = useState('health'); // health, dependent
    const [annualContribution, setAnnualContribution] = useState(2850);
    const [marginalTaxRate, setMarginalTaxRate] = useState(22);
    const [stateTaxRate, setStateTaxRate] = useState(5);

    const result = useMemo(() => {
        // 2024 FSA limits
        const limits = {
            health: 3200,
            dependent: 5000
        };

        const maxContribution = limits[fsaType];
        const cappedContribution = Math.min(annualContribution, maxContribution);

        // Tax savings calculation
        // FSA contributions are exempt from Federal, State, FICA (7.65%)
        const federalSavings = cappedContribution * (marginalTaxRate / 100);
        const stateSavings = cappedContribution * (stateTaxRate / 100);
        const ficaSavings = cappedContribution * 0.0765; // 6.2% Social Security + 1.45% Medicare

        const totalTaxSavings = federalSavings + stateSavings + ficaSavings;

        // Effective discount on expenses
        const effectiveDiscountRate = (totalTaxSavings / cappedContribution) * 100;

        // Monthly planning
        const monthlyContribution = cappedContribution / 12;
        const monthlyBudget = cappedContribution / 12;

        // Grace period / carryover
        const graceAmount = fsaType === 'health' ? 610 : 0; // 2024 health FSA carryover limit

        return {
            cappedContribution,
            maxContribution,
            federalSavings,
            stateSavings,
            ficaSavings,
            totalTaxSavings,
            effectiveDiscountRate,
            monthlyContribution,
            monthlyBudget,
            graceAmount,
            isOverLimit: annualContribution > maxContribution
        };
    }, [annualSalary, fsaType, annualContribution, marginalTaxRate, stateTaxRate]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Annual Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                min={30000}
                max={200000}
                step={5000}
                currency={currency}
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">FSA Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'health', label: 'Healthcare FSA', limit: '$3,200' },
                        { value: 'dependent', label: 'Dependent Care FSA', limit: '$5,000' }
                    ].map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFsaType(type.value)}
                            className={`px-4 py-3 rounded-lg text-left transition-all ${fsaType === type.value
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className={`text-xs ${fsaType === type.value ? 'text-teal-100' : 'text-gray-500'}`}>
                                Limit: {type.limit}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Annual FSA Contribution"
                value={annualContribution}
                onChange={setAnnualContribution}
                min={500}
                max={result.maxContribution}
                step={50}
                currency={currency}
                helperText={`2024 limit: $${result.maxContribution.toLocaleString()}`}
            />

            <InputWithSlider
                label="Federal Marginal Tax Rate (%)"
                value={marginalTaxRate}
                onChange={setMarginalTaxRate}
                min={10}
                max={37}
                step={1}
                symbol="%"
                helperText="10%, 12%, 22%, 24%, 32%, 35%, 37%"
            />

            <InputWithSlider
                label="State Tax Rate (%)"
                value={stateTaxRate}
                onChange={setStateTaxRate}
                min={0}
                max={13}
                step={0.5}
                symbol="%"
                isDecimal={true}
                helperText="0% in states with no income tax"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> FSA Calculator
                </h2>
                <p className="text-sm text-teal-800">Calculate tax savings from Flexible Spending Account contributions.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Total Annual Tax Savings</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalTaxSavings)}</p>
                            <p className="text-xs mt-2 opacity-90">
                                {result.effectiveDiscountRate.toFixed(1)}% effective discount on expenses
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Federal</p>
                                <p className="text-base font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.federalSavings)}
                                </p>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">State</p>
                                <p className="text-base font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.stateSavings)}
                                </p>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">FICA</p>
                                <p className="text-base font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.ficaSavings)}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-bold text-blue-900">Monthly Budget Planning</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-blue-600">Monthly Contribution</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyContribution)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600">Annual Budget</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.cappedContribution)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {fsaType === 'health' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Carryover Allowed</p>
                                <p className="text-lg font-bold text-emerald-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.graceAmount)}
                                </p>
                                <p className="text-[10px] text-emerald-500 mt-1">2024 health FSA carryover limit</p>
                            </div>
                        )}

                        {result.isOverLimit && (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                                <p className="text-xs text-amber-700">
                                    ⚠️ Contribution exceeds ${result.maxContribution.toLocaleString()} annual limit
                                </p>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold mb-2">FSA Rules:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use-it-or-lose-it (except ${result.graceAmount} carryover for health FSA)</li>
                                <li>Pre-tax contributions reduce taxable income</li>
                                <li>Can't change contribution mid-year (except qualifying life events)</li>
                                {fsaType === 'dependent' && <li>Dependent Care: for children under 13 or disabled dependents</li>}
                            </ul>
                        </div>
                    </div>
                }
                details={calculatorDetails['fsa-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
