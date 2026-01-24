import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import manifest from '../utils/calculatorsManifest';
import { importCalculatorBySlug } from '../utils/calculatorImports';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock standard utils that use heavy libs
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
    useParams: () => ({ slug: 'test-slug' }),
}));

// Mock Chart.js components
jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        Line: React.forwardRef((props, ref) => <div data-testid="mock-chart-line" ref={ref} />),
        Bar: React.forwardRef((props, ref) => <div data-testid="mock-chart-bar" ref={ref} />),
        Pie: React.forwardRef((props, ref) => <div data-testid="mock-chart-pie" ref={ref} />),
        Doughnut: React.forwardRef((props, ref) => <div data-testid="mock-chart-doughnut" ref={ref} />),
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

describe('Dynamic Calculator Rendering Tests', () => {
    manifest.forEach((calc) => {
        test(`Calculator: ${calc.title} (${calc.slug}) renders without crashing`, async () => {
            let Component;
            try {
                const module = await importCalculatorBySlug(calc.slug);
                Component = module.default;
            } catch (error) {
                throw new Error(`Failed to import calculator "${calc.slug}": ${error.message}`);
            }

            if (!Component) {
                throw new Error(`Calculator "${calc.slug}" has no default export`);
            }

            await act(async () => {
                render(<Component currency="INR" />);
            });

            // Basic check that something rendered
            expect(document.body.innerHTML).not.toBe('');
        });
    });
});
