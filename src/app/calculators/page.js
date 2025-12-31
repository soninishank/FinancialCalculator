import { Suspense } from 'react';
import CalculatorsList from '../../pages/CalculatorsList';
import manifest from '../../utils/calculatorsManifest';


export const metadata = {
    title: 'Financial Calculators Catalog',
    description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators',
    },
    openGraph: {
        title: "All Financial Calculators | Hashmatic",
        description: "Browse our complete list of free investment and loan calculators.",
        url: 'https://www.hashmatic.in/calculators',
        siteName: 'Hashmatic',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: "Financial Calculators Catalog",
        description: "Plan your future with Hashmatic's free online tools.",
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
            (m.keywords && m.keywords.toLowerCase().includes(term))
        );
    });

    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Financial Calculators Catalog",
        "description": "A comprehensive list of free financial tools for SIP, EMI, and investment planning.",
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
            <div className="max-w-6xl mx-auto px-6 py-4">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
                    Financial <span className="text-teal-600">Calculators</span>
                </h1>
                <p className="text-gray-500 text-lg">Browse our complete list of free investment and loan tools.</p>
            </div>
            <CalculatorsList initialFiltered={initialFiltered} initialQ={q} />
        </>
    );
}
