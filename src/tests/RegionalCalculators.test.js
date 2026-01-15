import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mocks
jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart" />,
    Bar: () => <div data-testid="bar-chart" />,
    Pie: () => <div data-testid="pie-chart" />,
    Doughnut: () => <div data-testid="doughnut-chart" />,
}));

jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    registerables: [],
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Import Components
import UKIncomeTaxCalculator from '../components/calculators/regional/uk/UKIncomeTaxCalculator';
import AustraliaIncomeTaxCalculator from '../components/calculators/regional/australia/AustraliaIncomeTaxCalculator';
import CanadaIncomeTaxCalculator from '../components/calculators/regional/canada/CanadaIncomeTaxCalculator';
import EuropeVATCalculator from '../components/calculators/regional/europe/EuropeVATCalculator';
import JapanPaycheckCalculator from '../components/calculators/regional/japan/JapanPaycheckCalculator';
import HongKongSalaryTaxCalculator from '../components/calculators/regional/hongkong/HongKongSalaryTaxCalculator';
import ChinaIncomeTaxCalculator from '../components/calculators/regional/china/ChinaIncomeTaxCalculator';
import SwitzerlandIncomeTaxCalculator from '../components/calculators/regional/switzerland/SwitzerlandIncomeTaxCalculator';

const checkNoNaN = () => {
    const bodyText = document.body.textContent;
    expect(bodyText).not.toMatch(/NaN/);
    expect(bodyText).not.toMatch(/Infinity/);
};

describe('Regional Calculators Smoke Tests', () => {

    test('UK Income Tax Calculator renders without errors', async () => {
        render(<UKIncomeTaxCalculator currency="GBP" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getByText(/Monthly Take-Home/i)).toBeInTheDocument();
    });

    test('Australia Income Tax Calculator renders without errors', async () => {
        render(<AustraliaIncomeTaxCalculator currency="AUD" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getByText(/Monthly Net Pay/i)).toBeInTheDocument();
    });

    test('Canada Income Tax Calculator renders without errors', async () => {
        render(<CanadaIncomeTaxCalculator currency="CAD" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getByText(/Monthly Net Pay/i)).toBeInTheDocument();
    });

    test('Europe VAT Calculator renders without errors', async () => {
        render(<EuropeVATCalculator currency="EUR" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getByText(/VAT Amount/i)).toBeInTheDocument();
    });

    test('Japan Paycheck Calculator renders without errors', async () => {
        render(<JapanPaycheckCalculator currency="JPY" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getByText(/Monthly Take-Home/i)).toBeInTheDocument();
    });

    test('Hong Kong Salary Tax Calculator renders without errors', async () => {
        render(<HongKongSalaryTaxCalculator currency="HKD" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Salaries Tax/i).length).toBeGreaterThan(0);
    });

    test('China Income Tax Calculator renders without errors', async () => {
        render(<ChinaIncomeTaxCalculator currency="CNY" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Individual Income Tax/i).length).toBeGreaterThan(0);
    });

    test('Switzerland Income Tax Calculator renders without errors', async () => {
        render(<SwitzerlandIncomeTaxCalculator currency="CHF" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Total Income Tax/i).length).toBeGreaterThan(0);
    });
});
