import calculators from '../utils/calculatorsManifest';

export default function sitemap() {
    const baseUrl = 'https://www.hashmatic.in';

    // Calculator routes
    // Core pillars to boost for Sitelinks
    const CORE_PILLARS = ['pure-sip', 'loan-emi', 'lump-sum', 'time-to-fire'];

    // Calculator routes
    const calculatorUrls = calculators.map((calc) => ({
        url: `${baseUrl}/calculators/${calc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        // Boost core pillars to 0.9, keep rest at 0.7 to create authority gap
        priority: CORE_PILLARS.includes(calc.slug) ? 0.9 : 0.7,
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
