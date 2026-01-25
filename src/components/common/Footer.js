'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
    const productColumns = [
        {
            title: 'Workspace',
            links: [
                { href: '/hub', label: 'Dashboard' },
                { href: '/track', label: 'Track' },
                { href: '/learn', label: 'Learn' },
                { href: '/my-tools', label: 'My Tools' },
            ],
        },
        {
            title: 'Money Operations',
            links: [
                { href: '/calculators/net-worth-tracker', label: 'Net Worth Tracker' },
                { href: '/calculators/emergency-fund-calculator', label: 'Emergency Fund' },
                { href: '/calculators/debt-avalanche-snowball', label: 'Debt Strategy' },
            ],
        },
        {
            title: 'Modeling Tools',
            links: [
                { href: '/calculators', label: 'Tools Library' },
                { href: '/calculators/compare', label: 'Compare Tools' },
                { href: '/calculators/all', label: 'A-Z Tool Index' },
            ],
        },
    ];

    return (
        <footer className="bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800/30 pt-24 pb-12 transition-colors duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent"></div>

            <div className="max-w-[1920px] mx-auto px-6 sm:px-8 md:px-12 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 border-t border-slate-50 dark:border-slate-800/30 pt-16">
                    <div className="col-span-2 md:col-span-1 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="FinCalc Home">
                            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-teal-600/20">
                                <span className="text-white font-black text-base">F</span>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">FinCalc</span>
                        </Link>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed font-bold uppercase tracking-wide max-w-xs">
                            Personal finance workspace for planning, tracking, modeling, and staying current.
                        </p>
                        <div className="flex gap-2">
                            <span className="text-[9px] font-black px-2.5 py-1 bg-teal-50 dark:bg-teal-500/5 text-teal-600 dark:text-teal-500 rounded-md border border-teal-100 dark:border-teal-500/10 uppercase tracking-widest">App-first</span>
                            <span className="text-[9px] font-black px-2.5 py-1 bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-500 rounded-md border border-blue-100 dark:border-blue-500/10 uppercase tracking-widest">Decision tools</span>
                        </div>
                    </div>

                    {productColumns.map((column) => (
                        <div key={column.title} className="space-y-5">
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-[0.2em]">{column.title}</h3>
                            <ul className="space-y-3">
                                {column.links.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className="text-slate-500 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 text-[11px] font-bold uppercase tracking-wider transition-all inline-block">{item.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-slate-50 dark:border-slate-800/20 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-3 text-[10px] font-bold text-slate-4300 dark:text-slate-600 uppercase tracking-widest">
                        <p>© {new Date().getFullYear()} FinCalc Intelligence</p>
                        <p className="flex items-center text-teal-600/60 dark:text-teal-500/50">
                            Verified v2.4.0
                        </p>
                        <Link href="/calculators" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tools Library</Link>
                        <Link href="/hub" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/track" className="hover:text-slate-900 dark:hover:text-white transition-colors">Track</Link>
                        <Link href="/learn" className="hover:text-slate-900 dark:hover:text-white transition-colors">Learn</Link>
                        <Link href="/my-tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">My Tools</Link>
                        <Link href="/calculators/all" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tool Index</Link>
                        <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
                    </div>

                    <div className="text-[10px] text-slate-300 dark:text-slate-700 font-medium text-center md:text-right leading-relaxed max-w-lg">
                        Informational purposes only. No financial advice provided.
                        <br className="hidden sm:block" /> Consult a professional before major investment decisions.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
