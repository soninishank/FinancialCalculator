'use client';

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCalculatorSearch } from "../hooks/useCalculatorSearch";
import CalculatorAdvisor from "../components/home/CalculatorAdvisor";
import { Providers } from "../app/providers";
import calculators from "../utils/calculatorsManifest";
import { clearRecent, getFavorites, getRecent, getViewPresets, recordRecent, removeViewPreset, saveViewPreset, toggleFavorite } from "../utils/calculatorPrefs";
import { Check, Copy, GitCompareArrows, Heart, Search, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";

const INTENT_PRESETS = [
  { id: "wealth", label: "Grow wealth", query: "sip cagr compound", category: "All" },
  { id: "loan-plan", label: "Plan a loan", query: "emi home car loan", category: "Loan" },
  { id: "retire", label: "Retirement", query: "fire swr withdrawal retirement", category: "FIRE" },
  { id: "tax", label: "Tax planning", query: "tax capital gains paycheck", category: "Tax" },
  { id: "safe-income", label: "Safe returns", query: "fd rd ppf savings", category: "Bank Scheme" }
];

export default function CalculatorsList({ initialFiltered = [], initialQ = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = React.useState(initialQ || "");
  const [mounted, setMounted] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("relevance");
  const [favorites, setFavorites] = React.useState([]);
  const [recent, setRecent] = React.useState([]);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [activeIntent, setActiveIntent] = React.useState("");
  const [compareSlugs, setCompareSlugs] = React.useState([]);
  const [viewPresets, setViewPresets] = React.useState([]);
  const [copiedCompare, setCopiedCompare] = React.useState(false);

  const filtered = useCalculatorSearch(q);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    const sort = params.get("sort");
    const fav = params.get("fav");
    const intent = params.get("intent");
    const compare = params.get("cmp");

    setFavorites(getFavorites());
    setRecent(getRecent());
    setViewPresets(getViewPresets());
    if (cat) setSelectedCategory(cat);
    if (sort) setSortBy(sort);
    if (fav === "1") setFavoritesOnly(true);
    if (intent) setActiveIntent(intent);
    if (compare) setCompareSlugs(compare.split(",").filter(Boolean).slice(0, 3));
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q); else params.delete("q");
    if (selectedCategory !== "All") params.set("cat", selectedCategory); else params.delete("cat");
    if (sortBy !== "relevance") params.set("sort", sortBy); else params.delete("sort");
    if (favoritesOnly) params.set("fav", "1"); else params.delete("fav");
    if (activeIntent) params.set("intent", activeIntent); else params.delete("intent");
    if (compareSlugs.length) params.set("cmp", compareSlugs.join(",")); else params.delete("cmp");

    const current = searchParams.toString();
    const next = params.toString();
    if (current !== next) {
      router.replace(`/calculators${next ? `?${next}` : ""}`, { scroll: false });
    }
  }, [mounted, q, selectedCategory, sortBy, favoritesOnly, activeIntent, compareSlugs, router, searchParams]);

  const baseList = mounted ? (filtered || []) : (initialFiltered || []);

  const displayList = React.useMemo(() => {
    let list = [...baseList];

    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }
    if (favoritesOnly) {
      list = list.filter((item) => favorites.includes(item.slug));
    }
    if (sortBy === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    if (sortBy === "newestSlug") list.sort((a, b) => b.slug.localeCompare(a.slug));
    return list;
  }, [baseList, selectedCategory, sortBy, favoritesOnly, favorites]);

  const grouped = React.useMemo(() => {
    return displayList.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [displayList]);

  const categories = React.useMemo(() => {
    const unique = new Set((mounted ? filtered : initialFiltered).map((item) => item.category || "Other"));
    return ["All", ...Array.from(unique)];
  }, [mounted, filtered, initialFiltered]);

  const favoriteItems = React.useMemo(() => {
    if (!favorites.length) return [];
    const set = new Set(favorites);
    return calculators.filter((item) => set.has(item.slug));
  }, [favorites]);

  const recentItems = React.useMemo(() => {
    if (!recent.length) return [];
    const map = new Map(calculators.map((item) => [item.slug, item]));
    return recent.map((slug) => map.get(slug)).filter(Boolean);
  }, [recent]);

  const compareItems = React.useMemo(() => {
    if (!compareSlugs.length) return [];
    const map = new Map(calculators.map((item) => [item.slug, item]));
    return compareSlugs.map((slug) => map.get(slug)).filter(Boolean);
  }, [compareSlugs]);

  const showCompareLimit = compareSlugs.length >= 3;

  const scrollToCategory = (cat) => {
    const element = document.getElementById(`cat-${cat}`);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const [showFloatingButtons, setShowFloatingButtons] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => setShowFloatingButtons(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      document.querySelector('input[aria-label="Search calculators"]')?.focus();
    }, 500);
  };

  const handleToggleFavorite = (slug) => {
    setFavorites(toggleFavorite(slug));
  };

  const handleOpenCalculator = (slug) => {
    setRecent(recordRecent(slug));
  };

  const handleToggleCompare = (slug) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  };

  const handleClearRecent = () => {
    setRecent(clearRecent());
  };

  const handleSaveCurrentView = () => {
    const name = window.prompt("Name this view");
    if (!name || !name.trim()) return;

    const trimmed = name.trim().slice(0, 40);
    const snapshot = {
      id: `preset-${Date.now()}`,
      name: trimmed,
      filters: {
        q,
        selectedCategory,
        sortBy,
        favoritesOnly,
        activeIntent,
      },
    };
    setViewPresets(saveViewPreset(snapshot));
  };

  const applyViewPreset = (preset) => {
    const f = preset?.filters || {};
    setQ(f.q || "");
    setSelectedCategory(f.selectedCategory || "All");
    setSortBy(f.sortBy || "relevance");
    setFavoritesOnly(Boolean(f.favoritesOnly));
    setActiveIntent(f.activeIntent || "");
  };

  const deleteViewPreset = (id) => {
    setViewPresets(removeViewPreset(id));
  };

  const copyCompareLink = async () => {
    if (!compareSlugs.length) return;
    const params = new URLSearchParams(window.location.search);
    params.set("cmp", compareSlugs.join(","));
    const url = `${window.location.origin}/calculators?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedCompare(true);
      setTimeout(() => setCopiedCompare(false), 1500);
    } catch {
      window.prompt("Copy this compare link", url);
    }
  };

  const applyIntent = (preset) => {
    setActiveIntent(preset.id);
    setQ(preset.query);
    setSelectedCategory(preset.category || "All");
    setFavoritesOnly(false);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSortBy("relevance");
    setFavoritesOnly(false);
    setActiveIntent("");
    setQ("");
  };

  return (
    <Providers>
      <div className="p-6 pt-0 max-w-6xl mx-auto transition-colors duration-500">
        <section className="mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-transparent dark:border-slate-800/50">
            <h2 className="text-lg font-semibold dark:text-white">Choose a calculator</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Search, filter, and compare tools for better money decisions.</p>

            <Suspense fallback={<div className="mt-6 h-14 bg-gray-50 dark:bg-slate-800 animate-pulse rounded-2xl" />}>
              <SearchInput q={q} setQ={setQ} />
            </Suspense>

            <div className="mt-4 flex flex-wrap gap-2">
              {INTENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyIntent(preset)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-widest transition-colors ${activeIntent === preset.id
                    ? "border-teal-300 bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:border-teal-800 dark:text-teal-300"
                    : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300"
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm text-gray-700 dark:text-slate-300">
                <span className="mb-1.5 block font-semibold">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-700 dark:text-slate-300">
                <span className="mb-1.5 block font-semibold">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2"
                >
                  <option value="relevance">Relevance</option>
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                  <option value="newestSlug">Newest Added</option>
                </select>
              </label>
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`sm:mt-7 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 font-semibold transition-colors ${favoritesOnly
                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-300"
                  : "border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                  }`}
              >
                <Heart className="w-4 h-4" />
                Favorites only
              </button>
              <button
                onClick={resetFilters}
                className="sm:mt-7 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2 font-semibold text-gray-700 dark:text-slate-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Reset filters
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveCurrentView}
                className="text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20"
              >
                Save current view
              </button>
              {viewPresets.map((preset) => (
                <div key={preset.id} className="inline-flex items-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => applyViewPreset(preset)}
                    className="text-xs font-semibold px-2.5 py-1.5 text-gray-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deleteViewPreset(preset.id)}
                    className="px-2 py-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                    aria-label={`Delete preset ${preset.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs font-semibold text-gray-500 dark:text-slate-400">
              {displayList.length} results found
              {q ? ` for "${q}"` : ""}
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}.
            </div>

            {Object.keys(grouped).length > 1 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {Object.keys(grouped).map((cat) => (
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

        {!!compareItems.length && (
          <section className="mb-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-widest">Compare Shortlist</h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/calculators/compare?cmp=${compareSlugs.join(",")}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:bg-teal-950/20"
                >
                  Open compare page
                </Link>
                <button
                  onClick={copyCompareLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20"
                >
                  {copiedCompare ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCompare ? "Copied" : "Copy link"}
                </button>
                <button
                  onClick={() => setCompareSlugs([])}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear shortlist
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {compareItems.map((item) => (
                <div key={item.slug} className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400">{item.category}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{item.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Link href={`/calculators/${item.slug}`} className="text-sm font-semibold text-teal-600 dark:text-teal-400">Open</Link>
                    <button onClick={() => handleToggleCompare(item.slug)} className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!recentItems.length && !q && !favoritesOnly && selectedCategory === "All" && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-widest">Recent</h2>
              <button
                onClick={handleClearRecent}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear recent
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentItems.map((meta) => (
                <Card
                  key={meta.slug}
                  meta={meta}
                  isFavorite={favorites.includes(meta.slug)}
                  onFavoriteToggle={handleToggleFavorite}
                  onOpen={handleOpenCalculator}
                  isCompared={compareSlugs.includes(meta.slug)}
                  onCompareToggle={handleToggleCompare}
                  compareDisabled={showCompareLimit && !compareSlugs.includes(meta.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {!!favoriteItems.length && !q && selectedCategory === "All" && (
          <section className="mb-8">
            <h2 className="text-base font-black text-gray-800 dark:text-white mb-4 uppercase tracking-widest">Favorites</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteItems.map((meta) => (
                <Card
                  key={meta.slug}
                  meta={meta}
                  isFavorite={favorites.includes(meta.slug)}
                  onFavoriteToggle={handleToggleFavorite}
                  onOpen={handleOpenCalculator}
                  isCompared={compareSlugs.includes(meta.slug)}
                  onCompareToggle={handleToggleCompare}
                  compareDisabled={showCompareLimit && !compareSlugs.includes(meta.slug)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          {displayList.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-center text-gray-600 dark:text-slate-400 border border-transparent dark:border-slate-800/50">
              No calculators match <strong>{q || "your filters"}</strong>. Try a broad term like <span className="font-semibold">loan</span>, <span className="font-semibold">sip</span>, or <span className="font-semibold">tax</span>.
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} id={`cat-${category}`} className="scroll-mt-6">
                  <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 border-l-4 border-indigo-500 pl-3 uppercase tracking-widest">{category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((meta) => (
                      <Card
                        key={meta.slug}
                        meta={meta}
                        isFavorite={favorites.includes(meta.slug)}
                        onFavoriteToggle={handleToggleFavorite}
                        onOpen={handleOpenCalculator}
                        isCompared={compareSlugs.includes(meta.slug)}
                        onCompareToggle={handleToggleCompare}
                        compareDisabled={showCompareLimit && !compareSlugs.includes(meta.slug)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800/50">
          <CalculatorAdvisor />
        </section>

        {showFloatingButtons && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label="Quick search"
              title="Scroll to search"
            >
              <Search className="w-5 h-5" />
              <span className="text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">Search</span>
            </button>

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
  return (
    <div className="mt-6 relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 dark:text-slate-600" />
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search calculators (e.g., SIP, EMI, tax, retirement...)"
        className="w-full pl-12 pr-12 py-4 border-2 border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/50 text-lg transition-all"
        aria-label="Search calculators"
      />
      {!!q && (
        <button
          onClick={() => setQ("")}
          className="absolute inset-y-0 right-3 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function Card({
  meta,
  isFavorite,
  onFavoriteToggle,
  onOpen,
  isCompared,
  onCompareToggle,
  compareDisabled
}) {
  return (
    <div className="group relative p-6 pt-12 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm hover:shadow-xl dark:shadow-none border border-transparent dark:border-slate-800/50 hover:border-teal-500/20 dark:hover:border-teal-500/30 transition-all duration-300 block transform hover:-translate-y-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFavoriteToggle?.(meta.slug);
        }}
        aria-label={isFavorite ? `Remove ${meta.title} from favorites` : `Add ${meta.title} to favorites`}
        className={`absolute left-4 top-4 rounded-full p-1.5 border transition-colors ${isFavorite
          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400"
          : "bg-white text-gray-400 border-gray-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700"
          }`}
      >
        <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCompareToggle?.(meta.slug);
        }}
        disabled={compareDisabled}
        aria-label={isCompared ? `Remove ${meta.title} from compare` : `Add ${meta.title} to compare`}
        className={`absolute left-14 top-4 rounded-full p-1.5 border transition-colors ${isCompared
          ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400"
          : "bg-white text-gray-400 border-gray-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700"
          } ${compareDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {isCompared ? <Sparkles className="w-4 h-4" /> : <GitCompareArrows className="w-4 h-4" />}
      </button>

      <Link href={`/calculators/${meta.slug}`} onClick={() => onOpen?.(meta.slug)} className="block">
        <div className="absolute top-4 right-4 bg-gray-50 dark:bg-slate-800 text-[10px] font-black text-gray-500 dark:text-slate-400 px-3 py-1 rounded-full border dark:border-slate-700/50 uppercase tracking-widest leading-none">
          {meta.category ?? "General"}
        </div>
        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{meta.title}</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">{meta.description}</p>

        <div className="mt-4 flex items-center text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
          Calculate Now →
        </div>
      </Link>
    </div>
  );
}
