/**
 * XIRR (Extended Internal Rate of Return) Calculation
 * Uses Newton-Raphson method to solve for the rate of return for irregular cash flows.
 */

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-6; // Accuracy threshold

/**
 * Calculates XIRR for a schedule of cash flows.
 * @param {Array<{amount: number, date: Date}>} cashFlows - Array of cash flows.
 * @param {number} guess - Initial guess for the rate (default 0.1).
 * @returns {number|string} - The annualized rate of return (0.12 = 12%) or error string.
 */
export const calculateXIRR = (cashFlows, guess = 0.1) => {
    if (!cashFlows || cashFlows.length < 2) {
        return "Need at least 2 cash flows";
    }

    // 1. Sort by date
    const sortedFlows = [...cashFlows].sort((a, b) => a.date - b.date);

    // 2. Validate (positive and negative values required)
    const hasPositive = sortedFlows.some((f) => f.amount > 0);
    const hasNegative = sortedFlows.some((f) => f.amount < 0);
    if (!hasPositive || !hasNegative) {
        return "Needs both positive and negative values (inflows & outflows)";
    }

    // 3. Newton-Raphson
    let rate = guess;
    const t0 = sortedFlows[0].date; // Start date

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        let fValue = 0; // NPV
        let fDerivative = 0; // Derivative of NPV

        for (const { amount, date } of sortedFlows) {
            // Time in years
            const dt = (date - t0) / (1000 * 60 * 60 * 24 * 365);
            const discountFactor = Math.pow(1 + rate, dt);

            fValue += amount / discountFactor;
            fDerivative -= (amount * dt) / (discountFactor * (1 + rate));
        }

        if (Math.abs(fValue) < TOLERANCE) {
            return rate;
        }

        if (Math.abs(fDerivative) < 1e-10) {
            // Derivative too close to 0, preventing division
            return "#NUM! (Derivative zero)";
        }

        const newRate = rate - fValue / fDerivative;

        if (Math.abs(newRate - rate) < TOLERANCE) {
            return newRate;
        }

        rate = newRate;

        // Safety break for wild divergence
        if (!isFinite(rate) || Math.abs(rate) > 1000) {
            return "#NUM! (Diverged)";
        }
    }

    return "#NUM! (Did not converge)";
};

/**
 * Generates a series of cash flows based on start date, maturity date, and frequency.
 * @param {string} startDate - ISO string YYYY-MM-DD
 * @param {string} maturityDate - ISO string YYYY-MM-DD
 * @param {string} frequency - 'monthly', 'quarterly', 'yearly'
 * @param {number} recurringAmount - Amount to invest per period (positive number, will be converted to negative)
 * @param {number} maturityAmount - Amount received at end (positive number)
 * @returns {{flows: Array, error?: string}}
 */
export const generateSimpleFlows = (startDate, maturityDate, frequency, recurringAmount, maturityAmount) => {
    const flows = [];
    let currentDate = new Date(startDate);
    const end = new Date(maturityDate);
    const amt = Number(recurringAmount);

    if (isNaN(currentDate.getTime()) || isNaN(end.getTime()) || isNaN(amt) || isNaN(Number(maturityAmount))) {
        return { error: "Invalid input values" };
    }

    if (currentDate >= end) {
        return { error: "Start date must be before maturity date" };
    }

    // Generate Installments
    while (currentDate < end) {
        flows.push({
            date: new Date(currentDate), // Clone
            amount: -Math.abs(amt) // Investment is outflow
        });

        // Increment date
        if (frequency === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
        else if (frequency === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
        else if (frequency === 'yearly') currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    // Add Maturity/Current Value
    flows.push({
        date: end,
        amount: Math.abs(Number(maturityAmount)) // Inflow
    });

    return { flows };
};
