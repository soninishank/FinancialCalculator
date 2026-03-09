'use client';

import React from 'react';
import Link from 'next/link';
import FinancialHubPanel from '../home/FinancialHubPanel';
import PersonalFinancePlanner from '../home/PersonalFinancePlanner';
import BudgetTracker from '../home/BudgetTracker';
import TaxBracketEstimator from '../home/TaxBracketEstimator';
import FinancialMilestones from '../home/FinancialMilestones';
import FinancialHealthScore from '../home/FinancialHealthScore';
import FinancialChecklist from '../home/FinancialChecklist';
import LeadCaptureCard from '../common/LeadCaptureCard';
import MoneyOSPanel from './MoneyOSPanel';

const WORKSPACES = [
    {
        id: 'overview',
        label: 'Overview',
        title: 'Quick diagnostics',
        description: 'Emergency fund and debt checks before you go deeper.'
    },
    {
        id: 'planner',
        label: 'Planner',
        title: 'Personal plan',
        description: 'Profile-based recommendations, FIRE progress, and debt paydown.'
    },
    {
        id: 'budget',
        label: 'Budget',
        title: 'Monthly budget',
        description: 'Track spending by category against your monthly targets.'
    },
    {
        id: 'tax',
        label: 'Tax',
        title: 'Tax estimator',
        description: 'Estimate your 2024 US federal tax bracket and effective rate.'
    },
    {
        id: 'money-os',
        label: 'Money OS',
        title: 'Operations',
        description: 'Budgeting, ledger, recurring cashflow, reconciliation, and goals.'
    }
];

const PROFILE_STORAGE_KEY = 'fincalc_profile_v1';
const MONEY_OS_STORAGE_KEY = 'fincalc_money_os_v1';

