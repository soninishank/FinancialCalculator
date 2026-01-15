import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function CollegeSavings529({ currency = 'USD' }) {
    const [childAge, setChildAge] = useState(5);
    const [collegeAge, setCollegeAge] = useState(18);
    const [currentSavings, setCurrentSavings] = useState(5000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [annualCollegeCost, setAnnualCollegeCost] = useState(30000); // Current cost
    const [yearsInCollege, setYearsInCollege] = useState(4);
    const [annualReturn, setAnnualReturn] = useState(7);
    const [educationInflation, setEducationInflation] = useState(5);

    const result = useMemo(() => {
        const yearsToCollege = Math.max(0, collegeAge - childAge);
        const monthsToCollege = yearsToCollege * 12;
        let balance = currentSavings;
        let totalInvested = currentSavings;

        const yearlyData = [];
        const monthlyRate = annualReturn / 12 / 100;

        // Growth Phase (Until College Starts)
        for (let i = 1; i <= yearsToCollege; i++) {
            // Simplified Annual Compounding for Chart
            const yearContribution = monthlyContribution * 12;
            const interest = (balance + yearContribution / 2) * (annualReturn / 100);
            balance += yearContribution + interest;
            totalInvested += yearContribution;

            yearlyData.push({
                year: childAge + i,
                invested: totalInvested,
                gain: balance - totalInvested,
                balance: balance,
                totalInvested: totalInvested,
                growth: balance - totalInvested,
                phase: 'Growth'
            });
        }

        // Cost Calculation (Future Value of Cost)
        // Cost inflates every year until college starts, AND during college
        const futureAnnualCostStart = annualCollegeCost * Math.pow(1 + educationInflation / 100, yearsToCollege);
        let totalProjectedCost = 0;

        // Expense Phase (During College) - Simplified
        // We assume costs are paid at start of each year
        // Remaining balance continues to grow? Yes.

        // This calculator is typically "Accumulation" focused. 
        // Let's calculate Total Cost vs Total Savings at age 18.

        for (let j = 0; j < yearsInCollege; j++) {
            const costForYear = futureAnnualCostStart * Math.pow(1 + educationInflation / 100, j);
            totalProjectedCost += costForYear;
        }

        const shortfall = totalProjectedCost - balance;

        return {
            totalSavingsAtCollege: balance,
            totalProjectedCost: totalProjectedCost,
            shortfall: shortfall,
            totalInvested,
            interestEarned: balance - totalInvested,
            yearlyData,
            futureAnnualCostStart
        };
    }, [childAge, collegeAge, currentSavings, monthlyContribution, annualCollegeCost, yearsInCollege, annualReturn, educationInflation]);

    const inputs = (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Child's Age"
                    value={childAge}
                    onChange={setChildAge}
                    min={0}
                    max={17}
                    step={1}
                    suffix=" Years"
                />
                <InputWithSlider
                    label="College Start Age"
                    value={collegeAge}
                    onChange={setCollegeAge}
                    min={childAge + 1}
                    max={25}
                    step={1}
                    suffix=" Years"
                />
            </div>

            <InputWithSlider
                label="Current Savings"
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={500000}
                step={500}
                currency={currency}
            />

            <InputWithSlider
                label="Monthly Contribution"
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                min={0}
                max={5000}
                step={50}
                currency={currency}
            />

            <InputWithSlider
                label="Current Annual College Cost"
                value={annualCollegeCost}
                onChange={setAnnualCollegeCost}
                min={5000}
                max={100000}
                step={1000}
                currency={currency}
                helperText="Cost for one year of college today."
            />

            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Inflation (%)"
                    value={educationInflation}
                    onChange={setEducationInflation}
                    min={0}
                    max={10}
                    step={0.5}
                    symbol="%"
                    helperText="College cost inflation."
                />
                <InputWithSlider
                    label="Exp. Return (%)"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    min={2}
                    max={15}
                    step={0.5}
                    symbol="%"
                    helperText="Investment growth rate."
                />
            </div>
            <InputWithSlider
                label="Duration of College"
                value={yearsInCollege}
                onChange={setYearsInCollege}
                min={1}
                max={6}
                step={1}
                suffix=" Years"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" /> 529 College Savings
                </h2>
                <p className="text-sm text-sky-800">Plan for your child's education with tax-advantaged savings.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.totalInvested}
                            gain={result.interestEarned}
                            total={result.totalSavingsAtCollege}
                            currency={currency}
                            labels={{ total: "Projected Savings" }}
                        />

                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <p className="text-xs text-orange-800 font-bold uppercase mb-1">Projected Total Cost</p>
                                <p className="text-lg font-bold text-orange-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.totalProjectedCost)}
                                </p>
                                <p className="text-[10px] text-orange-700 mt-1">Adjusted for inflation over duration.</p>
                            </div>

                            {result.shortfall > 0 ? (
                                <div className="text-right">
                                    <p className="text-xs text-red-600 font-bold uppercase mb-1 flex items-center justify-end gap-1">
                                        Shortfall <AlertTriangle className="w-3 h-3" />
                                    </p>
                                    <p className="text-lg font-bold text-red-700">
                                        -{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.shortfall)}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Surplus</p>
                                    <p className="text-lg font-bold text-emerald-700">
                                        +{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(Math.abs(result.shortfall))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                details={calculatorDetails['529-college-savings']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
