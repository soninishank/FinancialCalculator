
import manifest from '../utils/calculatorsManifest';
import { calculatorDetails } from '../data/calculatorDetails';
import { calculatorFaqs } from '../data/seoMetadata';

/**
 * Content Coverage Audit
 * 
 * This test suite ensures that every calculator defined in the manifest
 * has the necessary content blocks (Details, FAQs) to ensure a high-quality,
 * complete user experience.
 */
describe('Calculator Content Coverage', () => {

    test('All calculators must have a Details entry', () => {
        const errors = [];
        manifest.forEach(calc => {
            // Check for direct slug match (standard) or legacy casing variations
            const key = calc.slug;
            const legacyKeyCamel = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()); // e.g., car-loan-emi -> carLoanEmi
            
            // Allow for now, but goal is to standardize on slug
            const hasEntry = calculatorDetails[key] || calculatorDetails[legacyKeyCamel];

            if (!hasEntry) {
                errors.push(`Missing 'calculatorDetails' for slug: ${key}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`\nContent Missing:\n${errors.join('\n')}\n`);
        }
    });

    test('All calculators must have FAQ entries', () => {
        const errors = [];
        manifest.forEach(calc => {
             // Check for direct slug match (standard)
            const hasEntry = calculatorFaqs[calc.slug];
            
            if (!hasEntry) {
                errors.push(`Missing 'seoMetadata.js' FAQs for slug: ${calc.slug}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`\nFAQs Missing:\n${errors.join('\n')}\n`);
        }
    });
});
