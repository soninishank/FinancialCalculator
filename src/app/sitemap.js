import manifest from '../utils/calculatorsManifest';

export default function sitemap() {
    const baseUrl = 'https://www.hashmatic.in';

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/calculators',
        '/ipo',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    }));

    // 2. Dynamic Calculator Routes
    const calculatorRoutes = manifest.map((m) => ({
        url: `${baseUrl}/calculators/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...calculatorRoutes];
}
