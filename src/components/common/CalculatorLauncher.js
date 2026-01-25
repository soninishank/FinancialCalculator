'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock3, Heart, Search, Shuffle, Sparkles, X } from 'lucide-react';
import calculators from '../../utils/calculatorsManifest';
import { useCalculatorSearch } from '../../hooks/useCalculatorSearch';
import { getFavorites, getRecent, recordRecent, toggleFavorite } from '../../utils/calculatorPrefs';

const CATEGORY_SHORTCUTS = ['Investment', 'Loan', 'Tax', 'FIRE', 'Bank Scheme'];

export default function CalculatorLauncher({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);
  const [recentSlugs, setRecentSlugs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchResults = useCalculatorSearch(query);

  const calculatorsMap = useMemo(
    () => new Map(calculators.map((item) => [item.slug, item])),
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    setFavoriteSlugs(getFavorites());
    setRecentSlugs(getRecent());
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const recentItems = useMemo(
    () => recentSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean).slice(0, 6),
    [recentSlugs, calculatorsMap]
  );

  const favoriteItems = useMemo(
    () => favoriteSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean).slice(0, 6),
    [favoriteSlugs, calculatorsMap]
  );

  const visibleResults = useMemo(() => {
    let list = query.trim() ? searchResults : calculators;
    if (selectedCategory !== 'All') {
      list = list.filter((item) => item.category === selectedCategory);
    }
    return list.slice(0, 10);
  }, [query, searchResults, selectedCategory]);

  const surprisePick = useMemo(() => {
    const pool = selectedCategory === 'All'
      ? calculators
      : calculators.filter((item) => item.category === selectedCategory);
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }, [selectedCategory, isOpen]);

  const openCalculator = (slug) => {
    setRecentSlugs(recordRecent(slug));
    onClose?.();
    setQuery('');
    router.push(`/calculators/${slug}`);
  };

  const handleFavoriteToggle = (slug) => {
    setFavoriteSlugs(toggleFavorite(slug));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close calculator launcher"
      />
      <div className="relative mx-auto mt-24 w-[min(92vw,960px)] rounded-3xl border border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400">Launcher</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Find tools and workflows fast</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-300"
            aria-label="Close launcher"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools, workflows, categories, or use cases"
              className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-4 pl-12 pr-4 text-base text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${selectedCategory === 'All'
                ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300'
                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                }`}
            >
              All
            </button>
            {CATEGORY_SHORTCUTS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${selectedCategory === category
                  ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.25fr_0.85fr] max-h-[70vh] overflow-hidden">
          <div className="overflow-y-auto px-5 py-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {query.trim() ? 'Top Matches' : 'Browse'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {query.trim() ? 'Search results ranked by title and intent' : 'Popular starting points across the site'}
                </p>
              </div>
              {surprisePick && (
                <button
                  type="button"
                  onClick={() => openCalculator(surprisePick.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Surprise me
                </button>
              )}
            </div>

            <div className="space-y-2">
              {visibleResults.map((item) => {
                const isFavorite = favoriteSlugs.includes(item.slug);
                return (
                  <div
                    key={item.slug}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => openCalculator(item.slug)}
                        className="text-left flex-1"
                      >
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          {item.category || 'General'}
                        </div>
                        <div className="mt-1 text-base font-black text-slate-900 dark:text-white">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFavoriteToggle(item.slug)}
                          className={`rounded-full border p-2 ${isFavorite
                            ? 'border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:bg-rose-950/30'
                            : 'border-slate-200 text-slate-500 bg-white dark:border-slate-700 dark:text-slate-300 dark:bg-slate-900'
                            }`}
                          aria-label={isFavorite ? 'Remove favorite' : 'Save favorite'}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openCalculator(item.slug)}
                          className="rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-300"
                          aria-label={`Open ${item.title}`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {visibleResults.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
                  No tools match this search.
                </div>
              )}
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-4 bg-slate-50/80 dark:bg-slate-950/50">
            <SidebarSection
              title="Recent"
              icon={Clock3}
              items={recentItems}
              emptyLabel="Recently opened calculators will appear here."
              onOpen={openCalculator}
            />
            <SidebarSection
              title="Favorites"
              icon={Heart}
              items={favoriteItems}
              emptyLabel="Save calculators to build your own shortcut shelf."
              onOpen={openCalculator}
            />
            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Quick routes</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/calculators" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Open full directory
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/hub" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Open dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/track" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Open track
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/learn" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Open learn
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/calculators/compare" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Compare tools
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/my-tools" onClick={onClose} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
                  Open My Tools
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, icon: Icon, items, emptyLabel, onOpen }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
      </div>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => onOpen(item.slug)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-left hover:border-teal-300 dark:hover:border-teal-800 transition-colors"
            >
              <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
                {item.category || 'General'}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      )}
    </div>
  );
}
