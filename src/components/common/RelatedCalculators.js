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
};


const RelatedCalculators = ({ currentSlug, category }) => {
    // 1. Get calculators in the same category
    const sameCategory = manifest.filter(
        (m) => m.category === category && m.slug !== currentSlug
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

    // 4. Randomized Discovery (Discover More)
    // Filter out current and already recommended ones
    const excludedSlugs = new Set([currentSlug, ...recommendations.map(r => r.slug)]);
    const pool = manifest.filter(m => !excludedSlugs.has(m.slug));

    // Shuffle and pick 10
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const discovery = shuffled.slice(0, 10);

    return (
        <div className="space-y-6">
            <QuickSearch />

            {/* RELATED TOOLS */}
            {recommendations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-widest leading-none">
                            Related Tools
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recommendations.map((calc) => (
                            <Link
                                key={calc.slug}
                                href={`/calculators/${calc.slug}`}
                                className="block px-5 py-4 hover:bg-teal-50/30 transition-all group"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-[14px] font-bold text-gray-800 group-hover:text-teal-600 transition-colors leading-snug">
                                        {calc.title}
                                    </h4>
                                    <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0 text-teal-600 shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* DISCOVER MORE (Randomized) */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden ring-1 ring-indigo-50/50">
                <Link
                    href="/calculators"
                    className="px-5 py-4 border-b border-indigo-50 bg-indigo-50/40 flex justify-between items-center group/header hover:bg-indigo-100/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <h3 className="text-[12px] font-extrabold text-indigo-700 uppercase tracking-widest leading-none transition-colors">
                            Discover More
                        </h3>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-black px-2.5 py-1 bg-indigo-100/50 rounded-full group-hover/header:bg-indigo-600 group-hover/header:text-white transition-all shadow-sm">
                        Surprise Me!
                    </span>
                </Link>
                <div className="divide-y divide-gray-50">
                    {discovery.map((calc) => (
                        <Link
                            key={calc.slug}
                            href={`/calculators/${calc.slug}`}
                            className="block px-5 py-3.5 hover:bg-indigo-50/30 transition-all group"
                        >
                            <div className="flex flex-col gap-0.5">
                                <h4 className="text-[13px] font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                    {calc.title}
                                </h4>
                                <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                                    {calc.category}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-50">
                    <Link
                        href="/calculators"
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center justify-between group"
                    >
                        Browser Catalog
                        <span className="transform transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RelatedCalculators;
