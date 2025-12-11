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
    const [initialSIP, setInitialSIP] = useState(defaults.initialSIP || 0); // For StepUp
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

    return {
        monthlySIP, setMonthlySIP,
        lumpSum, setLumpSum,
        initialSIP, setInitialSIP,
        stepUpPercent, setStepUpPercent,
        annualRate, setAnnualRate,
        years, setYears,
        isTaxApplied, setIsTaxApplied,
        ltcgRate, setLtcgRate,
        isExemptionApplied, setIsExemptionApplied,
        exemptionLimit, setExemptionLimit,
        isInflationAdjusted, setIsInflationAdjusted,
        inflationRate, setInflationRate,
    };
}
