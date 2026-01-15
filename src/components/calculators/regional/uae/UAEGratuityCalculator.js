import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../../common/InputWithSlider';
import CalculatorLayout from '../../../common/CalculatorLayout';
import UnifiedSummary from '../../../common/UnifiedSummary';
import { calculatorDetails } from '../../../../data/calculatorDetails';
import { Briefcase } from 'lucide-react';

export default function UAEGratuityCalculator({ currency = 'AED' }) {
    const [basicSalary, setBasicSalary] = useState(10000);
    const [yearsOfService, setYearsOfService] = useState(5);
    const [isLimited, setIsLimited] = useState(true);
    const [reason, setReason] = useState('Termination'); // Termination, Resignation

    const result = useMemo(() => {
        let gratuity = 0;
        const totalDays = yearsOfService * 365;
        const dailyBasic = basicSalary / 30;

        if (yearsOfService < 1) {
            gratuity = 0;
        } else {
            // Simplified Labor Law 2022 (New Law)
            // 21 days for first 5 years, 30 days for additional years
            if (yearsOfService <= 5) {
                gratuity = (21 * dailyBasic) * yearsOfService;
            } else {
                gratuity = (21 * dailyBasic * 5) + (30 * dailyBasic * (yearsOfService - 5));
            }

            // Cap at 2 years of total salary
            gratuity = Math.min(gratuity, basicSalary * 24);

            // Resignation reductions (Old Law often applied this, New law is simpler but for a calculator we can show standard entitlements)
            if (reason === 'Resignation' && yearsOfService < 3) {
                // gratuity = gratuity * (1/3); // Old law logic, keeping it for complexity if needed or just status quo
            }
        }

        return {
            gratuity,
            monthlyBasic: basicSalary,
            totalDays,
            dailyRate: dailyBasic
        };
    }, [basicSalary, yearsOfService, isLimited, reason]);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Monthly Basic Salary"
                value={basicSalary}
                onChange={setBasicSalary}
                min={2000}
                max={100000}
                step={500}
                currency={currency}
            />
            <InputWithSlider
                label="Years of Service"
                value={yearsOfService}
                onChange={setYearsOfService}
                min={0}
                max={40}
                step={0.5}
                symbol=" years"
                isDecimal={true}
            />
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Contract Type (New Labor Law)</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsLimited(true)}
                        className={`py-2 px-4 rounded-lg border transition-all ${isLimited ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Fixed Term
                    </button>
                    <button
                        onClick={() => setIsLimited(false)}
                        className={`py-2 px-4 rounded-lg border transition-all ${!isLimited ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        Unlimited
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">
                    Based on <strong>UAE Federal Decree-Law No. 33 of 2021</strong>.
                    Gratuity is calculated on <strong>Basic Salary</strong> only (excluding allowances).
                </p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> UAE Gratuity Calculator
                </h2>
                <p className="text-sm text-amber-800">Calculate your end-of-service benefits based on the latest UAE Labor Law.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Estimated Gratuity Amount</p>
                            <p className="text-4xl font-bold text-teal-600">
                                {new Intl.NumberFormat('ar-AE', { style: 'currency', currency }).format(Math.round(result.gratuity))}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Entitlement Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Daily Basic Rate</span>
                                    <span className="font-medium">{new Intl.NumberFormat('ar-AE', { style: 'currency', currency }).format(result.dailyRate)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Service Period</span>
                                    <span className="font-medium">{yearsOfService} Years ({result.totalDays} Days)</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <span>Total Gratuity</span>
                                        <span className="text-teal-700">{new Intl.NumberFormat('ar-AE', { style: 'currency', currency }).format(Math.round(result.gratuity))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-50 p-4 rounded-lg flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0"></div>
                            <p className="text-xs text-teal-800">
                                <strong>Note:</strong> Gratuity is capped at 2 years of the worker's salary. Calculations assume full entitlement after 1 year of continuous service.
                            </p>
                        </div>
                    </div>
                }
                details={calculatorDetails['uae-gratuity']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
