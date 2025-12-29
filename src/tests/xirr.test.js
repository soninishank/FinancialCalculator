
import { calculateXIRR, generateSimpleFlows } from '../utils/xirr';

describe('XIRR Calculation', () => {
    // ... (existing tests) ...
    test('verifies excel scenario', () => {
        const flows = [
            { amount: -10000, date: new Date('2023-01-01') },
            { amount: -5000, date: new Date('2023-06-01') },
            { amount: 18000, date: new Date('2024-01-01') }
        ];
        const xirr = calculateXIRR(flows);
        // Excel says 29.56% approx
        expect(xirr).toBeCloseTo(0.2343, 3);
    });
});

describe('Simple Mode Flow Generation', () => {
    test('generates monthly flows correctly', () => {
        const { flows } = generateSimpleFlows('2023-01-01', '2023-04-01', 'monthly', 10000, 31000);

        expect(flows).toHaveLength(4); // Jan, Feb, Mar investments + Maturity
        expect(flows[0].amount).toBe(-10000);
        expect(flows[0].date.toISOString().slice(0, 10)).toBe('2023-01-01');
        expect(flows[1].date.toISOString().slice(0, 10)).toBe('2023-02-01');
        expect(flows[2].date.toISOString().slice(0, 10)).toBe('2023-03-01');

        // Maturity
        expect(flows[3].amount).toBe(31000);
        expect(flows[3].date.toISOString().slice(0, 10)).toBe('2023-04-01');
    });

    test('generates yearly flows correctly', () => {
        const { flows, error } = generateSimpleFlows('2020-01-01', '2022-01-01', 'yearly', 10000, 25000);
        expect(error).toBeUndefined();
        expect(flows).toHaveLength(3); // 2020, 2021 + Maturity 2022

        expect(flows[0].date.getFullYear()).toBe(2020);
        expect(flows[1].date.getFullYear()).toBe(2021);
        expect(flows[2].date.getFullYear()).toBe(2022);
    });

    test('validates dates', () => {
        const { error } = generateSimpleFlows('2023-01-01', '2022-01-01', 'monthly', 1000, 2000);
        expect(error).toBe('Start date must be before maturity date');
    });
});
