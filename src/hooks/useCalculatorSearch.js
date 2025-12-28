import { useMemo } from 'react';
import Fuse from 'fuse.js';
import calculators from '../utils/calculatorsManifest';

export function useCalculatorSearch(query) {
    const fuse = useMemo(() => new Fuse(calculators, {
        keys: ['title', 'keywords', 'description'],
        threshold: 0.4,
        distance: 100
    }), []);

    const results = useMemo(() => {
        const term = query.trim();
        if (!term) return calculators;
        return fuse.search(term).map(result => result.item);
    }, [query, fuse]);

    return results;
}
