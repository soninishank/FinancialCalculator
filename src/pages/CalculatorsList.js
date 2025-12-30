// src/pages/CalculatorsList.js
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCalculatorSearch } from "../hooks/useCalculatorSearch";
import CalculatorAdvisor from "../components/home/CalculatorAdvisor";
import SEO from "../components/common/SEO";

export default function CalculatorsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const filtered = useCalculatorSearch(q);

  // Update URL when q changes
  const handleSearchChange = (val) => {
    setQ(val);
    if (val) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SEO
        title="All Calculators"
        description="Browse our complete collection of free financial calculators including SIP, Loan EMI, CAGR, FIRE and more."
        keywords={['calculator list', 'financial tools', 'investment calculators']}
        path="/calculators"
      />
      <h1 className="text-3xl font-bold mb-6">All Calculators</h1>

      {/* Search & quick helper */}
      <section className="mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Choose a calculator</h2>
          <p className="text-sm text-gray-600 mt-1">Search or pick from the catalog below.</p>

          <div className="mt-4">
            <input
              value={q}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search calculators (e.g., SIP, EMI, Lump Sum)"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200"
              aria-label="Search calculators"
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        {filtered.length === 0 ? (
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

function Card({ meta }) {
  return (
    <Link
      to={`/calculators/${meta.slug}`}
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
