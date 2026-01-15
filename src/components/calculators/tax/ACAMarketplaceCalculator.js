import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Heart, DollarSign } from 'lucide-react';

export default function ACAMarketplaceCalculator({ currency = 'USD' }) {
    const [householdIncome, setHouseholdIncome] = useState(55000);
    const [householdSize, setHouseholdSize] = useState(2);
    const [age, setAge] = useState(40);
    const [state, setState] = useState('average'); // average, low, high
    const [metalTier, setMetalTier] = useState('silver'); // bronze, silver, gold, platinum

    const result = useMemo(() => {
        // 2024 Federal Poverty Level (FPL) - Continental US
        const fpl = 15060 + (householdSize - 1) * 5380;
        const fplPercentage = (householdIncome / fpl) * 100;

        // Subsidy eligibility: 100% - 400% FPL
        const isEligibleForSubsidy = fplPercentage >= 100 && fplPercentage <= 400;

        // Premium calculation (rough estimate based on age and tier)
        const ageFactor = age < 30 ? 1.0 : age < 40 ? 1.3 : age < 50 ? 1.7 : age < 60 ? 2.5 : 3.5;

        const tierMultipliers = {
            bronze: 0.75,
            silver: 1.0,
            gold: 1.25,
            platinum: 1.5
        };

        const basePremium = 450 * ageFactor * tierMultipliers[metalTier];

        // Premium Tax Credit (Subsidy) calculation
        // Based on income as % of FPL - simplified sliding scale
        let subsidyAmount = 0;
        let maxPremiumPercentage = 0;

        if (isEligibleForSubsidy) {
            if (fplPercentage <= 150) maxPremiumPercentage = 2;
            else if (fplPercentage <= 200) maxPremiumPercentage = 4;
            else if (fplPercentage <= 250) maxPremiumPercentage = 6;
            else if (fplPercentage <= 300) maxPremiumPercentage = 8.5;
            else if (fplPercentage <= 400) maxPremiumPercentage = 9.5;

            const maxAffordablePremium = (householdIncome * (maxPremiumPercentage / 100)) / 12;
            subsidyAmount = Math.max(0, basePremium - maxAffordablePremium);
        }

        const monthlyPremiumAfterSubsidy = Math.max(0, basePremium - subsidyAmount);
        const annualSavings = subsidyAmount * 12;

        // Out-of-pocket maximums by tier (2024 estimates)
        const oopMaxByTier = {
            bronze: 9450,
            silver: 9450,
            gold: 9450,
            platinum: 4500
        };

        return {
            fpl,
            fplPercentage,
            isEligibleForSubsidy,
            fullMonthlyPremium: basePremium,
            subsidyAmount,
            monthlyPremiumAfterSubsidy,
            annualPremiumCost: monthlyPremiumAfterSubsidy * 12,
            annualSavings,
            oopMax: oopMaxByTier[metalTier]
        };
    }, [householdIncome, householdSize, age, metalTier]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Household Income (MAGI)"
                value={householdIncome}
                onChange={setHouseholdIncome}
                min={10000}
                max={150000}
                step={1000}
                currency={currency}
                helperText="Modified Adjusted Gross Income"
            />

            <InputWithSlider
                label="Household Size"
                value={householdSize}
                onChange={setHouseholdSize}
                min={1}
                max={8}
                step={1}
                suffix=" People"
            />

            <InputWithSlider
                label="Your Age"
                value={age}
                onChange={setAge}
                min={18}
                max={64}
                step={1}
                suffix=" Years"
                helperText="Premiums increase with age"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Metal Tier</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'bronze', label: 'Bronze', coverage: '60%' },
                        { value: 'silver', label: 'Silver', coverage: '70%' },
                        { value: 'gold', label: 'Gold', coverage: '80%' },
                        { value: 'platinum', label: 'Platinum', coverage: '90%' }
                    ].map(tier => (
                        <button
                            key={tier.value}
                            onClick={() => setMetalTier(tier.value)}
                            className={`px-4 py-3 rounded-lg text-left transition-all ${metalTier === tier.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="font-medium text-sm">{tier.label}</div>
                            <div className={`text-xs ${metalTier === tier.value ? 'text-blue-100' : 'text-gray-500'}`}>
                                {tier.coverage} coverage
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Heart className="w-5 h-5" /> ACA Marketplace Calculator
                </h2>
                <p className="text-sm text-blue-800">Estimate health insurance premiums and subsidies under the Affordable Care Act.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Your Monthly Premium</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPremiumAfterSubsidy)}</p>
                            <p className="text-xs mt-2 opacity-90">After Premium Tax Credit</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Income % of FPL</p>
                                <p className="text-2xl font-bold text-gray-900">{result.fplPercentage.toFixed(0)}%</p>
                                <p className="text-[10px] text-gray-400 mt-1">FPL: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.fpl)}</p>
                            </div>
                            <div className={`border p-4 rounded-xl text-center ${result.isEligibleForSubsidy ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: result.isEligibleForSubsidy ? '#059669' : '#6b7280' }}>
                                    Subsidy Status
                                </p>
                                <p className="text-sm font-bold" style={{ color: result.isEligibleForSubsidy ? '#059669' : '#6b7280' }}>
                                    {result.isEligibleForSubsidy ? 'Eligible ✓' : 'Not Eligible'}
                                </p>
                                <p className="text-[10px] mt-1" style={{ color: result.isEligibleForSubsidy ? '#059669' : '#9ca3af' }}>
                                    100-400% FPL
                                </p>
                            </div>
                        </div>

                        {result.isEligibleForSubsidy && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    <p className="text-sm font-bold text-emerald-900">Premium Tax Credit</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-emerald-600">Monthly Subsidy</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.subsidyAmount)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-emerald-600">Annual Savings</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.annualSavings)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Full Premium</p>
                                <p className="text-lg font-bold text-gray-500 line-through">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.fullMonthlyPremium)}
                                </p>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Out-of-Pocket Max</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.oopMax)}
                                </p>
                            </div>
                        </div>
                    </div>
                }
                details={calculatorDetails['aca-marketplace-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
