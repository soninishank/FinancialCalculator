import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CurrencyProvider } from './contexts/CurrencyContext';

// Import Pages
import CalculatorPage from "./pages/CalculatorPage";
// import HomeFrontPage from "./pages/HomeFrontPage";
// import IPOTRackerPage from "./pages/IPOTRackerPage";
// import IPODetailPage from "./pages/IPODetailPage";
import CalculatorsList from "./pages/CalculatorsList";
import Layout from "./components/Layout";
import NotFoundPage from "./pages/NotFoundPage";

// Hooks
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";

function RouteTracker() {
  useGoogleAnalytics();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <CurrencyProvider>
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
      </CurrencyProvider>
    </BrowserRouter>
  );
}
