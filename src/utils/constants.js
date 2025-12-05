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
export const MAX_AMOUNT = 100000000; // 1 Billion / 100 Crores
export const MAX_SIP = 5000000;        // 50 Lakhs
export const MAX_LOAN = 100000000;     // 10 Crores
export const MAX_YEARS = 40;
export const MAX_RATE = 30;
export const MAX_STEP_UP = 50;

// 3. Input Min Limits
export const MIN_SIP = 100;
export const MIN_YEARS = 1;
export const MIN_RATE = 0;
export const MIN_AMOUNT = 0;