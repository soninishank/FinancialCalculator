'use client';

import React from 'react';
import { trackEvent } from '../../utils/analytics';

const STORAGE_KEY = 'fincalc_leads_v1';

export default function LeadCaptureCard({ source = 'site', compact = false }) {
    const [email, setEmail] = React.useState('');
    const [useCase, setUseCase] = React.useState('personal');
    const [status, setStatus] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalized = email.trim().toLowerCase();
        if (!normalized || !normalized.includes('@')) {
            setStatus('Please enter a valid email.');
            return;
        }

        try {
            const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
            const next = [
                { email: normalized, useCase, source, createdAt: new Date().toISOString() },
                ...existing.filter((item) => item.email !== normalized),
            ].slice(0, 200);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // ignore storage failures
        }

        trackEvent('lead_capture_submitted', { source, use_case: useCase });
        setStatus('Thanks. We saved your request and will contact you soon.');
        setEmail('');
    };

    return (
        <div className={`rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 ${compact ? 'p-4' : 'p-6'}`}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Get Pro Guidance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Join the priority list for advisor-grade reports and workflow automations.
            </p>

            <form onSubmit={handleSubmit} className={`grid gap-3 ${compact ? 'mt-3' : 'mt-4'} sm:grid-cols-3`}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                    <option value="personal">Personal planning</option>
                    <option value="advisor">Advisor/wealth firm</option>
                    <option value="creator">Content/finfluencer</option>
                </select>
                <button
                    type="submit"
                    className="sm:col-span-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2"
                >
                    Join Pro waitlist
                </button>
            </form>

            {status && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{status}</p>}
        </div>
    );
}
