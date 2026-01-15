'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const NewsAggregator = () => {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { isDarkMode } = useTheme();
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [visibleCount, setVisibleCount] = useState(10);
    const [expandedClusters, setExpandedClusters] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState('All');

    const CATEGORIES = ['All', 'Finance', 'Technology', 'Sports', 'Science', 'Entertainment', 'World'];

    const fetchNews = useCallback(async (category = selectedCategory, isAutoRefresh = false) => {
        if (!isAutoRefresh) setLoading(true);
        try {
            const res = await fetch(`/api/news?category=${category}`);
            if (!res.ok) throw new Error('Failed to fetch news');
            const data = await res.json();
            setNews(data);
            setLastRefresh(Date.now());
        } catch (err) {
            setError(err.message);
        } finally {
            if (!isAutoRefresh) setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        // Only fetch if we're not loading (to avoid double fetch on init)
        fetchNews();

        // Auto-refresh every 45 minutes
        const interval = setInterval(() => fetchNews(selectedCategory, true), 2700000);

        return () => clearInterval(interval);
    }, [fetchNews, selectedCategory]);

    // Initial load from localStorage
    useEffect(() => {
        const savedCategory = localStorage.getItem('news-category');
        if (savedCategory && CATEGORIES.includes(savedCategory)) {
            setSelectedCategory(savedCategory);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('news-category', selectedCategory);
    }, [selectedCategory]);



    const handleShare = async (e, title, url) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // Filter and Search Logic
    const allFilteredClusters = useMemo(() => {
        let clusters = news?.clusters || [];

        if (selectedCategory !== 'All') {
            clusters = clusters.filter(c => c.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            clusters = clusters.filter(c =>
                c.main.title.toLowerCase().includes(query) ||
                c.main.description?.toLowerCase().includes(query) ||
                c.main.source.toLowerCase().includes(query)
            );
        }

        return clusters;
    }, [news, selectedCategory, searchQuery]);

    if (loading) return (
        <div className={`flex flex-col items-center justify-center py-24 space-y-5 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-gray-900'}`}>
            <div className={`w-10 h-10 border-4 ${isDarkMode ? 'border-slate-800 border-t-blue-400' : 'border-slate-200 border-t-blue-600'} rounded-full animate-spin`}></div>
            <p className="text-sm font-bold tracking-widest uppercase opacity-50">Syncing Intelligence</p>
        </div>
    );

    if (error) return (
        <div className={`text-center py-16 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            <p className="font-bold mb-4">Error: {error}</p>
            <button onClick={() => fetchNews()} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Try Again</button>
        </div>
    );

    const visibleClusters = allFilteredClusters.slice(0, visibleCount);

    const groupClustersByTime = (clusters) => {
        const now = Date.now();
        const groups = {
            'Last Hour': [],
            'Today': [],
            'Older': []
        };

        clusters.forEach(c => {
            const diff = now - c.main.timestamp;
            if (diff < 3600000) groups['Last Hour'].push(c);
            else if (diff < 86400000) groups['Today'].push(c);
            else groups['Older'].push(c);
        });

        return groups;
    };

    const groupedClusters = groupClustersByTime(visibleClusters);

    return (
        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
            <div className="max-w-6xl mx-auto px-4">
                {/* News Aggregator Control Hub - Portal */}
                <div className={`relative mb-12 p-8 rounded-[2.5rem] border transition-all duration-500 ${isDarkMode
                    ? 'bg-slate-900/60 border-slate-800/50 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]'
                    : 'bg-white/70 border-white/40 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]'
                    }`}>
                    <div className="flex flex-col items-center space-y-8">
                        {/* Mode Row */}
                        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        </div>

                        {/* Premium Category Selector */}
                        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setVisibleCount(10); }}
                                    className={`px-6 py-3 text-[11px] font-black rounded-xl transition-all uppercase tracking-[0.15em] border ${selectedCategory === cat
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30'
                                        : isDarkMode
                                            ? 'bg-slate-950/20 border-slate-800/40 text-slate-500 hover:text-slate-200 hover:bg-slate-900/50'
                                            : 'bg-white/40 border-slate-200/60 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-white/80'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Stream */}
                <div className="space-y-16">
                    {Object.entries(groupedClusters).map(([timeGroup, clusters]) => (
                        clusters.length > 0 && (
                            <div key={timeGroup}>
                                <div className="flex items-center gap-5 mb-10">
                                    <h2 className={`text-[12px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                                        {timeGroup}
                                    </h2>
                                    <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                                </div>

                                <div className="grid gap-12">
                                    {clusters.map((cluster, idx) => (
                                        <div key={idx} className={`group relative flex flex-col md:flex-row gap-8 p-6 md:-m-6 rounded-[2rem] transition-all duration-500 overflow-hidden ${isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]'
                                            }`}>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex flex-wrap gap-2.5">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                            }`}>
                                                            {cluster.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                                                        <button
                                                            onClick={(e) => handleShare(e, cluster.main.title, cluster.main.link)}
                                                            className="p-2.5 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all hover:scale-110 active:scale-90"
                                                            title="Share Story"
                                                        >
                                                            🔗
                                                        </button>
                                                    </div>
                                                </div>

                                                <a href={cluster.main.link} target="_blank" rel="noopener noreferrer" className="block mb-4">
                                                    <h3 className={`text-2xl md:text-3xl font-black leading-snug tracking-tight group-hover:text-blue-500 transition-colors duration-300 ${isDarkMode ? 'text-slate-50' : 'text-[#002b4d]'
                                                        }`}>
                                                        {cluster.main.title}
                                                    </h3>
                                                </a>

                                                <div className="flex items-center gap-3 text-xs font-bold mb-5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                                                        {cluster.main.source}
                                                    </span>
                                                    {cluster.main.author && (
                                                        <>
                                                            <span className="text-slate-400 opacity-30">•</span>
                                                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                                                                By {cluster.main.author}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="text-slate-400 opacity-30">•</span>
                                                    <span className="text-slate-400 font-medium tracking-tight whitespace-nowrap">{formatTime(cluster.main.timestamp)}</span>
                                                </div>

                                                {cluster.main.description && (
                                                    <p className={`text-[15px] leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 opacity-80 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {cluster.main.description}
                                                    </p>
                                                )}

                                                {/* AI-Enriched Tags & Entities */}
                                                {(cluster.tags || cluster.entities) && (
                                                    <div className="flex flex-wrap items-center gap-2 mb-8">
                                                        {/* Companies / People Highlighting */}
                                                        {cluster.entities?.Companies?.slice(0, 2).map(company => (
                                                            <span key={company} className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                                🏢 {company}
                                                            </span>
                                                        ))}
                                                        {cluster.entities?.People?.slice(0, 1).map(person => (
                                                            <span key={person} className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                                                👤 {person}
                                                            </span>
                                                        ))}
                                                        {/* General AI Tags */}
                                                        {cluster.tags?.slice(0, 3).map(tag => (
                                                            <span key={tag} className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter opacity-40 hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                                # {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-auto">
                                                    {cluster.related.length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] font-bold">
                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                                                                <span className="uppercase tracking-widest">More Coverage</span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-1.5">
                                                                {(expandedClusters.has(idx) ? cluster.related : cluster.related.slice(0, 5)).map((story, ridx) => (
                                                                    <React.Fragment key={ridx}>
                                                                        <div className="relative group/tooltip inline-block">
                                                                            <a
                                                                                href={story.link}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className={`hover:text-blue-500 underline decoration-slate-400/30 underline-offset-4 transition-all ${isDarkMode ? 'text-slate-300' : 'text-slate-900 font-black'}`}>
                                                                                {story.source}
                                                                            </a>
                                                                            {/* Hover Tooltip */}
                                                                            <div className={`absolute bottom-full left-0 mb-2 w-72 p-4 rounded-xl shadow-2xl border opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                                                                }`}>
                                                                                <div className="text-xs font-bold mb-1 text-slate-500">
                                                                                    {story.author ? `${story.author} / ${story.source}:` : `${story.source}:`}
                                                                                </div>
                                                                                <div className={`text-sm font-bold leading-snug ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                                                                    {story.title}
                                                                                </div>
                                                                                {/* Arrow */}
                                                                                <div className={`absolute top-full left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${isDarkMode ? 'border-t-slate-800' : 'border-t-white'
                                                                                    }`}></div>
                                                                            </div>
                                                                        </div>
                                                                        {ridx < (expandedClusters.has(idx) ? cluster.related.length : Math.min(cluster.related.length, 5)) - 1 && <span className="text-slate-300">•</span>}
                                                                    </React.Fragment>
                                                                ))}
                                                                {cluster.related.length > 5 && !expandedClusters.has(idx) && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpandedClusters(prev => new Set([...prev, idx]));
                                                                        }}
                                                                        className="text-slate-400 hover:text-blue-500 opacity-70 hover:opacity-100 italic font-medium ml-1 transition-all underline decoration-slate-400/30 underline-offset-4 cursor-pointer">
                                                                        and {cluster.related.length - 5} more
                                                                    </button>
                                                                )}
                                                                {expandedClusters.has(idx) && cluster.related.length > 5 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpandedClusters(prev => {
                                                                                const newSet = new Set(prev);
                                                                                newSet.delete(idx);
                                                                                return newSet;
                                                                            });
                                                                        }}
                                                                        className="text-slate-400 hover:text-blue-500 opacity-70 hover:opacity-100 italic font-medium ml-1 transition-all underline decoration-slate-400/30 underline-offset-4 cursor-pointer">
                                                                        show less
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {cluster.main.imageUrl && (
                                                <div className="w-full md:w-64 h-48 md:h-60 flex-shrink-0 relative overflow-hidden rounded-[1.5rem] shadow-sm transform-gpu group-hover:scale-[1.02] transition-transform duration-700">
                                                    <a href={cluster.main.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                        <img
                                                            src={cluster.main.imageUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 saturate-[0.8] group-hover:saturate-100"
                                                            loading="lazy"
                                                            onError={(e) => e.target.parentElement.style.display = 'none'}
                                                        />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Intelligent Loading */}
                {allFilteredClusters.length > 0 ? (
                    visibleCount < allFilteredClusters.length && (
                        <div className="mt-20 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className={`group relative px-10 py-4 rounded-2xl font-black text-[12px] transition-all uppercase tracking-widest overflow-hidden active:scale-95 ${isDarkMode
                                    ? 'bg-slate-800 text-slate-300 hover:text-white'
                                    : 'bg-white border-2 border-slate-100 text-slate-500 hover:text-slate-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]'
                                    }`}
                            >
                                <span className="relative z-10">Expand the Stream</span>
                                <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-50'
                                    }`}></div>
                            </button>
                        </div>
                    )
                ) : (
                    <div className="py-20 text-center">
                        <p className={`text-xl font-black italic ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>No signals matching your criteria.</p>
                    </div>
                )}

                <div className={`mt-24 pt-10 border-t text-center text-[10px] font-black uppercase tracking-[0.5em] transition-opacity duration-1000 ${isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-200 text-slate-400'
                    }`}>
                    Omni-Aggregator • {allFilteredClusters.length} distinct events currently tracked
                </div>
            </div>
        </div>
    );
};

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 30000) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export default NewsAggregator;
