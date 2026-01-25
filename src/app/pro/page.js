import Link from 'next/link';
import LeadCaptureCard from '../../components/common/LeadCaptureCard';

export const metadata = {
    title: 'FinCalc Pro',
    description: 'FinCalc Pro for advisors, teams, and serious planners who want repeatable workflows, reports, and shared finance operations.',
    alternates: {
        canonical: 'https://www.hashmatic.in/pro',
    },
};

const plans = [
    {
        name: 'Starter',
        price: '$9/mo',
        bullets: ['Saved scenarios', 'Goal tracker', 'Priority calculator updates']
    },
    {
        name: 'Pro',
        price: '$29/mo',
        bullets: ['Advisor-ready PDF reports', 'Advanced compare workflows', 'Custom assumptions library']
    },
    {
        name: 'Team',
        price: 'Contact',
        bullets: ['Multi-user workspace', 'Client review links', 'Integration support']
    }
];

export default function ProPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <section className="py-14">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">FinCalc Pro</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
                        Built for people who want FinCalc to behave like a serious finance operating product, with repeatable workflows, professional output, and better collaboration.
                    </p>

                    <div className="grid md:grid-cols-3 gap-5 mt-8">
                        {plans.map((plan) => (
                            <div key={plan.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h2>
                                <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-2">{plan.price}</p>
                                <ul className="mt-4 space-y-2">
                                    {plan.bullets.map((line) => (
                                        <li key={line} className="text-sm text-slate-700 dark:text-slate-300">{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <LeadCaptureCard source="pro_page" />
                    </div>

                    <div className="mt-6">
                        <Link href="/hub" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            Open Financial Hub first
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
