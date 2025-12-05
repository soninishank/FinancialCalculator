// src/components/home/HomePage.js
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import calculators from '../../utils/calculatorsManifest';

export default function HomePage() {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return calculators;
    return calculators.filter(c =>
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      (c.keywords || '').toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div>
      <section className="mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Choose a calculator</h2>
          <p className="text-sm text-gray-600 mt-1">Search or pick from the catalog below.</p>

          <div className="mt-4">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search calculators (e.g., SIP, EMI, Lump Sum)"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map(c => (
            <Link key={c.slug} to={`/calculator/${c.slug}`} className="block">
              <div className="bg-white rounded-2xl p-5 shadow hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.title}</h3>
                  <span className="text-xs text-gray-500">{c.category}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                <div className="mt-4">
                  <span className="inline-block text-teal-700 text-sm border border-teal-100 rounded-full px-3 py-1">Open</span>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="col-span-full text-gray-500">No calculators match your search.</div>
          )}
        </div>
      </section>
    </div>
  );
}
