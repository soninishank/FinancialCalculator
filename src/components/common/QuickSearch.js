import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCalculatorSearch } from '../../hooks/useCalculatorSearch';
import { Search, X } from 'lucide-react';

const QuickSearch = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const results = useCalculatorSearch(query);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

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
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative mb-6" ref={containerRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-600" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search all calculators..."
                    className="block w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white text-gray-900 placeholder-gray-600 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-lg transition-all shadow-sm"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query.trim() !== '' && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto animate-in fade-in zoom-in duration-200">
                    {results.length > 0 ? (
                        <div className="py-2">
                            {results.slice(0, 8).map((calc) => (
                                <Link
                                    key={calc.slug}
                                    to={`/calculators/${calc.slug}`}
                                    onClick={handleSelect}
                                    className="block px-4 py-3 hover:bg-teal-50 transition-colors"
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
                            {results.length > 8 && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <Link
                                        to="/calculators"
                                        onClick={handleSelect}
                                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 uppercase"
                                    >
                                        View all results →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            No calculators found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuickSearch;
