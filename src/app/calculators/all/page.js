import Link from 'next/link';
import calculators from '../../../utils/calculatorsManifest';

export const metadata = {
    title: 'All Financial Calculators (HTML Sitemap)',
    description: 'Browse every FinCalc calculator in one crawlable, category-wise directory page.',
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators/all',
    },
};

export default function AllCalculatorsPage() {
    const grouped = calculators.reduce((acc, calc) => {
        const cat = calc.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(calc);
        return acc;
    }, {});

    const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">All Financial Calculators</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-8">
                Category-wise index of all calculators. Use this page as a complete directory.
            </p>

            <div className="space-y-10">
                {sortedCategories.map((category) => (
                    <section key={category}>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">
                            {category}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                            {grouped[category]
                                .sort((a, b) => a.title.localeCompare(b.title))
                                .map((calc) => (
                                    <Link
                                        key={calc.slug}
                                        href={`/calculators/${calc.slug}`}
                                        className="text-sm text-gray-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                                    >
                                        {calc.title}
                                    </Link>
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
