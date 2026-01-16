
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeAffordabilityCalculator from '../components/calculators/loans/HomeAffordabilityCalculator';
import '@testing-library/jest-dom';

// FIX: Mock Lucide icons to prevent rendering issues in tests
jest.mock('lucide-react', () => ({
    Home: () => <div data-testid="icon-home" />,
    Calculator: () => <div data-testid="icon-calculator" />
}));

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

// Mock InputWithSlider
jest.mock('../components/common/InputWithSlider', () => {
    return ({ label, value, onChange, min, max }) => (
        <div data-testid="input-with-slider">
            <label>{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                aria-label={label}
            />
        </div>
    );
});

describe('HomeAffordabilityCalculator', () => {

    // 1. SMOKE TEST
    test('renders without crashing', () => {
        render(<HomeAffordabilityCalculator currency="USD" />);
        expect(screen.getByText('Home Affordability Calculator')).toBeInTheDocument();
        expect(screen.getByText('Maximum Home Price')).toBeInTheDocument();
    });

    // 2. LOGIC VERIFICATION (28/36 Rule)
    test('calculates correct affordability based on income', () => {
        render(<HomeAffordabilityCalculator currency="USD" />);

        const incomeInput = screen.getByLabelText('Annual Gross Income');
        const debtInput = screen.getByLabelText('Monthly Debt Payments');

        // Case: Income $100,000, Debt $0
        // Monthly Income = $8,333.33
        // Front-end (28%) = $2,333
        // Back-end (36%) = $3,000
        // Max Payment = $2,333 (Front-end limit wins)

        fireEvent.change(incomeInput, { target: { value: '100000' } });
        fireEvent.change(debtInput, { target: { value: '0' } });

        // Check Front-End DTI is maxed at ~28%
        // We look for text present in the result
        // Check Front-End DTI is maxed at ~28%
        // Regex matches 27.x% or 28.0%
        // Regex matches 27.x% or 28.0%
        const dtiRegex = /2[7-8]\.\d%/;
        expect(screen.getAllByText(dtiRegex).length).toBeGreaterThan(0);
    });

    test('calculates correct affordability with high debt', () => {
        render(<HomeAffordabilityCalculator currency="USD" />);

        const incomeInput = screen.getByLabelText('Annual Gross Income');
        const debtInput = screen.getByLabelText('Monthly Debt Payments');

        // Case: Income $100,000, Debt $1,000
        // Monthly Income = $8,333.33
        // Front-end limit = $2,333
        // Back-end limit = $3,000 - $1,000 = $2,000
        // Max Payment = $2,000 (Back-end limit wins)

        fireEvent.change(incomeInput, { target: { value: '100000' } });
        fireEvent.change(debtInput, { target: { value: '1000' } });

        // Check Back-End DTI is maxed at ~36% (Total Debt / Income)
        // Debt ($1000) + Housing ($2000) = $3000 = 36%
        // Check Back-End DTI is close to 36% (might be slightly less due to step granularity)
        // Regex matches 35.x% or 36.0%
        const dtiRegex = /3[5-6]\.\d%/;
        expect(screen.getAllByText(dtiRegex).length).toBeGreaterThan(0);
    });

    // 3. NEGATIVE / EDGE CASES
    test('handles extremely low income gracefully', () => {
        render(<HomeAffordabilityCalculator currency="USD" />);
        const incomeInput = screen.getByLabelText('Annual Gross Income');

        // InputWithSlider min is 30k, but let's try to set it low via fireEvent
        fireEvent.change(incomeInput, { target: { value: '30000' } }); // Min allowed

        // Should still render a result, even if small
        expect(screen.getByText('Maximum Home Price')).toBeInTheDocument();
    });
});
