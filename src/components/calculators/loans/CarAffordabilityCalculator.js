import React, { useState, useEffect } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const CarAffordabilityCalculator = ({ currency }) => {
    const [monthlyIncome, setMonthlyIncome] = useState(100000);
    const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
    const [downPayment, setDownPayment] = useState(200000);
    const [interestRate, setInterestRate] = useState(9);
    const [loanTerm, setLoanTerm] = useState(5); // years

    const [affordableEMI, setAffordableEMI] = useState(0);
    const [maxCarPrice, setMaxCarPrice] = useState(0);

    useEffect(() => {
        const income = parseFloat(monthlyIncome) || 0;
        const expenses = parseFloat(monthlyExpenses) || 0;
        const dp = parseFloat(downPayment) || 0;
        const rate = parseFloat(interestRate) || 0;
        const term = parseFloat(loanTerm) || 0;

        // Rule of thumb: EMI should not exceed 15-20% of net income
        // Or surplus - buffer. Let's use 20% of income as a safe heuristic or (Income - Expenses) * 0.5
        // Let's use 15% rule (20/4/10 rule uses 20% down, 4 years, <10% income)

        // Let's allow user to see what they "can" afford based on disposable income.
        // Disposable = Income - Expenses.
        // Safe EMI = Disposable * 0.5 (Conservative)

        // Let's use 20% of gross income as maximum recommended EMI. 
        const maxEMI = income * 0.20;

        setAffordableEMI(maxEMI);

        // Calculate Loan Amount from EMI
        // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
        // P = [EMI * ((1+R)^N - 1)] / [R * (1+R)^N]

        if (rate > 0 && term > 0) {
            const r = rate / 12 / 100;
            const n = term * 12;
            const loanAmount = (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
            setMaxCarPrice(loanAmount + dp);
        } else if (term > 0) {
            const loanAmount = maxEMI * term * 12;
            setMaxCarPrice(loanAmount + dp);
        } else {
            setMaxCarPrice(dp);
        }

    }, [monthlyIncome, monthlyExpenses, downPayment, interestRate, loanTerm]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <InputWithSlider
                    label="Monthly Net Income"
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    min={10000}
                    max={1000000}
                    step={5000}
                    currency={currency}
                />
                <InputWithSlider
                    label="Down Payment Saving"
                    value={downPayment}
                    onChange={setDownPayment}
                    min={0}
                    max={2000000}
                    step={10000}
                    currency={currency}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputWithSlider
                        label="Interest Rate"
                        value={interestRate}
                        onChange={setInterestRate}
                        min={1}
                        max={15}
                        step={0.1}
                        symbol="%"
                    />
                    <InputWithSlider
                        label="Loan Term (Years)"
                        value={loanTerm}
                        onChange={setLoanTerm}
                        min={1}
                        max={10}
                        step={1}
                    />
                </div>
            </div>

            <div className="flex-1 space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="text-lg font-medium text-indigo-100 mb-4">Affordability Check</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-indigo-200 mb-1">Max Affordable Car Price</p>
                            <p className="text-4xl font-bold">
                                {moneyFormat(maxCarPrice, currency)}
                            </p>
                        </div>
                        <div className="pt-6 border-t border-indigo-500/30">
                            <p className="text-sm text-indigo-200 mb-1">Recommended Max EMI (20% rule)</p>
                            <p className="text-2xl font-semibold">
                                {moneyFormat(affordableEMI, currency)} /mo
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20 text-sm text-blue-800 dark:text-blue-300">
                    <p>
                        <strong>Note:</strong> This calculation assumes you shouldn't spend more than 20% of your net income on car payments.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CarAffordabilityCalculator;
