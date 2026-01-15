import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { ShieldCheck } from 'lucide-react';

export default function SocialSecurityCalculator({ currency = 'USD' }) {
    const [birthYear, setBirthYear] = useState(1980);
    const [fraBenefit, setFraBenefit] = useState(2000); // PIA
    const [lifeExpectancy, setLifeExpectancy] = useState(85);

    const result = useMemo(() => {
        // 1. Determine FRA
        let fra = 67; // Default for 1960+
        if (birthYear >= 1943 && birthYear <= 1954) fra = 66;
        else if (birthYear === 1955) fra = 66.167; // 66 + 2mo
        else if (birthYear === 1956) fra = 66.333;
        else if (birthYear === 1957) fra = 66.5;
        else if (birthYear === 1958) fra = 66.667;
        else if (birthYear === 1959) fra = 66.833;
        // else 1960+ is 67

        const fraAge = Math.round(fra); // simplify for UI display if needed, but keeping precision for calc

        // 2. Calculate Benefits at key ages
        // Early Filing (62)
        // Reduction: 5/9 of 1% for first 36 months, 5/12 of 1% for remaining months.
        const monthsEarlyMax = (fra - 62) * 12;
        let earlyReduction = 0;

        if (monthsEarlyMax > 0) {
            const first36 = Math.min(36, monthsEarlyMax);
            const remaining = Math.max(0, monthsEarlyMax - 36);
            earlyReduction = (first36 * (5 / 9)) + (remaining * (5 / 12));
        }
        const benefit62 = fraBenefit * (1 - (earlyReduction / 100));

        // Late Filing (70)
        // Credit: 8% per year delayed past FRA
        const yearsDelayed = 70 - fra;
        const delayedCredit = yearsDelayed * 8;
        const benefit70 = fraBenefit * (1 + (delayedCredit / 100));

        // 3. Compare Lifetime Payouts
        const chartData = [];
        // Determine break-even points
        // We will plot cumulative value from age 62 to lifeExpectancy

        // We need data points for the graph 'Lifetime Cumulative Benefit'
        // Just plotting the 3 specific scenarios: Claim at 62, Claim at FRA, Claim at 70

        // To keep the chart readable, we will pick representative ages like 62, 70, 75, 80, 85, 90, 95
        for (let age = 62; age <= 95; age++) {
            let cum62 = 0;
            let cumFRA = 0;
            let cum70 = 0;

            if (age >= 62) cum62 = benefit62 * 12 * (age - 62);
            if (age >= fra) cumFRA = fraBenefit * 12 * (age - fra);
            if (age >= 70) cum70 = benefit70 * 12 * (age - 70);

            chartData.push({
                year: age,
                claim62: Math.round(cum62),
                claimFRA: Math.round(cumFRA),
                claim70: Math.round(cum70)
            });
        }

        // Custom single-point estimates for the Summary
        const lifetime62 = benefit62 * 12 * (lifeExpectancy - 62);
        const lifetimeFRA = lifeExpectancy >= fra ? fraBenefit * 12 * (lifeExpectancy - fra) : 0;
        const lifetime70 = lifeExpectancy >= 70 ? benefit70 * 12 * (lifeExpectancy - 70) : 0;

        return {
            fra,
            benefit62,
            fraBenefit,
            benefit70,
            lifetime62,
            lifetimeFRA,
            lifetime70,
            chartData
        };
    }, [birthYear, fraBenefit, lifeExpectancy]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Birth Year"
                value={birthYear}
                onChange={setBirthYear}
                min={1950}
                max={2000}
                step={1}
                helperText={`Your Full Retirement Age is approx ${Math.floor(result.fra)}.`}
            />

            <InputWithSlider
                label="Monthly Benefit at Full Retirement Age"
                value={fraBenefit}
                onChange={setFraBenefit}
                min={500}
                max={5000}
                step={50}
                currency={currency}
                helperText="Estimate from your SSA.gov statement."
            />

            <InputWithSlider
                label="Life Expectancy"
                value={lifeExpectancy}
                onChange={setLifeExpectancy}
                min={70}
                max={100}
                step={1}
                suffix=" Years"
                helperText="To estimate total lifetime payout."
            />
        </div>
    );

    // Prepare chart data for standard bar chart component?
    // The standard component FinancialCompoundingBarChart expects specific keys like 'totalInvested', 'wealth', etc.
    // Or we can create a custom config. Let's reuse component by mapping data.
    // Actually, multiline comparison is better for break-even.
    // But FinancialCompoundingBarChart is stacked/grouped.
    // Let's use it to show CUMULATIVE Payout at Life Expectancy? 
    // Or better: Monthly Benefit comparison (Bar) AND Lifetime Payout (Bar)

    // Let's show Monthly Benefit Comparison as the primary visual
    const monthlyData = [
        {
            year: "Start at 62",
            benefit: result.benefit62,
            total: result.benefit62 // hack for single bar
        },
        {
            year: `Start at ${Math.floor(result.fra)} (FRA)`,
            benefit: result.fraBenefit,
            total: result.fraBenefit
        },
        {
            year: "Start at 70",
            benefit: result.benefit70,
            total: result.benefit70
        }
    ];

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Social Security Estimator
                </h2>
                <p className="text-sm text-blue-800">Compare your monthly benefits if you claim early (62), on time (FRA), or delay (70).</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 text-center">
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <p className="text-xs text-orange-600 font-bold uppercase mb-1">Claiming Early (Age 62)</p>
                                <p className="text-2xl font-bold text-orange-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.benefit62)}/mo
                                </p>
                                <p className="text-xs text-orange-500 mt-1">
                                    Lifetime: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.lifetime62)}
                                </p>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 ring-2 ring-emerald-200">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Full Retirement Age ({Math.floor(result.fra)})</p>
                                <p className="text-3xl font-bold text-emerald-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.fraBenefit)}/mo
                                </p>
                                <p className="text-xs text-emerald-500 mt-1">
                                    Lifetime: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.lifetimeFRA)}
                                </p>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Maximum Benefit (Age 70)</p>
                                <p className="text-2xl font-bold text-indigo-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.benefit70)}/mo
                                </p>
                                <p className="text-xs text-indigo-500 mt-1">
                                    Lifetime: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.lifetime70)}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            Based on living to age {lifeExpectancy}.
                        </div>
                    </div>
                }
                charts={
                    <div className="mt-8">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Monthly Benefit Comparison</h3>
                        {/* We reuse the bar chart but repurpose keys */}
                        <FinancialCompoundingBarChart
                            data={monthlyData.map(d => ({
                                year: d.year,
                                totalInvested: d.benefit, // abusing key for bar height
                                growth: 0
                            }))}
                            currency={currency}
                        />
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Waiting until 70 increases your monthly check significantly, but you receive fewer checks over your lifetime.
                        </p>
                    </div>
                }
                details={calculatorDetails['social-security-break-even']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