function readStorageJson(key) {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function HubWorkspace() {
    const [activeWorkspace, setActiveWorkspace] = React.useState('overview');
    const [userSnapshot, setUserSnapshot] = React.useState({
        hasProfile: false,
        accounts: 0,
        transactions: 0,
        goals: 0,
        recurring: 0
    });
    const currentWorkspace = WORKSPACES.find((workspace) => workspace.id === activeWorkspace) || WORKSPACES[0];
    const workspaceCards = React.useMemo(() => {
        return WORKSPACES.map((workspace) => {
            if (workspace.id === 'overview') {
                return {
                    ...workspace,
                    outcome: 'See emergency buffer, debt pressure, and fast calculator recommendations.',
                    badge: userSnapshot.hasProfile || userSnapshot.accounts > 0 ? 'Good reset point' : 'Best first step'
                };
            }
            if (workspace.id === 'planner') {
                return {
                    ...workspace,
                    outcome: userSnapshot.hasProfile ? 'Your profile is saved. Review and update your plan.' : 'Build a saved profile and get tailored next calculators.',
                    badge: userSnapshot.hasProfile ? 'Saved profile' : 'One-time setup'
                };
            }
            return {
                ...workspace,
                outcome: userSnapshot.accounts > 0 || userSnapshot.transactions > 0
                    ? `Continue managing ${userSnapshot.accounts} account${userSnapshot.accounts === 1 ? '' : 's'} and ${userSnapshot.transactions} transaction${userSnapshot.transactions === 1 ? '' : 's'}.`
                    : 'Set up accounts, budgets, and recurring cashflow in one place.',
                badge: userSnapshot.accounts > 0 ? 'In progress' : 'Operations mode'
            };
        });
    }, [userSnapshot]);

    const recommendedWorkspace = React.useMemo(() => {
        if (userSnapshot.accounts > 0 || userSnapshot.transactions > 0) return 'money-os';
        if (userSnapshot.hasProfile) return 'planner';
        return 'overview';
    }, [userSnapshot]);

    React.useEffect(() => {
        const profile = readStorageJson(PROFILE_STORAGE_KEY);
        const moneyOS = readStorageJson(MONEY_OS_STORAGE_KEY);
        setUserSnapshot({
            hasProfile: Boolean(profile),
            accounts: Array.isArray(moneyOS?.accounts) ? moneyOS.accounts.length : 0,
            transactions: Array.isArray(moneyOS?.transactions) ? moneyOS.transactions.length : 0,
            goals: Array.isArray(moneyOS?.goals) ? moneyOS.goals.length : 0,
            recurring: Array.isArray(moneyOS?.recurring) ? moneyOS.recurring.length : 0
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700 dark:text-sky-300">Financial Hub</p>
                                <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">One workspace, three clear modes</h1>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    The hub is now split by intent so diagnostics, planning, and operations do not compete on the same screen.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                                <Link href="/calculators" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                    All calculators
                                </Link>
                                <Link href="/calculators/all" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                    Calculator sitemap
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            {workspaceCards.map((workspace) => {
                                const isActive = workspace.id === activeWorkspace;
                                return (
                                    <button
                                        key={workspace.id}
                                        type="button"
                                        onClick={() => setActiveWorkspace(workspace.id)}
                                        className={`rounded-2xl border px-5 py-4 text-left transition ${isActive
                                            ? 'border-sky-400 bg-sky-50 text-slate-900 shadow-sm dark:border-sky-700 dark:bg-sky-950/30 dark:text-white'
                                            : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-black">{workspace.label}</div>
                                            <span className="rounded-full bg-white/80 dark:bg-slate-900/90 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                                {workspace.badge}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-base font-bold">{workspace.title}</div>
                                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{workspace.description}</div>
                                        <div className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{workspace.outcome}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-5 py-4">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current view</div>
                                <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{currentWorkspace.title}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{currentWorkspace.description}</div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveWorkspace(recommendedWorkspace)}
                                        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
                                    >
                                        Open recommended view
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveWorkspace('money-os')}
                                        className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        Jump to Money OS
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-5 py-4">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Your progress</div>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <ProgressStat label="Profile" value={userSnapshot.hasProfile ? 'Saved' : 'Not set'} />
                                    <ProgressStat label="Accounts" value={String(userSnapshot.accounts)} />
                                    <ProgressStat label="Transactions" value={String(userSnapshot.transactions)} />
                                    <ProgressStat label="Goals" value={String(userSnapshot.goals)} />
                                </div>
                                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                    {recommendedWorkspace === 'money-os' && 'You already have operating data. Continue from Money OS.'}
                                    {recommendedWorkspace === 'planner' && 'Your plan exists, but your operations setup is still light.'}
                                    {recommendedWorkspace === 'overview' && 'Start with diagnostics, then move into planning or operations.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {activeWorkspace === 'overview' && (
                <>
                    <section className="py-6">
                        <div className="max-w-4xl mx-auto px-6">
                            <FinancialHealthScore />
                        </div>
                    </section>
                    <FinancialHubPanel />
                    <section className="py-6">
                        <div className="max-w-4xl mx-auto px-6">
                            <FinancialMilestones />
                        </div>
                    </section>
                    <section className="py-6">
                        <div className="max-w-4xl mx-auto px-6">
                            <FinancialChecklist />
                        </div>
                    </section>
                </>
            )}
            {activeWorkspace === 'planner' && <PersonalFinancePlanner />}
            {activeWorkspace === 'budget' && (
                <section className="py-10">
                    <div className="max-w-4xl mx-auto px-6">
                        <BudgetTracker />
                    </div>
                </section>
            )}
            {activeWorkspace === 'tax' && (
                <section className="py-10">
                    <div className="max-w-4xl mx-auto px-6">
                        <TaxBracketEstimator />
                    </div>
                </section>
            )}
            {activeWorkspace === 'money-os' && <MoneyOSPanel />}

            <div className="max-w-6xl mx-auto px-6 pb-12">
                <LeadCaptureCard source={`hub_${activeWorkspace}`} compact />
            </div>
        </div>
    );
}

function ProgressStat({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-3">
            <div className="text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-1 text-base font-black text-slate-900 dark:text-white">{value}</div>
        </div>
    );
}
