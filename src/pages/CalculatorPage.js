'use client';

import React, { Suspense, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import manifest from '../utils/calculatorsManifest';
import { useCurrency } from '../contexts/CurrencyContext';
import RelatedCalculators from '../components/common/RelatedCalculators';
// import SEO from '../components/common/SEO'; // Metadata in page.js
import SocialShare from '../components/common/SocialShare';
import { lazyLoad } from '../utils/lazyLoad';
import { getLazyCalculator } from '../utils/calculatorImports';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Breadcrumbs from '../components/common/Breadcrumbs';

const calculatorCache = {};

const importBySlug = (slug) => getLazyCalculator(slug, calculatorCache);


export default function CalculatorPage() {
  const params = useParams();
  const slug = params?.slug; // Handle undefined initially on server
  const meta = manifest.find(m => m.slug === slug);

  // call hooks unconditionally
  const { currency, setCurrency } = useCurrency();

  const router = useRouter();
  const pathname = usePathname();

  // Next.js doesn't have location.state in the same way. We can use search params or just default to /
  // For simplicity, defaulting to / or history back.

  const handleBack = useCallback(() => {
    // If we want checking history length, window.history is available in client component
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  if (!meta) {
    // If slug is missing or invalid, we can show not found or just loading
    if (!slug) return null; // Hydration gap if params not ready?
    return (
      <div className="p-6">
        <p>Calculator not found.</p>
        <button onClick={() => router.push('/')} className="text-teal-600">Back to catalog</button>
      </div>
    );
  }

  const LazyCalc = importBySlug(slug);

  // JSON-LD is injected via metadata in page.js, or can be separate Script here.
  // Since we removed SEO component, we rely on page.js for Schema.

  return (
    <div className="w-full h-full">
      {/* SEO removed, handled by server component wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content: 9 columns on large screens for a balanced width */}
        <main className="lg:col-span-9 order-1">
          <div className="bg-white rounded-2xl p-3 sm:p-8 shadow-sm border border-gray-100">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="text-sm font-medium text-teal-600 mb-6 inline-flex items-center hover:translate-x-[-4px] transition-transform"
              aria-label="Go back"
            >
              <span className="mr-2">←</span> Back
            </button>

            <Breadcrumbs
              items={[
                { label: 'Calculators', href: '/calculators' },
                { label: meta.title }
              ]}
            />
            <h1 id="main-title" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {meta.title}
            </h1>

            <p className="text-gray-500 text-base mb-8 max-w-3xl leading-relaxed">
              {meta.description}
            </p>

            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="ml-3 text-gray-500 font-medium">Loading calculator...</span>
                </div>
              }>
                <LazyCalc currency={currency} setCurrency={setCurrency} />
              </Suspense>
            </ErrorBoundary>

            {/* AuthorBio removed as per user request */}
            <SocialShare title={meta.title} />
          </div>
        </main>

        {/* Sidebar: 3 columns for better readability */}
        <aside className="lg:col-span-3 order-2">
          <div className="sticky top-6">
            <RelatedCalculators currentSlug={slug} category={meta.category} />
          </div>
        </aside>
      </div>
    </div>
  );
}
