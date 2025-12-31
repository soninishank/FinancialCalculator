'use client';

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCalculatorSearch } from "../hooks/useCalculatorSearch";
import CalculatorAdvisor from "../components/home/CalculatorAdvisor";
// import SEO from "../components/common/SEO"; // Handled by metadata
import { Search } from "lucide-react";

export default function CalculatorsList({ initialFiltered, initialQ }) {
  const [q, setQ] = useState(initialQ || "");
  const filtered = useCalculatorSearch(q);

  // If we are on the server or first render, we use the initialFiltered to ensure SEO content is there
  // However, useCalculatorSearch(q) where q is initialQ should already return the same list.

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Calculators</h1>

      <section className="mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Choose a calculator</h2>
          <p className="text-sm text-gray-600 mt-1">Search or pick from the catalog below.</p>

          <Suspense fallback={<div className="mt-6 h-14 bg-gray-50 animate-pulse rounded-2xl"></div>}>
            <SearchInput q={q} setQ={setQ} />
          </Suspense>
        </div>
      </section>

      <section>
        {(filtered || initialFiltered).length === 0 ? (
          <div className="p-8 bg-white rounded-xl shadow-sm text-center text-gray-600">
            No calculators match <strong>{q}</strong>.
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(
              filtered.reduce((acc, item) => {
                const cat = item.category || 'Other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3">{category}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(meta => (
                    <Card key={meta.slug} meta={meta} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Advisor Footer */}
      <section className="mt-12 pt-8 border-t border-gray-100">
        <CalculatorAdvisor />
      </section>
    </div>
  );
}

function SearchInput({ q, setQ }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearchChange = (val) => {
    setQ(val);
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`/calculators?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-6 relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-600" />
      </div>
      <input
        value={q}
        onChange={e => handleSearchChange(e.target.value)}
        placeholder="Search calculators (e.g., SIP, EMI, Lump Sum...)"
        className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-lg transition-all"
        aria-label="Search calculators"
      />
    </div>
  );
}

function Card({ meta }) {
  return (
    <Link
      href={`/calculators/${meta.slug}`}
      className="relative p-6 pt-12 bg-white rounded-xl shadow hover:shadow-md transition block"
    >
      <div className="absolute top-3 right-3 bg-gray-50 text-xs text-gray-600 px-2 py-1 rounded-full border">
        {meta.category ?? "General"}
      </div>

      <h3 className="font-semibold text-lg mb-2">{meta.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
    </Link>
  );
}
