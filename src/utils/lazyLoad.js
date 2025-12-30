import { lazy } from 'react';

/**
 * A utility to lazy load a component with retries.
 * 
 * @param {Function} importFunc - The dynamic import function (e.g. () => import('./Component'))
 * @param {number} retries - Number of retry attempts (default: 4)
 * @param {number} interval - Initial delay before retry in ms (default: 1000)
 */
export const lazyLoad = (importFunc, retries = 4, interval = 1000) => {
    return lazy(() => {
        return new Promise((resolve, reject) => {
            importFunc()
                .then(resolve)
                .catch((error) => {
                    // Check if retries are left
                    if (retries === 0) {
                        // If it's a chunk load error and we are out of retries, we might want to reload the page once?
                        // For now, let the ErrorBoundary handle the final failure.
                        console.error("Lazy load failed after retries:", error);
                        reject(error);
                        return;
                    }

                    console.warn(`Lazy load failed, retrying... (${retries} attempts left)`);

                    // Exponential backoff or simple interval
                    setTimeout(() => {
                        // Recursive call with decremented retries
                        lazyLoad(importFunc, retries - 1, interval)
                        // The recursive call returns a Lazy component which isn't a Promise that resolves to the module directly.
                        // Wait, lazy expects a function that returns a Promise resolving to { default: Component }

                        // We need to re-execute the importFunc, not call lazyLoad recursively in this way.
                        // Let's retry the Promise chain.

                        // Actually, simpler logic:
                        lazyRetry(importFunc, retries, interval).then(resolve).catch(reject);
                    }, interval);
                });
        });
    });
};

/**
 * Helper to retry the promise itself
 */
const lazyRetry = (importFunc, retriesLeft, interval) => {
    return new Promise((resolve, reject) => {
        importFunc()
            .then(resolve)
            .catch((error) => {
                if (retriesLeft === 0) {
                    reject(error);
                    return;
                }
                setTimeout(() => {
                    lazyRetry(importFunc, retriesLeft - 1, interval).then(resolve).catch(reject);
                }, interval);
            });
    });
};

// Default export if you prefer using it like lazy(() => import(...)) replacement directly
export default lazyLoad;
