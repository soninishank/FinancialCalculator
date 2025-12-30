import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CurrencyProvider } from './contexts/CurrencyContext';

// Static imports for layout and hooks
import Layout from "./components/Layout";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";
import ScrollToTop from "./components/common/ScrollToTop";

// Lazy Load Pages
const CalculatorPage = lazy(() => import("./pages/CalculatorPage"));
// const HomeFrontPage = lazy(() => import("./pages/HomeFrontPage"));
// const IPOTRackerPage = lazy(() => import("./pages/IPOTRackerPage"));
// const IPODetailPage = lazy(() => import("./pages/IPODetailPage"));
const CalculatorsList = lazy(() => import("./pages/CalculatorsList"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteTracker() {
  useGoogleAnalytics();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <ScrollToTop />
      <CurrencyProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        }>
          <Routes>
            <Route element={<Layout fullWidth={true} />}>
              <Route path="/" element={<Navigate to="/calculators" replace />} />
            </Route>
            <Route element={<Layout />}>
              <Route path="/calculators" element={<CalculatorsList />} />
              <Route path="/calculators/:slug" element={<CalculatorPage />} />
              {/* <Route path="/ipo-tracker" element={<IPOTRackerPage />} /> */}
              {/* <Route path="/ipo/:symbol" element={<IPODetailPage />} /> */}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
