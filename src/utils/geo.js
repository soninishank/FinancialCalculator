/**
 * Mapping of ISO Country Codes to Currency Codes
 */
export const COUNTRY_CURRENCY_MAP = {
    // North America
    'US': 'USD',
    'CA': 'CAD',
    'MX': 'MXN',

    // Europe
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'IE': 'EUR',
    'CH': 'CHF',

    // Asia
    'IN': 'INR',
    'JP': 'JPY',
    'CN': 'CNY',
    'HK': 'HKD',
    'SG': 'SGD',
    'AE': 'AED',

    // Oceania
    'AU': 'AUD',
    'NZ': 'NZD',

    // Other
    'BR': 'BRL',
    'ZA': 'ZAR'
};

/**
 * Get currency for a country code
 * @param {string} countryCode 
 * @returns {string} Currency code
 */
export function getCurrencyForCountry(countryCode) {
    if (!countryCode) return 'INR';
    return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD';
}

/**
 * Guess country/currency from browser timezone
 * A useful fallback for client-side initial load
 */
export function guessCurrencyFromTimezone() {
    if (typeof Intl === 'undefined') return 'INR';

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'INR';
    if (tz.includes('America/')) return 'USD';
    if (tz.includes('Europe/London')) return 'GBP';
    if (tz.includes('Europe/')) return 'EUR';
    if (tz.includes('Australia/') || tz.includes('Pacific/Auckland')) return 'AUD';
    if (tz.includes('Asia/Singapore')) return 'SGD';
    if (tz.includes('Asia/Dubai')) return 'AED';
    if (tz.includes('Asia/Tokyo')) return 'JPY';
    if (tz.includes('Asia/Hong_Kong')) return 'HKD';
    if (tz.includes('America/Toronto') || tz.includes('America/Vancouver') || tz.includes('Canada/')) return 'CAD';

    return 'INR'; // Global default
}
