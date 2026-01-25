import { useMemo } from 'react';
import Fuse from 'fuse.js';
import calculators from '../utils/calculatorsManifest';

const SEARCH_ALIASES = {
    sip: ['systematic investment plan', 'monthly investment', 'mutual fund'],
    emi: ['loan', 'mortgage', 'installment'],
    tax: ['income tax', 'capital gains', 'deduction'],
    retirement: ['fire', 'withdrawal', 'pension'],
    fire: ['financial independence', 'retirement'],
    fd: ['fixed deposit', 'bank scheme'],
    rd: ['recurring deposit', 'bank scheme'],
    home: ['mortgage', 'home loan', 'property'],
    stock: ['equity', 'shares', 'market'],
    debt: ['loan payoff', 'credit card', 'liability'],
};

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function expandSearchQuery(query) {
    const raw = normalizeText(query);
    if (!raw) return '';
    const tokens = raw.split(/\s+/).filter(Boolean);
    const expanded = new Set(tokens);

    tokens.forEach((token) => {
        const aliases = SEARCH_ALIASES[token] || [];
        aliases.forEach((alias) => expanded.add(alias));
    });

    return Array.from(expanded).join(' ');
}

function scoreExactMatch(item, query) {
    if (!query) return 0;

    const normalizedQuery = normalizeText(query);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const title = normalizeText(item.title);
    const category = normalizeText(item.category);
    const keywords = normalizeText(item.keywords);
    const description = normalizeText(item.description);
    const combined = `${title} ${keywords} ${description} ${category}`;

    let score = 0;
    if (title === normalizedQuery) score += 120;
    if (title.startsWith(normalizedQuery)) score += 65;
    if (title.includes(normalizedQuery)) score += 35;
    if (category.includes(normalizedQuery)) score += 25;
    if (keywords.includes(normalizedQuery)) score += 25;

    const matchedTokens = tokens.filter((token) => combined.includes(token)).length;
    score += matchedTokens * 10;

    return score;
}

export function useCalculatorSearch(query) {
    const fuse = useMemo(() => new Fuse(calculators, {
        keys: [
            { name: 'title', weight: 0.55 },
            { name: 'keywords', weight: 0.3 },
            { name: 'description', weight: 0.12 },
            { name: 'category', weight: 0.03 }
        ],
        threshold: 0.38,
        distance: 120,
        includeScore: true
    }), []);

    const results = useMemo(() => {
        const term = query.trim();
        if (!term) return calculators;

        const expanded = expandSearchQuery(term);
        const ranked = fuse.search(expanded)
            .map((result) => ({
                item: result.item,
                fuseScore: result.score ?? 1,
                exactBoost: scoreExactMatch(result.item, term)
            }))
            .sort((a, b) => {
                if (a.exactBoost !== b.exactBoost) return b.exactBoost - a.exactBoost;
                return a.fuseScore - b.fuseScore;
            });

        const deduped = [];
        const seen = new Set();
        ranked.forEach((entry) => {
            if (!seen.has(entry.item.slug)) {
                seen.add(entry.item.slug);
                deduped.push(entry.item);
            }
        });

        return deduped;
    }, [query, fuse]);

    return results;
}
