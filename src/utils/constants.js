// src/utils/constants.js

// --- FINANCIAL CONSTANTS (Used by all calculators) ---

// 1. Initial Default Values (Used by useState)
export const DEFAULT_MONTHLY_SIP = 5000;
export const DEFAULT_LUMP_SUM = 100000;
export const DEFAULT_LOAN_PRINCIPAL = 5000000;
export const DEFAULT_TARGET_AMOUNT = 10000000; // 1 Crore
export const DEFAULT_TENURE_YEARS = 10;
export const DEFAULT_RATE = 12;
export const DEFAULT_STEP_UP = 10;
export const DEFAULT_LOAN_RATE = 8;
export const DEFAULT_LOAN_TENURE = 20;

// 2. Input Max Limits (Used by InputWithSlider)
export const MAX_AMOUNT = 100000000; // 10 cr
export const MAX_SIP = 5000000;        // 50 Lakhs
export const MAX_LOAN = 100000000;     // 10 Crores
export const MAX_YEARS = 35;
export const MAX_RATE = 30;
export const MAX_STEP_UP = 50;
export const TARGET_MAX_AMOUNT_GOAL_PLANNER = 1000000000; // 100 cr

// 3. Input Min Limits
export const MIN_SIP = 100;
export const MIN_YEARS = 1;
export const MIN_RATE = 0;
export const MIN_AMOUNT = 0;

// 4. FIRE & Advanced Defaults
export const DEFAULT_SWR = 4; // 4% Rule
export const DEFAULT_RETIREMENT_AGE = 50;
export const DEFAULT_CURRENT_AGE = 30;
export const DEFAULT_EXPENSE = 50000;
export const DEFAULT_INFLATION = 6;
export const MAX_EXPENSE_LARGE = 1000000;
export const MIN_SWR = 2;
export const MAX_SWR = 10;



// --- 5. UI Constants (Colors & Labels) ---
// Colors
export const CHART_COLORS = {
    PRIMARY: '#0f766e', // Teal-700
    SECONDARY: '#3B82F6', // Blue-500
    ACCENT: '#F59E0B', // Amber-500
    NEUTRAL: '#198c6bff', // Slate-500 (Darker, less "grey")
    SUCCESS: '#10B981', // Emerald-500
    DANGER: '#EF4444', // Red-500
    TEXT_LIGHT: '#102a4eff', // Slate-400
    BACKGROUND_LIGHT: 'rgba(8, 82, 74, 0.1)', // Teal-500 with opacity
    BACKGROUND_SECONDARY: 'rgba(59, 130, 246, 0.1)', // Blue-500 with opacity
    BACKGROUND_SUCCESS: 'rgba(16, 185, 129, 0.1)', // Emerald-500 with opacity
};

// Labels
export const LABELS = {
    EQUITY: 'Equity',
    DEBT: 'Debt',
    GOLD: 'Gold',
    TOTAL_INVESTMENT: 'Total Investment',
    INTEREST_EARNED: 'Interest Earned',
    MATURITY_VALUE: 'Maturity Value',
    PRINCIPAL_AMOUNT: 'Principal Amount',
    TOTAL_AMOUNT: 'Total Amount',
    TOTAL_VALUE: 'Total Value',
    WEALTH_GAINED: 'Wealth Gained',
    INVESTED_AMOUNT: 'Invested Amount',
};

// --- 6. Other Constants ---
export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const MAX_WORK_AGE = 70;

export const DEFAULT_CORPUS = 2000000;

export const STEP_AMOUNT = 1000;
export const STEP_SIP = 500;
export const STEP_LARGE = 100000;
export const STEP_MEDIUM = 50000;
export const STEP_HUGE = 500000;
export const STEP_EXPENSE = 5000;
export const STEP_PERCENT = 0.1;
export const STEP_YEARS = 1;

export const DEFAULT_DELAY = 5;
export const DEFAULT_INVESTMENT_YEARS = 20;

export const MAX_EXPENSE = 500000;
export const MAX_CORPUS = 500000000; // 50 Cr
export const MAX_INFLATION = 15;
export const MIN_LOAN = 100000;


export const DEFAULT_HOME_PRICE = 5000000;
export const DEFAULT_DOWN_PAYMENT = 1000000;
export const DEFAULT_RENT = 15000;
export const MAX_RENT = 200000;
export const MIN_RENT = 5000;

// Credit Card Defaults
export const DEFAULT_CC_BALANCE = 50000;
export const DEFAULT_CC_RATE = 18;
export const DEFAULT_CC_PAYMENT = 2000;
export const MAX_CC_BALANCE = 1000000;
export const MAX_CC_RATE = 60;
export const MIN_CC_PAYMENT = 500;
export const STEP_CC_PAYMENT = 100;

// ROI Defaults
export const DEFAULT_ROI_INITIAL = 10000;
export const DEFAULT_ROI_FINAL = 15000;
export const DEFAULT_ROI_YEARS = 3;

// Rule of 72 Defaults
export const DEFAULT_RULE72_RATE = 10;
export const DEFAULT_RULE72_AMOUNT = 10000;
export const MIN_RULE72_RATE = 1;
export const MIN_RULE72_AMOUNT = 1000;
export const MAX_RULE72_AMOUNT = 100000000;

// Refinance Defaults
export const DEFAULT_REFINANCE_LOAN = 5000000;
export const DEFAULT_REFINANCE_RATE_OLD = 9;
export const DEFAULT_REFINANCE_RATE_NEW = 8;
export const DEFAULT_REFINANCE_TERM = 20;
export const DEFAULT_REFINANCE_COST = 20000;
export const MAX_REFINANCE_COST = 500000;
export const STEP_REFINANCE_COST = 1000;

// Processing Fee Defaults
export const MAX_PROCESSING_FEE_PERCENT = 5;
export const STEP_PROCESSING_FEE_PERCENT = 0.1;
export const MAX_FEE_AMOUNT = 1000000;