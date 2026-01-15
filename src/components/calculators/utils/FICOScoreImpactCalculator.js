import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FICOScoreImpactCalculator({ currency = 'USD' }) {
    const [currentScore, setCurrentScore] = useState(680);
    const [totalCreditLimit, setTotalCreditLimit] = useState(20000);
    const [currentBalance, setCurrentBalance] = useState(6000);
    const [onTimePayments, setOnTimePayments] = useState(95);
    const [accountAge, setAccountAge] = useState(5); // years
    const [newInquiries, setNewInquiries] = useState(1);
    const [accountTypes, setAccountTypes] = useState(3); // revolving, installment, mortgage

    // Scenarios
    const [payoffAmount, setPayoffAmount] = useState(2000);
    const [newCreditLimit, setNewCreditLimit] = useState(5000);

    const result = useMemo(() => {
        // FICO Score Composition (weights)
        const weights = {
            paymentHistory: 0.35,
            utilization: 0.30,
            creditAge: 0.15,
            newCredit: 0.10,
            creditMix: 0.10
        };

        // Current utilization
        const currentUtilization = (currentBalance / totalCreditLimit) * 100;

        // Score calculation (simplified model)
        const getScoreFromFactors = (util, payment, age, inquiries, types) => {
            // Payment History (35%)
            let paymentScore = payment * 0.35;

            // Utilization (30%) - Ideal: under 30%, Excellent: under 10%
            let utilizationScore = 0;
            if (util < 10) utilizationScore = 30;
            else if (util < 30) utilizationScore = 25;
            else if (util < 50) utilizationScore = 20;
            else if (util < 75) utilizationScore = 12;
            else utilizationScore = 5;

            // Credit Age (15%) - Longer is better
            let ageScore = Math.min(15, age * 1.5);

            // New Credit (10%) - Fewer inquiries is better
            let inquiriesScore = Math.max(0, 10 - inquiries * 2);

            // Credit Mix (10%) - More variety is better (max 5 types)
            let mixScore = Math.min(10, types * 2.5);

            const totalScore = paymentScore + utilizationScore + ageScore + inquiriesScore + mixScore;

            // Convert to 300-850 scale
            return Math.round(300 + (totalScore / 100) * 550);
        };

        const estimatedScore = getScoreFromFactors(
            currentUtilization,
            onTimePayments,
            accountAge,
            newInquiries,
            accountTypes
        );

        // Scenario 1: Pay off debt
        const balanceAfterPayoff = Math.max(0, currentBalance - payoffAmount);
        const utilizationAfterPayoff = (balanceAfterPayoff / totalCreditLimit) * 100;
        const scoreAfterPayoff = getScoreFromFactors(
            utilizationAfterPayoff,
            onTimePayments,
            accountAge,
            newInquiries,
            accountTypes
        );

        // Scenario 2: Open new credit card
        const newTotalLimit = totalCreditLimit + newCreditLimit;
        const utilizationWithNewCard = (currentBalance / newTotalLimit) * 100;
        const scoreWithNewCard = getScoreFromFactors(
            utilizationWithNewCard,
            onTimePayments,
            accountAge,
            newInquiries + 1, // Hard inquiry
            accountTypes
        );

        // Scenario 3: Perfect payments for 6 months
        const perfectPaymentScore = getScoreFromFactors(
            currentUtilization,
            Math.min(100, onTimePayments + 2),
            accountAge + 0.5,
            Math.max(0, newInquiries - 1), // Old inquiries fall off
            accountTypes
        );

        // Score ranges
        const getScoreRange = (score) => {
            if (score >= 800) return { label: 'Exceptional', color: 'emerald', icon: '🌟' };
            if (score >= 740) return { label: 'Very Good', color: 'blue', icon: '✨' };
            if (score >= 670) return { label: 'Good', color: 'green', icon: '👍' };
            if (score >= 580) return { label: 'Fair', color: 'amber', icon: '⚠️' };
            return { label: 'Poor', color: 'red', icon: '❌' };
        };

        const currentRange = getScoreRange(estimatedScore);

        // Recommendations
        const recommendations = [];
        if (currentUtilization > 30) {
            recommendations.push({
                action: 'Pay Down Balances',
                impact: '+' + (scoreAfterPayoff - estimatedScore),
                priority: 'High'
            });
        }
        if (onTimePayments < 100) {
            recommendations.push({
                action: 'Set Up Autopay',
                impact: '+10-40',
                priority: 'Critical'
            });
        }
        if (accountAge < 5) {
            recommendations.push({
                action: 'Keep Old Accounts Open',
                impact: '+5-15 over time',
                priority: 'Medium'
            });
        }
        if (newInquiries >= 3) {
            recommendations.push({
                action: 'Avoid New Credit Applications',
                impact: '+5-10',
                priority: 'Medium'
            });
        }

        return {
            estimatedScore,
            currentRange,
            currentUtilization,
            // Scenarios
            payoff: {
                newUtilization: utilizationAfterPayoff,
                newScore: scoreAfterPayoff,
                impact: scoreAfterPayoff - estimatedScore
            },
            newCard: {
                newUtilization: utilizationWithNewCard,
                newScore: scoreWithNewCard,
                impact: scoreWithNewCard - estimatedScore
            },
            perfectPayments: {
                newScore: perfectPaymentScore,
                impact: perfectPaymentScore - estimatedScore
            },
            recommendations
        };
    }, [currentScore, totalCreditLimit, currentBalance, onTimePayments, accountAge, newInquiries, accountTypes, payoffAmount, newCreditLimit]);

    const inputs = (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-sm text-blue-900 mb-3">Current Credit Profile</h3>

                <InputWithSlider
                    label="Total Credit Limit"
                    value={totalCreditLimit}
                    onChange={setTotalCreditLimit}
                    min={1000}
                    max={100000}
                    step={1000}
                    currency={currency}
                />

                <InputWithSlider
                    label="Current Balance"
                    value={currentBalance}
                    onChange={setCurrentBalance}
                    min={0}
                    max={totalCreditLimit}
                    step={100}
                    currency={currency}
                    helperText={`Utilization: ${result.currentUtilization.toFixed(1)}%`}
                />

                <InputWithSlider
                    label="On-Time Payment History (%)"
                    value={onTimePayments}
                    onChange={setOnTimePayments}
                    min={50}
                    max={100}
                    step={1}
                    symbol="%"
                    helperText="% of payments made on time"
                />

                <InputWithSlider
                    label="Average Account Age (Years)"
                    value={accountAge}
                    onChange={setAccountAge}
                    min={0}
                    max={20}
                    step={0.5}
                    suffix=" Years"
                    isDecimal={true}
                />

                <InputWithSlider
                    label="Hard Inquiries (Last 2 Years)"
                    value={newInquiries}
                    onChange={setNewInquiries}
                    min={0}
                    max={10}
                    step={1}
                    suffix=" Inquiries"
                />

                <InputWithSlider
                    label="Account Types"
                    value={accountTypes}
                    onChange={setAccountTypes}
                    min={1}
                    max={5}
                    step={1}
                    suffix=" Types"
                    helperText="Credit cards, loans, mortgage, etc."
                />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-sm text-emerald-900 mb-3">Scenario Testing</h3>

                <InputWithSlider
                    label="Pay Off Amount"
                    value={payoffAmount}
                    onChange={setPayoffAmount}
                    min={0}
                    max={currentBalance}
                    step={100}
                    currency={currency}
                    helperText="Test impact of paying down debt"
                />

                <InputWithSlider
                    label="New Credit Card Limit"
                    value={newCreditLimit}
                    onChange={setNewCreditLimit}
                    min={0}
                    max={20000}
                    step={500}
                    currency={currency}
                    helperText="Test impact of opening new card"
                />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> FICO Score Impact Calculator
                </h2>
                <p className="text-sm text-indigo-800">Simulate how financial actions affect your credit score.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className={`bg-gradient-to-br from-${result.currentRange.color}-500 to-${result.currentRange.color}-600 p-6 rounded-xl text-white shadow-lg`}>
                            <p className="text-xs font-bold uppercase mb-1 opacity-80">Estimated FICO Score</p>
                            <div className="flex items-center gap-3">
                                <p className="text-4xl font-bold">{result.estimatedScore}</p>
                                <div>
                                    <p className="text-lg font-semibold">{result.currentRange.icon} {result.currentRange.label}</p>
                                    <p className="text-xs opacity-80">Credit Score Range</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <p className="text-sm font-bold text-amber-900">Credit Utilization</p>
                            </div>
                            <p className="text-2xl font-bold text-center text-amber-700">{result.currentUtilization.toFixed(1)}%</p>
                            <p className="text-xs text-center text-amber-600 mt-1">
                                {result.currentUtilization < 10 ? '✅ Excellent' :
                                    result.currentUtilization < 30 ? '✅ Good' :
                                        result.currentUtilization < 50 ? '⚠️ Fair' : '❌ High'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-sm text-gray-900">Scenario Impacts</h3>

                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">Pay Off ${payoffAmount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-600">Reduces utilization to {result.payoff.newUtilization.toFixed(1)}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${result.payoff.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {result.payoff.impact >= 0 ? '+' : ''}{result.payoff.impact}
                                        </p>
                                        <p className="text-xs text-gray-500">New: {result.payoff.newScore}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">Open New ${newCreditLimit.toLocaleString()} Card</p>
                                        <p className="text-xs text-gray-600">Lowers utilization, adds inquiry</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${result.newCard.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {result.newCard.impact >= 0 ? '+' : ''}{result.newCard.impact}
                                        </p>
                                        <p className="text-xs text-gray-500">New: {result.newCard.newScore}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">6 Months Perfect Payments</p>
                                        <p className="text-xs text-gray-600">Improves history & ages accounts</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${result.perfectPayments.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {result.perfectPayments.impact >= 0 ? '+' : ''}{result.perfectPayments.impact}
                                        </p>
                                        <p className="text-xs text-gray-500">New: {result.perfectPayments.newScore}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.recommendations.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <p className="text-sm font-bold text-green-900">Top Recommendations</p>
                                </div>
                                <div className="space-y-2">
                                    {result.recommendations.slice(0, 3).map((rec, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-semibold text-gray-900">{rec.action}</p>
                                                <p className="text-xs text-gray-600">{rec.priority} Priority</p>
                                            </div>
                                            <p className="text-green-700 font-bold">{rec.impact}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                }
                charts={
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-gray-900">FICO Score Composition</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Payment History', weight: 35, desc: `${onTimePayments}% on-time` },
                                { label: 'Credit Utilization', weight: 30, desc: `${result.currentUtilization.toFixed(1)}%` },
                                { label: 'Length of Credit History', weight: 15, desc: `${accountAge} years avg` },
                                { label: 'New Credit Inquiries', weight: 10, desc: `${newInquiries} inquiries` },
                                { label: 'Credit Mix', weight: 10, desc: `${accountTypes} account types` }
                            ].map(factor => (
                                <div key={factor.label} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-900">{factor.label}</span>
                                        <span className="text-sm font-bold text-blue-600">{factor.weight}%</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{factor.desc}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${factor.weight * 2}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                details={calculatorDetails['fico-score-impact']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
