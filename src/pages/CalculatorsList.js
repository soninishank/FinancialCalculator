'use client';

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCalculatorSearch } from "../hooks/useCalculatorSearch";
import CalculatorAdvisor from "../components/home/CalculatorAdvisor";
import { Providers } from "../app/providers";
// import SEO from "../components/common/SEO"; // Handled by metadata
import { Search } from "lucide-react";

export default function CalculatorsList({ initialFiltered = [], initialQ = "" }) {
  const [q, setQ] = React.useState(initialQ || "");
  const [mounted, setMounted] = React.useState(false);
  const filtered = useCalculatorSearch(q);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use initialFiltered until mounted to avoid hydration mismatch
  const displayList = mounted ? (filtered || []) : (initialFiltered || []);

  const grouped = React.useMemo(() => {
    return displayList.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [displayList]);

  const categories = Object.keys(grouped);

  const scrollToCategory = (cat) => {
    const element = document.getElementById(`cat-${cat}`);
    if (element) {
      // Offset for normal header plus padding
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Track scroll position for floating buttons
  const [showFloatingButtons, setShowFloatingButtons] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show floating buttons after scrolling 300px
      setShowFloatingButtons(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus search input after scrolling
    setTimeout(() => {
      document.querySelector('input[aria-label="Search calculators"]')?.focus();
    }, 500);
  };

  return (
    <Providers>
      <div className="p-6 pt-0 max-w-6xl mx-auto transition-colors duration-500">

        {/* Normal Search Section */}
        <section className="mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-transparent dark:border-slate-800/50">
            <h2 className="text-lg font-semibold dark:text-white">Choose a calculator</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Search or pick from the catalog below.</p>

            <Suspense fallback={<div className="mt-6 h-14 bg-gray-50 dark:bg-slate-800 animate-pulse rounded-2xl"></div>}>
              <SearchInput q={q} setQ={setQ} />
            </Suspense>

            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-100/50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors border border-gray-200 dark:border-slate-700/50 uppercase tracking-widest"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          {displayList.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-center text-gray-600 dark:text-slate-400 border border-transparent dark:border-slate-800/50">
              No calculators match <strong>{q}</strong>.
            </div>
          ) : (
            <div className="space-y-12">
              <div className="space-y-12">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} id={`cat-${category}`} className="scroll-mt-6">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 border-l-4 border-indigo-500 pl-3 uppercase tracking-widest">{category}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map(meta => (
                        <Card key={meta.slug} meta={meta} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Advisor Footer */}
        <section className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800/50">
          <CalculatorAdvisor />
        </section>

        {/* Floating Action Buttons */}
        {showFloatingButtons && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {/* Search Button */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label="Quick search"
              title="Scroll to search"
            >
              <Search className="w-5 h-5" />
              <span className="text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
                Search
              </span>
            </button>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center justify-center w-12 h-12 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label="Scroll to top"
              title="Back to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </Providers>
  );
}

function SearchInput({ q, setQ }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearchChange = (val) => {
    setQ(val);
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`/calculators?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-6 relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 dark:text-slate-600" />
      </div>
      <input
        value={q}
        onChange={e => handleSearchChange(e.target.value)}
        placeholder="Search calculators (e.g., SIP, EMI, Lump Sum...)"
        className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/50 text-lg transition-all"
        aria-label="Search calculators"
      />
    </div>
  );
}

function Card({ meta }) {
  return (
    <Link
      href={`/calculators/${meta.slug}`}
      className="group relative p-6 pt-12 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm hover:shadow-xl dark:shadow-none border border-transparent dark:border-slate-800/50 hover:border-teal-500/20 dark:hover:border-teal-500/30 transition-all duration-300 block transform hover:-translate-y-1"
    >
      <div className="absolute top-4 right-4 bg-gray-50 dark:bg-slate-800 text-[10px] font-black text-gray-500 dark:text-slate-400 px-3 py-1 rounded-full border dark:border-slate-700/50 uppercase tracking-widest leading-none">
        {meta.category ?? "General"}
      </div>

      <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{meta.title}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">{meta.description}</p>

      <div className="mt-4 flex items-center text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
        Calculate Now →
      </div>
    </Link>
  );
}
