'use client';

import React from 'react';

/**
 * InvestmentReturnSummary
 *
 * Lets users log multiple investment positions (lump-sum or SIP), then
 * computes CAGR and projected future value for each. Persisted in localStorage.
 */

const STORAGE_KEY = 'fincalc_investments_v1';

const DEFAULT_INVESTMENTS = [
    { id: 'idx1', name: 'Index Fund (Nifty 50)', type: 'lump', principal: 100000, currentValue: 142000, years: 4, emoji: '📈' },
    { id: 'sip1', name: 'SIP — Mid Cap Fund', type: 'sip', monthlyAmount: 5000, months: 24, rate: 14, emoji: '🔄' },
];

function loadInvestments() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return DEFAULT_INVESTMENTS;
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : DEFAULT_INVESTMENTS;
    } catch {
        return DEFAULT_INVESTMENTS;
    }
}

function saveInvestments(list) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

/**  CAGR = (FV/PV)^(1/n) - 1  */
function calcCAGR(pv, fv, years) {
    if (!pv || !fv || !years || pv <= 0 || years <= 0) return null;
    return (Math.pow(fv / pv, 1 / years) - 1) * 100;
}

/** Future value of SIP: FV = PMT × ((1+r)^n - 1) / r */
function sipFV(monthly, monthlyRate, months) {
    if (!monthlyRate) return monthly * months;
    return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

function cagrColor(cagr) {
    if (cagr === null) return 'text-slate-500';
    if (cagr >= 15) return 'text-emerald-700 dark:text-emerald-300';
    if (cagr >= 8) return 'text-sky-700 dark:text-sky-300';
    if (cagr >= 0) return 'text-amber-700 dark:text-amber-300';
    return 'text-rose-700 dark:text-rose-300';
}

const usd = (n) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const pctFmt = (n) => n === null ? '—' : `${n.toFixed(1)}%`;

export default function InvestmentReturnSummary() {
    const [investments, setInvestments] = React.useState(DEFAULT_INVESTMENTS);
    const [mounted, setMounted] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [addType, setAddType] = React.useState('lump');
    const [form, setForm] = React.useState({ name: '', emoji: '💼', principal: '', currentValue: '', years: '', monthlyAmount: '', months: '', rate: '' });

    React.useEffect(() => {
        setMounted(true);
        setInvestments(loadInvestments());
    }, []);

    const addInvestment = () => {
        if (!form.name.trim()) return;
        const next = [...investments, { ...form, id: `inv_${Date.now()}`, type: addType }];
        setInvestments(next);
        saveInvestments(next);
        setAdding(false);
        setForm({ name: '', emoji: '💼', principal: '', currentValue: '', years: '', monthlyAmount: '', months: '', rate: '' });
    };

    const removeInvestment = (id) => {
        const next = investments.filter((i) => i.id !== id);
        setInvestments(next);
        saveInvestments(next);
    };

    const updateInvestment = (id, field, val) => {
        const next = investments.map((inv) =>
            inv.id === id ? { ...inv, [field]: field === 'name' || field === 'emoji' ? val : Number(val) || 0 } : inv
        );
        setInvestments(next);
        saveInvestments(next);
    };

    // Portfolio summary
    const totalInvested = investments.reduce((s, inv) => {
        if (inv.type === 'lump') return s + (Number(inv.principal) || 0);
        return s + (Number(inv.monthlyAmount) || 0) * (Number(inv.months) || 0);
    }, 0);
    const totalCurrent = investments.reduce((s, inv) => {
        if (inv.type === 'lump') return s + (Number(inv.currentValue) || 0);
        const r = (Number(inv.rate) || 12) / 100 / 12;
        return s + sipFV(Number(inv.monthlyAmount) || 0, r, Number(inv.months) || 0);
    }, 0);
    const overallGain = totalCurrent - totalInvested;

    if (!mounted) return null;

    return (
        <div className="mt-8 rounded-2xl border border-sky-200 dark:border-sky-800/50 bg-sky-50/60 dark:bg-sky-950/20 p-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">Investment Returns</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {investments.length} investment{investments.length !== 1 ? 's' : ''} · {usd(totalInvested)} invested · {usd(overallGain > 0 ? overallGain : 0)} gain
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    className="rounded-full border border-sky-200 dark:border-sky-700 px-3 py-1.5 text-xs font-black text-sky-700 dark:text-sky-300"
                >
                    {adding ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {/* Add form */}
            {adding && (
                <div className="mt-4 rounded-2xl border border-sky-200 dark:border-sky-700 bg-white/70 dark:bg-sky-950/30 p-4 space-y-3">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setAddType('lump')}
                            className={`rounded-full px-3 py-1 text-xs font-black ${addType === 'lump' ? 'bg-sky-700 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            Lump Sum
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddType('sip')}
                            className={`rounded-full px-3 py-1 text-xs font-black ${addType === 'sip' ? 'bg-sky-700 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            SIP / Recurring
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <input className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Investment name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        {addType === 'lump' ? (
                            <>
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Principal invested ($)" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} />
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Current value ($)" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} />
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Years held" value={form.years} onChange={(e) => setForm({ ...form, years: e.target.value })} />
                            </>
                        ) : (
                            <>
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Monthly amount ($)" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} />
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Duration (months)" value={form.months} onChange={(e) => setForm({ ...form, months: e.target.value })} />
                                <input type="number" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm" placeholder="Expected annual return %" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
                            </>
                        )}
                    </div>
                    <button type="button" onClick={addInvestment} className="rounded-lg bg-sky-700 dark:bg-sky-600 px-4 py-2 text-xs font-black text-white">Add Investment</button>
                </div>
            )}

            {/* Investment cards */}
            <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {investments.map((inv) => {
                    let cagr = null;
                    let currentVal = 0;
                    let invested = 0;
                    let gain = 0;

                    if (inv.type === 'lump') {
                        invested = Number(inv.principal) || 0;
                        currentVal = Number(inv.currentValue) || 0;
                        cagr = calcCAGR(invested, currentVal, Number(inv.years));
                        gain = currentVal - invested;
                    } else {
                        const monthly = Number(inv.monthlyAmount) || 0;
                        const months = Number(inv.months) || 0;
                        const r = (Number(inv.rate) || 12) / 100 / 12;
                        invested = monthly * months;
                        currentVal = sipFV(monthly, r, months);
                        gain = currentVal - invested;
                        cagr = Number(inv.rate) || null;
                    }

                    const gainPct = invested > 0 ? ((gain / invested) * 100) : 0;
                    const cls = cagrColor(cagr);

                    return (
                        <div key={inv.id} className="rounded-2xl border border-white/80 dark:border-sky-900/40 bg-white/80 dark:bg-sky-950/30 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{inv.emoji}</span>
                                    <span className="font-black text-sm text-slate-900 dark:text-white leading-tight">{inv.name}</span>
                                </div>
                                <button type="button" onClick={() => removeInvestment(inv.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 text-lg leading-none">×</button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Invested</div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{usd(invested)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Current Value</div>
                                    <input
                                        type="number" min="0"
                                        value={inv.type === 'lump' ? (Number(inv.currentValue) || '') : Math.round(currentVal)}
                                        disabled={inv.type === 'sip'}
                                        onChange={(e) => updateInvestment(inv.id, 'currentValue', e.target.value)}
                                        className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm font-bold disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">CAGR / Return</span>
                                    <div className={`text-lg font-black ${cls}`}>{pctFmt(cagr)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Gain</span>
                                    <div className={`text-lg font-black ${gain >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                        {gain >= 0 ? '+' : ''}{usd(gain)} ({gainPct.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{inv.type === 'sip' ? `SIP · ${inv.months}mo · ${inv.rate}% p.a.` : `Lump sum · ${inv.years}yr`}</div>
                        </div>
                    );
                })}
            </div>

            {investments.length === 0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-sky-300 dark:border-sky-700 p-5 text-center text-sm text-sky-700 dark:text-sky-300">
                    No investments tracked. Click &ldquo;+ Add&rdquo; to begin.
                </div>
            )}

            {/* Portfolio totals */}
            {investments.length > 0 && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total Invested', value: usd(totalInvested) },
                        { label: 'Current Value', value: usd(totalCurrent) },
                        { label: 'Total Gain', value: `${usd(overallGain)} (${totalInvested > 0 ? ((overallGain / totalInvested) * 100).toFixed(1) : 0}%)` },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-white/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 p-3">
                            <div className="text-[10px] font-black uppercase tracking-wider text-sky-500">{label}</div>
                            <div className="mt-1 text-base font-black text-slate-900 dark:text-white">{value}</div>
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">SIP values use expected rate for projection · Data saved locally.</p>
        </div>
    );
}
