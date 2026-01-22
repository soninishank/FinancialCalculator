import NewsAggregator from "../components/news/NewsAggregator";

export const metadata = {
    title: "FinCalc - SIP, EMI, Loan & Tax Calculators",
    description: "FinCalc offers a comprehensive suite of free financial tools including SIP, EMI, Income Tax, and FIRE calculators. Accurate and multi-currency support.",
    keywords: [
        'financial calculator', 'sip calculator', 'loan emi calculator',
        'income tax calculator 2024-25', 'investment tools', 'retirement planner',
        'mutual fund returns', 'wealth management', 'sip returns calculator',
        'home loan prepayments', 'emi calculator', 'tax planning tools',
        'compound interest calculator', 'fire planner', 'stock average calculator'
    ],
    openGraph: {
        title: "FinCalc - Premium Financial Suite",
        description: "Professional financial planning tools for everyone. SIP, EMI, Tax, and more.",
        url: 'https://www.hashmatic.in',
        siteName: 'FinCalc',
        images: [{ url: 'https://www.hashmatic.in/logo192.png', width: 192, height: 192 }],
        locale: 'en_US',
        type: 'website',
    },
};

export default function Home() {
    const popularTools = [
        { title: 'SIP Calculator', slug: 'pure-sip', icon: '📈' },
        { title: 'Income Tax (2024-25)', slug: 'india-tax', icon: '🏛️' },
        { title: 'Loan EMI Calculator', slug: 'loan-emi', icon: '🏠' },
        { title: 'Step-Up SIP', slug: 'step-up-sip', icon: '🚀' },
        { title: 'SWP Calculator', slug: 'swp-calculator', icon: '💰' },
        { title: 'Time to Goal', slug: 'time-to-goal', icon: '🎯' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-transparent transition-colors duration-500 overflow-x-hidden">
            {/* SEO Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "FinCalc Financial Suite",
                        "url": "https://www.hashmatic.in",
                        "applicationCategory": "FinanceApplication",
                        "description": "Professional-grade financial planning tools (SIP, EMI, Tax) with multi-currency support.",
                        "featureList": [
                            "SIP Return Projections",
                            "Advanced Home Loan EMI Analysis",
                            "Income Tax Regime Comparison (FY 2024-25)",
                            "FIRE & Retirement Planning",
                            "Real-time Financial News Aggregator"
                        ]
                    })
                }}
            />

            {/* Background Decor */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-screen -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent pointer-events-none"></div>

            {/* Semantic SEO Header (Subtle) */}
            <div className="container mx-auto px-4 pt-12 pb-4">
            </div>

            {/* News Stream Section */}
            <section className="pt-0 pb-12">
                <div className="container mx-auto px-4">
                    <NewsAggregator />
                </div>
            </section>

        </div>
    );
}
