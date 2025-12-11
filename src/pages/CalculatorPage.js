// src/pages/CalculatorPage.js
import React, { Suspense, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

  const navigate = useNavigate();
  const location = useLocation();

  // location.state.from is an optional explicit origin the catalog can set.
  // e.g. on the catalog page: <Link to={`/calculators/${slug}`} state={{ from: location.pathname }} />
  const fallbackPath = location.state && location.state.from ? location.state.from : '/';

  const handleBack = useCallback(() => {
    // If there's at least one entry in history, try to go back.
    // window.history.length can be > 1 even for new tabs in some browsers, but this is a pragmatic check.
    // We still guard with a fallback because navigate(-1) may not always produce the expected result (direct open).
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // direct open, fallback to catalog/home
        navigate(fallbackPath);
      }
    } catch (err) {
      // defensive fallback
      navigate(fallbackPath);
    }
  }, [navigate, fallbackPath]);

  if (!meta) {
    return (
      <div className="p-6">
        <p>Calculator not found.</p>
        <button onClick={() => navigate('/')} className="text-teal-600">Back to catalog</button>
      </div>
    );
  }

  const LazyCalc = React.lazy(() => importBySlug(slug));

  return (
    // single-column layout: calculator uses full width
    <div className="w-full max-w-none px-0">
      <main className="w-full bg-white rounded p-6 shadow mx-auto max-w-4xl">
        {/* Back button — uses history with safe fallback */}
        <button
          onClick={handleBack}
          className="text-sm text-teal-600 mb-4 inline-flex items-center"
          aria-label="Go back"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{meta.title}</h1>
        <p className="text-gray-600 mb-4">{meta.description}</p>

        <Suspense fallback={<div>Loading calculator…</div>}>
          <LazyCalc currency={currency} setCurrency={setCurrency} />
        </Suspense>
      </main>
    </div>
  );
}
