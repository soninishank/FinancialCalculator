import { useState } from 'react';
import { DEFAULT_LTCG_TAX_RATE_DECIMAL } from '../utils/tax';

/**
 * Hook to manage common state for investment calculators.
 * 
 * @param {Object} defaults - Default values for state
 * @returns {Object} - State and setters
 */
export function useCalculatorState(defaults = {}) {
    // Input Values
    const [monthlySIP, setMonthlySIP] = useState(defaults.monthlySIP || 0);
    const [lumpSum, setLumpSum] = useState(defaults.lumpSum || 0);
    const [targetAmount, setTargetAmount] = useState(defaults.targetAmount || 0); // Added for GoalPlanner
    const [initialSIP, setInitialSIP] = useState(defaults.initialSIP || 0); // For StepUp
    const [deferDuration, setDeferDuration] = useState(defaults.deferDuration || 0); // SWP Deferment (Months)
    const [compoundingFrequency, setCompoundingFrequency] = useState(defaults.compoundingFrequency || 'monthly'); // SWP Frequency
    const [stepUpPercent, setStepUpPercent] = useState(defaults.stepUpPercent || 0);
    const [annualRate, setAnnualRate] = useState(defaults.annualRate || 12);
    const [years, setYears] = useState(defaults.years || 10); // Standard tenure state

    // Tax Configuration
    const [isTaxApplied, setIsTaxApplied] = useState(false);
    const [ltcgRate, setLtcgRate] = useState(DEFAULT_LTCG_TAX_RATE_DECIMAL * 100); // 10%
    const [isExemptionApplied, setIsExemptionApplied] = useState(false);
    const [exemptionLimit, setExemptionLimit] = useState(100000);

    // Inflation Configuration
    const [isInflationAdjusted, setIsInflationAdjusted] = useState(false);
    const [inflationRate, setInflationRate] = useState(6); // Default 6% inflation

    // Compounding (Experimental/New)


    // Date Range Modes (New)
    const [calculationMode, setCalculationMode] = useState(defaults.calculationMode || 'duration');
    const [startDate, setStartDate] = useState(defaults.startDate || new Date().toISOString().slice(0, 7));
    const [endDate, setEndDate] = useState(defaults.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + (defaults.years || 10))).toISOString().slice(0, 10));
    const [scheduleStartDate, setScheduleStartDate] = useState(defaults.scheduleStartDate || new Date().toISOString().slice(0, 7));

    return {
        monthlySIP, setMonthlySIP,
        lumpSum, setLumpSum,
        targetAmount, setTargetAmount,
        initialSIP, setInitialSIP,
        deferDuration, setDeferDuration,
        compoundingFrequency, setCompoundingFrequency,
        stepUpPercent, setStepUpPercent,
        annualRate, setAnnualRate,
        years, setYears,
        isTaxApplied, setIsTaxApplied,
        ltcgRate, setLtcgRate,
        isExemptionApplied, setIsExemptionApplied,
        exemptionLimit, setExemptionLimit,
        isInflationAdjusted, setIsInflationAdjusted,
        inflationRate, setInflationRate,

        calculationMode, setCalculationMode,
        startDate, setStartDate,
        endDate, setEndDate,
        scheduleStartDate, setScheduleStartDate,
    };
}
