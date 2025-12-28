import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCalculatorSearch } from '../../hooks/useCalculatorSearch';


export default function CalculatorAdvisor() {
    const [query, setQuery] = useState('');
    const results = useCalculatorSearch(query);

    // Only show results if user has typed something significant
    const hasInput = query.length > 2;


    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border-8 border-white/10"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full border-8 border-white/10"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold">Unsure which calculator to use?</h2>
                </div>

                <p className="text-indigo-100 mb-6 max-w-lg">
                    Describe what you want to do (e.g., "save for a house," "retire early," or "pay off debt") and we'll recommend the best tool.
                </p>

                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe your goal..."
                        className="w-full py-4 pl-6 pr-12 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-lg text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>

                {/* Recommendations Grid */}
                {hasInput && (
                    <div className="mt-6 animate-fade-in-up">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">Recommended Tools</h3>

                        {results.length === 0 ? (
                            <p className="text-white/70 italic">
                                No matching calculators found. Try different keywords like "loan", "tax", or "growth".
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.slice(0, 4).map(calc => (
                                    <Link key={calc.slug} to={`/calculator/${calc.slug}`} className="block group">
                                        <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-4 transition-all border border-white/10 hover:border-white/30">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-lg text-white group-hover:text-yellow-300 transition-colors">
                                                    {calc.title}
                                                </h4>
                                                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-white/80">
                                                    {calc.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-indigo-100 mt-1 line-clamp-2">
                                                {calc.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
