import Link from 'next/link';
import NetWorthTracker from '../../components/calculators/savings/NetWorthTracker';
import MoneyOSPanel from '../../components/hub/MoneyOSPanel';
import CashFlowSummaryBanner from '../../components/home/CashFlowSummaryBanner';
import SavingsRateHistory from '../../components/home/SavingsRateHistory';
import SubscriptionManager from '../../components/home/SubscriptionManager';

export const metadata = {
    title: 'Track Your Money',
    description: 'Track net worth, operating cash flow, recurring activity, and personal money systems inside FinCalc.',
    alternates: {
        canonical: 'https://www.hashmatic.in/track',
    },
};

export default function TrackPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">Track</p>
                                <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">Stay close to the actual money system</h1>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    Track net worth, operating accounts, recurring cash flow, and the underlying behavior of your finances instead of only projecting outcomes.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                                <Link href="/hub" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                                    Open dashboard
                                </Link>
                                <Link href="/my-tools" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                                    Open My Tools
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-10">
                <div className="grid gap-4 md:grid-cols-3">
                    <TrackCard title="Net worth" body="See whether your balance sheet is moving in the right direction." />
                    <TrackCard title="Cash flow" body="Move beyond budgets and track the actual monthly operating system." />
                    <TrackCard title="Recurring commitments" body="Keep subscriptions, rules, and recurring flows visible." />
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-6">
                <CashFlowSummaryBanner />
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-6">
                <SavingsRateHistory />
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-6">
                <SubscriptionManager />
            </section>

            <section className="px-6 pb-12">
                <NetWorthTracker />
            </section>

            <section className="pb-12">
                <MoneyOSPanel />
            </section>
        </div>
    );
}

function TrackCard({ title, body }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 p-5">
            <div className="text-lg font-black text-slate-900 dark:text-white">{title}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{body}</div>
        </div>
    );
}
