import { Suspense } from 'react';
import CalculatorsList from '../../pages/CalculatorsList';

export const metadata = {
    title: 'Free Financial Calculators (SIP, EMI, Loan) - Hashmatic',
    description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
    keywords: ['calculator list', 'financial tools', 'investment calculators'],
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators',
    },
    openGraph: {
        title: "All Financial Calculators | Hashmatic",
        description: "Browse our complete list of free investment and loan calculators.",
        url: 'https://www.hashmatic.in/calculators',
        siteName: 'Hashmatic',
        images: [
            {
                url: 'https://www.hashmatic.in/logo192.png',
                width: 192,
                height: 192,
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: "All Calculators | Hashmatic",
        description: "Plan your future with Hashmatic's free online tools.",
        images: ['https://www.hashmatic.in/logo192.png'],
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
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <CalculatorsList initialFiltered={initialFiltered} initialQ={q} />
        </>
    );
}
