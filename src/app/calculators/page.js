import { Suspense } from 'react';
import CalculatorsList from '../../pages/CalculatorsList';
import manifest from '../../utils/calculatorsManifest';
import { Providers } from '../providers';


export const metadata = {
    title: 'FinCalc Calculator Directory - Browse All Financial Tools',
    description: "Explore our comprehensive directory of free online financial tools. Find SIP, EMI, Income Tax, and Retirement calculators in one place. Accurate and easy to use.",
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators',
    },
    openGraph: {
        title: "Financial Calculator Directory | FinCalc",
        description: "Browse our complete directory of free investment and loan calculators. Plan your future with FinCalc's free online tools.",
        url: 'https://www.hashmatic.in/calculators',
        siteName: 'FinCalc',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FinCalc Calculator Directory",
        description: "Plan your future with FinCalc's free online tools.",
    },
};

export default async function Page({ searchParams }) {
    const params = await searchParams;
    const q = params?.q || "";

    // Simple server-side filter to avoid bailout while still showing initial results
    const initialFiltered = manifest.filter(m => {
        if (!q) return true;
        const term = q.toLowerCase();
        return (
            m.title.toLowerCase().includes(term) ||
            m.description.toLowerCase().includes(term) ||
            (m.keywords && (
                Array.isArray(m.keywords)
                    ? m.keywords.some(k => k.toLowerCase().includes(term))
                    : m.keywords.toLowerCase().includes(term)
            ))
        );
    });

    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "FinCalc Calculator Directory",
        "description": "A comprehensive directory of free financial tools for SIP, EMI, and investment planning.",
        "url": "https://www.hashmatic.in/calculators",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": initialFiltered.map((m, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://www.hashmatic.in/calculators/${m.slug}`,
                "name": m.title
            }))
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.hashmatic.in"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Calculators",
                    "item": "https://www.hashmatic.in/calculators"
                }
            ]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <Providers>
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        Financial <span className="text-teal-600 dark:text-teal-400">Calculators</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-lg">Browse our complete list of free investment and loan tools.</p>
                </div>
                <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">Loading calculators...</div>}>
                    <CalculatorsList initialFiltered={initialFiltered} initialQ={q} />
                </Suspense>
            </Providers>
        </>
    );
}
