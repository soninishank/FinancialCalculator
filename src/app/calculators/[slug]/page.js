import { Suspense } from 'react';
import CalculatorPage from '../../../pages/CalculatorPage';
import manifest from '../../../utils/calculatorsManifest';
import { calculatorFaqs } from '../../../data/seoMetadata';
import { siteConfig } from '../../../config/site';

export async function generateStaticParams() {
    return manifest.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);
    if (!meta) return {};

    const baseUrl = siteConfig.url;
    const pageUrl = `${baseUrl}/calculators/${slug}`;

    const keywordList = Array.isArray(meta.keywords)
        ? meta.keywords
        : String(meta.keywords || '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);

    const keywords = [
        ...keywordList,
        'free online calculator',
        'financial planning tool',
        meta.title.toLowerCase(),
        `${meta.title.toLowerCase()} india`,
        `${meta.title.toLowerCase()} online`
    ].join(', ');

    return {
        title: `${meta.title}`,
        description: meta.description,
        keywords: keywords,
        alternates: {
            canonical: pageUrl,
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title: `${meta.title} | ${siteConfig.name}`,
            description: meta.description,
            url: pageUrl,
            siteName: siteConfig.name,
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: meta.title,
            description: meta.description,
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const meta = manifest.find((m) => m.slug === slug);

    if (!meta) {
        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <CalculatorPage />
            </Suspense>
        );
    }

    const faqs = calculatorFaqs[slug] || [];

    // Map internal categories to accurate Schema.org types
    const categoryMap = {
        'Loan': 'FinanceApplication',
        'Investments': 'FinanceApplication',
        'Tax': 'FinanceApplication',
        'Math': 'WebApplication',
        'Health': 'MedicalWebPage'
    };

    const appCategory = categoryMap[meta.category] || 'SoftwareApplication';

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": `${meta.title}`,
                "operatingSystem": "Web",
                "applicationCategory": appCategory,
                "url": `${siteConfig.url}/calculators/${slug}`,
                "description": meta.description,
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": siteConfig.name,
                    "url": siteConfig.url,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${siteConfig.url}/logo192.png`
                    }
                },
                "featureList": [
                    "Instant Calculation",
                    "Mobile Responsive",
                    "Free to use",
                    "No signup required"
                ]
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": siteConfig.url
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Calculators",
                        "item": `${siteConfig.url}/calculators`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": meta.title,
                        "item": `${siteConfig.url}/calculators/${slug}`
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
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading calculator...</div>}>
                <CalculatorPage />
            </Suspense>
        </>
    );
}
