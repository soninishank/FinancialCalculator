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
        const formatDate = (date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        // T+1: Basis of allotment
        const allotmentDate = holidayService.addBusinessDays(T, 1);

        // T+2: Refund initiation & Allotment
        const refundDate = holidayService.addBusinessDays(T, 2);

        // T+3: Credit of shares to demat & Listing
        const listingDate = holidayService.addBusinessDays(T, 3);

        return {
            allotment_finalization_date: formatDate(allotmentDate),
            refund_initiation_date: formatDate(refundDate),
            demat_credit_date: formatDate(listingDate),
            listing_date: formatDate(listingDate)
        };
    }

    /**
     * Apply fallback dates to an IPO if they are missing or fall on invalid days (holidays/weekends)
     * @param {Object} client DB client
     * @param {string} ipoId 
     * @param {string|Date} issueEndDate 
     */
    async applyFallbackIfMissing(client, ipoId, issueEndDate) {
        if (!issueEndDate) return;

        // 1. Check current dates from DB
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
            const currentValue = current[field];
            const newValue = fallback[field];

            // Re-validate existing date using newest holiday service (IST-aware)
            const isInvalid = currentValue && holidayService.isHoliday(currentValue);

            if ((!currentValue || isInvalid) && newValue) {
                // Determine if we need to update: either missing, invalid, or simply different from newest fallback
                const currentStr = currentValue ? (currentValue instanceof Date ? currentValue.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : String(currentValue)) : null;

                if (currentStr !== newValue) {
                    updates.push(`${field} = $${i++}`);
                    params.push(newValue);
                }
            }
        }

        if (updates.length > 0) {
            params.push(ipoId);
            await client.query(`
                UPDATE ipo_dates 
                SET ${updates.join(', ')}
                WHERE ipo_id = $${i}
            `, params);
            console.log(`[SEBI] Corrected ${updates.length} dates for IPO ${ipoId} to align with business days`);
        }
    }
}

module.exports = new SEBIDateService();
