/**
 * Common utilities for IPO data processing
 */

/**
 * Calculate the minimum number of lots required for eligibility
 * @param {number} bidLot - The size of a single lot
 * @param {number} price - The price per share
 * @param {string} series - The IPO series ('SME', 'EQ', etc.)
 * @returns {number} The minimum number of lots
 */
function calculateMinLots(bidLot, price, series) {
    if (!bidLot || !price || price <= 0) {
        return 1;
    }

    if (series === 'SME') {
        const threshold = 200000;
        const oneLotVal = bidLot * price;
        if (oneLotVal < threshold) {
            return Math.ceil(threshold / oneLotVal);
        }
    }

    return 1;
}

/**
 * Calculate the investment amount based on number of lots
 * @param {number} lots - Number of lots
 * @param {number} bidLot - Size of a single lot
 * @param {number} price - Price per share
 * @returns {number|null} The total investment amount
 */
function calculateInvestment(lots, bidLot, price) {
    if (!lots || !bidLot || !price) {
        return null;
    }
    return lots * bidLot * price;
}

module.exports = {
    calculateMinLots,
    calculateInvestment
};
