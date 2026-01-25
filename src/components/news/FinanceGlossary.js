'use client';

import React from 'react';

const TERMS = [
    { term: 'CAGR', full: 'Compound Annual Growth Rate', definition: 'The rate at which an investment grows from start to end if it grew at a steady compounded rate each year. Formula: (End/Start)^(1/n) − 1.' },
    { term: 'XIRR', full: 'Extended Internal Rate of Return', definition: 'Annualized return for irregular cash flows (e.g., monthly SIPs with different dates). More accurate than CAGR for SIP portfolios.' },
    { term: 'SIP', full: 'Systematic Investment Plan', definition: 'A method of investing a fixed amount at regular intervals (usually monthly) into a mutual fund, leveraging rupee cost averaging.' },
    { term: 'EMI', full: 'Equated Monthly Installment', definition: 'Fixed monthly payment on a loan comprising a principal and interest portion, calculated so the loan is fully repaid by the end of the tenure.' },
    { term: 'DTI', full: 'Debt-to-Income Ratio', definition: 'Total monthly debt payments divided by gross monthly income. Lenders use this to assess creditworthiness — keep it below 36% for healthy finances.' },
    { term: 'SWR', full: 'Safe Withdrawal Rate', definition: 'The percentage of a retirement portfolio that can be withdrawn annually without running out of money. The classic "4% Rule" is the most widely cited benchmark.' },
    { term: 'ROI', full: 'Return on Investment', definition: 'Net profit divided by cost of investment, expressed as a percentage. Answers: "How much did I make relative to what I put in?"' },
    { term: 'NAV', full: 'Net Asset Value', definition: 'The per-unit price of a mutual fund, calculated daily as (Total Assets − Liabilities) ÷ Number of Units.' },
    { term: 'P/E Ratio', full: 'Price-to-Earnings Ratio', definition: 'A stock\'s current price divided by its earnings per share. A high P/E may indicate overvaluation or strong growth expectations.' },
    { term: 'Expense Ratio', full: 'Expense Ratio', definition: 'Annual fee charged by a mutual fund or ETF, expressed as a % of AUM. Even 0.5% difference compounded over decades can significantly erode returns.' },
    { term: 'FD', full: 'Fixed Deposit', definition: 'A savings instrument where a bank pays a guaranteed interest rate over a fixed tenure. Principal is fully protected (up to DICGC limits in India).' },
    { term: 'PPF', full: 'Public Provident Fund', definition: 'A government-backed long-term savings scheme in India with a 15-year lock-in, tax-free interest, and EEE (Exempt-Exempt-Exempt) tax status.' },
    { term: 'NPS', full: 'National Pension System', definition: 'A voluntary, long-term retirement savings scheme in India regulated by PFRDA. Features market-linked returns and partial tax deduction under Section 80CCD.' },
    { term: 'SWP', full: 'Systematic Withdrawal Plan', definition: 'A facility that lets you redeem a fixed amount from a mutual fund at regular intervals — the inverse of a SIP, useful for generating regular income in retirement.' },
    { term: 'LTCG', full: 'Long-Term Capital Gains', definition: 'Profit from selling an asset held beyond a specified period (e.g., 1 year for equity in India). Taxed at a lower rate than short-term gains.' },
    { term: 'LTV', full: 'Loan-to-Value Ratio', definition: 'Loan amount as a percentage of the asset\'s market value. A lower LTV signals less risk for lenders and can result in better interest rates.' },
    { term: 'Inflation', full: 'Inflation', definition: 'The rate at which the general price level rises over time, eroding purchasing power. Your investment returns must beat inflation to create real wealth.' },
    { term: 'AUM', full: 'Assets Under Management', definition: 'The total market value of investments managed by a fund house or advisor. Larger AUM may signal trust but can sometimes constrain fund flexibility.' },
    { term: 'FIRE', full: 'Financial Independence, Retire Early', definition: 'A lifestyle movement aimed at saving and investing aggressively (typically 50–70% of income) to retire far earlier than the conventional age 60.' },
    { term: 'ETF', full: 'Exchange-Traded Fund', definition: 'A basket of securities (like an index fund) that trades on a stock exchange throughout the day. Combines diversification of mutual funds with liquidity of stocks.' },
];

export default function FinanceGlossary() {
    const [query, setQuery] = React.useState('');

    const filtered = React.useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return TERMS;
        return TERMS.filter(
            (t) =>
                t.term.toLowerCase().includes(q) ||
                t.full.toLowerCase().includes(q) ||
                t.definition.toLowerCase().includes(q)
        );
    }, [query]);

    return (
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-700 dark:text-indigo-300">Finance Glossary</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Key terms, plainly explained</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{TERMS.length} concepts — search to filter.</p>
                </div>
                <div className="relative sm:w-64">
                    <input
                        id="glossary-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search terms…"
                        className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-4 py-2 pl-9 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>

            {/* Grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.length > 0 ? filtered.map((item) => (
                    <GlossaryCard key={item.term} {...item} query={query} />
                )) : (
                    <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
                        No terms match &ldquo;{query}&rdquo;.
                    </div>
                )}
            </div>
        </div>
    );
}

function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded px-0.5">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

function GlossaryCard({ term, full, definition, query }) {
    const [flipped, setFlipped] = React.useState(false);

    return (
        <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            aria-label={`${term} — click to ${flipped ? 'show abbreviation' : 'see definition'}`}
            className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200 group"
        >
            {!flipped ? (
                <>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">{highlight(term, query)}</div>
                    <div className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">{highlight(full, query)}</div>
                    <div className="mt-3 text-[11px] font-bold text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        Tap for definition →
                    </div>
                </>
            ) : (
                <>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300 mb-2">{term}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{definition}</p>
                    <div className="mt-3 text-[11px] font-bold text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        Tap to collapse ↑
                    </div>
                </>
            )}
        </button>
    );
}
