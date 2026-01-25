import Link from 'next/link';
import NewsAggregator from '../../components/news/NewsAggregator';
import FinanceGlossary from '../../components/news/FinanceGlossary';

export const metadata = {
    title: 'Learn And Briefing',
    description: 'Stay current with financial coverage and connect market context back to your money decisions.',
    alternates: {
        canonical: 'https://www.hashmatic.in/learn',
    },
};

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700 dark:text-sky-300">Learn</p>
                                <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">Stay current before you decide</h1>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    Use live financial coverage as a briefing layer so your planning and modeling live closer to what is happening now.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                                <Link href="/hub" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                    Open dashboard
                                </Link>
                                <Link href="/calculators" className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                    Open tools
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <LearnCard title="Market context" body="Follow live finance coverage without leaving the app." />
                            <LearnCard title="Decision support" body="Use the briefing layer before modeling your own scenario." />
                            <LearnCard title="Weekly habit" body="Make this the surface you open before bigger money actions." />
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-14">
                <div className="max-w-6xl mx-auto px-6">
                    <NewsAggregator />
                </div>
            </section>

            <section className="pb-14">
                <div className="max-w-6xl mx-auto px-6">
                    <FinanceGlossary />
                </div>
            </section>
        </div>
    );
}

function LearnCard({ title, body }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-5">
            <div className="text-lg font-black text-slate-900 dark:text-white">{title}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{body}</div>
        </div>
    );
}
