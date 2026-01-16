
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SalaryHikeCalculator from '../components/calculators/income/SalaryHikeCalculator';
import '@testing-library/jest-dom';

// GLODEN TEST TEMPLATE
// This file serves as the standard for testing financial calculators.
// It covers:
// 1. Rendering (Smoke Test)
// 2. Happy Path (Standard Inputs)
// 3. Negative/Edge Cases (Boundary Values)

// Mock Chart.js to avoid canvas errors
jest.mock('react-chartjs-2', () => ({
    Doughnut: () => <div data-testid="mock-doughnut-chart" />
}));

jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    ArcElement: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
}));

// Mock common components to isolate unit logic
jest.mock('../components/common/InputWithSlider', () => {
    return ({ label, value, onChange, min, max }) => (
        <div data-testid="input-with-slider">
            <label>{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                aria-label={label}
            />
        </div>
    );
});

describe('SalaryHikeCalculator', () => {

    // 1. SMOKE TEST
    test('renders without crashing', () => {
        render(<SalaryHikeCalculator currency="INR" />);
        expect(screen.getByText('Current Annual Salary')).toBeInTheDocument();
        expect(screen.getByText('Hike Percentage')).toBeInTheDocument();
        expect(screen.getByText('New Salary Structure')).toBeInTheDocument();
    });

    // 2. HAPPY PATH
    test('calculates correct hike for standard values', () => {
        render(<SalaryHikeCalculator currency="INR" />);

        // Get inputs (mocked InputWithSlider renders standard inputs with labels)
        const salaryInput = screen.getByLabelText('Current Annual Salary');
        const hikeInput = screen.getByLabelText('Hike Percentage');

        // Initial State (Default values if any, or 0)
        // Let's set: Salary = 10,00,000, Hike = 10%
        fireEvent.change(salaryInput, { target: { value: '1000000' } });
        fireEvent.change(hikeInput, { target: { value: '10' } });

        // Expected Calculation:
        // Hike = 10,00,000 * 0.10 = 1,00,000
        // New Salary = 11,00,000

        // Check for formatted output in the DOM
        // Note: The component uses moneyFormat/Intl, so we look for substrings or specific formats
        // We match stricter strings if possible, but localized strings can be tricky.
        // Looking for "1,100,000" or similar.

        // Expect multiple occurrences (e.g. in summary and breakdown)
        const hikeMatches = screen.getAllByText(/1,00,000/);
        expect(hikeMatches.length).toBeGreaterThan(0);

        const salaryMatches = screen.getAllByText(/11,00,000/);
        expect(salaryMatches.length).toBeGreaterThan(0);
    });

    // 3. NEGATIVE / EDGE CASES
    test('handles zero values gracefully', () => {
        render(<SalaryHikeCalculator currency="INR" />);

        const salaryInput = screen.getByLabelText('Current Annual Salary');
        const hikeInput = screen.getByLabelText('Hike Percentage');

        fireEvent.change(salaryInput, { target: { value: '0' } });
        fireEvent.change(hikeInput, { target: { value: '10' } });

        // Should basically show 0
        // We look for logic that handles division by zero or NaN, though simple multiplication usually handles 0 fine.
        const results = screen.getAllByText(/₹0/i);
        expect(results.length).toBeGreaterThan(0);
    });

    test('handles negative inputs by respecting min props (simulated integration)', () => {
        // Since we mocked InputWithSlider, we can't test strict UI restriction (that's InputWithSlider's job).
        // But we can test if the PARENT component handles the value if it somehow gets passed.

        render(<SalaryHikeCalculator currency="INR" />);
        const salaryInput = screen.getByLabelText('Current Annual Salary');

        // If logic allows negatives, we might see negative results. Standards say clamp to 0 if nonsensical.
        fireEvent.change(salaryInput, { target: { value: '-5000' } });

        // Ideally, the calculator component logic *could* coerce this or show standard negative formatting.
        // If standard behavior is just math, -5000 is "valid" math but invalid business logic.
        // This test ensures it doesn't crash.
        expect(screen.getByText(/New Salary Structure/)).toBeInTheDocument();
    });
});
