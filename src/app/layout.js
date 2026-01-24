import '../index.css';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata = {
    title: {
        template: '%s | FinCalc',
        default: 'FinCalc - Premium Financial Calculators (SIP, EMI, Tax)',
    },
    description: "Access premium, free online financial calculators for SIP, Home Loan EMI, Income Tax (New & Old Regime), and Retirement planning. FinCalc provides professional-grade investment tools for global and Indian investors.",
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.hashmatic.in'),
    openGraph: {
        type: 'website',
        url: 'https://www.hashmatic.in/',
        title: 'FinCalc - Free Financial & Investment Planning Tools',
        description: "Accurate financial calculators for SIP, Loans, Taxes, and Wealth planning. Simple, powerful, and ad-free.",
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FinCalc - Professional Financial Calculators',
        description: "Plan your financial future with FinCalc's suite of investment and loan tools.",
    },
};

const GA_MEASUREMENT_ID = 'G-N9ZGWK9DNG';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
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
                                "name": "SIP Calculator",
                                "url": "https://www.hashmatic.in/calculators/pure-sip"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 2,
                                "name": "Income Tax Calculator",
                                "url": "https://www.hashmatic.in/calculators/india-tax"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 3,
                                "name": "Home Loan EMI Calculator",
                                "url": "https://www.hashmatic.in/calculators/advanced-home-loan"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 4,
                                "name": "FIRE Planner",
                                "url": "https://www.hashmatic.in/calculators/ultimate-fire-planner"
                            },
                            {
                                "@type": "SiteNavigationElement",
                                "position": 5,
                                "name": "All Calculators",
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
