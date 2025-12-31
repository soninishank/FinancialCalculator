import { lazyLoad } from './lazyLoad';

// This function returns the dynamic import promise for a given slug
export const importCalculatorBySlug = (slug) => {
    switch (slug) {
        case 'sip-plus-lump': return import('../components/calculators/SIPWithLumpSum');
        case 'pure-sip': return import('../components/calculators/PureSIP');
        case 'lump-sum': return import('../components/calculators/LumpSumOnly');
        case 'step-up-sip': return import('../components/calculators/StepUpSIP');
        case 'step-up-plus-lump': return import('../components/calculators/StepUpSIPWithLump');
        case 'target-amount-calculator': return import('../components/calculators/GoalPlanner');
        case 'loan-emi': return import('../components/calculators/LoanEMI');
        case 'car-loan-emi': return import('../components/calculators/CarLoanEMI');
        case 'advanced-car-loan-emi': return import('../components/calculators/AdvancedCarLoanEMI');
        case 'step-up-loan-emi': return import('../components/calculators/StepUpLoanEMI');
        case 'moratorium-loan-emi': return import('../components/calculators/MoratoriumLoanEMI');
        case 'cagr-calculator': return import('../components/calculators/CAGRCalculator');
        case 'compare-loans': return import('../components/calculators/CompareLoans');
        case 'advanced-home-loan': return import('../components/calculators/AdvancedHomeLoanEMI');
        case 'topup-loan-emi': return import('../components/calculators/TopUpLoanEMI');
        case 'emi-comparison': return import('../components/calculators/EMIComparison');
        case 'swp-calculator': return import('../components/calculators/SWPCalculator');
        // FIRE Calculators
        case 'ultimate-fire-planner': return import('../components/calculators/TimeToFIRE');
        case 'swr-simulator': return import('../components/calculators/SWRSimulator');
        // Decision Making
        case 'rent-vs-buy': return import('../components/calculators/RentVsBuy');
        case 'cost-of-delay': return import('../components/calculators/CostOfDelay');
        case 'step-down-withdrawal': return import('../components/calculators/StepDownWithdrawal');
        // General / Hygiene
        case 'inflation-impact': return import('../components/calculators/InflationImpact');
        case 'asset-allocation': return import('../components/calculators/AssetAllocation');
        case 'simple-interest': return import('../components/calculators/SimpleInterest');
        case 'recurring-deposit': return import('../components/calculators/RecurringDeposit');
        case 'fixed-deposit': return import('../components/calculators/FixedDeposit');
        case 'ppf-calculator': return import('../components/calculators/PPFCalculator');
        case 'credit-card-payoff': return import('../components/calculators/CreditCardPayoff');
        case 'roi-calculator': return import('../components/calculators/ROICalculator');
        case 'rule-of-72': return import('../components/calculators/RuleOf72');
        case 'refinance-calculator': return import('../components/calculators/RefinanceCalculator');
        case 'compound-interest': return import('../components/calculators/CompoundInterest');
        case 'home-loan-eligibility': return import('../components/calculators/HomeLoanEligibility');
        case 'property-loan-eligibility': return import('../components/calculators/PropertyLoanEligibility');
        case 'expense-ratio-calculator': return import('../components/calculators/ExpenseRatioCalculator');
        case 'time-to-goal': return import('../components/calculators/TimeDurationCalculator');
        case 'xirr-calculator': return import('../components/calculators/XIRRCalculator');
        default: return Promise.reject(new Error(`Unknown calculator: ${slug}`));
    }
};

// Helper for React components to get a Lazy Loaded component
export const getLazyCalculator = (slug, cache = {}) => {
    if (cache[slug]) return cache[slug];

    // Create a closure that calls the import function
    const importer = () => importCalculatorBySlug(slug);

    const LazyComponent = lazyLoad(importer);
    cache[slug] = LazyComponent;
    return LazyComponent;
};
