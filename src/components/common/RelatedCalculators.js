import React from 'react';
import { Link } from 'react-router-dom';
import manifest from '../../utils/calculatorsManifest';

const MANUAL_RELATIONS = {
    'simple-interest': ['lump-sum', 'recurring-deposit', 'cagr-calculator'],
    'pure-sip': ['step-up-sip', 'sip-plus-lump', 'swp-calculator'],
    'loan-emi': ['refinance-calculator', 'topup-loan-emi', 'credit-card-payoff'],
    'lump-sum': ['pure-sip', 'cagr-calculator', 'rule-of-72'],
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Related Calculators
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {recommendations.map((calc) => (
                    <Link
                        key={calc.slug}
                        to={`/calculator/${calc.slug}`}
                        className="block px-4 py-4 hover:bg-teal-50/30 transition-colors group"
                    >
                        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                            {calc.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {calc.description}
                        </p>
                    </Link>
                ))}
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <Link
                    to="/calculators"
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide flex items-center"
                >
                    View All Calculators <span className="ml-1">→</span>
                </Link>
            </div>
        </div>
    );
};

export default RelatedCalculators;
