'use client';

import { CurrencyProvider } from '../contexts/CurrencyContext';
// import { useGoogleAnalytics } from '../src/hooks/useGoogleAnalytics'; // We will adapt this later or use Script

export function Providers({ children }) {
    // useGoogleAnalytics(); // Can adapt here if needed
    return (
        <CurrencyProvider>
            {children}
        </CurrencyProvider>
    );
}
