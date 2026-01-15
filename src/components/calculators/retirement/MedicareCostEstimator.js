import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { HeartPulse, AlertTriangle } from 'lucide-react';

export default function MedicareCostEstimator({ currency = 'USD' }) {
    const [age, setAge] = useState(65);
    const [magi, setMAGI] = useState(95000); // Modified Adjusted Gross Income
    const [filingStatus, setFilingStatus] = useState('single'); // single, joint
    const [partDPremium, setPartDPremium] = useState(35);
    const [medigapPlan, setMedigapPlan] = useState('G'); // F, G, N
    const [yearsToProject, setYearsToProject] = useState(20);

    const result = useMemo(() => {
        // 2024 Medicare Part B base premium
        const partBBase = 174.70;

        // IRMAA tiers (2024) - Income-Related Monthly Adjustment Amount
        const irmaaTable = filingStatus === 'single' ? [
            { limit: 103000, partB: 0, partD: 0 },
            { limit: 129000, partB: 69.90, partD: 12.90 },
            { limit: 161000, partB: 174.70, partD: 33.30 },
            { limit: 193000, partB: 279.50, partD: 53.80 },
            { limit: 500000, partB: 384.30, partD: 74.20 },
            { limit: Infinity, partB: 419.30, partD: 81.00 }
        ] : [
            { limit: 206000, partB: 0, partD: 0 },
            { limit: 258000, partB: 69.90, partD: 12.90 },
            { limit: 322000, partB: 174.70, partD: 33.30 },
            { limit: 386000, partB: 279.50, partD: 53.80 },
            { limit: 750000, partB: 384.30, partD: 74.20 },
            { limit: Infinity, partB: 419.30, partD: 81.00 }
        ];

        const irmaa = irmaaTable.find(tier => magi <= tier.limit);
        const monthlyPartB = partBBase + (irmaa?.partB || 0);
        const monthlyPartD = partDPremium + (irmaa?.partD || 0);

        // Medigap costs (rough 2024 averages by plan)
        const medigapCosts = {
            F: 250,
            G: 175,
            N: 125
        };
        const monthlyMedigap = medigapCosts[medigapPlan] || 0;

        const totalMonthly = monthlyPartB + monthlyPartD + monthlyMedigap;
        const totalAnnual = totalMonthly * 12;

        // Lifetime projection with 4% annual inflation
        let lifetimeCost = 0;
        const yearlyBreakdown = [];
        for (let year = 1; year <= yearsToProject; year++) {
            const inflationFactor = Math.pow(1.04, year - 1);
            const yearCost = totalAnnual * inflationFactor;
            lifetimeCost += yearCost;
            if (year <= 10 || year % 5 === 0) {
                yearlyBreakdown.push({
                    year,
                    age: age + year - 1,
                    monthlyCost: (yearCost / 12),
                    annualCost: yearCost,
                    cumulativeCost: lifetimeCost
                });
            }
        }

        return {
            monthlyPartB,
            monthlyPartD,
            monthlyMedigap,
            totalMonthly,
            totalAnnual,
            lifetimeCost,
            yearlyBreakdown,
            hasIRMAA: (irmaa?.partB || 0) > 0
        };
    }, [age, magi, filingStatus, partDPremium, medigapPlan, yearsToProject]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Your Current Age"
                value={age}
                onChange={setAge}
                min={65}
                max={95}
                step={1}
                suffix=" Years"
            />

            <InputWithSlider
                label="Modified Adjusted Gross Income (MAGI)"
                value={magi}
                onChange={setMAGI}
                min={0}
                max={500000}
                step={5000}
                currency={currency}
                helperText="From 2 years ago (IRS lookback)"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'single', label: 'Single' },
                        { value: 'joint', label: 'Married Filing Jointly' }
                    ].map(status => (
                        <button
                            key={status.value}
                            onClick={() => setFilingStatus(status.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filingStatus === status.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Part D Drug Plan Premium"
                value={partDPremium}
                onChange={setPartDPremium}
                min={0}
                max={150}
                step={5}
                currency={currency}
                helperText="Average: $35-50/month"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Medigap Plan</label>
                <div className="grid grid-cols-3 gap-2">
                    {['F', 'G', 'N'].map(plan => (
                        <button
                            key={plan}
                            onClick={() => setMedigapPlan(plan)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${medigapPlan === plan
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Plan {plan}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500">Plan G most popular (F closed to new enrollees)</p>
            </div>

            <InputWithSlider
                label="Years to Project"
                value={yearsToProject}
                onChange={setYearsToProject}
                min={5}
                max={30}
                step={1}
                suffix=" Years"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5" /> Medicare Cost Estimator
                </h2>
                <p className="text-sm text-teal-800">Estimate Medicare Part B, Part D, Medigap, and IRMAA surcharges.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Total Monthly Cost</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalMonthly)}</p>
                            <p className="text-xs mt-2 opacity-90">Annual: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalAnnual)}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Part B</p>
                                <p className="text-lg font-bold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPartB)}</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Part D</p>
                                <p className="text-lg font-bold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPartD)}</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Medigap</p>
                                <p className="text-lg font-bold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyMedigap)}</p>
                            </div>
                        </div>

                        {result.hasIRMAA && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <p className="text-sm font-bold text-amber-900">IRMAA Surcharge Applied</p>
                                </div>
                                <p className="text-xs text-amber-700">
                                    High earners pay Income-Related Monthly Adjustment Amounts on Part B & D.
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Lifetime Cost ({yearsToProject} years)</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.lifetimeCost)}
                            </p>
                            <p className="text-[10px] text-blue-500 mt-1">Includes 4% annual inflation</p>
                        </div>
                    </div>
                }
                charts={
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Year</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Age</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Annual Cost</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Cumulative</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {result.yearlyBreakdown.map(row => (
                                    <tr key={row.year} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{row.year}</td>
                                        <td className="px-4 py-2">{row.age}</td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.annualCost)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-bold text-blue-600">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.cumulativeCost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
                details={calculatorDetails['medicare-cost-estimator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
