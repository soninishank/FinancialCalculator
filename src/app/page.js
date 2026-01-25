import Link from "next/link";
import {
    ArrowRight,
    BriefcaseBusiness,
    FolderHeart,
    LineChart,
    Sparkles,
    WalletCards,
} from "lucide-react";

export const metadata = {
    title: "FinCalc - Personal Finance Workspace",
    description: "FinCalc is a personal finance workspace for planning, tracking, and modeling decisions without turning the product into a tool directory.",
    openGraph: {
        title: "FinCalc - Personal Finance Workspace",
        description: "A cleaner finance app for planning, tracking, and decision support.",
        url: "https://www.hashmatic.in",
        siteName: "FinCalc",
        locale: "en_US",
        type: "website",
    },
};

const surfaces = [
    {
        title: "Dashboard",
        href: "/hub",
        icon: BriefcaseBusiness,
        description: "Start with your current financial position and what needs attention next.",
    },
    {
        title: "Track",
        href: "/track",
        icon: LineChart,
        description: "Monitor net worth, cash movement, and recurring financial behavior.",
    },
    {
        title: "My Tools",
        href: "/my-tools",
        icon: FolderHeart,
        description: "Return to saved work, recent activity, and reusable planning views.",
    },
    {
        title: "Tools",
        href: "/calculators",
        icon: WalletCards,
        description: "Use the modeling layer only when a decision needs exact numbers.",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f3f6fb_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_45%,#0f172a_100%)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "FinCalc",
                        "url": "https://www.hashmatic.in",
                        "applicationCategory": "FinanceApplication",
                        "description": "Personal finance workspace for planning, tracking, and modeling decisions.",
                    }),
                }}
            />

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10" />
                </div>

                <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-4 py-2">
                            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-700 dark:text-slate-300">
                                Personal finance workspace
                            </span>
                        </div>

                        <h1 className="mt-6 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white">
                            A finance app should help you
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600">
                                run your money life, not just open tools.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-400">
                            FinCalc is organized around ongoing financial work: understanding where you stand, tracking progress, returning to saved workflows, and modeling decisions only when needed.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/hub"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 dark:bg-white px-6 py-3.5 text-sm font-black text-white dark:text-slate-950"
                            >
                                Open Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/track"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-6 py-3.5 text-sm font-black text-slate-800 dark:text-slate-100"
                            >
                                Open Track
                            </Link>
                            <Link
                                href="/my-tools"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-6 py-3.5 text-sm font-black text-slate-800 dark:text-slate-100"
                            >
                                Open My Tools
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {surfaces.map((surface) => (
                            <Link
                                key={surface.title}
                                href={surface.href}
                                className="rounded-[1.75rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="rounded-2xl w-fit border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                                    <surface.icon className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                                </div>
                                <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{surface.title}</h2>
                                <p className="mt-3 text-slate-600 dark:text-slate-400">{surface.description}</p>
                                <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-300">
                                    Open
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
