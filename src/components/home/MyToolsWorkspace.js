'use client';

import React from 'react';
import Link from 'next/link';
import calculators from '../../utils/calculatorsManifest';
import BillCalendar from './BillCalendar';
import {
    clearFavorites,
    clearRecent,
    getFavorites,
    getRecent,
    getViewPresets,
    getSavedComparisons,
    recordRecent,
    removeViewPreset,
    removeSavedComparison,
    toggleFavorite,
} from '../../utils/calculatorPrefs';

const MONEY_OS_KEY = 'fincalc_money_os_v1';

function readGoals() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(MONEY_OS_KEY) : null;
        const data = raw ? JSON.parse(raw) : null;
        return Array.isArray(data?.goals) ? data.goals : [];
    } catch {
        return [];
    }
}

const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function countCategories(items) {
    return items.reduce((acc, item) => {
        const category = item?.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});
}

export default function MyToolsWorkspace() {
    const [mounted, setMounted] = React.useState(false);
    const [favoriteSlugs, setFavoriteSlugs] = React.useState([]);
    const [recentSlugs, setRecentSlugs] = React.useState([]);
    const [viewPresets, setViewPresets] = React.useState([]);
    const [activeGoals, setActiveGoals] = React.useState([]);
    const [savedComparisons, setSavedComparisons] = React.useState([]);

    const calculatorsMap = React.useMemo(
        () => new Map(calculators.map((item) => [item.slug, item])),
        []
    );

    React.useEffect(() => {
        setMounted(true);
        setFavoriteSlugs(getFavorites());
        setRecentSlugs(getRecent());
        setViewPresets(getViewPresets());
        setActiveGoals(readGoals());
        setSavedComparisons(getSavedComparisons());
    }, []);

    const favoriteItems = React.useMemo(
        () => favoriteSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean),
        [favoriteSlugs, calculatorsMap]
    );

    const recentItems = React.useMemo(
        () => recentSlugs.map((slug) => calculatorsMap.get(slug)).filter(Boolean),
        [recentSlugs, calculatorsMap]
    );

    const topCategories = React.useMemo(() => {
        const counts = countCategories([...favoriteItems, ...recentItems]);
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
    }, [favoriteItems, recentItems]);

    const handleOpen = (slug) => {
        setRecentSlugs(recordRecent(slug));
    };

    const handleToggleFavorite = (slug) => {
        setFavoriteSlugs(toggleFavorite(slug));
    };

    const handleClearRecent = () => {
        setRecentSlugs(clearRecent());
    };

    const handleClearFavorites = () => {
        setFavoriteSlugs(clearFavorites());
    };

    const handleDeletePreset = (id) => {
        setViewPresets(removeViewPreset(id));
    };

    const handleDeleteComparison = (id) => {
        setSavedComparisons(removeSavedComparison(id));
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="h-10 w-60 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-700 dark:text-indigo-300">My Tools</p>
                                <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">Your saved calculator workspace</h1>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    Manage favorites, recent calculators, and saved directory views from one place.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                                <Link href="/calculators" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                                    Browse calculators
                                </Link>
                                <Link href="/calculators/compare" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                                    Compare workspace
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SummaryStat label="Favorites" value={String(favoriteItems.length)} subtext="Saved for quick access" />
                            <SummaryStat label="Recent" value={String(recentItems.length)} subtext="Most recent calculator sessions" />
                            <SummaryStat label="Saved Views" value={String(viewPresets.length)} subtext="Reusable directory filters" />
                            <SummaryStat
                                label="Top Focus"
                                value={topCategories[0]?.[0] || 'None yet'}
                                subtext={topCategories[0] ? `${topCategories[0][1]} saved or recent tools` : 'Start using calculators to build patterns'}
                            />
                            <SummaryStat label="Goals" value={String(activeGoals.length)} subtext="Active financial goals" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <ToolsSection
                        title="Favorites"
                        description="Pin calculators you use repeatedly."
                        items={favoriteItems}
                        emptyLabel="No favorites yet. Save calculators from the directory or launcher."
                        actionLabel="Clear favorites"
                        onAction={favoriteItems.length ? handleClearFavorites : null}
                        onToggleFavorite={handleToggleFavorite}
                        onOpen={handleOpen}
                        favoriteSlugs={favoriteSlugs}
                    />

                    <ToolsSection
                        title="Recently opened"
                        description="Jump back into your latest calculator sessions."
                        items={recentItems}
                        emptyLabel="Open a calculator and it will show up here."
                        actionLabel="Clear recent"
                        onAction={recentItems.length ? handleClearRecent : null}
                        onToggleFavorite={handleToggleFavorite}
                        onOpen={handleOpen}
                        favoriteSlugs={favoriteSlugs}
                    />
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Saved directory views</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            These presets come from the calculator directory filters.
                        </p>
                        <div className="mt-4 space-y-3">
                            {viewPresets.length > 0 ? viewPresets.map((preset) => {
                                const filters = preset.filters || {};
                                const params = new URLSearchParams();
                                if (filters.q) params.set('q', filters.q);
                                if (filters.selectedCategory && filters.selectedCategory !== 'All') params.set('cat', filters.selectedCategory);
                                if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
                                if (filters.favoritesOnly) params.set('fav', '1');
                                if (filters.activeIntent) params.set('intent', filters.activeIntent);

                                return (
                                    <div key={preset.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">{preset.name}</div>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {filters.q ? `Search: ${filters.q}` : 'All calculators'}{filters.selectedCategory && filters.selectedCategory !== 'All' ? ` • ${filters.selectedCategory}` : ''}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePreset(preset.id)}
                                                className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-300"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <Link
                                                href={`/calculators${params.toString() ? `?${params.toString()}` : ''}`}
                                                className="text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                                            >
                                                Open saved view
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-500 dark:text-slate-400">
                                    Save a filtered directory view from the calculators page to reuse it here.
                                </div>
                            )}
                        </div>
                    </div>

                    <BillCalendar />

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Usage patterns</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Categories you return to most often.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {topCategories.length > 0 ? topCategories.map(([category, count]) => (
                                <span
                                    key={category}
                                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"
                                >
                                    {category} · {count}
                                </span>
                            )) : (
                                <span className="text-sm text-slate-500 dark:text-slate-400">No usage signal yet.</span>
                            )}
                        </div>
                    </div>

                    {/* Active Goals Widget */}
                    <ActiveGoalsWidget goals={activeGoals} />

                    {/* Saved Comparisons */}
                    <SavedComparisonsWidget
                        comparisons={savedComparisons}
                        calculatorsMap={calculatorsMap}
                        onDelete={handleDeleteComparison}
                    />
                </div>
            </section>
        </div>
    );
}

function SummaryStat({ label, value, subtext }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtext}</div>
        </div>
    );
}

