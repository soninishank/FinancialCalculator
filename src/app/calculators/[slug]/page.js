import CalculatorPage from '../../../pages/CalculatorPage';
import manifest from '../../../utils/calculatorsManifest';

export async function generateStaticParams() {
    return manifest.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);
    if (!meta) return {};

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": meta.title,
                "description": meta.description,
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                }
            },
            // BreadcrumbList requires absolute URL, for now simplified or omitted if complex relative URL calculation is needed on server without request object in generateMetadata (though we can construct it if we know base URL)
        ]
    };

    return {
        title: `${meta.title} - Hashmatic`,
        description: meta.description,
        keywords: meta.keywords,
        alternates: {
            canonical: `https://www.hashmatic.in/calculators/${slug}`,
        },
        openGraph: {
            title: meta.title,
            description: meta.description,
            type: 'website',
            url: `https://www.hashmatic.in/calculators/${slug}`,
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);

    if (!meta) return <CalculatorPage />;

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": meta.title,
                "description": meta.description,
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                }
            },
            {
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
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": meta.title,
                        "item": `https://www.hashmatic.in/calculators/${slug}`
                    }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <CalculatorPage />
        </>
    );
}
