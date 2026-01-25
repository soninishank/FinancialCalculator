const FAVORITES_KEY = 'calc_favorites_v1';
const RECENT_KEY = 'calc_recent_v1';
const VIEW_PRESETS_KEY = 'calc_view_presets_v1';
const MAX_RECENT = 8;
const MAX_PRESETS = 6;

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseArray(raw) {
    try {
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function getFavorites() {
    if (!canUseStorage()) return [];
    return parseArray(window.localStorage.getItem(FAVORITES_KEY));
}

export function setFavorites(slugs) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs));
}

export function clearFavorites() {
    if (!canUseStorage()) return [];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
    return [];
}

export function toggleFavorite(slug) {
    const current = getFavorites();
    const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
    setFavorites(next);
    return next;
}

export function getRecent() {
    if (!canUseStorage()) return [];
    return parseArray(window.localStorage.getItem(RECENT_KEY));
}

export function recordRecent(slug) {
    if (!canUseStorage()) return [];
    const deduped = getRecent().filter((item) => item !== slug);
    const next = [slug, ...deduped].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
}

export function clearRecent() {
    if (!canUseStorage()) return [];
    window.localStorage.setItem(RECENT_KEY, JSON.stringify([]));
    return [];
}

export function getViewPresets() {
    if (!canUseStorage()) return [];
    const raw = parseArray(window.localStorage.getItem(VIEW_PRESETS_KEY));
    return raw.filter((item) => item && item.id && item.name);
}

export function saveViewPreset(preset) {
    if (!canUseStorage()) return [];
    const current = getViewPresets().filter((item) => item.id !== preset.id);
    const next = [preset, ...current].slice(0, MAX_PRESETS);
    window.localStorage.setItem(VIEW_PRESETS_KEY, JSON.stringify(next));
    return next;
}

export function removeViewPreset(id) {
    if (!canUseStorage()) return [];
    const next = getViewPresets().filter((item) => item.id !== id);
    window.localStorage.setItem(VIEW_PRESETS_KEY, JSON.stringify(next));
    return next;
}

// ── Saved Comparisons ────────────────────────────────────────────────────────
const SAVED_COMPARISONS_KEY = 'calc_saved_comparisons_v1';
const MAX_SAVED_COMPARISONS = 8;

export function getSavedComparisons() {
    if (!canUseStorage()) return [];
    const raw = parseArray(window.localStorage.getItem(SAVED_COMPARISONS_KEY));
    return raw.filter((item) => item && item.id && item.name && Array.isArray(item.slugs));
}

export function saveComparison(comparison) {
    if (!canUseStorage()) return [];
    const current = getSavedComparisons().filter((item) => item.id !== comparison.id);
    const next = [comparison, ...current].slice(0, MAX_SAVED_COMPARISONS);
    window.localStorage.setItem(SAVED_COMPARISONS_KEY, JSON.stringify(next));
    return next;
}

export function removeSavedComparison(id) {
    if (!canUseStorage()) return [];
    const next = getSavedComparisons().filter((item) => item.id !== id);
    window.localStorage.setItem(SAVED_COMPARISONS_KEY, JSON.stringify(next));
    return next;
}
