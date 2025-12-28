// Common utility functions for calculators

/**
 * Calculate actual calendar year from start date and month number
 * @param {string} startDate - Format "YYYY-MM"
 * @param {number} monthNumber - Month number in the series (1-based)
 * @returns {number} Actual calendar year
 */
export function getActualYear(startDate, monthNumber) {
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const monthsElapsed = monthNumber - 1;
    const yearsElapsed = Math.floor((startMonth - 1 + monthsElapsed) / 12);
    return startYear + yearsElapsed;
}

/**
 * Get month name from start date and month number
 * @param {string} startDate - Format "YYYY-MM"
 * @param {number} monthNumber - Month number in the series (1-based)
 * @returns {string} Month name (Jan, Feb, etc.)
 */
export function getActualMonthName(startDate, monthNumber) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [, startMonth] = startDate.split('-').map(Number);
    const actualMonthIndex = (startMonth - 1 + monthNumber - 1) % 12;
    return monthNames[actualMonthIndex];
}

/**
 * Get both actual year and month name
 * @param {string} startDate - Format "YYYY-MM"
 * @param {number} monthNumber - Month number in the series (1-based)
 * @returns {{ year: number, monthName: string }}
 */
export function getActualYearAndMonth(startDate, monthNumber) {
    return {
        year: getActualYear(startDate, monthNumber),
        monthName: getActualMonthName(startDate, monthNumber)
    };
}

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Validates a date range for financial calculations.
 * Checks for valid years (1000-3000) and ensures end > start.
 * @returns {boolean}
 */
export function validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100;
    const maxYear = currentYear + 100;

    const sy = start.getFullYear();
    const ey = end.getFullYear();

    if (isNaN(sy) || isNaN(ey) || sy < minYear || ey < minYear || sy > maxYear || ey > maxYear || end <= start) {
        return false;
    }
    return true;
}

/**
 * Returns the effective schedule start date.
 * If in 'dates' mode, it uses the month/year of the start date.
 * Otherwise, uses the manually selected schedule start date.
 */
export function getEffectiveScheduleStart(mode, startDate, scheduleStartDate) {
    if (mode === 'dates' && startDate) {
        return startDate.slice(0, 7);
    }
    return scheduleStartDate;
}
