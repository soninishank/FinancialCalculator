import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import UnifiedSummary from '../../common/UnifiedSummary';
import { FinancialCompoundingBarChart } from '../../common/FinancialCharts';
import MonthYearPicker from '../../common/MonthYearPicker';
import CollapsibleInvestmentTable from '../../common/CollapsibleInvestmentTable';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Baby, AlertTriangle } from 'lucide-react';

export default function SSYCalculator({ currency = 'INR' }) {
    const [yearlyInvestment, setYearlyInvestment] = useState(150000);
    const [girlAge, setGirlAge] = useState(1);
    const [startYear, setStartYear] = useState(new Date().toISOString().slice(0, 4)); // Only year needed
    const [interestRate, setInterestRate] = useState(8.2);

    const result = useMemo(() => {
        const maturityYears = 21;
        const paymentYears = 15;
        const currentYearNum = parseInt(startYear);
        const maturityYear = currentYearNum + maturityYears;

        // SSY Logic:
        // Deposits for first 15 years.
        // Account matures 21 years from date of opening.
        // Interest compounds annually.

        let totalInvested = 0;
        let currentBalance = 0;
        const yearlyData = [];
        const monthlyData = []; // Not really monthly, but for compatibility

        for (let i = 1; i <= maturityYears; i++) {
            const yearLabel = currentYearNum + i;
            let investmentForYear = 0;

            if (i <= paymentYears) {
                investmentForYear = yearlyInvestment;
            }

            // Interest calculation (simplified annual compounding on opening balance + current year investment)
            // Govt rules: Interest calculated on lowest balance between 5th and end of month. 
            // We assume annual lump sum at start for simplicity, or sum of monthly. 
            // Standard calculators usually assume annual compounding on (Opening Balance + Investment/2) or similar approximations.
            // But SSY is strictly annual compounding on the balance.
            // Let's assume investment happens at start of year to maximize interest for the user estimate.

            const interestForYear = (currentBalance + investmentForYear) * (interestRate / 100);

            totalInvested += investmentForYear;
            currentBalance += investmentForYear + interestForYear;

            yearlyData.push({
                year: yearLabel,
                invested: totalInvested,
                gain: currentBalance - totalInvested,
                totalInvested: totalInvested,
                balance: currentBalance,
                growth: currentBalance - totalInvested,
                // Extra fields for table
                yearlyDeposit: investmentForYear,
                interestEarned: interestForYear
            });
        }

        return {
            totalInvested,
            interestEarned: currentBalance - totalInvested,
            maturityValue: currentBalance,
            maturityYear,
            yearlyData
        };
    }, [yearlyInvestment, girlAge, startYear, interestRate]);


    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Yearly Investment"
                value={yearlyInvestment}
                onChange={setYearlyInvestment}
                min={250}
                max={150000}
                step={250}
                currency={currency}
                helperText="Max ₹1.5 Lakhs per financial year."
            />

            <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Tax Benefit:</strong> Investment up to ₹1.5 Lakh is tax deductible u/s 80C.
                </p>
            </div>

            <InputWithSlider
                label="Girl Child's Age"
                value={girlAge}
                onChange={setGirlAge}
                min={0}
                max={10}
                step={1}
                suffix=" Years"
                helperText="Account can be opened only for girl child below 10 years."
            />

            <InputWithSlider
                label="Interest Rate (%)"
                value={interestRate}
                onChange={setInterestRate}
                min={7}
                max={10}
                step={0.1}
                symbol="%"
                isDecimal={true}
                helperText="Current SSY Rate is 8.2%"
            />

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Start Year
                </label>
                <select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {[0, 1, 2, 3, 4, 5].map(offset => {
                        const y = new Date().getFullYear() + offset;
                        return <option key={y} value={y}>{y}</option>
                    })}
                </select>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-pink-900 flex items-center gap-2">
                    <Baby className="w-5 h-5" /> Sukanya Samriddhi Yojana (SSY)
                </h2>
                <p className="text-sm text-pink-800">Secure your daughter's future with high returns and tax benefits.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <UnifiedSummary
                        invested={result.totalInvested}
                        gain={result.interestEarned}
                        total={result.maturityValue}
                        currency={currency}
                    />
                }
                charts={<FinancialCompoundingBarChart data={result.yearlyData} currency={currency} type="investment" />}
                table={
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Maturity Year: {result.maturityYear}</h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Year</th>
                                        <th className="px-4 py-3">Deposit</th>
                                        <th className="px-4 py-3">Interest (Approx)</th>
                                        <th className="px-4 py-3 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {result.yearlyData.map((row) => (
                                        <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-800">{row.year}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(row.yearlyDeposit)}
                                            </td>
                                            <td className="px-4 py-3 text-emerald-600">
                                                +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(row.interestEarned)}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-900 text-right">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(row.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
                details={calculatorDetails['ssy-calculator']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
