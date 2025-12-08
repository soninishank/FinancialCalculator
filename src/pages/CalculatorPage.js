// src/pages/CalculatorPage.js
import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import manifest from '../utils/calculatorsManifest';
import { useCurrency } from '../contexts/CurrencyContext';

// Explicit dynamic imports so bundlers can split chunks
const importBySlug = (slug) => {
  switch (slug) {
    case 'sip-plus-lump': return import('../components/calculators/SIPWithLumpSum');
    case 'pure-sip': return import('../components/calculators/PureSIP');
    case 'lump-sum': return import('../components/calculators/LumpSumOnly');
    case 'step-up-sip': return import('../components/calculators/StepUpSIP');
    case 'step-up-plus-lump': return import('../components/calculators/StepUpSIPWithLump');
    case 'goal-planner': return import('../components/calculators/GoalPlanner');
    case 'loan-emi': return import('../components/calculators/LoanEMI');
    case 'cagr-calculator': return import('../components/calculators/CAGRCalculator');
    case 'topup-loan-emi': return import('../components/calculators/TopUpLoanEMI');
    case 'swp-calculator': return import('../components/calculators/SWPCalculator');
    default: return Promise.reject(new Error('Unknown calculator'));
  }
};

export default function CalculatorPage() {
  const { slug } = useParams();
  const meta = manifest.find(m => m.slug === slug);

  // call hooks unconditionally
  const { currency, setCurrency } = useCurrency();

  if (!meta) {
    return (
      <div className="p-6">
        <p>Calculator not found.</p>
        <Link to="/" className="text-teal-600">Back to catalog</Link>
      </div>
    );
  }

  const LazyCalc = React.lazy(() => importBySlug(slug));

   return (
    // single-column layout: calculator uses full width
    <div className="w-full">
      <main className="bg-white rounded p-6 shadow">
        <Link to="/" className="text-sm text-teal-600 mb-4 inline-block">← Back</Link>
        <h1 className="text-2xl font-bold mb-2">{meta.title}</h1>
        <p className="text-gray-600 mb-4">{meta.description}</p>

        <Suspense fallback={<div>Loading calculator…</div>}>
          <LazyCalc currency={currency} setCurrency={setCurrency} />
        </Suspense>
      </main>
    </div>
  );
}
