import calculators from '../utils/calculatorsManifest';

export default function sitemap() {
    const baseUrl = 'https://www.hashmatic.in';

    // Calculator routes
    // Top calculators to boost for better Google visibility and Sitelinks
    const HIGH_PRIORITY_CALCS = [
        'pure-sip',              // SIP Calculator (most popular)
        'loan-emi',              // EMI Calculator
        'lump-sum',              // Lump Sum Calculator
        'compound-interest',     // Compound Interest
        'step-up-sip',           // Step-Up SIP
        'swp-calculator',        // SWP Calculator
        'ppf-calculator',        // PPF Calculator
        'fixed-deposit',         // FD Calculator
        'car-loan-emi',          // Car Loan EMI
        'cagr-calculator',       // CAGR Calculator
        'advanced-home-loan',    // Home Loan with Prepayments
        'ultimate-fire-planner', // FIRE Planner
        'target-amount-calculator', // Goal Planner
        'recurring-deposit',     // RD Calculator
        'nps-calculator',        // NPS Calculator
        'gst-calculator'         // GST Calculator
    ];

    // Calculator routes
    const calculatorUrls = calculators.map((calc) => ({
        url: `${baseUrl}/calculators/${calc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        // Boost high-priority calculators to 0.95, keep rest at 0.7
        priority: HIGH_PRIORITY_CALCS.includes(calc.slug) ? 0.95 : 0.7,
    }));

    // Static routes (Home, Calculators index)
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/calculators`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        // Add other known static routes here if needed (e.g., /about, /contact)
    ];

    return [...routes, ...calculatorUrls];
}
