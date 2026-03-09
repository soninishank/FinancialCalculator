'use client';

import React from 'react';

const CONVERTER_KEY = 'fincalc_currency_converter_v1';

/* ── Static exchange rates relative to USD ── */
const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92 },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.79 },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 149.5 },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36 },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.54 },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.88 },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.24 },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.12 },
    { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', rate: 17.15 },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', rate: 4.97 },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', rate: 1325 },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.34 },
    { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', rate: 7.82 },
    { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', rate: 10.55 },
    { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', rate: 10.42 },
    { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', rate: 6.88 },
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', rate: 1.63 },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.63 },
    { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', rate: 30.25 },
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rate: 91.50 },
    { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', rate: 3.98 },
    { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', rate: 35.20 },
    { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', rate: 15600 },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', rate: 4.72 },
    { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', rate: 55.80 },
    { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', rate: 22.85 },
    { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', rate: 3.67 },
    { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', rate: 880 },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.67 },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75 },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1550 },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', rate: 30.90 },
];

const rateMap = Object.fromEntries(CURRENCIES.map(c => [c.code, c.rate]));

function convert(amount, from, to) {
    if (!amount || !rateMap[from] || !rateMap[to]) return 0;
    return (amount / rateMap[from]) * rateMap[to];
}

function loadState() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CONVERTER_KEY) : null;
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveState(state) {
    try { window.localStorage.setItem(CONVERTER_KEY, JSON.stringify(state)); } catch { /* noop */ }
}

function formatResult(value, code) {
    const decimals = ['JPY', 'KRW', 'IDR', 'CLP', 'NGN'].includes(code) ? 0 : 2;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export default function CurrencyConverterWidget() {
    const [mounted, setMounted] = React.useState(false);
    const [from, setFrom] = React.useState('USD');
    const [to, setTo] = React.useState('EUR');
    const [amount, setAmount] = React.useState('1000');
    const [favorites, setFavorites] = React.useState([]);
    const [history, setHistory] = React.useState([]);

    React.useEffect(() => {
        setMounted(true);
        const saved = loadState();
        if (saved.from) setFrom(saved.from);
        if (saved.to) setTo(saved.to);
        if (saved.amount) setAmount(saved.amount);
        if (Array.isArray(saved.favorites)) setFavorites(saved.favorites);
        if (Array.isArray(saved.history)) setHistory(saved.history);
    }, []);

    const result = React.useMemo(() => convert(Number(amount) || 0, from, to), [amount, from, to]);

    const swap = () => {
        setFrom(to);
        setTo(from);
        persist({ from: to, to: from });
    };

    const persist = (overrides = {}) => {
        const state = { from, to, amount, favorites, history, ...overrides };
        saveState(state);
    };

    const handleConvert = () => {
        const entry = { from, to, amount: Number(amount) || 0, result, ts: Date.now() };
        const newHistory = [entry, ...history].slice(0, 10);
        setHistory(newHistory);
        persist({ history: newHistory });
    };

    const toggleFavorite = (pair) => {
        const key = `${pair.from}-${pair.to}`;
        const next = favorites.includes(key) ? favorites.filter(f => f !== key) : [...favorites, key];
        setFavorites(next);
        persist({ favorites: next });
    };

    const applyFavorite = (key) => {
        const [f, t] = key.split('-');
        setFrom(f);
        setTo(t);
        persist({ from: f, to: t });
    };

    const handleFromChange = (val) => { setFrom(val); persist({ from: val }); };
    const handleToChange = (val) => { setTo(val); persist({ to: val }); };
    const handleAmountChange = (val) => { setAmount(val); persist({ amount: val }); };

    if (!mounted) return null;

    const fromCurrency = CURRENCIES.find(c => c.code === from);
    const toCurrency = CURRENCIES.find(c => c.code === to);
    const currentPairKey = `${from}-${to}`;
    const isFavorited = favorites.includes(currentPairKey);

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Currency Converter</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Quick Convert</h2>
                </div>
                <button
                    type="button"
                    onClick={() => toggleFavorite({ from, to })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${isFavorited
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                        }`}
                >
                    {isFavorited ? '★ Saved' : '☆ Save pair'}
                </button>
            </div>

            {/* Converter */}
            <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">From</label>
                        <select
                            value={from}
                            onChange={e => handleFromChange(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none cursor-pointer"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end justify-center pb-1">
                        <button
                            type="button"
                            onClick={swap}
                            className="rounded-full border border-slate-300 dark:border-slate-700 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Swap currencies"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">To</label>
                        <select
                            value={to}
                            onChange={e => handleToChange(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none cursor-pointer"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Amount</label>
                    <input
                        type="number" min="0" step="any"
                        value={amount}
                        onChange={e => handleAmountChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Result */}
                <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-950/30 p-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-sky-700 dark:text-sky-300">
                            {toCurrency?.flag} {formatResult(result, to)}
                        </span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{to}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        1 {from} = {formatResult(rateMap[to] / rateMap[from], to)} {to} · Indicative rate
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleConvert}
                    className="w-full rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                >
                    Save to history
                </button>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
                <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Favorite Pairs</p>
                    <div className="flex flex-wrap gap-2">
                        {favorites.map(key => {
                            const [f, t] = key.split('-');
                            const fc = CURRENCIES.find(c => c.code === f);
                            const tc = CURRENCIES.find(c => c.code === t);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => applyFavorite(key)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${key === currentPairKey
                                        ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                                        }`}
                                >
                                    {fc?.flag} {f} → {tc?.flag} {t}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Recent Conversions</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {history.map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/30">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {formatResult(h.amount, h.from)} {h.from} → {formatResult(h.result, h.to)} {h.to}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                                    {new Date(h.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
