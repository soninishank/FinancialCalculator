import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import Pages
import CalculatorPage from "./pages/CalculatorPage";
import HomeFrontPage from "./pages/HomeFrontPage";
import IPOTRackerPage from "./pages/IPOTRackerPage";
import IPODetailPage from "./pages/IPODetailPage";
import CalculatorsList from "./pages/CalculatorsList";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <Routes>
            <Route path="/" element={<HomeFrontPage />} />
            <Route element={<Layout />}>
              <Route path="/calculators" element={<CalculatorsList />} />
              <Route path="/calculator/:slug" element={<CalculatorPage />} />
              <Route path="/ipo-tracker" element={<IPOTRackerPage />} />
              <Route path="/ipo/:symbol" element={<IPODetailPage />} />
            </Route>
            <Route path="*" element={<div>Route not found.</div>} />
          </Routes>
        </CurrencyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
