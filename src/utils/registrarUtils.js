/**
 * IPO Registrar Allotment Status Link Mapping
 * 
 * This file contains the mapping of IPO registrars to their allotment status check URLs.
 * Update this file when new registrars are added or URLs change.
 */

const REGISTRAR_ALLOTMENT_LINKS = {
    'KFin Technologies Limited': 'https://ipostatus.kfintech.com',
    'Karvy Computershare': 'https://ipostatus.kfintech.com', // Merged with KFin
    'Link Intime India Pvt Ltd': 'https://www.linkintime.co.in/initial_offer/public-issues.html',
    'Bigshare Services Pvt Ltd': 'https://www.bigshareonline.com/ipo_allotment.html',
    'Cameo Corporate Services Ltd': 'https://www.cameoindia.com/iporesults.aspx',
    'Skyline Financial Services Pvt Ltd': 'http://www.skylinerta.com/ipo.php',
    'MAS Services Ltd': 'https://masserv.com',
    'Purva Sharegistry (India) Pvt Ltd': 'https://www.purvashare.com',
    'Alankit Assignments Ltd': 'https://alankit.com',
    'Integrated Registry Management Services': 'https://www.integratedindia.in/ipo.aspx',
    'Beetal Financial & Computer Services': 'https://www.beetalfinancial.com/ipo-result.php',
    'Maheshwari Datamatics Pvt Ltd': 'https://www.mdpl.in/ipo-ofs-status',
    'Niche Technologies': 'https://www.nichetechpl.com/ipo_status.html'
};

/**
 * Get the allotment status check URL for a given registrar
 * @param {string} registrarName - Name of the registrar
 * @returns {string|null} - URL to check allotment status, or null if not found
 */
export const getRegistrarAllotmentLink = (registrarName) => {
    if (!registrarName) return null;

    // Try exact match first
    if (REGISTRAR_ALLOTMENT_LINKS[registrarName]) {
        return REGISTRAR_ALLOTMENT_LINKS[registrarName];
    }

    // Try partial match (case insensitive)
    const lowerName = registrarName.toLowerCase();
    for (const [key, value] of Object.entries(REGISTRAR_ALLOTMENT_LINKS)) {
        if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
            return value;
        }
    }

    return null;
};

/**
 * Get all supported registrars
 * @returns {Array<string>} - List of all supported registrar names
 */
export const getSupportedRegistrars = () => {
    return Object.keys(REGISTRAR_ALLOTMENT_LINKS);
};

export default {
    getRegistrarAllotmentLink,
    getSupportedRegistrars
};
