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
