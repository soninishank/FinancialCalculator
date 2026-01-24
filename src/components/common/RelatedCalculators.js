import React from 'react';
import Link from 'next/link';
import manifest from '../../utils/calculatorsManifest';
import QuickSearch from './QuickSearch';

const MANUAL_RELATIONS = {
    'simple-interest': ['lump-sum', 'recurring-deposit', 'cagr-calculator'],
    'pure-sip': ['step-up-sip', 'sip-plus-lump', 'swp-calculator'],
    'loan-emi': ['refinance-calculator', 'topup-loan-emi', 'credit-card-payoff', 'home-loan-eligibility', 'property-loan-eligibility'],
    'lump-sum': ['pure-sip', 'cagr-calculator', 'rule-of-72', 'compound-interest'],
    'compound-interest': ['lump-sum', 'simple-interest', 'recurring-deposit', 'cagr-calculator'],
    'home-loan-eligibility': ['loan-emi', 'refinance-calculator', 'topup-loan-emi', 'property-loan-eligibility'],
    'property-loan-eligibility': ['home-loan-eligibility', 'loan-emi', 'refinance-calculator', 'topup-loan-emi'],
    'india-tax': ['gst-calculator', 'nps-calculator', 'ppf-calculator'],
    'swp-calculator': ['pure-sip', 'ultimate-fire-planner', 'swr-simulator'],
};


const RelatedCalculators = ({ currentSlug, category }) => {
    const [discovery, setDiscovery] = React.useState([]);
    const [mounted, setMounted] = React.useState(false);

    // 1. Get calculators in the same category
    const sameCategory = manifest.filter(
        (m) => m && m.category === category && m.slug !== currentSlug
    );

    // 2. Get manual relations
    const manual = (MANUAL_RELATIONS[currentSlug] || []).map((s) =>
        manifest.find((m) => m.slug === s)
    ).filter(Boolean);

    // 3. Combine and deduplicate recommendations
    const combinedRel = [...manual, ...sameCategory];
    const uniqueRel = combinedRel.filter(
        (item, index, self) => index === self.findIndex((t) => t.slug === item.slug)
    );
    const recommendations = uniqueRel.slice(0, 4);

    // 4. Randomized Discovery (Discover More) - Move to useEffect for hydration
    React.useEffect(() => {
        setMounted(true);
        const excludedSlugs = new Set([currentSlug, ...recommendations.map(r => r.slug)]);
        const pool = manifest.filter(m => !excludedSlugs.has(m.slug));
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        setDiscovery(shuffled.slice(0, 8));
    }, [currentSlug, recommendations.length]);

    return (
        <div className="space-y-6">
            <QuickSearch />

            {/* RELATED TOOLS */}
            {recommendations.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/50 overflow-hidden transition-colors">
                    <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
                        <h2 className="text-[12px] font-bold text-gray-900 dark:text-gray-400 uppercase tracking-widest leading-none">
                            Related Tools
                        </h2>
                    </div>
                    <nav className="divide-y divide-gray-50 dark:divide-slate-800">
                        {recommendations.map((calc) => (
                            <Link
                                key={calc.slug}
                                href={`/calculators/${calc.slug}`}
                                className="block px-5 py-4 hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-all group outline-none"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-[14px] font-bold text-gray-800 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                                        {calc.title}
                                    </span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* DISCOVER MORE (Randomized) */}
            {mounted && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 overflow-hidden ring-1 ring-indigo-50/50 dark:ring-indigo-900/20 transition-colors">
                    <Link
                        href="/calculators"
                        className="px-5 py-4 border-b border-indigo-50 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/20 flex justify-between items-center group/header hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 transition-colors outline-none"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <h2 className="text-[12px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest leading-none transition-colors">
                                Discover More
                            </h2>
                        </div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-black px-2.5 py-1 bg-indigo-100/50 dark:bg-indigo-900/50 rounded-full group-hover/header:bg-indigo-600 dark:group-hover/header:bg-indigo-500 group-hover/header:text-white transition-all shadow-sm">
                            Catalog
                        </span>
                    </Link>
                    <nav className="divide-y divide-gray-50 dark:divide-slate-800">
                        {discovery.map((calc) => (
                            <Link
                                key={calc.slug}
                                href={`/calculators/${calc.slug}`}
                                className="block px-5 py-3.5 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all group outline-none"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[13px] font-bold text-gray-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {calc.title}
                                    </span>
                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                                        {calc.category}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};

export default RelatedCalculators;
