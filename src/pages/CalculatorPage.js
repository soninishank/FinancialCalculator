// src/pages/CalculatorPage.js
import React, { Suspense, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import manifest from '../utils/calculatorsManifest';
import { useCurrency } from '../contexts/CurrencyContext';
import RelatedCalculators from '../components/common/RelatedCalculators';

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
    // FIRE Calculators
    case 'time-to-fire': return import('../components/calculators/TimeToFIRE');
    case 'coast-fire': return import('../components/calculators/CoastFIRE');
    case 'swr-simulator': return import('../components/calculators/SWRSimulator');
    // Decision Making
    case 'rent-vs-buy': return import('../components/calculators/RentVsBuy');
    case 'cost-of-delay': return import('../components/calculators/CostOfDelay');
    case 'step-down-withdrawal': return import('../components/calculators/StepDownWithdrawal');
    // General / Hygiene
    case 'inflation-impact': return import('../components/calculators/InflationImpact');
    case 'asset-allocation': return import('../components/calculators/AssetAllocation');
    case 'simple-interest': return import('../components/calculators/SimpleInterest');
    case 'recurring-deposit': return import('../components/calculators/RecurringDeposit');
    case 'credit-card-payoff': return import('../components/calculators/CreditCardPayoff');
    case 'roi-calculator': return import('../components/calculators/ROICalculator');
    case 'rule-of-72': return import('../components/calculators/RuleOf72');
    case 'refinance-calculator': return import('../components/calculators/RefinanceCalculator');
    case 'compound-interest': return import('../components/calculators/CompoundInterest');
    case 'home-loan-eligibility': return import('../components/calculators/HomeLoanEligibility');
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
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    } catch (err) {
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Main Content: 9 columns on large screens for a balanced width */}
        <main className="lg:col-span-9 order-1">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="text-sm font-medium text-teal-600 mb-6 inline-flex items-center hover:translate-x-[-4px] transition-transform"
              aria-label="Go back"
            >
              <span className="mr-2">←</span> Back
            </button>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {meta.title}
            </h1>
            <p className="text-gray-500 text-base mb-8 max-w-3xl leading-relaxed">
              {meta.description}
            </p>

            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-500 font-medium">Loading calculator...</span>
              </div>
            }>
              <LazyCalc currency={currency} setCurrency={setCurrency} />
            </Suspense>
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
