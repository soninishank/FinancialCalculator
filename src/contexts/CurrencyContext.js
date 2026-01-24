// src/contexts/CurrencyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [currency, setCurrencyState] = useState('INR');
  const [isLocked, setIsLocked] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const params = new URLSearchParams(window.location.search);
    const urlCurr = params.get('curr');
    const storedCurr = localStorage.getItem('app-currency');

    if (urlCurr) {
      setCurrencyState(urlCurr);
    } else if (storedCurr) {
      setCurrencyState(storedCurr);
    } else {
      setCurrencyState(getGeoDefault());
    }
  }, []);

  const setCurrency = (val) => {
    setCurrencyState(val);
    localStorage.setItem('app-currency', val);
  };

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
