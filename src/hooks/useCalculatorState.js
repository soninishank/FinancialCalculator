import { useState } from 'react';
import { useUrlState } from './useUrlState';
import { DEFAULT_LTCG_TAX_RATE_DECIMAL } from '../utils/tax';

/**
 * Hook to manage common state for investment calculators with URL persistence.
 * 
 * @param {Object} defaults - Default values for state
 * @returns {Object} - State and setters
 */
export function useCalculatorState(defaults = {}) {
    // Input Values - Synced to URL
    const [monthlySIP, setMonthlySIP] = useUrlState('sip', defaults.monthlySIP || 0);
    const [lumpSum, setLumpSum] = useUrlState('lump', defaults.lumpSum || 0);
    const [targetAmount, setTargetAmount] = useUrlState('target', defaults.targetAmount || 0);
    const [initialSIP, setInitialSIP] = useUrlState('initSip', defaults.initialSIP || 0);
    const [deferDuration, setDeferDuration] = useUrlState('defer', defaults.deferDuration || 0);
    const [compoundingFrequency, setCompoundingFrequency] = useUrlState('freq', defaults.compoundingFrequency || 'monthly');
    const [stepUpPercent, setStepUpPercent] = useUrlState('step', defaults.stepUpPercent || 0);
    const [annualRate, setAnnualRate] = useUrlState('rate', defaults.annualRate || 12);
    const [years, setYears] = useUrlState('years', defaults.years || 10);

    // Tax Configuration
    const [isTaxApplied, setIsTaxApplied] = useUrlState('tax', false);
    const [ltcgRate, setLtcgRate] = useUrlState('ltcg', DEFAULT_LTCG_TAX_RATE_DECIMAL * 100);
    const [isExemptionApplied, setIsExemptionApplied] = useUrlState('exemp', false);
    const [exemptionLimit, setExemptionLimit] = useUrlState('exempLim', 100000);

    // Inflation Configuration
    const [isInflationAdjusted, setIsInflationAdjusted] = useUrlState('inflAdj', false);
    const [inflationRate, setInflationRate] = useUrlState('inflRate', 6);

    // Date Range Modes
    const [calculationMode, setCalculationMode] = useState(defaults.calculationMode || 'duration');
    const [startDate, setStartDate] = useUrlState('start', defaults.startDate || new Date().toISOString().slice(0, 7));
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
