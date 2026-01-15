import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialLoanPieChart } from '../../common/FinancialCharts'; // Use this for Cost vs Interest (Tax) vs Profit
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

const LT_BRACKETS_2024 = {
    single: [
        { limit: 47025, rate: 0 },
        { limit: 518900, rate: 15 },
        { limit: Infinity, rate: 20 }
    ],
    married: [
        { limit: 94050, rate: 0 },
        { limit: 583750, rate: 15 },
        { limit: Infinity, rate: 20 }
    ],
    head: [
        { limit: 63000, rate: 0 },
        { limit: 551350, rate: 15 },
        { limit: Infinity, rate: 20 }
    ]
};

export default function USCapitalGainsCalculator({ currency = 'USD' }) {
    const [purchasePrice, setPurchasePrice] = useState(10000);
    const [salePrice, setSalePrice] = useState(15000);
    const [isLongTerm, setIsLongTerm] = useState(true); // > 1 year
    const [filingStatus, setFilingStatus] = useState('single'); // single, married, head
    const [annualIncome, setAnnualIncome] = useState(75000);
    const [shortTermRate, setShortTermRate] = useState(24); // Fallback for short term

    const result = useMemo(() => {
        const gain = salePrice - purchasePrice;

        let taxRate = 0;
        let taxAmount = 0;

        if (gain > 0) {
            if (isLongTerm) {
                // Determine Long Term Rate based on Income
                const brackets = LT_BRACKETS_2024[filingStatus];
                // Simple bracket logic: The capital gains sit ON TOP of other income.
                // But for simplicity, we often just check where the TOTAL income falls.
                // Strict way: Income + Gain.
                // Let's use the marginal rate of the (Income + Gain) stack?
                // Actually the standard is: Look at Taxable Income (including gain).
                // If Taxable Income < Limit1, 0%.
                // We will assume 'annualIncome' includes the gain for simplicity of the UI, 
                // or better: add gain to income.

                // Let's assume 'annualIncome' is WITHOUT the gain, so we add the gain to see where it lands?
                // Actually, the breakpoints apply to taxable income. 
                // Let's simplify: Check rate based on Annual Income (user input)

                const totalIncome = annualIncome; // User enters their total taxable income estimate

                if (totalIncome <= brackets[0].limit) taxRate = brackets[0].rate;
                else if (totalIncome <= brackets[1].limit) taxRate = brackets[1].rate;
                else taxRate = brackets[2].rate;

                // Checking for NIIT (Net Investment Income Tax) 3.8% if MAGI > 200k/250k
                // Let's add simple checkbox for NIIT or auto-detect?
                // Auto-detect roughly
                const niitThreshold = filingStatus === 'married' ? 250000 : 200000;
                if (totalIncome > niitThreshold) {
                    taxRate += 3.8;
                }

            } else {
                // Short Term
                taxRate = shortTermRate;
            }

            taxAmount = gain * (taxRate / 100);
        }

        const netProfit = gain - taxAmount;

        return {
            gain,
            taxRate,
            taxAmount,
            netProfit,
            roi: (netProfit / purchasePrice) * 100
        };
    }, [purchasePrice, salePrice, isLongTerm, filingStatus, annualIncome, shortTermRate]);

    const inputs = (
        <div className="space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setIsLongTerm(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${!isLongTerm ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Short Term (&lt; 1 Year)
                </button>
                <button
                    onClick={() => setIsLongTerm(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${isLongTerm ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Long Term (&gt; 1 Year)
                </button>
            </div>

            <InputWithSlider
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                min={100}
                max={1000000}
                step={100}
                currency={currency}
            />

            <InputWithSlider
                label="Sale Price"
                value={salePrice}
                onChange={setSalePrice}
                min={100}
                max={2000000}
                step={100}
                currency={currency}
            />

            {isLongTerm ? (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Filing Status</label>
                        <select
                            value={filingStatus}
                            onChange={(e) => setFilingStatus(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        >
                            <option value="single">Single</option>
                            <option value="married">Married Filing Jointly</option>
                            <option value="head">Head of Household</option>
                        </select>
                    </div>

                    <InputWithSlider
                        label="Total Annual Taxable Income"
                        value={annualIncome}
                        onChange={setAnnualIncome}
                        min={0}
                        max={1000000}
                        step={1000}
                        currency={currency}
                        helperText="Includes wages, this gain, and other income."
                    />
                </>
            ) : (
                <InputWithSlider
                    label="Federal Tax Bracket (%)"
                    value={shortTermRate}
                    onChange={setShortTermRate}
                    min={10}
                    max={37}
                    step={1}
                    symbol="%"
                    helperText="Your ordinary income tax rate."
                />
            )}
        </div>
    );

    // Reuse FinancialLoanPieChart for visualization
    // principal = Purchase Price
    // totalInterest = Net Profit
    // fees = Tax Amount
    // This is a mapping hack but visualizes the split perfectly:
    // "Principal" -> Purchase Cost
    // "Interest" -> Net Profit (Money you keep)
    // "Fees" -> Taxes (Money you lose)

    return (
        <div className="animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> US Capital Gains Tax
                </h2>
                <p className="text-sm text-blue-800">Estimate your federal tax liability for Short Term vs. Long Term asset sales.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.gain} // Using Invested as "Gain"
                            gain={result.netProfit} // Using Gain as "Net Profit"
                            total={result.taxAmount} // Using Total as "Tax"
                            currency={currency}
                            labels={{ invested: "Total Capital Gain", gain: "Net Profit (After Tax)", total: "Estimated Tax" }}
                        />
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Effective Tax Rate</p>
                                <p className="text-lg font-bold text-emerald-700">{result.taxRate.toFixed(1)}%</p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Return on Investment</p>
                                <p className="text-lg font-bold text-indigo-700">{result.roi.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                }
                charts={
                    result.gain > 0 && (
                        <div className="mt-8">
                            <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Proceeds Breakdown</h3>
                            {/* Map data for visualizer: 
                                 Principal = Cost Basis (Purchase Price)
                                 Interest = Net Profit
                                 Fees = Tax 
                             */}
                            <FinancialLoanPieChart
                                principal={purchasePrice}
                                totalInterest={result.netProfit}
                                fees={result.taxAmount}
                                currency={currency}
                            />
                            <div className="text-center text-xs text-gray-400 mt-2">
                                Legend Mapping: Principal = Cost Basis, Interest = Net Profit, Fees = Taxes
                            </div>
                        </div>
                    )
                }
                details={calculatorDetails['us-capital-gains']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
