'use client';

import React from 'react';
import Link from 'next/link';
import calculators from '../../utils/calculatorsManifest';
import { getFavorites, getRecent, recordRecent, toggleFavorite } from '../../utils/calculatorPrefs';

function sortRecommended(items, categoryWeight) {
    return items
        .slice()
        .sort((a, b) => {
            const wA = categoryWeight[a.category] || 0;
            const wB = categoryWeight[b.category] || 0;
            if (wA !== wB) return wB - wA;
            return a.title.localeCompare(b.title);
        });
}

export default function PersonalizedToolsPanel() {
    const [mounted, setMounted] = React.useState(false);
    const [favoriteSlugs, setFavoriteSlugs] = React.useState([]);
    const [recentSlugs, setRecentSlugs] = React.useState([]);

    React.useEffect(() => {
        setMounted(true);
        setFavoriteSlugs(getFavorites());
        setRecentSlugs(getRecent());
    }, []);

    const calculatorsMap = React.useMemo(() => new Map(calculators.map((item) => [item.slug, item])), []);

    const recentItems = React.useMemo(
        () => recentSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean).slice(0, 6),
        [recentSlugs, calculatorsMap]
    );

    const favoriteItems = React.useMemo(
        () => favoriteSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean).slice(0, 6),
        [favoriteSlugs, calculatorsMap]
    );

    const recommendedItems = React.useMemo(() => {
        const seedSlugs = new Set([...recentSlugs, ...favoriteSlugs]);
        const seedItems = [...recentItems, ...favoriteItems];
        const categoryWeight = {};

        seedItems.forEach((item) => {
            const cat = item?.category || 'Other';
            categoryWeight[cat] = (categoryWeight[cat] || 0) + 1;
        });

        const pool = calculators.filter((item) => !seedSlugs.has(item.slug));
        const ranked = sortRecommended(pool, categoryWeight);
        const fallback = calculators.filter((item) => !seedSlugs.has(item.slug));

        return (ranked.length ? ranked : fallback).slice(0, 6);
    }, [recentSlugs, favoriteSlugs, recentItems, favoriteItems]);

    const handleFavoriteToggle = (slug) => {
        setFavoriteSlugs(toggleFavorite(slug));
    };

    const handleOpen = (slug) => {
        setRecentSlugs(recordRecent(slug));
    };

    if (!mounted) {
        return (
            <section className="py-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="h-8 w-72 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 bg-white/50 dark:bg-slate-900/40">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-8">
                    {!!recentItems.length && (
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">Continue Where You Left Off</h2>
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {recentItems.map((item) => (
                                    <ToolCard
                                        key={item.slug}
                                        item={item}
                                        isFavorite={favoriteSlugs.includes(item.slug)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onOpen={handleOpen}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!!favoriteItems.length && (
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">Your Favorites</h2>
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {favoriteItems.map((item) => (
                                    <ToolCard
                                        key={item.slug}
                                        item={item}
                                        isFavorite={favoriteSlugs.includes(item.slug)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onOpen={handleOpen}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Recommended For You</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Picks based on your recent activity and favorite categories.
                        </p>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {recommendedItems.map((item) => (
                                <ToolCard
                                    key={item.slug}
                                    item={item}
                                    isFavorite={favoriteSlugs.includes(item.slug)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    onOpen={handleOpen}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ToolCard({ item, isFavorite, onFavoriteToggle, onOpen }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
                    {item.category || 'General'}
                </span>
                <button
                    onClick={() => onFavoriteToggle(item.slug)}
                    className={`text-xs font-bold px-2 py-1 rounded-full border transition-colors ${isFavorite
                        ? 'border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:bg-rose-950/20'
                        : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                        }`}
                >
                    {isFavorite ? 'Saved' : 'Save'}
                </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
            <div className="mt-4">
                <Link
                    href={`/calculators/${item.slug}`}
                    onClick={() => onOpen(item.slug)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300 hover:underline"
                >
                    Open calculator
                </Link>
            </div>
        </div>
    );
}