function ActiveGoalsWidget({ goals }) {
    const hasGoals = goals && goals.length > 0;
    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Goals</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Financial goals from Money OS.</p>
                </div>
                {hasGoals && (
                    <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300">
                        {goals.length}
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-3">
                {hasGoals ? goals.map((goal, idx) => {
                    const target = Math.abs(Number(goal.target) || 0);
                    const current = Math.abs(Number(goal.current || goal.saved || 0));
                    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                    const done = pct >= 100;
                    return (
                        <div key={goal.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-black text-sm text-slate-900 dark:text-white truncate">{goal.name || goal.title || `Goal ${idx + 1}`}</div>
                                <span className={`text-xs font-black shrink-0 ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-300'}`}>
                                    {pct}%
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            {target > 0 && (
                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {currFmt.format(current)} <span className="text-slate-400">of</span> {currFmt.format(target)}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-500 dark:text-slate-400">
                        No goals yet. Set financial goals in{' '}
                        <Link href="/hub" className="font-bold text-sky-700 dark:text-sky-300 hover:underline">Money OS</Link>.
                    </div>
                )}
            </div>
        </div>
    );
}

function SavedComparisonsWidget({ comparisons, calculatorsMap, onDelete }) {
    const hasComparisons = comparisons && comparisons.length > 0;
    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Saved Comparisons</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Calculator sets saved from the compare workspace.</p>
                </div>
                {hasComparisons && (
                    <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300">
                        {comparisons.length}
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-3">
                {hasComparisons ? comparisons.map((cmp) => {
                    const slugs = cmp.slugs || [];
                    const names = slugs
                        .map((s) => calculatorsMap.get(s)?.title || s)
                        .slice(0, 3);
                    const compareUrl = `/calculators/compare?cmp=${slugs.join(',')}`;
                    const savedDate = cmp.savedAt ? new Date(cmp.savedAt).toLocaleDateString() : '';
                    return (
                        <div key={cmp.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-black text-sm text-slate-900 dark:text-white truncate flex-1">{cmp.name}</div>
                                <button
                                    type="button"
                                    onClick={() => onDelete(cmp.id)}
                                    className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {names.join(' · ')}{slugs.length > 3 ? ` +${slugs.length - 3} more` : ''}
                            </div>
                            {savedDate && <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Saved {savedDate}</div>}
                            <div className="mt-3">
                                <Link
                                    href={compareUrl}
                                    className="text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                                >
                                    Open comparison →
                                </Link>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-500 dark:text-slate-400">
                        No saved comparisons yet.{' '}
                        <Link href="/calculators/compare" className="font-bold text-indigo-700 dark:text-indigo-300 hover:underline">Open the compare workspace</Link>{' '}
                        and click &ldquo;Save to My Tools&rdquo;.
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolsSection({
    title,
    description,
    items,
    emptyLabel,
    actionLabel,
    onAction,
    onToggleFavorite,
    onOpen,
    favoriteSlugs,
}) {
    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
                </div>
                {onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            <div className="mt-4 grid gap-3">
                {items.length > 0 ? items.map((item) => {
                    const isFavorite = favoriteSlugs.includes(item.slug);
                    return (
                        <div key={item.slug} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                        {item.category || 'General'}
                                    </div>
                                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.title}</div>
                                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggleFavorite(item.slug)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${isFavorite
                                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {isFavorite ? 'Saved' : 'Save'}
                                </button>
                            </div>
                            <div className="mt-4">
                                <Link
                                    href={`/calculators/${item.slug}`}
                                    onClick={() => onOpen(item.slug)}
                                    className="text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                                >
                                    Open calculator
                                </Link>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-500 dark:text-slate-400">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
