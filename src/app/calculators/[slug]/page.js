import CalculatorPage from '../../../pages/CalculatorPage';
import manifest from '../../../utils/calculatorsManifest';

export async function generateStaticParams() {
    return manifest.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);
    if (!meta) return {};

    const baseUrl = 'https://www.hashmatic.in';
    const pageUrl = `${baseUrl}/calculators/${slug}`;
    const defaultImage = `${baseUrl}/logo192.png`; // Fallback image

    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${meta.title} | Financial Tools`,
            description: meta.description,
            url: pageUrl,
            siteName: 'Hashmatic',
            images: [
                {
                    url: defaultImage,
                    width: 192,
                    height: 192,
                    alt: meta.title,
                },
            ],
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: meta.title,
            description: meta.description,
            images: [defaultImage],
        },
    };
}

import { calculatorFaqs } from '../../../data/seoMetadata';

export default async function Page({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);

    if (!meta) return <CalculatorPage />;

    const faqs = calculatorFaqs[slug] || [];

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
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Hashmatic",
                    "url": "https://www.hashmatic.in"
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

    if (faqs.length > 0) {
        schema["@graph"].push({
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                }
            }))
        });
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <div className="sr-only">
                <h1>{meta.title} | Financial Calculator</h1>
            </div>
            <CalculatorPage />
        </>
    );
}
