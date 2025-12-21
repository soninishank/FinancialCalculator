import React from 'react';
import { Link } from 'react-router-dom';
import manifest from '../../utils/calculatorsManifest';

const MANUAL_RELATIONS = {
    'simple-interest': ['lump-sum', 'recurring-deposit', 'cagr-calculator'],
    'pure-sip': ['step-up-sip', 'sip-plus-lump', 'swp-calculator'],
    'loan-emi': ['refinance-calculator', 'topup-loan-emi', 'credit-card-payoff', 'home-loan-eligibility'],
    'lump-sum': ['pure-sip', 'cagr-calculator', 'rule-of-72', 'compound-interest'],
    'compound-interest': ['lump-sum', 'simple-interest', 'recurring-deposit', 'cagr-calculator'],
    'home-loan-eligibility': ['loan-emi', 'refinance-calculator', 'topup-loan-emi'],
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

    // 3. Combine and deduplicate
    const combined = [...manual, ...sameCategory];
    const unique = combined.filter(
        (item, index, self) => index === self.findIndex((t) => t.slug === item.slug)
    );

    // 4. Limit to 5
    const recommendations = unique.slice(0, 5);

    if (recommendations.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest leading-none">
                    Related Tools
                </h3>
            </div>
            <div className="divide-y divide-gray-50">
                {recommendations.map((calc) => (
                    <Link
                        key={calc.slug}
                        to={`/calculator/${calc.slug}`}
                        className="block px-5 py-5 hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="text-[15px] font-bold text-gray-800 group-hover:text-teal-600 transition-colors leading-snug">
                                {calc.title}
                            </h4>
                            <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0 text-teal-600 shrink-0 mt-0.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                            {calc.description}
                        </p>
                    </Link>
                ))}
            </div>
            <div className="bg-gray-50/50 px-5 py-4">
                <Link
                    to="/calculators"
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest flex items-center justify-between group"
                >
                    View All Calculators
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
            </div>
        </div>
    );
};

export default RelatedCalculators;
