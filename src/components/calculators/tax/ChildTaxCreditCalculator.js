import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Baby, DollarSign } from 'lucide-react';

export default function ChildTaxCreditCalculator({ currency = 'USD' }) {
    const [filingStatus, setFilingStatus] = useState('married'); // single, married, hoh
    const [agi, setAGI] = useState(150000);
    const [numChildren, setNumChildren] = useState(2);
    const [childrenUnder6, setChildrenUnder6] = useState(0);
    const [taxLiability, setTaxLiability] = useState(8000);

    const result = useMemo(() => {
        // 2024 Child Tax Credit parameters
        const creditPerChild = 2000;
        const refundableLimit = 1700; // Additional Child Tax Credit (ACTC)

        // Phase-out thresholds
        const thresholds = {
            married: 400000,
            single: 200000,
            hoh: 200000
        };

        const threshold = thresholds[filingStatus];

        // Calculate base credit
        let totalCredit = numChildren * creditPerChild;

        // Phase-out calculation: $50 reduction per $1,000 over threshold
        const excessIncome = Math.max(0, agi - threshold);
        const phaseOutReduction = Math.ceil(excessIncome / 1000) * 50;
        totalCredit = Math.max(0, totalCredit - phaseOutReduction);

        // Non-refundable portion (reduces tax liability to $0)
        const nonRefundableCredit = Math.min(totalCredit, taxLiability);

        // Refundable portion (Additional CTC - can exceed tax liability)
        const maxRefundable = Math.min(numChildren * refundableLimit, totalCredit);
        const refundableCredit = Math.max(0, Math.min(maxRefundable, totalCredit - nonRefundableCredit));

        const totalBenefit = nonRefundableCredit + refundableCredit;

        // Dependent Care Credit (separate, for informational purposes)
        // Up to $3,000 for 1 child, $6,000 for 2+
        const dependentCareMax = childrenUnder6 >= 2 ? 6000 : childrenUnder6 === 1 ? 3000 : 0;
        const dependentCareCredit = agi < 125000 ? dependentCareMax * 0.35 :
            agi < 183000 ? dependentCareMax * 0.25 :
                agi < 400000 ? dependentCareMax * 0.20 : 0;

        return {
            totalCredit,
            nonRefundableCredit,
            refundableCredit,
            totalBenefit,
            phaseOutReduction,
            dependentCareCredit,
            isPhaseOut: excessIncome > 0
        };
    }, [filingStatus, agi, numChildren, childrenUnder6, taxLiability]);

    const inputs = (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Filing Status</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'hoh', label: 'Head of Household' }
                    ].map(status => (
                        <button
                            key={status.value}
                            onClick={() => setFilingStatus(status.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filingStatus === status.value
                                    ? 'bg-pink-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Adjusted Gross Income (AGI)"
                value={agi}
                onChange={setAGI}
                min={0}
                max={500000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Number of Qualifying Children"
                value={numChildren}
                onChange={setNumChildren}
                min={0}
                max={8}
                step={1}
                suffix=" Children"
                helperText="Under 17 at end of tax year"
            />

            <InputWithSlider
                label="Children Under 6 Years"
                value={childrenUnder6}
                onChange={setChildrenUnder6}
                min={0}
                max={numChildren}
                step={1}
                suffix=" Children"
                helperText="For Dependent Care Credit eligibility"
            />

            <InputWithSlider
                label="Expected Tax Liability"
                value={taxLiability}
                onChange={setTaxLiability}
                min={0}
                max={50000}
                step={500}
                currency={currency}
                helperText="Your total federal income tax before credits"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-pink-900 flex items-center gap-2">
                    <Baby className="w-5 h-5" /> Child Tax Credit Calculator
                </h2>
                <p className="text-sm text-pink-800">Calculate your Child Tax Credit and Additional Child Tax Credit (refundable portion).</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Total Child Tax Credit</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalBenefit)}</p>
                            <p className="text-xs mt-2 opacity-90">{numChildren} {numChildren === 1 ? 'child' : 'children'} × $2,000 per child</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Non-Refundable</p>
                                <p className="text-xl font-bold text-blue-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.nonRefundableCredit)}
                                </p>
                                <p className="text-[10px] text-blue-500 mt-1">Reduces tax owed</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Refundable (ACTC)</p>
                                <p className="text-xl font-bold text-emerald-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.refundableCredit)}
                                </p>
                                <p className="text-[10px] text-emerald-500 mt-1">Can get as refund</p>
                            </div>
                        </div>

                        {result.isPhaseOut && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Phase-Out Reduction</p>
                                <p className="text-lg font-bold text-amber-700">
                                    -{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.phaseOutReduction)}
                                </p>
                                <p className="text-[10px] text-amber-500 mt-1">Income above ${filingStatus === 'married' ? '400' : '200'}k threshold</p>
                            </div>
                        )}

                        {childrenUnder6 > 0 && result.dependentCareCredit > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                    <p className="text-sm font-bold text-purple-900">Dependent Care Credit</p>
                                </div>
                                <p className="text-xs text-purple-700 mb-2">
                                    Separate credit for childcare expenses while you work.
                                </p>
                                <p className="text-center">
                                    <span className="text-xs text-purple-600">Estimated Credit:</span>
                                    <span className="block text-lg font-bold text-purple-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.dependentCareCredit)}
                                    </span>
                                    <span className="text-[10px] text-purple-500">Based on actual childcare expenses paid</span>
                                </p>
                            </div>
                        )}

                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 mb-1">Tax Liability After CTC</p>
                            <p className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.max(0, taxLiability - result.nonRefundableCredit))}
                            </p>
                        </div>
                    </div>
                }
                details={calculatorDetails['child-tax-credit']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
