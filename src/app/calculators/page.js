import { Suspense } from 'react';
import Link from 'next/link';
import CalculatorsList from '../../pages/CalculatorsList';
import manifest from '../../utils/calculatorsManifest';
import { Providers } from '../providers';


export const metadata = {
    title: 'FinCalc Tools Library - Modeling And Decision Tools',
    description: "Explore FinCalc's library of financial modeling tools for investing, debt, taxes, retirement, net worth, and scenario analysis.",
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators',
    },
    openGraph: {
        title: "Money Tools Library | FinCalc",
        description: "Browse FinCalc's financial tools library for modeling decisions across investing, debt, taxes, and planning.",
        url: 'https://www.hashmatic.in/calculators',
        siteName: 'FinCalc',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FinCalc Tools Library",
        description: "Browse financial modeling tools inside the broader FinCalc finance workspace.",
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
        "name": "FinCalc Tools Library",
        "description": "A library of financial modeling tools for investing, debt, taxes, and planning.",
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
                        Money <span className="text-teal-600 dark:text-teal-400">Tools</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-lg">Browse the modeling layer of FinCalc for investing, debt, taxes, and planning.</p>
                </div>
                <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">Loading calculators...</div>}>
                    <CalculatorsList initialFiltered={initialFiltered} initialQ={q} />
                </Suspense>

                <section className="max-w-6xl mx-auto px-6 pb-14">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800/50">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Complete Tools Library (A-Z)</h2>
                            <Link href="/calculators/all" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
                                Open full sitemap page
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                            {[...manifest]
                                .sort((a, b) => a.title.localeCompare(b.title))
                                .map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/calculators/${item.slug}`}
                                        className="text-sm text-gray-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 py-1"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                        </div>
                    </div>
                </section>
            </Providers>
        </>
    );
}
