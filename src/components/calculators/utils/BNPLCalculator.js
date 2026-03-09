import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../common/CalculatorLayout';
import InputWithSlider from '../../common/InputWithSlider';
import { moneyFormat } from '../../../utils/formatting';

const PRESETS = [
    { name: 'Affirm (0%)', installments: 4, fee: 0, interest: 0, lateFee: 0 },
    { name: 'Klarna (4-pay)', installments: 4, fee: 0, interest: 0, lateFee: 7 },
    { name: 'Afterpay', installments: 4, fee: 0, interest: 0, lateFee: 8 },
    { name: 'Affirm (w/ Interest)', installments: 12, fee: 0, interest: 15, lateFee: 0 },
    { name: 'Custom', installments: 6, fee: 0, interest: 0, lateFee: 0 }
];

const BNPLCalculator = ({ currency = 'USD' }) => {
    const [purchasePrice, setPurchasePrice] = useState(500);
    const [selectedPreset, setSelectedPreset] = useState(4); // Custom
    const [installments, setInstallments] = useState(6);
    const [annualInterest, setAnnualInterest] = useState(0);
    const [upfrontFee, setUpfrontFee] = useState(0);
    const [lateFeePerMiss, setLateFeePerMiss] = useState(0);
    const [missedPayments, setMissedPayments] = useState(0);

    const handlePresetSelect = (index) => {
        setSelectedPreset(index);
        const preset = PRESETS[index];
        setInstallments(preset.installments);
        setAnnualInterest(preset.interest);
        setUpfrontFee(preset.fee);
        setLateFeePerMiss(preset.lateFee);
    };

    const result = useMemo(() => {
        const price = parseFloat(purchasePrice) || 0;
        const numInstallments = parseFloat(installments) || 1;
        const rate = (parseFloat(annualInterest) || 0) / 100;
        const fee = parseFloat(upfrontFee) || 0;
        const lateFee = parseFloat(lateFeePerMiss) || 0;
        const missed = parseFloat(missedPayments) || 0;

        const monthlyRate = rate / 12;

        // Calculate installment amount
        let installmentAmount;
        let totalInterest = 0;

        if (monthlyRate > 0) {
            // PMT formula for interest-bearing BNPL
            installmentAmount = price * monthlyRate * Math.pow(1 + monthlyRate, numInstallments) /
                (Math.pow(1 + monthlyRate, numInstallments) - 1);
            totalInterest = (installmentAmount * numInstallments) - price;
        } else {
            installmentAmount = price / numInstallments;
            totalInterest = 0;
        }

        // Total late fees
        const totalLateFees = lateFee * missed;

        // Total cost
        const totalCost = price + totalInterest + fee + totalLateFees;

        // Extra cost over cash
        const extraCost = totalCost - price;

        // True APR (including fees)
        let trueAPR = 0;
        if (extraCost > 0 && price > 0) {
            // Simple APR approximation: (total charges / principal) / (months / 12) * 100
            const periodInYears = numInstallments / 12;
            if (periodInYears > 0) {
                trueAPR = (extraCost / price) / periodInYears * 100;
            }
        }

        // Cost per day of financing
        const financingDays = numInstallments * 30;
        const costPerDay = financingDays > 0 ? extraCost / financingDays : 0;

        // What else could you buy with the extra cost?
        const coffees = extraCost / 5; // $5 coffees

        return {
            installmentAmount,
            totalInterest,
            totalLateFees,
            totalCost,
            extraCost,
            trueAPR,
            costPerDay,
            coffees: Math.floor(coffees),
            numInstallments
        };
    }, [purchasePrice, installments, annualInterest, upfrontFee, lateFeePerMiss, missedPayments]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                min={50}
                max={10000}
                step={25}
                currency={currency}
                helperText="What are you buying?"
            />

            {/* BNPL Provider Presets */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    BNPL Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => handlePresetSelect(i)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedPreset === i
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            <InputWithSlider
                label="Number of Installments"
                value={installments}
                onChange={setInstallments}
                min={2}
                max={36}
                step={1}
            />
            <InputWithSlider
                label="Annual Interest Rate (%)"
                value={annualInterest}
                onChange={setAnnualInterest}
                min={0}
                max={36}
                step={0.5}
                suffix="%"
                helperText="Many BNPL plans are 0% but some charge interest"
            />
            <InputWithSlider
                label="Upfront / Processing Fee"
                value={upfrontFee}
                onChange={setUpfrontFee}
                min={0}
                max={100}
                step={1}
                currency={currency}
            />
            <InputWithSlider
                label="Late Fee per Missed Payment"
                value={lateFeePerMiss}
                onChange={setLateFeePerMiss}
                min={0}
                max={50}
                step={1}
                currency={currency}
            />
            <InputWithSlider
                label="Expected Missed Payments"
                value={missedPayments}
                onChange={setMissedPayments}
                min={0}
                max={installments}
                step={1}
                helperText="Be honest — how many payments might you miss?"
            />
        </div>
    );

    const summary = (
        <div className="space-y-6">
            {/* Per Installment */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">You&apos;ll Pay</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {moneyFormat(result.installmentAmount, currency)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    × {result.numInstallments} installments
                </p>
            </div>

            {/* Total Cost vs Cash */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cash Price</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {moneyFormat(purchasePrice, currency)}
                    </p>
                </div>
                <div className={`p-4 rounded-xl border text-center ${result.extraCost > 0
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30'
                    }`}>
                    <p className={`text-xs font-medium mb-1 ${result.extraCost > 0
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-emerald-700 dark:text-emerald-300'
                        }`}>BNPL Total Cost</p>
                    <p className={`text-lg font-bold ${result.extraCost > 0
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-emerald-800 dark:text-emerald-200'
                        }`}>
                        {moneyFormat(result.totalCost, currency)}
                    </p>
                </div>
            </div>

            {/* Extra Cost / True APR */}
            {result.extraCost > 0 ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/30 text-center">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Extra Cost of BNPL</p>
                    <p className="text-3xl font-bold text-red-800 dark:text-red-200">
                        {moneyFormat(result.extraCost, currency)}
                    </p>
                    {result.trueAPR > 0 && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            True APR: <strong>{result.trueAPR.toFixed(1)}%</strong>
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">No Extra Cost! ✅</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">This BNPL plan costs the same as paying cash</p>
                </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cost Breakdown</p>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{moneyFormat(purchasePrice, currency)}</span>
                    </div>
                    {result.totalInterest > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Interest Charged</span>
                            <span className="font-semibold text-red-600">+{moneyFormat(result.totalInterest, currency)}</span>
                        </div>
                    )}
                    {upfrontFee > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                            <span className="font-semibold text-red-600">+{moneyFormat(upfrontFee, currency)}</span>
                        </div>
                    )}
                    {result.totalLateFees > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Late Fees ({missedPayments} missed)</span>
                            <span className="font-semibold text-red-600">+{moneyFormat(result.totalLateFees, currency)}</span>
                        </div>
                    )}
                    <hr className="border-gray-100 dark:border-slate-700" />
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total You&apos;ll Pay</span>
                        <span className="font-bold text-gray-900 dark:text-white">{moneyFormat(result.totalCost, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Fun Fact */}
            {result.extraCost > 0 && result.coffees > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        ☕ That extra {moneyFormat(result.extraCost, currency)} = <strong>{result.coffees} coffees</strong> you could have bought instead
                    </p>
                </div>
            )}
        </div>
    );

    const details = (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Understanding Buy Now Pay Later</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                    <strong>Buy Now, Pay Later (BNPL)</strong> services like Affirm, Klarna, and Afterpay let you split
                    purchases into installments. While many plans are interest-free, the hidden costs can add up.
                </p>

                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-6">Hidden Costs to Watch For</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Late Fees:</strong> Missing a payment can trigger $5-$10 fees per occurrence</li>
                    <li><strong>Deferred Interest:</strong> Some plans charge retroactive interest if you miss the payoff window</li>
                    <li><strong>Overspending:</strong> BNPL can encourage spending more than you planned</li>
                    <li><strong>Credit Impact:</strong> Some providers report to credit bureaus; missed payments hurt your score</li>
                </ul>

                <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-6">When BNPL Makes Sense</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li>0% interest plans where you&apos;re confident you won&apos;t miss payments</li>
                    <li>Essential purchases where cash flow timing is an issue</li>
                    <li>When the item will be used/needed before you could save up</li>
                </ul>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 mt-6">
                    <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">⚠️ Warning Signs</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-400">
                        <li>Using BNPL for wants, not needs</li>
                        <li>Having multiple BNPL plans active simultaneously</li>
                        <li>Missing payments regularly</li>
                        <li>Not tracking total BNPL obligations alongside other debt</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={summary}
            details={details}
        />
    );
};

export default BNPLCalculator;
