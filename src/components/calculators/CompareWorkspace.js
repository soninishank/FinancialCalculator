'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftRight, ArrowRight, BookmarkPlus, Copy, Download, Plus, X } from 'lucide-react';
import calculators from '../../utils/calculatorsManifest';
import { downloadCSV } from '../../utils/export';
import { saveComparison } from '../../utils/calculatorPrefs';

const MAX_COMPARE = 4;

function normalizeKeywords(keywords) {
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
        return keywords.split(',').map((k) => k.trim()).filter(Boolean);
    }
    return [];
}

function bestForLabel(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('loan')) return 'Debt planning & affordability';
    if (cat.includes('tax') || cat.includes('regional')) return 'Tax estimation & paychecks';
    if (cat.includes('sip') || cat.includes('invest')) return 'Long-term wealth building';
    if (cat.includes('retirement') || cat.includes('fire')) return 'Retirement corpus planning';
    if (cat.includes('planner') || cat.includes('decision')) return 'What-if decision making';
    return 'General financial analysis';
}

export default function CompareWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedSlugs, setSelectedSlugs] = React.useState([]);
    const [picker, setPicker] = React.useState(null);
    const [copied, setCopied] = React.useState(false);
    const [saveName, setSaveName] = React.useState(null);
    const [saveMode, setSaveMode] = React.useState(false);
    const [savedBadge, setSavedBadge] = React.useState(false);

    const calculatorMap = React.useMemo(() => new Map(calculators.map((item) => [item.slug, item])), []);

    React.useEffect(() => {
        const cmp = searchParams.get('cmp') || '';
        const fromUrl = cmp
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .filter((slug, idx, arr) => arr.indexOf(slug) === idx)
            .slice(0, MAX_COMPARE)
            .filter((slug) => calculatorMap.has(slug));
        setSelectedSlugs(fromUrl);
    }, [searchParams, calculatorMap]);

    const compared = React.useMemo(
        () => selectedSlugs.map((slug) => calculatorMap.get(slug)).filter(Boolean),
        [selectedSlugs, calculatorMap]
    );

    const updateUrl = (slugs) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slugs.length) params.set('cmp', slugs.join(','));
        else params.delete('cmp');
        router.replace(`/calculators/compare${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    };

    const addSlug = (slug) => {
        if (!slug || selectedSlugs.includes(slug) || selectedSlugs.length >= MAX_COMPARE) return;
        const next = [...selectedSlugs, slug];
        setSelectedSlugs(next);
        setPicker('');
        updateUrl(next);
    };

    const removeSlug = (slug) => {
        const next = selectedSlugs.filter((s) => s !== slug);
        setSelectedSlugs(next);
        updateUrl(next);
    };

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= selectedSlugs.length) return;
        const next = [...selectedSlugs];
        const temp = next[index];
        next[index] = next[target];
        next[target] = temp;
        setSelectedSlugs(next);
        updateUrl(next);
    };

    const copyLink = async () => {
        const url = `${window.location.origin}/calculators/compare?cmp=${selectedSlugs.join(',')}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt('Copy compare link', url);
        }
    };

    const exportComparison = () => {
        const rows = compared.map((item) => {
            const keywords = normalizeKeywords(item.keywords).slice(0, 8).join(' | ');
            return [
                item.title,
                item.category || 'General',
                bestForLabel(item.category),
                keywords,
                item.description || '',
            ];
        });
        downloadCSV(rows, ['Calculator', 'Category', 'Best For', 'Top Keywords', 'Description'], 'calculator_comparison.csv');
    };

    const handleSaveComparison = () => {
        if (!selectedSlugs.length) return;
        const name = saveName.trim() || `Comparison ${new Date().toLocaleDateString()}`;
        saveComparison({
            id: `cmp_${Date.now()}`,
            name,
            slugs: selectedSlugs,
            savedAt: new Date().toISOString(),
        });
        setSaveMode(false);
        setSaveName('');
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
    };

    const availableToAdd = calculators
        .filter((item) => !selectedSlugs.includes(item.slug))
        .filter((item) => {
            if (!picker.trim()) return true;
            const q = picker.toLowerCase();
            return (
                item.title.toLowerCase().includes(q) ||
                (item.category || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q)
            );
        })
        .slice(0, 20);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Calculator Compare Workspace</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-2">
                    Compare up to {MAX_COMPARE} calculators side-by-side and quickly jump into the one you need.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[240px]">
                        <input
                            value={picker}
                            onChange={(e) => setPicker(e.target.value)}
                            placeholder="Add calculator by name or category..."
                            className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-950"
                        />
                        {!!picker && (
                            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 max-h-72 overflow-auto shadow-xl">
                                {availableToAdd.map((item) => (
                                    <button
                                        key={item.slug}
                                        onClick={() => addSlug(item.slug)}
                                        className="w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b last:border-b-0 border-gray-100 dark:border-slate-800"
                                    >
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{item.category}</p>
                                    </button>
                                ))}
                                {!availableToAdd.length && (
                                    <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400">No matching calculators.</div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={copyLink}
                        disabled={!selectedSlugs.length}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 disabled:opacity-40"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied' : 'Copy compare link'}
                    </button>
                    <button
                        onClick={exportComparison}
                        disabled={!compared.length}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>

                    {/* Save comparison */}
                    {!saveMode ? (
                        <button
                            onClick={() => setSaveMode(true)}
                            disabled={!selectedSlugs.length}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 disabled:opacity-40"
                        >
                            <BookmarkPlus className="w-4 h-4" />
                            {savedBadge ? 'Saved ✓' : 'Save to My Tools'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComparison(); if (e.key === 'Escape') setSaveMode(false); }}
                                placeholder="Name this comparison…"
                                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-950 w-48"
                            />
                            <button onClick={handleSaveComparison} className="text-xs font-black text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                Save
                            </button>
                            <button onClick={() => setSaveMode(false)} className="text-xs text-slate-500 dark:text-slate-400">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!compared.length ? (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                    <p className="text-gray-600 dark:text-slate-400 mb-4">No calculators selected yet.</p>
                    <Link href="/calculators" className="inline-flex items-center gap-2 font-bold text-teal-700 dark:text-teal-300">
                        <ArrowRight className="w-4 h-4" />
                        Browse calculators and shortlist to compare
                    </Link>
                </div>
            ) : (
                <>
                    <div className={`grid gap-4 ${compared.length >= 4 ? 'xl:grid-cols-4' : compared.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {compared.map((item, idx) => {
                            const topKeywords = normalizeKeywords(item.keywords).slice(0, 6);
                            return (
                                <div key={item.slug} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-slate-400">{item.category}</span>
                                        <button onClick={() => removeSlug(item.slug)} className="text-gray-400 hover:text-rose-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h2 className="mt-2 text-lg font-black text-gray-900 dark:text-white">{item.title}</h2>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{item.description}</p>
                                    <p className="mt-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Best for: {bestForLabel(item.category)}</p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {topKeywords.map((k) => (
                                            <span key={`${item.slug}-${k}`} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/calculators/${item.slug}`}
                                            className="text-sm font-bold text-teal-700 dark:text-teal-300"
                                        >
                                            Open
                                        </Link>
                                        <button
                                            onClick={() => move(idx, -1)}
                                            disabled={idx === 0}
                                            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-40"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={() => move(idx, 1)}
                                            disabled={idx === compared.length - 1}
                                            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-40"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 overflow-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-slate-300">Quick Comparison Table</h3>
                        </div>
                        <table className="min-w-[760px] w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800">
                                    <th className="text-left px-3 py-2 font-black text-gray-700 dark:text-slate-300">Attribute</th>
                                    {compared.map((item) => (
                                        <th key={`head-${item.slug}`} className="text-left px-3 py-2 font-black text-gray-700 dark:text-slate-300">{item.title}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow label="Category" values={compared.map((item) => item.category || 'General')} />
                                <ComparisonRow label="Best for" values={compared.map((item) => bestForLabel(item.category))} />
                                <ComparisonRow label="Description length" values={compared.map((item) => `${(item.description || '').length} chars`)} />
                                <ComparisonRow label="Keyword count" values={compared.map((item) => `${normalizeKeywords(item.keywords).length}`)} />
                                <ComparisonRow label="Primary keywords" values={compared.map((item) => normalizeKeywords(item.keywords).slice(0, 3).join(', ') || '-')} />
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="mt-6">
                <Link href="/calculators" className="text-sm font-bold text-gray-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300">
                    ← Back to calculator catalog
                </Link>
            </div>
        </div>
    );
}

function ComparisonRow({ label, values }) {
    return (
        <tr className="border-t border-gray-100 dark:border-slate-800">
            <td className="px-3 py-2 font-semibold text-gray-700 dark:text-slate-300">{label}</td>
            {values.map((value, idx) => (
                <td key={`${label}-${idx}`} className="px-3 py-2 text-gray-600 dark:text-slate-400">
                    {value}
                </td>
            ))}
        </tr>
    );
}
