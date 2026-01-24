// src/contexts/CurrencyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUrlState } from '../hooks/useUrlState';
import { getCurrencyForCountry, guessCurrencyFromTimezone } from '../utils/geo';

// Create context
const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => { }
});

export function CurrencyProvider({ children }) {
  const getGeoDefault = () => {
    // Check cookie first
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/user-country=([^;]+)/);
      if (match) return getCurrencyForCountry(match[1]);
    }
    // Fallback to timezone
    return guessCurrencyFromTimezone();
  };

  // 1. Determine initial default stably to avoid hydration mismatch
  // We MUST use a constant value for the first render on both server/client
  const [currency, setCurrency] = useUrlState('curr', 'INR');
  const [isLocked, setIsLocked] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Still keep a sync effect but only if currency wasn't set by URL
  useEffect(() => {
    setHasMounted(true);
    const params = new URLSearchParams(window.location.search);

    if (!params.get('curr')) {
      const currentGeo = getGeoDefault();
      if (currentGeo !== currency) {
        setCurrency(currentGeo);
      }
    }
  }, []); // Only run once on mount

  // Sync with URL if it changes later (optional, usually handled by useUrlState)
  useEffect(() => {
    if (!hasMounted) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('curr')) {
      // Re-check geo if URL is cleared? Maybe redundant.
    }
  }, [currency, hasMounted]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLocked, setIsLocked }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'INR',
      setCurrency: () => { },
      isLocked: false,
      setIsLocked: () => { }
    };
  }
  return ctx;
}
