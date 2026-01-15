import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Car, TrendingUp } from 'lucide-react';

export default function AutoLeaseVsBuyCalculator({ currency = 'USD' }) {
    const [vehiclePrice, setVehiclePrice] = useState(35000);
    const [leaseTerm, setLeaseTerm] = useState(36); // months
    const [downPayment, setDownPayment] = useState(3000);
    const [interestRate, setInterestRate] = useState(6.5);
    const [residualValue, setResidualValue] = useState(50); // % of MSRP
    const [moneyFactor, setMoneyFactor] = useState(0.00125); // Lease interest rate / 2400
    const [milesPerYear, setMilesPerYear] = useState(12000);
    const [compareYears, setCompareYears] = useState(5);

    const result = useMemo(() => {
        // ========== LEASE CALCULATION ==========
        const leaseMonths = leaseTerm;
        const residualAmount = vehiclePrice * (residualValue / 100);
        const capitalizedCost = vehiclePrice - downPayment;

        // Monthly lease payment = Depreciation + Finance charge
        const depreciation = (capitalizedCost - residualAmount) / leaseMonths;
        const financeCharge = (capitalizedCost + residualAmount) * moneyFactor;
        const monthlyLeasePayment = depreciation + financeCharge;

        const totalLeasePayments = monthlyLeasePayment * leaseMonths;
        const totalLeaseCost = totalLeasePayments + downPayment;

        // ========== BUY/FINANCE CALCULATION ==========
        const loanAmount = vehiclePrice - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const loanTermMonths = 60; // Standard 5-year auto loan

        const monthlyFinancePayment = monthlyRate === 0
            ? loanAmount / loanTermMonths
            : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
            (Math.pow(1 + monthlyRate, loanTermMonths) - 1);

        const totalFinancePayments = monthlyFinancePayment * loanTermMonths;
        const totalInterestPaid = totalFinancePayments - loanAmount;
        const totalBuyCost = totalFinancePayments + downPayment;

        // Vehicle depreciation curve (simplified)
        const depreciationByYear = [
            { year: 0, value: vehiclePrice },
            { year: 1, value: vehiclePrice * 0.80 },
            { year: 2, value: vehiclePrice * 0.68 },
            { year: 3, value: vehiclePrice * 0.58 },
            { year: 4, value: vehiclePrice * 0.50 },
            { year: 5, value: vehiclePrice * 0.43 },
            { year: 7, value: vehiclePrice * 0.35 },
            { year: 10, value: vehiclePrice * 0.25 }
        ];

        // Long-term cost comparison
        const compareMonths = compareYears * 12;
        let leaseCyclesNeeded = Math.ceil(compareMonths / leaseMonths);
        const totalLeaseCostLongTerm = leaseCyclesNeeded * totalLeaseCost;

        // If bought: you own+the vehicle
        const vehicleValueAtEnd = depreciationByYear.find(d => d.year === compareYears)?.value || vehiclePrice * 0.25;
        const netBuyCost = totalBuyCost - vehicleValueAtEnd;

        const savings = totalLeaseCostLongTerm - netBuyCost;

        return {
            // Lease
            monthlyLeasePayment,
            totalLeaseCost,
            leaseMonths,

            // Buy
            monthlyFinancePayment,
            totalBuyCost,
            totalInterestPaid,

            // Long-term
            totalLeaseCostLongTerm,
            vehicleValueAtEnd,
            netBuyCost,
            savings,
            isBuyingBetter: savings > 0,
            leaseCyclesNeeded
        };
    }, [vehiclePrice, leaseTerm, downPayment, interestRate, residualValue, moneyFactor, compareYears]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Vehicle Price (MSRP)"
                value={vehiclePrice}
                onChange={setVehiclePrice}
                min={15000}
                max={100000}
                step={1000}
                currency={currency}
            />

            <InputWithSlider
                label="Down Payment"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                max={20000}
                step={500}
                currency={currency}
            />

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-sm text-blue-900 mb-3">Lease Parameters</h3>

                <InputWithSlider
                    label="Lease Term (Months)"
                    value={leaseTerm}
                    onChange={setLeaseTerm}
                    min={24}
                    max={48}
                    step={12}
                    suffix=" Months"
                />

                <InputWithSlider
                    label="Residual Value (% of MSRP)"
                    value={residualValue}
                    onChange={setResidualValue}
                    min={30}
                    max={70}
                    step={1}
                    symbol="%"
                    helperText="Set by leasing company (36mo: ~55%, 24mo: ~60%)"
                />

                <InputWithSlider
                    label="Money Factor"
                    value={moneyFactor}
                    onChange={setMoneyFactor}
                    min={0.0001}
                    max={0.005}
                    step={0.00001}
                    isDecimal={true}
                    helperText="Money Factor × 2400 = APR. Typical: 0.0010-0.0025"
                />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-sm text-emerald-900 mb-3">Finance Parameters</h3>

                <InputWithSlider
                    label="Interest Rate (APR %)"
                    value={interestRate}
                    onChange={setInterestRate}
                    min={1}
                    max={15}
                    step={0.1}
                    symbol="%"
                    isDecimal={true}
                    helperText="Auto loan rate (5-year term)"
                />
            </div>

            <InputWithSlider
                label="Comparison Period (Years)"
                value={compareYears}
                onChange={setCompareYears}
                min={3}
                max={10}
                step={1}
                suffix=" Years"
                helperText="Total cost comparison timeline"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <Car className="w-5 h-5" /> Auto Lease vs Buy Calculator
                </h2>
                <p className="text-sm text-indigo-800">Compare total cost of leasing vs. financing a vehicle over time.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-2">Lease Option</p>
                                <p className="text-2xl font-bold text-blue-700 mb-1">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyLeasePayment)}/mo
                                </p>
                                <p className="text-xs text-gray-600">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalLeaseCost)}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{result.leaseMonths} months • No equity</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                <p className="text-xs text-emerald-600 uppercase font-bold mb-2">Buy/Finance Option</p>
                                <p className="text-2xl font-bold text-emerald-700 mb-1">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.monthlyFinancePayment)}/mo
                                </p>
                                <p className="text-xs text-gray-600">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalBuyCost)}</p>
                                <p className="text-[10px] text-gray-500 mt-1">60 months • You own it</p>
                            </div>
                        </div>

                        <div className={`p-6 rounded-xl ${result.isBuyingBetter ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} text-white shadow-lg`}>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <p className="text-xs font-bold uppercase opacity-80">{compareYears}-Year Total Cost Comparison</p>
                            </div>
                            <p className="text-xs opacity-90 mb-3">
                                {result.isBuyingBetter ? 'Buying' : 'Leasing'} is more cost-effective over {compareYears} years
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-[10px] opacity-80">Lease Total</p>
                                    <p className="text-lg font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.totalLeaseCostLongTerm)}
                                    </p>
                                    <p className="text-[9px] opacity-70">{result.leaseCyclesNeeded} lease cycles</p>
                                </div>
                                <div>
                                    <p className="text-[10px] opacity-80">Buy Net Cost</p>
                                    <p className="text-lg font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.netBuyCost)}
                                    </p>
                                    <p className="text-[9px] opacity-70">After resale value</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Vehicle Value at {compareYears} Years</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.vehicleValueAtEnd)}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">Your equity if bought</p>
                            </div>
                            <div className={`border p-4 rounded-xl text-center ${result.isBuyingBetter ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: result.isBuyingBetter ? '#059669' : '#2563eb' }}>
                                    Savings with {result.isBuyingBetter ? 'Buying' : 'Leasing'}
                                </p>
                                <p className="text-lg font-bold" style={{ color: result.isBuyingBetter ? '#059669' : '#2563eb' }}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.abs(result.savings))}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold mb-2">Consider Leasing If:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>You want latest features every few years</li>
                                <li>You drive under {milesPerYear.toLocaleString()} miles/year</li>
                                <li>You prefer lower monthly payments</li>
                            </ul>
                            <p className="font-semibold mt-3 mb-2">Consider Buying If:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>You plan to keep vehicle 5+ years</li>
                                <li>You drive high mileage</li>
                                <li>You want to build equity</li>
                            </ul>
                        </div>
                    </div>
                }
                details={calculatorDetails['auto-lease-vs-buy']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
