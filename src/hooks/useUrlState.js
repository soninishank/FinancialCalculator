'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * A hook that works like useState but syncs the value with a URL query parameter.
 * 
 * @param {string} key - The query parameter key
 * @param {any} defaultValue - The default value if not in URL
 * @param {Object} options - { type: 'number' | 'string' | 'boolean', debounce: number }
 */
export function useUrlState(key, defaultValue, options = {}) {
    const { type = typeof defaultValue, debounce = 500 } = options;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);

    // Initial state from URL or default
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') return defaultValue;

        const params = new URLSearchParams(window.location.search);
        const val = params.get(key);

        if (val !== null) {
            if (type === 'number') {
                const n = Number(val);
                return isNaN(n) ? defaultValue : n;
            }
            if (type === 'boolean') return val === 'true';
            return val;
        }
        return defaultValue;
    });

    // Update URL when state changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            // Only set if different from default or if we want to always track
            // Actually, for calculators, we want to track everything filled.
            if (state !== undefined && state !== null && state !== '') {
                params.set(key, state);
            } else {
                params.delete(key);
            }

            const query = params.toString() ? `?${params.toString()}` : '';
            router.replace(`${pathname}${query}`, { scroll: false });
        }, debounce);

        return () => clearTimeout(timeoutId);
    }, [state, key, pathname, router, debounce]);

    return [state, setState];
}
