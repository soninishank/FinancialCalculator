import '../index.css';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata = {
    title: {
        template: '%s | FinCalc',
        default: 'FinCalc - Personal Finance Workspace',
    },
    description: "FinCalc is a personal finance workspace for planning, tracking, decision support, and modeling. Use dashboards, saved tools, workflows, and targeted calculators in one product.",
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.hashmatic.in'),
    openGraph: {
        type: 'website',
        url: 'https://www.hashmatic.in/',
        title: 'FinCalc - Personal Finance Workspace',
        description: "Plan, track, and model money decisions with dashboards, workflows, saved tools, and finance calculators.",
        images: [
            {
                url: 'https://www.hashmatic.in/opengraph-image',
                width: 1200,
                height: 630,
                alt: 'FinCalc - Financial Calculators',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FinCalc - Personal Finance Workspace',
        description: "Use a broader finance workspace for planning, tracking, and modeling key money decisions.",
        images: ['https://www.hashmatic.in/opengraph-image'],
    },
};

const GA_MEASUREMENT_ID = 'G-N9ZGWK9DNG';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Icons are handled automatically by file convention (src/app/icon.png) */}
                <link rel="preconnect" href="https://www.googletagmanager.com" />
            </head>
            <body>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                    strategy="lazyOnload"
                />
                <Script id="google-analytics" strategy="lazyOnload">
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
                </Script>

                {/* Structured Data for Sitelinks */}
                <Script id="schema-website" type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "FinCalc",
                        "url": "https://www.hashmatic.in/",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://www.hashmatic.in/calculators?q={search_term_string}"
                            },
                            "query-input": "required name=search_term_string"
                        }
                    })}
                </Script>

                {/* Site Navigation Schema for Sitelinks */}
                <Script id="schema-navigation" type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "itemListElement": [
                            {
                                "@type": "SiteNavigationElement",
                                "position": 1,
                                "name": "Dashboard",
                                "url": "https://www.hashmatic.in/hub"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 2,
                                "name": "Track",
                                "url": "https://www.hashmatic.in/track"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 3,
                                "name": "Learn",
                                "url": "https://www.hashmatic.in/learn"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 4,
                                "name": "My Tools",
                                "url": "https://www.hashmatic.in/my-tools"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 5,
                                "name": "Money Tools",
                                "url": "https://www.hashmatic.in/calculators"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 6,
                                "name": "FinCalc Pro",
                                "url": "https://www.hashmatic.in/pro"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 7,
                                "name": "All Money Tools",
                                "url": "https://www.hashmatic.in/calculators"
                            }
                        ]
                    })}
                </Script>

                <Providers>
                    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-500 flex flex-col">
                        <Header />
                        <main className="pt-20 flex-grow">
                            <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-8 py-8">
                                {children}
                            </div>
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
