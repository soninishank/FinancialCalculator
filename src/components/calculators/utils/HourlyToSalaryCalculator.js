import React, { useState, useMemo } from 'react';
import InputWithSlider from '../../common/InputWithSlider';
import CalculatorLayout from '../../common/CalculatorLayout';
import { calculatorDetails } from '../../../data/calculatorDetails';
import { Clock } from 'lucide-react';

export default function HourlyToSalaryCalculator({ currency = 'USD' }) {
    const [hourlyRate, setHourlyRate] = useState(25);
    const [hoursPerWeek, setHoursPerWeek] = useState(40);
    const [weeksPerYear, setWeeksPerYear] = useState(52);
    const [vacationDays, setVacationDays] = useState(10); // Paid vacation days

    const result = useMemo(() => {
        // Annual results
        const totalHours = hoursPerWeek * weeksPerYear;
        const annualSalary = hourlyRate * totalHours;
        const monthlySalary = annualSalary / 12;
        const biWeeklySalary = annualSalary / 26;
        const weeklySalary = annualSalary / 52;
        const dailySalary = annualSalary / (weeksPerYear * 5); // Assuming 5 day week

        return {
            annualSalary,
            monthlySalary,
            biWeeklySalary,
            weeklySalary,
            dailySalary,
            totalHours
        };
    }, [hourlyRate, hoursPerWeek, weeksPerYear]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);

    const inputs = (
        <div className="space-y-6">
            <InputWithSlider
                label="Hourly Pay Rate"
                value={hourlyRate}
                onChange={setHourlyRate}
                min={0}
                max={200}
                step={0.5}
                currency={currency}
                isDecimal={true}
            />

            <InputWithSlider
                label="Hours worked per week"
                value={hoursPerWeek}
                onChange={setHoursPerWeek}
                min={1}
                max={80}
                step={1}
                suffix=" Hours"
            />

            <InputWithSlider
                label="Weeks worked per year"
                value={weeksPerYear}
                onChange={setWeeksPerYear}
                min={1}
                max={52}
                step={1}
                suffix=" Weeks"
                helperText="Standard is 52."
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Hourly to Salary Converter
                </h2>
                <p className="text-sm text-indigo-800">Quickly see how your hourly wage translates to annual, monthly, or weekly income.</p>
            </div>

            <CalculatorLayout
                inputs={inputs}
                summary={
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-indigo-600 rounded-2xl shadow-lg ring-4 ring-indigo-100 mb-8">
                            <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">Estimated Annual Salary</p>
                            <p className="text-4xl font-black text-white">
                                {formatCurrency(result.annualSalary)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase">Monthly</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(result.monthlySalary)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase">Bi-Weekly</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(result.biWeeklySalary)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase">Weekly</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(result.weeklySalary)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase">Daily</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(result.dailySalary)}</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Hours per Year</span>
                                <span className="font-bold text-gray-800">{result.totalHours.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                }
                details={calculatorDetails['hourly-to-salary']?.render() || <div className="p-6 text-center text-gray-500">Details coming soon...</div>}
            />
        </div>
    );
}
