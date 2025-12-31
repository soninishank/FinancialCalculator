import '../src/index.css';
import Header from '../src/components/home/Header';
import Footer from '../src/components/common/Footer';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata = {
    title: 'Hashmatic - Free Online Financial Calculators (SIP, EMI, Loan)',
    description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.hashmatic.in'),
    openGraph: {
        type: 'website',
        url: 'https://www.hashmatic.in/',
        title: 'Hashmatic - Free Online Financial Calculators (SIP, EMI, Loan)',
        description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
        images: ['https://placehold.co/1200x630/teal/white?text=Hashmatic'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hashmatic - Free Online Financial Calculators (SIP, EMI, Loan)',
        description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
        images: ['https://placehold.co/1200x630/teal/white?text=Hashmatic'],
    },
};

const GA_MEASUREMENT_ID = 'G-N9ZGWK9DNG';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo192.png" />
            </head>
            <body>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
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
