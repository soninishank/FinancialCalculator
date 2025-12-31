import React, { useState } from 'react';
import Link from 'next/link';
import { useCalculatorSearch } from '../../hooks/useCalculatorSearch';
import CalculatorAdvisor from './CalculatorAdvisor';

export default function HomePage() {
  const [q, setQ] = useState('');
  const list = useCalculatorSearch(q);

  return (
    <div>
      <section className="mb-12">
        <CalculatorAdvisor />
      </section>

      <section className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">All Financial Tools</h2>
        <div className="relative w-full max-w-xs group">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter (e.g., SIP, EMI)"
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map(c => (
            <Link key={c.slug} href={`/calculator/${c.slug}`} className="block">
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
