import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Home, DollarSign } from 'lucide-react';

export default function PropertyTaxEstimator({ currency = 'USD' }) {
    const [homeValue, setHomeValue] = useState(400000);
    const [taxRate, setTaxRate] = useState(1.1);
    const [assessmentRatio, setAssessmentRatio] = useState(100);
    const [exemptions, setExemptions] = useState(0);
    const [yearsToProject, setYearsToProject] = useState(10);
    const [annualIncrease, setAnnualIncrease] = useState(2);

    const result = useMemo(() => {
        const assessedValue = (homeValue * (assessmentRatio / 100)) - exemptions;
        const annualTax = (assessedValue * (taxRate / 100));
        const monthlyTax = annualTax / 12;

        // Project future taxes
        const projection = [];
        let cumulativeTax = 0;

        for (let year = 1; year <= yearsToProject; year++) {
            const inflationFactor = Math.pow(1 + (annualIncrease / 100), year - 1);
            const yearTax = annualTax * inflationFactor;
            cumulativeTax += yearTax;

            projection.push({
                year,
                annualTax: yearTax,
                monthlyTax: yearTax / 12,
                cumulativeTax
            });
        }

        // SALT deduction limit ($10k federal cap)
        const saltCap = 10000;
        const deductibleAmount = Math.min(annualTax, saltCap);
        const taxSavings = deductibleAmount * 0.24; // Assume 24% tax bracket

        return {
            assessedValue,
            annualTax,
            monthlyTax,
            projection,
            deductibleAmount,
            taxSavings,
            totalLifetimeTax: cumulativeTax,
            isOverSALTCap: annualTax > saltCap
        };
    }, [homeValue, taxRate, assessmentRatio, exemptions, yearsToProject, annualIncrease]);

    // Top 10 highest/lowest property tax states
    const statePresets = [
        { name: 'New Jersey', rate: 2.47 },
        { name: 'Illinois', rate: 2.23 },
        { name: 'Connecticut', rate: 2.14 },
        { name: 'New Hampshire', rate: 2.05 },
        { name: 'Vermont', rate: 1.90 },
        { name: 'Texas', rate: 1.74 },
        { name: 'Wisconsin', rate: 1.73 },
        { name: 'Nebraska', rate: 1.65 },
        { name: 'Ohio', rate: 1.56 },
        { name: 'Iowa', rate: 1.50 },
        { name: 'US Average', rate: 1.10 },
        { name: 'Hawaii', rate: 0.31 }
    ];

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Home Market Value"
                value={homeValue}
                onChange={setHomeValue}
                min={100000}
                max={2000000}
                step={10000}
                currency={currency}
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">State Presets (Quick Select)</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {statePresets.map(state => (
                        <button
                            key={state.name}
                            onClick={() => setTaxRate(state.rate)}
                            className="px-3 py-2 rounded-lg text-left transition-all bg-white hover:bg-blue-50 border border-gray-200 text-xs"
                        >
                            <div className="font-medium">{state.name}</div>
                            <div className="text-gray-500">{state.rate}%</div>
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Property Tax Rate (%)"
                value={taxRate}
                onChange={setTaxRate}
                min={0.1}
                max={3}
                step={0.01}
                symbol="%"
                isDecimal={true}
                helperText="Varies by state/county"
            />

            <InputWithSlider
                label="Assessment Ratio (%)"
                value={assessmentRatio}
                onChange={setAssessmentRatio}
                min={50}
                max={100}
                step={5}
                symbol="%"
                helperText="% of market value used for tax (usually 100%)"
            />

            <InputWithSlider
                label="Homestead Exemption"
                value={exemptions}
                onChange={setExemptions}
                min={0}
                max={100000}
                step={5000}
                currency={currency}
                helperText="Reduces assessed value (varies by state)"
            />

            <InputWithSlider
                label="Expected Annual Tax Increase (%)"
                value={annualIncrease}
                onChange={setAnnualIncrease}
                min={0}
                max={5}
                step={0.1}
                symbol="%"
                isDecimal={true}
                helperText="Historical average: 2-3%"
            />

            <InputWithSlider
                label="Years to Project"
                value={yearsToProject}
                onChange={setYearsToProject}
                min={5}
                max={30}
                step={5}
                suffix=" Years"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Home className="w-5 h-5" /> Property Tax Estimator
                </h2>
                <p className="text-sm text-orange-800">Estimate annual property taxes and understand state-by-state variations.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Annual Property Tax</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.annualTax)}</p>
                            <p className="text-xs mt-2 opacity-90">
                                ${result.monthlyTax.toFixed(0)}/month
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Market Value</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(homeValue)}
                                </p>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Assessed Value</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.assessedValue)}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-bold text-blue-900">SALT Deduction (Federal)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-blue-600">Deductible Amount</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.deductibleAmount)}
                                    </p>
                                    <p className="text-[10px] text-blue-500">$10k cap</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600">Est. Tax Savings</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.taxSavings)}
                                    </p>
                                    <p className="text-[10px] text-blue-500">At 24% bracket</p>
                                </div>
                            </div>
                            {result.isOverSALTCap && (
                                <p className="text-xs text-amber-700 mt-2 text-center">
                                    ⚠️ Your property tax exceeds the $10k SALT deduction cap
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
                            <p className="text-xs text-purple-600 font-bold uppercase mb-1">{yearsToProject}-Year Total</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalLifetimeTax)}
                            </p>
                            <p className="text-[10px] text-purple-500 mt-1">Cumulative property taxes</p>
                        </div>
                    </div>
                }
                charts={
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Year</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Annual Tax</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Monthly</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Cumulative</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {result.projection.map(row => (
                                    <tr key={row.year} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{row.year}</td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.annualTax)}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.monthlyTax)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-bold text-blue-600">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.cumulativeTax)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
                details={calculatorDetails['property-tax-estimator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
