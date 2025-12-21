const holidayService = require('./HolidayService');

class SEBIDateService {
    /**
     * Calculate tentative dates based on SEBI T+3 guidelines
     * @param {string|Date} issueEndDate T date
     * @returns {Object} { allotment_finalization_date, refund_initiation_date, demat_credit_date, listing_date }
     */
    calculateFallbackDates(issueEndDate) {
        if (!issueEndDate) return {};

        const T = new Date(issueEndDate);

        // T+1: Basis of allotment
        const allotmentDate = holidayService.addBusinessDays(T, 1);

        // T+2: Refund initiation & Allotment
        const refundDate = holidayService.addBusinessDays(T, 2);

        // T+3: Credit of shares to demat & Listing
        const listingDate = holidayService.addBusinessDays(T, 3);

        return {
            allotment_finalization_date: allotmentDate.toISOString().split('T')[0],
            refund_initiation_date: refundDate.toISOString().split('T')[0],
            demat_credit_date: listingDate.toISOString().split('T')[0],
            listing_date: listingDate.toISOString().split('T')[0]
        };
    }

    /**
     * Apply fallback dates to an IPO if they are missing
     * @param {Object} client DB client
     * @param {string} ipoId 
     * @param {string|Date} issueEndDate 
     */
    async applyFallbackIfMissing(client, ipoId, issueEndDate) {
        if (!issueEndDate) return;

        // 1. Check current dates
        const res = await client.query('SELECT * FROM ipo_dates WHERE ipo_id = $1', [ipoId]);
        const current = res.rows[0] || {};

        const fallback = this.calculateFallbackDates(issueEndDate);

        const updates = [];
        const params = [];
        let i = 1;

        const fields = [
            'allotment_finalization_date',
            'refund_initiation_date',
            'demat_credit_date',
            'listing_date'
        ];

        for (const field of fields) {
            if (!current[field] && fallback[field]) {
                updates.push(`${field} = $${i++}`);
                params.push(fallback[field]);
            }
        }

        if (updates.length > 0) {
            params.push(ipoId);
            await client.query(`
                UPDATE ipo_dates 
                SET ${updates.join(', ')}
                WHERE ipo_id = $${i}
            `, params);
            console.log(`[SEBI] Applied ${updates.length} fallback dates for IPO ${ipoId}`);
        }
    }
}

module.exports = new SEBIDateService();
