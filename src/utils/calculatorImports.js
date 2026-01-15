import { lazyLoad } from './lazyLoad';

// This function returns the dynamic import promise for a given slug
export const importCalculatorBySlug = (slug) => {
    switch (slug) {
        case 'sip-plus-lump': return import('../components/calculators/investments/SIPWithLumpSum');
        case 'pure-sip': return import('../components/calculators/investments/PureSIP');
        case 'lump-sum': return import('../components/calculators/investments/LumpSumOnly');
        case 'step-up-sip': return import('../components/calculators/investments/StepUpSIP');
        case 'step-up-plus-lump': return import('../components/calculators/investments/StepUpSIPWithLump');
        case 'target-amount-calculator': return import('../components/calculators/investments/GoalPlanner');
        case 'loan-emi': return import('../components/calculators/loans/LoanEMI');
        case 'car-loan-emi': return import('../components/calculators/loans/CarLoanEMI');
        case 'advanced-car-loan-emi': return import('../components/calculators/loans/AdvancedCarLoanEMI');
        case 'step-up-loan-emi': return import('../components/calculators/loans/StepUpLoanEMI');
        case 'moratorium-loan-emi': return import('../components/calculators/loans/MoratoriumLoanEMI');
        case 'cagr-calculator': return import('../components/calculators/investments/CAGRCalculator');
        case 'compare-loans': return import('../components/calculators/loans/CompareLoans');
        case 'advanced-home-loan': return import('../components/calculators/loans/AdvancedHomeLoanEMI');
        case 'topup-loan-emi': return import('../components/calculators/loans/TopUpLoanEMI');
        case 'emi-comparison': return import('../components/calculators/loans/EMIComparison');
        case 'swp-calculator': return import('../components/calculators/investments/SWPCalculator');
        // FIRE Calculators
        case 'ultimate-fire-planner': return import('../components/calculators/retirement/TimeToFIRE');
        case 'swr-simulator': return import('../components/calculators/retirement/SWRSimulator');
        // Decision Making
        case 'rent-vs-buy': return import('../components/calculators/decision/RentVsBuy');
        case 'cost-of-delay': return import('../components/calculators/decision/CostOfDelay');
        case 'step-down-withdrawal': return import('../components/calculators/retirement/StepDownWithdrawal');
        // General / Hygiene
        case 'inflation-impact': return import('../components/calculators/utils/InflationImpact');
        case 'asset-allocation': return import('../components/calculators/utils/AssetAllocation');
        case 'simple-interest': return import('../components/calculators/utils/SimpleInterest');
        case 'recurring-deposit': return import('../components/calculators/savings/RecurringDeposit');
        case 'fixed-deposit': return import('../components/calculators/savings/FixedDeposit');
        case 'ppf-calculator': return import('../components/calculators/savings/PPFCalculator');
        case 'credit-card-payoff': return import('../components/calculators/loans/CreditCardPayoff');
        case 'roi-calculator': return import('../components/calculators/investments/ROICalculator');
        case 'rule-of-72': return import('../components/calculators/utils/RuleOf72');
        case 'refinance-calculator': return import('../components/calculators/loans/RefinanceCalculator');
        case 'compound-interest': return import('../components/calculators/utils/CompoundInterest');
        case 'home-loan-eligibility': return import('../components/calculators/loans/HomeLoanEligibility');
        case 'property-loan-eligibility': return import('../components/calculators/loans/PropertyLoanEligibility');
        case 'expense-ratio-calculator': return import('../components/calculators/investments/ExpenseRatioCalculator');
        case 'time-to-goal': return import('../components/calculators/investments/TimeDurationCalculator');
        case 'xirr-calculator': return import('../components/calculators/investments/XIRRCalculator');
        case 'gst-calculator': return import('../components/calculators/tax/GSTCalculator');
        case 'nps-calculator': return import('../components/calculators/retirement/NPSCalculator');
        case 'ssy-calculator': return import('../components/calculators/savings/SSYCalculator');
        case '401k-calculator': return import('../components/calculators/retirement/Calculator401k');
        case 'roth-ira-calculator': return import('../components/calculators/retirement/RothIRACalculator');
        case '529-college-savings': return import('../components/calculators/education/CollegeSavings529');
        case 'us-mortgage-calculator': return import('../components/calculators/loans/USMortgageCalculator');
        case 'rmd-calculator': return import('../components/calculators/retirement/RMDCalculator');
        case 'us-capital-gains': return import('../components/calculators/tax/USCapitalGainsCalculator');
        case 'social-security-break-even': return import('../components/calculators/retirement/SocialSecurityCalculator');
        case 'us-paycheck-calculator': return import('../components/calculators/tax/USPaycheckCalculator');
        case 'hsa-calculator': return import('../components/calculators/retirement/HSACalculator');
        case 'hourly-to-salary': return import('../components/calculators/utils/HourlyToSalaryCalculator');
        // USA-Specific Calculators
        case 'student-loan-payoff': return import('../components/calculators/loans/StudentLoanPayoffCalculator');
        case 'student-loan-forgiveness': return import('../components/calculators/loans/StudentLoanForgivenessCalculator');
        case 'medicare-cost-estimator': return import('../components/calculators/retirement/MedicareCostEstimator');
        case 'aca-marketplace-calculator': return import('../components/calculators/tax/ACAMarketplaceCalculator');
        case 'child-tax-credit': return import('../components/calculators/tax/ChildTaxCreditCalculator');
        case 'fsa-calculator': return import('../components/calculators/tax/FSACalculator');
        case 'traditional-ira-calculator': return import('../components/calculators/retirement/TraditionalIRACalculator');
        case 'home-affordability-calculator': return import('../components/calculators/loans/HomeAffordabilityCalculator');
        case 'auto-lease-vs-buy': return import('../components/calculators/decision/AutoLeaseVsBuyCalculator');
        case 'property-tax-estimator': return import('../components/calculators/tax/PropertyTaxEstimator');
        case 'debt-avalanche-snowball': return import('../components/calculators/loans/DebtAvalancheSnowballCalculator');
        case 'fico-score-impact': return import('../components/calculators/utils/FICOScoreImpactCalculator');
        // Regional Calculators
        case 'uk-income-tax': return import('../components/calculators/regional/uk/UKIncomeTaxCalculator');
        case 'australia-income-tax': return import('../components/calculators/regional/australia/AustraliaIncomeTaxCalculator');
        case 'canada-income-tax': return import('../components/calculators/regional/canada/CanadaIncomeTaxCalculator');
        case 'europe-vat': return import('../components/calculators/regional/europe/EuropeVATCalculator');
        case 'japan-paycheck': return import('../components/calculators/regional/japan/JapanPaycheckCalculator');
        case 'hongkong-salary-tax': return import('../components/calculators/regional/hongkong/HongKongSalaryTaxCalculator');
        case 'china-income-tax': return import('../components/calculators/regional/china/ChinaIncomeTaxCalculator');
        case 'switzerland-income-tax': return import('../components/calculators/regional/switzerland/SwitzerlandIncomeTaxCalculator');
        case 'singapore-tax': return import('../components/calculators/regional/singapore/SingaporeTaxCalculator');
        case 'uae-gratuity': return import('../components/calculators/regional/uae/UAEGratuityCalculator');
        case 'nz-paycheck': return import('../components/calculators/regional/newzealand/NZPaycheckCalculator');
        case 'india-tax': return import('../components/calculators/regional/india/IndiaIncomeTaxCalculator');
        case 'ireland-tax': return import('../components/calculators/regional/ireland/IrelandIncomeTaxCalculator');
        case 'mexico-isr': return import('../components/calculators/regional/mexico/MexicoISRCalculator');
        case 'brazil-clt': return import('../components/calculators/regional/brazil/BrazilCLTCalculator');
        case 'south-africa-tax': return import('../components/calculators/regional/southafrica/SouthAfricaTaxCalculator');
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
