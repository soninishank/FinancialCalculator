// src/pages/HomeFrontPage.js
import React from "react";
import Link from "next/link";

// import SEO from "../components/common/SEO";

// ... imports

export default function HomeFrontPage() {

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FinCalc",
    "url": "https://www.hashmatic.in",
    "applicationCategory": "FinanceApplication"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.hashmatic.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Calculators",
        "item": "https://www.hashmatic.in/calculators"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* SEO handled in page.js metadata */}

      {/* -------- HERO SECTION -------- */}
      <section className="bg-indigo-600 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Smart Tools to Plan Your Financial Journey
          </h1>
          <p className="mt-3 text-indigo-100 text-lg">
            Master your money with FinCalc's suite of professional calculators.
          </p>

          <div className="mt-6">
            <Link
              href="/calculators"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              Explore Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* -------- POPULAR CALCULATORS -------- */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Popular <span className="text-indigo-600">Calculators</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Our most used financial planning tools</p>
            </div>
            <Link href="/calculators" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 group">
              View All Calculators
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { slug: 'pure-sip', title: 'SIP Calculator', desc: 'Plan your mutual fund wealth growth' },
              { slug: 'advanced-home-loan', title: 'Home Loan EMI', desc: 'Calculate EMIs with prepayments' },
              { slug: 'india-tax', title: 'Income Tax', desc: 'Compare Old vs New Tax Regimes' },
              { slug: 'ultimate-fire-planner', title: 'FIRE Planner', desc: 'Track your path to early retirement' }
            ].map((calc) => (
              <Link
                key={calc.slug}
                href={`/calculators/${calc.slug}`}
                className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group bg-slate-50/50 dark:bg-slate-900/50"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {calc.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">
                  {calc.desc}
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Use Tool →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------- KNOWLEDGE HUB & FEATURES -------- */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">Accurate Logic</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Precision-engineered financial models covering 100+ scenarios from simple EMI to complex FIRE projections.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">Privacy First</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Calculations happen within your browser. Your financial data never leaves your device and is never stored on our servers.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">Global Support</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Multi-currency support and regional tax engines for India, USA, UK, Australia, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------- FOOTER -------- */}
      <footer className="py-6 bg-gray-100 text-center text-sm text-gray-500 border-t">
        © 2025 FinCalc. Built for investors.
      </footer>
    </>
  );
}



