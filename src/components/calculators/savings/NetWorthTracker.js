'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import Tesseract from 'tesseract.js';
import { moneyFormat } from '../../../utils/formatting';
import { downloadPDF } from '../../../utils/export';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const uid = () => Math.random().toString(36).substring(2, 9);
const YYYY_MM = () => new Date().toISOString().substring(0, 7);

const ASSET_CATEGORIES = ['Cash', 'Investments', 'Real Estate', 'Crypto', 'Vehicles', 'Other'];
const LIABILITY_CATEGORIES = ['Mortgage', 'Credit Card', 'Student Loan', 'Auto Loan', 'Personal Loan', 'Other'];

export default function NetWorthTracker({ currency = 'INR' }) {
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('fincalc_networth');
            return saved ? JSON.parse(saved) : [{ id: uid(), month: YYYY_MM(), assets: [], liabilities: [] }];
        } catch {
            return [{ id: uid(), month: YYYY_MM(), assets: [], liabilities: [] }];
        }
    });

    const [activeMonthId, setActiveMonthId] = useState(history[history.length - 1]?.id || null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const fileInputRef = useRef(null);
    const csvInputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('fincalc_networth', JSON.stringify(history));
    }, [history]);

    const activeRecord = history.find(h => h.id === activeMonthId) || history[history.length - 1] || { assets: [], liabilities: [] };

    // Derived metrics
    const totalAssets = activeRecord.assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const totalLiabilities = activeRecord.liabilities.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Handlers
    const addRecord = () => {
        const newRecord = { id: uid(), month: YYYY_MM(), assets: [], liabilities: [] };
        setHistory(prev => [...prev, newRecord].sort((a, b) => a.month.localeCompare(b.month)));
        setActiveMonthId(newRecord.id);
    };

    const updateMonthDate = (id, newMonth) => {
        setHistory(prev => prev.map(h => h.id === id ? { ...h, month: newMonth } : h).sort((a, b) => a.month.localeCompare(b.month)));
    };

    const addItem = (type) => {
        setHistory(prev => prev.map(h => {
            if (h.id === activeMonthId) {
                const list = type === 'assets' ? h.assets : h.liabilities;
                return { ...h, [type]: [...list, { id: uid(), name: '', category: type === 'assets' ? 'Cash' : 'Credit Card', value: '' }] };
            }
            return h;
        }));
    };

    const updateItem = (type, itemId, field, value) => {
        setHistory(prev => prev.map(h => {
            if (h.id === activeMonthId) {
                const list = type === 'assets' ? h.assets : h.liabilities;
                return { ...h, [type]: list.map(item => item.id === itemId ? { ...item, [field]: value } : item) };
            }
            return h;
        }));
    };

    const removeItem = (type, itemId) => {
        setHistory(prev => prev.map(h => {
            if (h.id === activeMonthId) {
                const list = type === 'assets' ? h.assets : h.liabilities;
                return { ...h, [type]: list.filter(item => item.id !== itemId) };
            }
            return h;
        }));
    };

    // CSV Parsing (Simple approach)
    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim());

            // Very naive parser for simple 2 column CSV: "Name, Value" or "Asset, Amount"
            const newAssets = [];
            const newLiabs = [];

            for (let i = 1; i < lines.length; i++) { // skip header
                const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                if (parts.length >= 2) {
                    const name = parts[0];
                    let val = parseFloat(parts[1].replace(/[^0-9.-]+/g, ''));
                    if (!isNaN(val)) {
                        if (val >= 0) {
                            newAssets.push({ id: uid(), name, category: 'Other', value: val });
                        } else {
                            newLiabs.push({ id: uid(), name, category: 'Other', value: Math.abs(val) });
                        }
                    }
                }
            }

            if (newAssets.length > 0 || newLiabs.length > 0) {
                setHistory(prev => prev.map(h => {
                    if (h.id === activeMonthId) {
                        return {
                            ...h,
                            assets: [...h.assets, ...newAssets],
                            liabilities: [...h.liabilities, ...newLiabs]
                        };
                    }
                    return h;
                }));
            }
        };
        reader.readAsText(file);
        e.target.value = null; // reset
    };

    // OCR Tesseract
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setOcrLoading(true);
        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => console.log(m)
            });
            const text = result.data.text;

            // Look for things that look like currency amounts
            const regex = /[$€£₹]?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
            const matches = text.match(regex);

            if (matches && matches.length > 0) {
                // Find the largest number - likely to be the total balance
                const amounts = matches.map(m => parseFloat(m.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
                if (amounts.length > 0) {
                    const maxAmount = Math.max(...amounts);
                    setHistory(prev => prev.map(h => {
                        if (h.id === activeMonthId) {
                            return {
                                ...h,
                                assets: [...h.assets, { id: uid(), name: 'Scanned Account', category: 'Cash', value: maxAmount }]
                            };
                        }
                        return h;
                    }));
                }
            } else {
                alert("Could not detect any clear monetary amounts in the image. Try manual entry or a clearer screenshot.");
            }
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Error parsing image. Please try again or enter manually.");
        } finally {
            setOcrLoading(false);
            e.target.value = null;
        }
    };

    // Chart Data
    const chartData = useMemo(() => {
        const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));

        return {
            labels: sorted.map(h => {
                const [y, m] = h.month.split('-');
                const d = new Date(y, m - 1);
                return d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Net Worth',
                    data: sorted.map(h => {
                        const a = h.assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                        const l = h.liabilities.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                        return a - l;
                    }),
                    borderColor: '#10B981', // emerald-500
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }, [history]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `Net Worth: ${moneyFormat(ctx.raw, currency, false, 0)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                ticks: { callback: (val) => moneyFormat(val, currency, true) }
            },
            x: {
                grid: { display: false, drawBorder: false }
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* HER0 & KPI */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div>
                        <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-2">Total Net Worth</h2>
                        <div className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                            {moneyFormat(netWorth, currency, false, 0)}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Assets</div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{moneyFormat(totalAssets, currency)}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Liabilities</div>
                            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{moneyFormat(totalLiabilities, currency)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: History & Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth Trend</h3>
                        </div>
                        <div className="h-[300px]">
                            {history.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">Add data to see trends</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Data Entry */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Entries</h3>
                            <button onClick={addRecord} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">+ New Month</button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Select Month</label>
                            <select
                                value={activeMonthId || ''}
                                onChange={e => setActiveMonthId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
                            >
                                {history.map(h => (
                                    <option key={h.id} value={h.id}>{new Date(h.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</option>
                                ))}
                            </select>
                        </div>

                        {/* Magic Import Buttons */}
                        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                            <h4 className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider mb-3">Magic Import</h4>
                            <div className="flex gap-2">
                                <button onClick={() => csvInputRef.current?.click()} className="flex-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold py-2 px-3 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    CSV Upload
                                </button>
                                <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />

                                <button onClick={() => fileInputRef.current?.click()} disabled={ocrLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    {ocrLoading ? (
                                        <span className="animate-pulse">Scanning...</span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            Screenshot
                                        </>
                                    )}
                                </button>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                            </div>
                        </div>

                        {/* ASSETS */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Assets (+)</h4>
                                <button onClick={() => addItem('assets')} className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Add Item</button>
                            </div>
                            <div className="space-y-3">
                                {activeRecord.assets.length === 0 && <p className="text-xs text-slate-400 italic">No assets added.</p>}
                                {activeRecord.assets.map(item => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <div className="flex-1 space-y-1">
                                            <input type="text" value={item.name} onChange={e => updateItem('assets', item.id, 'name', e.target.value)} placeholder="Name (e.g. Chase Check)" className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none" />
                                            <select value={item.category} onChange={e => updateItem('assets', item.id, 'category', e.target.value)} className="w-full text-xs bg-transparent text-slate-500 outline-none">
                                                {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-1/3">
                                            <input type="number" value={item.value} onChange={e => updateItem('assets', item.id, 'value', e.target.value)} placeholder="0.00" className="w-full text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none text-right" />
                                        </div>
                                        <button onClick={() => removeItem('assets', item.id)} className="text-slate-400 hover:text-red-500">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LIABILITIES */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Liabilities (-)</h4>
                                <button onClick={() => addItem('liabilities')} className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Add Item</button>
                            </div>
                            <div className="space-y-3">
                                {activeRecord.liabilities.length === 0 && <p className="text-xs text-slate-400 italic">No liabilities added.</p>}
                                {activeRecord.liabilities.map(item => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <div className="flex-1 space-y-1">
                                            <input type="text" value={item.name} onChange={e => updateItem('liabilities', item.id, 'name', e.target.value)} placeholder="Name (e.g. Visa)" className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none" />
                                            <select value={item.category} onChange={e => updateItem('liabilities', item.id, 'category', e.target.value)} className="w-full text-xs bg-transparent text-slate-500 outline-none">
                                                {LIABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-1/3">
                                            <input type="number" value={item.value} onChange={e => updateItem('liabilities', item.id, 'value', e.target.value)} placeholder="0.00" className="w-full text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none text-right" />
                                        </div>
                                        <button onClick={() => removeItem('liabilities', item.id)} className="text-slate-400 hover:text-red-500">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
