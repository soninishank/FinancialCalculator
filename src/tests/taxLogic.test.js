import {
    calculateSimpleInterest,
    calculateCompoundInterest,
    calculateRealRate,
} from '../utils/finance';
import { calculateLTCG } from '../utils/tax';
import { calculateUSCapitalGainsTax } from '../utils/usCapitalGains';

describe('Finance and tax regression tests', () => {
    test('calculateRealRate preserves negative real returns', () => {
        expect(calculateRealRate(4, 5)).toBeCloseTo(-0.95, 2);
    });

    test('simple interest rejects reversed date ranges', () => {
        const result = calculateSimpleInterest({
            principal: 1000,
            rate: 10,
            startDate: '2026-06-01',
            endDate: '2026-01-01',
        });

        expect(result.error).toMatch(/End date/);
        expect(result.totalAmount).toBe(1000);
        expect(result.interest).toBe(0);
    });

    test('compound interest rejects reversed date ranges', () => {
        const result = calculateCompoundInterest({
            principal: 1000,
            rate: 10,
            frequency: 12,
            startDate: '2026-06-01',
            endDate: '2026-01-01',
        });

        expect(result.error).toMatch(/End date/);
        expect(result.totalAmount).toBe(1000);
        expect(result.interest).toBe(0);
    });

    test('shared LTCG logic does not apply a fake currency-based exemption cap', () => {
        const result = calculateLTCG(5000, 10000, true, {
            currency: 'USD',
            exemptionApplied: true,
            exemptionLimit: 2500,
            taxRate: 10,
        });

        expect(result.taxableGain).toBe(2500);
        expect(result.taxAmount).toBe(250);
    });

    test('US long-term gains are taxed progressively instead of at one flat rate', () => {
        const result = calculateUSCapitalGainsTax({
            purchasePrice: 100000,
            salePrice: 170000,
            isLongTerm: true,
            filingStatus: 'single',
            annualIncome: 40000,
        });

        expect(result.gain).toBe(70000);
        expect(result.taxAmount).toBeCloseTo(9247.5, 2);
        expect(result.taxRate).toBeCloseTo(13.21, 2);
    });
});
