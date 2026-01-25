import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoanEMI from '../components/calculators/loans/LoanEMI';

jest.mock('../utils/export', () => ({
    downloadPDF: jest.fn(),
    downloadCSV: jest.fn(),
}));

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

describe('LoanEMI business logic regression tests', () => {
    afterEach(() => {
        cleanup();
        window.history.replaceState({}, '', '/');
    });

    test('zero-rate loans still produce a valid amortization schedule', () => {
        window.history.replaceState({}, '', '/?p=120000&r=0&y=1&mode=EMI');
        render(<LoanEMI currency="INR" />);

        expect(screen.queryByText(/Loan will never be paid off/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Total Interest Payable/i).parentElement).toHaveTextContent('₹0');
        expect(screen.getByText(/Amortization Schedule/i)).toBeInTheDocument();
    });

    test('negative amortization shows the loan error state and hides the schedule', () => {
        window.history.replaceState({}, '', '/?p=100000&r=12&y=10&mode=TENURE&emi=500');
        render(<LoanEMI currency="INR" />);

        expect(screen.getByText(/Loan will never be paid off/i)).toBeInTheDocument();
        expect(screen.queryByText(/Amortization Schedule/i)).not.toBeInTheDocument();
    });

    test('switching tenure units preserves the same loan economics', () => {
        render(<LoanEMI currency="INR" />);

        const totalPaymentCard = screen.getAllByText(/^Total Payment$/i)[0].parentElement;
        const totalPaymentBefore = totalPaymentCard.textContent;

        fireEvent.click(screen.getByText('Months'));

        const totalPaymentAfter = screen.getAllByText(/^Total Payment$/i)[0].parentElement.textContent;
        expect(totalPaymentAfter).toBe(totalPaymentBefore);
    });
});
