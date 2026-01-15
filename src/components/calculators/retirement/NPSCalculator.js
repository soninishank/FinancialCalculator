import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Landmark } from 'lucide-react';

export default function NPSCalculator({ currency = 'INR' }) {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(60);
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [annuityPercentage, setAnnuityPercentage] = useState(40); // Min 40%
    const [annuityRate, setAnnuityRate] = useState(6);

    const result = useMemo(() => {
        const yearsToInvest = Math.max(0, retirementAge - currentAge);
        const months = yearsToInvest * 12;
        const monthlyRate = expectedReturn / 12 / 100;

        // Future Value of SIP formula
        // FV = P * ((1 + r)^n - 1) * (1 + r) / r
        let totalCorpus = 0;
        let investedAmount = monthlyInvestment * months;

        if (monthlyRate === 0) {
            totalCorpus = investedAmount;
        } else {
            totalCorpus = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        }

        const interestEarned = totalCorpus - investedAmount;
        const annuityCorpus = (totalCorpus * annuityPercentage) / 100;
        const lumpsumAmount = totalCorpus - annuityCorpus; // This is tax-free up to 60%
        const monthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;

        // Generate yearly data for chart
        const yearlyData = [];
        let currentBalance = 0;
        let totalInvested = 0;

        for (let i = 1; i <= yearsToInvest; i++) {
            const monthsPassed = i * 12;
            const yearInvestment = monthlyInvestment * 12;
            totalInvested += yearInvestment;

            // Recalculate compound interest for this year
            // Simplify: use standard formula for 'i' years
            let fv = 0;
            if (monthlyRate === 0) fv = monthlyInvestment * monthsPassed;
            else fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate) * (1 + monthlyRate);

            currentBalance = fv;

            yearlyData.push({
                year: currentAge + i,
                invested: totalInvested,
                gain: currentBalance - totalInvested,
                totalInvested: totalInvested,
                balance: currentBalance,
                growth: currentBalance - totalInvested
            });
        }

        return {
            investedAmount,
            interestEarned,
            totalCorpus,
            lumpsumAmount,
            annuityCorpus,
            monthlyPension,
            yearlyData
        };
    }, [monthlyInvestment, currentAge, retirementAge, expectedReturn, annuityPercentage, annuityRate]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Investment"
                value={monthlyInvestment}
                onChange={setMonthlyInvestment}
                min={500}
                max={200000}
                step={500}
                currency={currency}
            />

            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Current Age"
                    value={currentAge}
                    onChange={setCurrentAge}
                    min={18}
                    max={retirementAge - 1}
                    step={1}
                    suffix=" Years"
                />
                <InputWithSlider
                    label="Retirement Age"
                    value={retirementAge}
                    onChange={setRetirementAge}
                    min={currentAge + 1}
                    max={75}
                    step={1}
                    suffix=" Years"
                />
            </div>

            <InputWithSlider
                label="Expected Return (ROI)"
                value={expectedReturn}
                onChange={setExpectedReturn}
                min={5}
                max={20}
                step={0.5}
                symbol="%"
                isDecimal={true}
            />

            <InputWithSlider
                label="Annuity Investment (%)"
                value={annuityPercentage}
                onChange={setAnnuityPercentage}
                min={40}
                max={100}
                step={5}
                symbol="%"
                helperText="Min. 40% of corpus must be used to buy annuity."
            />

            <InputWithSlider
                label="Expected Annuity Rate"
                value={annuityRate}
                onChange={setAnnuityRate}
                min={4}
                max={10}
                step={0.5}
                symbol="%"
                isDecimal={true}
                helperText="Rate at which you buy the pension plan."
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5" /> National Pension System (NPS)
                </h2>
                <p className="text-sm text-orange-800">Govt-backed retirement savings scheme for a secure future.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <UnifiedSummary
                            invested={result.investedAmount}
                            gain={result.interestEarned}
                            total={result.totalCorpus}
                            currency={currency}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Tax-Free Lumpsum</p>
                                <p className="text-xl font-bold text-emerald-700">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.lumpsumAmount)}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Monthly Pension</p>
                                <p className="text-xl font-bold text-blue-700">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(result.monthlyPension)}
                                </p>
                            </div>
                        </div>
                    </div>
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                details={calculatorDetails['nps-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
