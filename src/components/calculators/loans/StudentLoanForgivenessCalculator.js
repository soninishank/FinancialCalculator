import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentLoanForgivenessCalculator({ currency = 'USD' }) {
    const [loanBalance, setLoanBalance] = useState(75000);
    const [annualIncome, setAnnualIncome] = useState(55000);
    const [familySize, setFamilySize] = useState(1);
    const [forgivenessType, setForgivenessType] = useState('pslf'); // pslf, idr-20, idr-25
    const [qualifyingPayments, setQualifyingPayments] = useState(24); // Already made

    const result = useMemo(() => {
        const monthlyIncome = annualIncome / 12;
        const povertyLine = 15060 + (familySize - 1) * 5380; // 2024 Federal Poverty Guidelines (approx)
        const discretionaryIncome = Math.max(0, annualIncome - povertyLine * 1.5);

        // IDR Payment calculation (SAVE/REPAYE formula: 10% of discretionary income)
        const monthlyIDRPayment = discretionaryIncome * 0.10 / 12;

        let requiredPayments, yearsTillForgiveness, monthlyPayment, totalPaid, forgivenAmount;

        if (forgivenessType === 'pslf') {
            requiredPayments = 120; // 10 years
            yearsTillForgiveness = Math.max(0, (requiredPayments - qualifyingPayments) / 12);
            monthlyPayment = monthlyIDRPayment;
            totalPaid = requiredPayments * monthlyPayment;
            // Simplified: Assume minimal interest growth for PSLF
            forgivenAmount = Math.max(0, loanBalance - totalPaid);
        } else if (forgivenessType === 'idr-20') {
            requiredPayments = 240; // 20 years
            yearsTillForgiveness = Math.max(0, (requiredPayments - qualifyingPayments) / 12);
            monthlyPayment = monthlyIDRPayment;
            totalPaid = requiredPayments * monthlyPayment;
            // Rough estimate: balance grows with interest, then forgiven
            forgivenAmount = Math.max(0, loanBalance * 1.5 - totalPaid); // Simplified
        } else {
            requiredPayments = 300; // 25 years
            yearsTillForgiveness = Math.max(0, (requiredPayments - qualifyingPayments) / 12);
            monthlyPayment = monthlyIDRPayment;
            totalPaid = requiredPayments * monthlyPayment;
            forgivenAmount = Math.max(0, loanBalance * 1.7 - totalPaid); // Simplified
        }

        // Tax bomb estimate (IDR only, PSLF is tax-free)
        const taxBomb = forgivenessType !== 'pslf' ? forgivenAmount * 0.22 : 0; // Assume 22% tax rate

        return {
            monthlyPayment,
            requiredPayments,
            paymentsRemaining: Math.max(0, requiredPayments - qualifyingPayments),
            yearsTillForgiveness,
            totalPaid,
            forgivenAmount,
            taxBomb,
            isPSLF: forgivenessType === 'pslf'
        };
    }, [loanBalance, annualIncome, familySize, forgivenessType, qualifyingPayments]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Current Loan Balance"
                value={loanBalance}
                onChange={setLoanBalance}
                min={10000}
                max={300000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Annual Gross Income"
                value={annualIncome}
                onChange={setAnnualIncome}
                min={20000}
                max={200000}
                step={5000}
                currency={currency}
            />

            <InputWithSlider
                label="Family Size"
                value={familySize}
                onChange={setFamilySize}
                min={1}
                max={8}
                step={1}
                suffix=" People"
            />

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Forgiveness Program</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { value: 'pslf', label: 'PSLF (10 years)', desc: 'Public Service Loan Forgiveness' },
                        { value: 'idr-20', label: 'IDR 20 Years', desc: 'Income-Driven Repayment (Undergraduate)' },
                        { value: 'idr-25', label: 'IDR 25 Years', desc: 'Income-Driven Repayment (Graduate)' }
                    ].map(program => (
                        <button
                            key={program.value}
                            onClick={() => setForgivenessType(program.value)}
                            className={`px-4 py-3 rounded-lg text-left transition-all ${forgivenessType === program.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="font-medium text-sm">{program.label}</div>
                            <div className={`text-xs ${forgivenessType === program.value ? 'text-blue-100' : 'text-gray-500'}`}>
                                {program.desc}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Qualifying Payments Made"
                value={qualifyingPayments}
                onChange={setQualifyingPayments}
                min={0}
                max={result.requiredPayments}
                step={1}
                suffix=" Payments"
                helperText={`Need ${result.requiredPayments} total qualifying payments`}
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" /> Student Loan Forgiveness Calculator
                </h2>
                <p className="text-sm text-purple-800">Estimate PSLF and Income-Driven Repayment forgiveness timelines.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Monthly IDR Payment</p>
                            <p className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyPayment)}</p>
                            <p className="text-xs mt-2 opacity-90">Based on your income and family size</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payments Remaining</p>
                                <p className="text-2xl font-bold text-gray-900">{result.paymentsRemaining}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{result.yearsTillForgiveness.toFixed(1)} years</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Progress</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {((qualifyingPayments / result.requiredPayments) * 100).toFixed(0)}%
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{qualifyingPayments}/{result.requiredPayments}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <p className="text-sm font-bold text-emerald-900">Forgiveness Estimate</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-emerald-600">Amount Forgiven</p>
                                    <p className="text-lg font-bold text-emerald-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.forgivenAmount)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-emerald-600">Total Paid</p>
                                    <p className="text-lg font-bold text-emerald-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.totalPaid)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!result.isPSLF && result.taxBomb > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    <p className="text-sm font-bold text-amber-900">Tax Bomb Warning (IDR)</p>
                                </div>
                                <p className="text-xs text-amber-700 mb-2">
                                    Forgiven amount is taxable income for IDR plans (not PSLF).
                                </p>
                                <p className="text-center">
                                    <span className="text-xs text-amber-600">Estimated Tax Liability:</span>
                                    <span className="block text-lg font-bold text-amber-700">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.taxBomb)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                }
                details={calculatorDetails['student-loan-forgiveness']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
