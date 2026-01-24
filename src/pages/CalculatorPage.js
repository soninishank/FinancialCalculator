'use client';

import React, { Suspense, useCallback, useEffect } from 'react';
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
import CommentSection from '../components/common/CommentSection';

const FORCED_CURRENCY_MAP = {
  // US Calculators (USD)
  'us-capital-gains': 'USD',
  'us-mortgage-calculator': 'USD',
  'us-paycheck-calculator': 'USD',
  'student-loan-payoff': 'USD',
  'student-loan-forgiveness': 'USD',
  'medicare-cost-estimator': 'USD',
  'aca-marketplace-calculator': 'USD',
  'child-tax-credit': 'USD',
  'fsa-calculator': 'USD',
  'traditional-ira-calculator': 'USD',
  'roth-ira-calculator': 'USD',
  '529-college-savings': 'USD',
  'rmd-calculator': 'USD',
  'hsa-calculator': 'USD',
  'social-security-break-even': 'USD',
  '401k-calculator': 'USD',
  'home-affordability-calculator': 'USD',
  'property-tax-estimator': 'USD',
  'fico-score-impact': 'USD',

  // India Calculators (INR)
  'india-tax': 'INR',
  'ppf-calculator': 'INR',
  'nps-calculator': 'INR',
  'ssy-calculator': 'INR',
  'gst-calculator': 'INR',
  'recurring-deposit': 'INR',
  'fixed-deposit': 'INR',

  // Other Regions
  'uk-income-tax': 'GBP',
  'australia-income-tax': 'AUD',
  'canada-income-tax': 'CAD',
  'europe-vat': 'EUR',
  'japan-paycheck': 'JPY',
  'hongkong-salary-tax': 'HKD',
  'china-income-tax': 'CNY',
  'switzerland-income-tax': 'CHF',
  'singapore-tax': 'SGD',
  'uae-gratuity': 'AED',
  'nz-paycheck': 'NZD',
  'ireland-tax': 'EUR',
  'mexico-isr': 'MXN',
  'brazil-clt': 'BRL',
  'south-africa-tax': 'ZAR'
};

const calculatorCache = {};

const importBySlug = (slug) => getLazyCalculator(slug, calculatorCache);


export default function CalculatorPage() {
  const params = useParams();
  const slug = params?.slug; // Handle undefined initially on server
  const meta = manifest.find(m => m.slug === slug);

  // Force specific currency for regional calculators
  const forcedCurrency = FORCED_CURRENCY_MAP[slug];
  const { currency: globalCurrency, setCurrency, setIsLocked } = useCurrency();

  // Use forced currency if available, otherwise fallback to global context
  const currency = forcedCurrency || globalCurrency;

  useEffect(() => {
    if (forcedCurrency) {
      setCurrency(forcedCurrency);
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
    // Cleanup: ensure we unlock when leaving the page
    return () => setIsLocked(false);
  }, [forcedCurrency, setCurrency, setIsLocked]);

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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors duration-500">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-6 inline-flex items-center hover:translate-x-[-4px] transition-all"
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

            {/* SEO-optimized H1 - visible and keyword-rich */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 mt-6">
              {meta.title}
            </h1>

            <p className="text-gray-500 dark:text-slate-400 text-base mb-8 max-w-3xl leading-relaxed">
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
            <Suspense fallback={<div className="h-20 animate-pulse bg-gray-50 dark:bg-slate-800/50 rounded-xl mt-8"></div>}>
              <SocialShare title={meta.title} />
            </Suspense>

            {/* Comment Section */}
            <CommentSection slug={slug} />
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
