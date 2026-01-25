'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCalculatorSearch } from '../../hooks/useCalculatorSearch';
import { Search, X } from 'lucide-react';
import calculators from '../../utils/calculatorsManifest';
import { getRecent, recordRecent } from '../../utils/calculatorPrefs';

const QuickSearch = () => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recentItems, setRecentItems] = useState([]);
    const results = useCalculatorSearch(query);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const visibleResults = query.trim() ? results.slice(0, 8) : recentItems;

    useEffect(() => {
        const recentSlugs = getRecent();
        if (!recentSlugs.length) {
            setRecentItems([]);
            return;
        }
        const map = new Map(calculators.map((item) => [item.slug, item]));
        setRecentItems(recentSlugs.map((slug) => map.get(slug)).filter(Boolean).slice(0, 6));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut: '/' to focus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement !== inputRef.current) {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onKeyDownInput = (e) => {
        if (!isOpen || visibleResults.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % visibleResults.length);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? visibleResults.length - 1 : prev - 1));
            return;
        }
        if (e.key === 'Enter' && activeIndex >= 0 && visibleResults[activeIndex]) {
            e.preventDefault();
            const slug = visibleResults[activeIndex].slug;
            handleSelect(slug);
            router.push(`/calculators/${slug}`);
        }
    };

    const handleSelect = (slug) => {
        if (slug) {
            recordRecent(slug);
        }
        setIsOpen(false);
        setQuery('');
        setActiveIndex(-1);
    };

    return (
        <div className="relative mb-6" ref={containerRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-600" aria-hidden="true" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={onKeyDownInput}
                    placeholder="Search all calculators..."
                    aria-label="Search all calculators"
                    className="block w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white text-gray-900 placeholder-gray-600 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-lg transition-all shadow-sm"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto animate-in fade-in zoom-in duration-200">
                    {visibleResults.length > 0 ? (
                        <div className="py-2">
                            {!query.trim() && (
                                <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Recent Calculators
                                </div>
                            )}
                            {visibleResults.map((calc, idx) => (
                                <Link
                                    key={calc.slug}
                                    href={`/calculators/${calc.slug}`}
                                    onClick={() => handleSelect(calc.slug)}
                                    className={`block px-4 py-3 transition-colors ${idx === activeIndex ? 'bg-teal-50' : 'hover:bg-teal-50'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-teal-700">
                                            {calc.title}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                            {calc.category}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {query.trim() && results.length > 8 && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <Link
                                        href="/calculators"
                                        onClick={() => handleSelect()}
                                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 uppercase"
                                    >
                                        View all results →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            {query.trim() ? `No calculators found for "${query}"` : "No recent calculators yet"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuickSearch;
