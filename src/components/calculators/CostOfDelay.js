import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { calculateCostOfDelay } from '../../utils/finance';
import { moneyFormat } from '../../utils/formatting';
import { FinancialBarChart } from '../common/FinancialCharts';
import {
    DEFAULT_MONTHLY_SIP,
    DEFAULT_RATE,
    DEFAULT_DELAY,
    DEFAULT_INVESTMENT_YEARS,
    MIN_SIP,
    MAX_SIP,
    STEP_SIP,
    MAX_YEARS,
    MIN_RATE,
    MAX_RATE,
    CHART_COLORS
} from '../../utils/constants';

// ... imports remain same ...

export default function CostOfDelay({ currency }) {
    const [monthlySIP, setMonthlySIP] = useState(DEFAULT_MONTHLY_SIP);
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);
    const [delayYears, setDelayYears] = useState(DEFAULT_DELAY);
    const [investmentYears, setInvestmentYears] = useState(DEFAULT_INVESTMENT_YEARS);

    // FIX: Clamp delayYears if investmentYears is reduced below current delay
    const handleDurationChange = (newDuration) => {
        const dur = Number(newDuration);
        setInvestmentYears(dur);
        if (delayYears >= dur) {
            setDelayYears(dur - 1);
        }
    };

    const result = useMemo(() => calculateCostOfDelay({
        monthlyInvestment: monthlySIP,
        annualReturn,
        delayYears,
        investmentYears
    }), [monthlySIP, annualReturn, delayYears, investmentYears]);

    const chartData = {
        labels: ['Final Corpuses'],
        datasets: [
            {
                label: `Start Now (${investmentYears} yrs)`,
                data: [result.startedNow],
                backgroundColor: CHART_COLORS.SUCCESS,
            },
            {
                label: `Delay by ${delayYears} yrs (${investmentYears - delayYears} yrs inv)`,
                data: [result.startedLater],
                backgroundColor: CHART_COLORS.DANGER,
            },
        ]
    };

    const options = {
        plugins: {
            legend: { position: 'bottom' }
        }
    };

    const inputs = (
        <>
            <InputWithSlider
                label="Monthly SIP Amount"
                value={monthlySIP}
                onChange={setMonthlySIP}
                min={MIN_SIP} max={MAX_SIP} step={STEP_SIP}
                currency={currency}
            />
            <div className="grid grid-cols-2 gap-4">
                <InputWithSlider
                    label="Total Duration (Years)"
                    value={investmentYears}
                    onChange={handleDurationChange}
                    min={10} max={MAX_YEARS}
                />
                <InputWithSlider
                    label="Years of Delay"
                    value={delayYears}
                    onChange={setDelayYears}
                    min={1} max={investmentYears - 1}
                />
            </div>
            <InputWithSlider
                label="Expected Return (%)"
                value={annualReturn}
                onChange={setAnnualReturn}
                min={MIN_RATE} max={MAX_RATE} step={0.1}
            />
        </>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-center animate-fade-in shadow-sm">
                    <h3 className="text-red-900 font-bold text-lg mb-2">Cost of Waiting {delayYears} Years</h3>
                    <div className="text-4xl font-extrabold text-red-600 mb-2">
                        {moneyFormat(result.cost, currency)}
                    </div>
                    <p className="text-red-800 text-sm">
                        You lose this much by delaying your start!
                    </p>
                </div>
            }
            charts={
                <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-8">
                    <FinancialBarChart data={chartData} options={options} currency={currency} height={300} />
                </div>
            }
        />
    );
}

