
import React from 'react';
import { render, screen } from '@testing-library/react';
import ExpenseRatioCalculator from '../components/calculators/ExpenseRatioCalculator';
import '@testing-library/jest-dom';

// Mock TextEncoder/Decoder for JSDOM
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock dependencies
jest.mock('../utils/export', () => ({
    downloadPDF: jest.fn(),
}));

// Mock Chart.js to capture props
jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        // We capture props in a data-attribute to inspect them in tests, 
        // or we can just spy on the component. 
        // Simplest is to just render a dummy that we can find, and maybe attach props to it.
        // Actually, we can spy on the mock implementation if we want, but let's try to infer from what is rendered or use a spy.
        // Better: Mock the whole module and expose a mock function we can inspect.
        Bar: React.forwardRef((props, ref) => {
            const { data } = props;
            if (Array.isArray(data)) {
                return <div data-testid="chart-bar-invalid">Invalid Data Type: Array</div>;
            }
            if (data && data.datasets) {
                return <div data-testid="chart-bar-valid">Valid Data Object</div>;
            }
            return <div data-testid="chart-bar-unknown">Unknown Data</div>;
        }),
        Line: React.forwardRef((props, ref) => null),
        Pie: React.forwardRef((props, ref) => null),
        Doughnut: React.forwardRef((props, ref) => null),
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

describe('ExpenseRatioCalculator Data Handling', () => {
    test('passes valid data object to FinancialBarChart (not an array)', () => {
        render(<ExpenseRatioCalculator />);

        // This should fail currently because it renders "Invalid Data Type: Array"
        const validChart = screen.queryByTestId('chart-bar-valid');
        const invalidChart = screen.queryByTestId('chart-bar-invalid');

        if (invalidChart) {
            throw new Error("Component passed an Array to Bar chart instead of a Data Object! Reproduction successful.");
        }

        expect(validChart).toBeInTheDocument();
    });
});
