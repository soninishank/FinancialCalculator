import Link from "next/link";

export const metadata = {
    title: "Financial Calculators & Planning Tools - Hashmatic",
    description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
    keywords: ['financial calculator', 'sip calculator', 'loan emi calculator', 'cagr calculator', 'hashmatic'],
};

export default function Home() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Hashmatic",
        "url": "https://www.hashmatic.in",
        "applicationCategory": "FinanceApplication"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            {/* -------- HERO SECTION -------- */}
            <section className="bg-indigo-600 text-white py-14 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                        Plan Your Financial Future with Precision
                    </h1>
                    <p className="mt-6 text-indigo-100 text-xl max-w-2xl mx-auto font-medium">
                        Master your investments with Hashmatic's professional-grade suite of SIP, EMI, and Retirement calculators.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/calculators"
                            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                        >
                            Explore All Calculators
                        </Link>
                    </div>
                </div>
            </section>

            {/* Popular Sections */}
            <section className="py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Calculations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CalculatorCard
                        title="SIP Calculator"
                        desc="Calculate future value of your systematic investment plan."
                        slug="pure-sip"
                    />
                    <CalculatorCard
                        title="EMI Calculator"
                        desc="Plan your loans with detailed monthly breakdown."
                        slug="pure-emi"
                    />
                    <CalculatorCard
                        title="Lumpsum Calculator"
                        desc="See how a single investment grows over time."
                        slug="lump-sum"
                    />
                </div>
            </section>

            <footer className="py-12 bg-gray-50 text-center rounded-3xl mt-8">
                <p className="text-gray-500 font-medium italic">"The best time to start investing was 20 years ago. The second best time is now."</p>
                <div className="mt-6 text-sm text-gray-400">
                    © 2025 Hashmatic. Professional planning tools for smart investors.
                </div>
            </footer>
        </>
    );
}

function CalculatorCard({ title, desc, slug }) {
    return (
        <Link href={`/calculators/${slug}`} className="group">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{desc}</p>
                <div className="mt-6 flex items-center text-indigo-500 font-bold text-sm">
                    Try Calculator <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Link>
    );
}
