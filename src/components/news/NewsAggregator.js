'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Share2, Facebook, Twitter, Linkedin, Mail, Copy, Check
} from 'lucide-react';

const NewsAggregator = () => {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();
    const [visibleCount, setVisibleCount] = useState(10);
    const [expandedClusters, setExpandedClusters] = useState(new Set());
    const [activeShareMenu, setActiveShareMenu] = useState(null);
    const [copiedUrl, setCopiedUrl] = useState(null);

    const fetchNews = useCallback(async (isAutoRefresh = false) => {
        if (!isAutoRefresh) setLoading(true);
        try {
            const res = await fetch(`/api/news?category=Finance`);
            if (!res.ok) throw new Error('Failed to fetch news');
            const data = await res.json();
            setNews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!isAutoRefresh) setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch if we're not loading (to avoid double fetch on init)
        fetchNews();

        // Auto-refresh every 45 minutes
        const interval = setInterval(() => fetchNews(true), 2700000);

        return () => clearInterval(interval);
    }, [fetchNews]);

    // Click outside listener for share menu
    useEffect(() => {
        const handleClickOutside = () => setActiveShareMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);




    const handleShare = (e, platform, title, url) => {
        e.preventDefault();
        e.stopPropagation();

        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopiedUrl(url);
                setTimeout(() => setCopiedUrl(null), 2000);
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        setActiveShareMenu(null);
    };


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

    const visibleClusters = (news?.clusters || []).slice(0, visibleCount);

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
            <div className="max-w-6xl mx-auto">
                {/* Financial News Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-4">
                        <span className="text-2xl">📈</span>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Live Updates</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">
                        Financial News
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Stay informed with real-time updates from WSJ, Bloomberg, Financial Times, and 12+ premium sources
                    </p>
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
                                                    <div className="flex items-center gap-6">
                                                        {/* Share Interaction */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setActiveShareMenu(activeShareMenu === idx ? null : idx);
                                                                }}
                                                                className={`flex items-center gap-2 group/btn transition-all duration-300 ${activeShareMenu === idx ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                            >
                                                                <span className="text-[11px] font-black uppercase tracking-widest">Share</span>
                                                                <Share2 className={`w-4 h-4 transition-transform duration-300 ${activeShareMenu === idx ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                                                            </button>

                                                            {/* Premium Share Dropdown */}
                                                            {activeShareMenu === idx && (
                                                                <div
                                                                    className="absolute right-0 top-full mt-3 w-56 bg-black rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right px-2 py-2"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="flex flex-col space-y-1">
                                                                        {[
                                                                            { id: 'facebook', label: 'Facebook', icon: Facebook },
                                                                            { id: 'twitter', label: 'X (Twitter)', icon: Twitter },
                                                                            { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                                                                            { id: 'email', label: 'Email', icon: Mail },
                                                                            { id: 'copy', label: copiedUrl === cluster.main.link ? 'Copied!' : 'Copy', icon: copiedUrl === cluster.main.link ? Check : Copy },
                                                                        ].map((item) => (
                                                                            <button
                                                                                key={item.id}
                                                                                onClick={(e) => handleShare(e, item.id, cluster.main.title, cluster.main.link)}
                                                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 text-white transition-colors text-left group/item"
                                                                            >
                                                                                <item.icon className={`w-4 h-4 ${item.id === 'copy' && copiedUrl === cluster.main.link ? 'text-emerald-400' : 'text-white/60 group-hover/item:text-white'}`} />
                                                                                <span className="text-xs font-bold leading-none">{item.label}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    {/* Simple Pointer/Arrow */}
                                                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-black border-l border-t border-white/10 rotate-45"></div>
                                                                </div>
                                                            )}
                                                        </div>
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

                {(news?.clusters || []).length > 0 ? (
                    visibleCount < (news?.clusters || []).length && (
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
