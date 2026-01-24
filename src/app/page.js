import NewsAggregator from "../components/news/NewsAggregator";
import Link from "next/link";
import { TrendingUp, Calculator, Target, PiggyBank, Newspaper } from "lucide-react";

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
        locale: 'en_US',
        type: 'website',
    },
};

export default function Home() {
    const popularTools = [
        { title: 'SIP Calculator', slug: 'pure-sip', icon: '📈', desc: 'Plan your mutual fund investments' },
        { title: 'Income Tax', slug: 'india-tax', icon: '🏛️', desc: 'Compare old vs new tax regime' },
        { title: 'Loan EMI', slug: 'loan-emi', icon: '🏠', desc: 'Calculate monthly installments' },
        { title: 'Step-Up SIP', slug: 'step-up-sip', icon: '🚀', desc: 'Grow your SIP annually' },
        { title: 'SWP Calculator', slug: 'swp-calculator', icon: '💰', desc: 'Plan systematic withdrawals' },
        { title: 'Time to Goal', slug: 'time-to-goal', icon: '🎯', desc: 'Reach financial targets faster' },
    ];

    const features = [
        { icon: TrendingUp, title: 'Real-time Insights', desc: 'Live financial news & market updates' },
        { icon: Calculator, title: '50+ Calculators', desc: 'Comprehensive financial planning tools' },
        { icon: Target, title: 'Goal Planning', desc: 'Plan and track your financial goals' },
        { icon: PiggyBank, title: 'Smart Investing', desc: 'Make informed investment decisions' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
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

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none"></div>

                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-6">
                            <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Free Financial Tools & Live News</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent leading-tight">
                            Your Complete Financial Planning Suite
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Make smarter financial decisions with powerful calculators, real-time market news, and expert insights — completely free.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                            <Link
                                href="/calculators"
                                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                            >
                                <Calculator className="w-5 h-5" />
                                Explore Calculators
                            </Link>
                            <Link
                                href="#news"
                                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-slate-100 font-bold rounded-xl transition-all border-2 border-slate-200 dark:border-slate-700 flex items-center gap-2"
                            >
                                <TrendingUp className="w-5 h-5" />
                                View Market News
                            </Link>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                >
                                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 mx-auto" />
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">{feature.title}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Calculators Section */}
            <section className="py-12 bg-white/50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
                            Popular Calculators
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Start with our most-used financial planning tools
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {popularTools.map((tool, idx) => (
                            <Link
                                key={idx}
                                href={`/calculators/${tool.slug}`}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{tool.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {tool.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {tool.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/calculators"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:gap-3 transition-all"
                        >
                            View All Calculators
                            <span className="text-xl">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* News Stream Section */}
            <section id="news" className="py-16 scroll-mt-20">
                <div className="container mx-auto px-4">
                    <NewsAggregator />
                </div>
            </section>
        </div>
    );
}
