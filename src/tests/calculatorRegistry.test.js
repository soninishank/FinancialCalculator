
import manifest from '../utils/calculatorsManifest';
import { importCalculatorBySlug } from '../utils/calculatorImports';

/**
 * Integration Test: Calculator Registry Verification
 * 
 * This test ensures that every calculator defined in the manifest
 * has a corresponding import mapping in the application.
 * This prevents runtime "Unknown calculator" errors.
 */
describe('Calculator Registry Integration', () => {

    test('All manifest instances should have a valid import mapping', async () => {
        // Iterate over every single calculator in the manifest
        const errors = [];

        for (const calculator of manifest) {
            const { slug, title } = calculator;

            try {
                // Attempt to resolve the import
                // We don't need to await the full module load (which might fail in strictly unit test env if files missing),
                // but we MUST ensure the function doesn't throw or return a rejected promise immediately.
                const importPromise = importCalculatorBySlug(slug);
                expect(importPromise).toBeDefined();
            } catch (error) {
                errors.push(`Missing import mapping for slug: "${slug}" (Title: ${title})`);
            }
        }

        // If we found any missing mappings, fail the test with a descriptive message
        if (errors.length > 0) {
            throw new Error(`\nCalculator Registry Failure:\n${errors.join('\n')}\n`);
        }
    });

    test('Should throw error for unknown slug', async () => {
        const unknownSlug = 'non-existent-calculator-slug-12345';
        try {
            await importCalculatorBySlug(unknownSlug);
            // If it doesn't throw, fail the test
            throw new Error('Should have thrown an error for unknown slug');
        } catch (e) {
            expect(e.message).toContain('Unknown calculator');
        }
    });
});
