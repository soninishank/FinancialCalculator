'use client';

import { CurrencyProvider } from '../contexts/CurrencyContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <CurrencyProvider>
                {children}
            </CurrencyProvider>
        </ThemeProvider>
    );
}
