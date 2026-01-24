// src/contexts/CurrencyContext.js
import React, { createContext, useContext, useState } from 'react';
import { useUrlState } from '../hooks/useUrlState';

// Create context
const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => { }
});

/**
 * CurrencyProvider - wraps the app and provides currency state
 */
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useUrlState('curr', 'INR');
  const [isLocked, setIsLocked] = useState(false);
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLocked, setIsLocked }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * useCurrency - safe hook that always returns an object { currency, setCurrency }.
 * If used outside a provider it returns a fallback (no-op setter) instead of throwing.
 */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback object — keeps calling code safe even if provider wasn't mounted.
    return {
      currency: 'INR',
      setCurrency: () => { },
      isLocked: false,
      setIsLocked: () => { }
    };
  }
  return ctx;
}
