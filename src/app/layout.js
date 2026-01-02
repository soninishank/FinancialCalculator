import '../index.css';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata = {
    title: {
        template: '%s | Hashmatic',
        default: 'Financial Calculators - SIP, EMI, Loan & Investment Tools',
    },
    description: "Free online financial calculators for SIP, Home Loan EMI, Income Tax, and Retirement planning. Accurate, ad-free investment tools for Indian investors.",
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.hashmatic.in'),
    openGraph: {
        type: 'website',
        url: 'https://www.hashmatic.in/',
        title: 'Financial Calculators - SIP, EMI, Loan & Investment Tools',
        description: "Free online financial calculators for SIP, Home Loan EMI, Income Tax, and Retirement planning. Accurate, ad-free investment tools for Indian investors.",
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Financial Calculators - SIP, EMI, Loan & Investment Tools',
        description: "Free online financial calculators for SIP, Home Loan EMI, Income Tax, and Retirement planning. Accurate, ad-free investment tools for Indian investors.",
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
                        "name": "Hashmatic",
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

                <Providers>
                    <div className="bg-gray-50 min-h-screen transition-colors duration-200 flex flex-col">
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
