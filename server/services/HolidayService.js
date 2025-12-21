/**
 * Indian Market Holidays for 2024 and 2025
 * Source: NSE/BSE Holiday Calendar
 */
const INDIAN_MARKET_HOLIDAYS = [
    // 2024
    '2024-01-26', // Republic Day
    '2024-03-08', // Mahashivratri
    '2024-03-25', // Holi
    '2024-03-29', // Good Friday
    '2024-04-11', // Id-ul-Fitr (Ramadan Id)
    '2024-04-17', // Shri Ram Navami
    '2024-05-01', // Maharashtra Day
    '2024-06-17', // Bakri Id
    '2024-07-17', // Moharram
    '2024-08-15', // Independence Day
    '2024-10-02', // Mahatma Gandhi Jayanti
    '2024-11-01', // Diwali Laxmi Pujan
    '2024-11-15', // Gurunanak Jayanti
    '2024-12-25', // Christmas

    // 2025 (Estimated based on standard calendar, might need updates)
    '2025-01-26', // Republic Day
    '2025-02-26', // Mahashivratri
    '2025-03-14', // Holi
    '2025-03-31', // Id-ul-Fitr
    '2025-04-10', // Mahavir Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-08-15', // Independence Day
    '2025-10-02', // Mahatma Gandhi Jayanti
    '2025-10-20', // Diwali
    '2025-12-25', // Christmas
];

class HolidayService {
    isHoliday(date) {
        if (!date) return false;
        const d = new Date(date);

        // Use IST (Asia/Kolkata) for both weekend and holiday checks
        // This avoids timezone shifts where midnight IST falls on the previous day in UTC
        const istDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // Format: YYYY-MM-DD
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });

        if (weekday === 'Sat' || weekday === 'Sun') return true;
        return INDIAN_MARKET_HOLIDAYS.includes(istDateStr);
    }

    addBusinessDays(startDate, days) {
        let currentDate = new Date(startDate);
        let added = 0;

        while (added < days) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (!this.isHoliday(currentDate)) {
                added++;
            }
        }
        return currentDate;
    }
}

module.exports = new HolidayService();
