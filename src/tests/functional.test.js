import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Imports
import RecurringDeposit from '../components/calculators/RecurringDeposit';
import SWPCalculator from '../components/calculators/SWPCalculator';
import GoalPlanner from '../components/calculators/GoalPlanner';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock modules
jest.mock('../utils/export', () => ({
    downloadPDF: jest.fn(),
    downloadCSV: jest.fn(),
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
        push: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        Line: React.forwardRef((props, ref) => <div data-testid="mock-chart" ref={ref} />),
        Bar: React.forwardRef((props, ref) => <div data-testid="mock-chart" ref={ref} />),
        Pie: React.forwardRef((props, ref) => <div data-testid="mock-chart" ref={ref} />),
        Doughnut: React.forwardRef((props, ref) => <div data-testid="mock-chart" ref={ref} />),
    };
});

jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    registerables: [],
    CategoryScale: jest.fn(),
    LinearScale: jest.fn(),
    PointElement: jest.fn(),
    LineElement: jest.fn(),
    Title: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    BarElement: jest.fn(),
    ArcElement: jest.fn(),
    Filler: jest.fn(),
}));

describe('Functional Verification Tests', () => {

    test('RecurringDeposit calculates correct values (No NaN)', async () => {
        render(<RecurringDeposit currency="INR" />);

        // Wait for potential effects
        await act(async () => {
            await new Promise(r => setTimeout(r, 0));
        });

        const maturityValues = screen.getAllByText(/Maturity Value/i);
        expect(maturityValues.length).toBeGreaterThan(0);

        // Check for NaN anywhere in the document body
        const bodyText = document.body.textContent;
        expect(bodyText).not.toMatch(/NaN/);
        expect(bodyText).not.toMatch(/Infinity/);
    });

    test('SWPCalculator calculates correct values (No NaN)', async () => {
        render(<SWPCalculator currency="INR" />);

        await act(async () => {
            await new Promise(r => setTimeout(r, 0));
        });

        const bodyText = document.body.textContent;
        expect(bodyText).not.toMatch(/NaN/);
        expect(bodyText).not.toMatch(/Infinity/);
    });

    test('GoalPlanner does not crash on render', async () => {
        render(<GoalPlanner currency="INR" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        const bodyText = document.body.textContent;
        expect(bodyText).not.toMatch(/NaN/);
    });
});
