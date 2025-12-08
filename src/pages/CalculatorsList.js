// src/pages/CalculatorsList.js
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import manifest from "../utils/calculatorsManifest";

export default function CalculatorsList() {
  const [q, setQ] = useState("");

  // normalize and precompute searchable text for each calculator
  const items = useMemo(() => {
    return manifest.map(m => ({
      ...m,
      _search: `${m.title} ${m.description} ${m.keywords} ${m.category}`.toLowerCase()
    }));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(i => i._search.includes(term));
  }, [items, q]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Calculators</h1>

      {/* Search & quick helper */}
      <section className="mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Choose a calculator</h2>
          <p className="text-sm text-gray-600 mt-1">Search or pick from the catalog below.</p>

          <div className="mt-4">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(meta => (
              <Card key={meta.slug} meta={meta} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ meta }) {
  return (
    <Link
      to={`/calculator/${meta.slug}`}
      className="relative p-6 bg-white rounded-xl shadow hover:shadow-md transition block"
    >
      <div className="absolute top-3 right-3 bg-gray-50 text-xs text-gray-600 px-2 py-1 rounded-full border">
        {meta.category ?? "General"}
      </div>

      <h3 className="font-semibold text-lg mb-2">{meta.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
    </Link>
  );
}
