import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SingaporeTaxCalculator from '../components/calculators/regional/singapore/SingaporeTaxCalculator';
import UAEGratuityCalculator from '../components/calculators/regional/uae/UAEGratuityCalculator';
import NZPaycheckCalculator from '../components/calculators/regional/newzealand/NZPaycheckCalculator';
import IndiaIncomeTaxCalculator from '../components/calculators/regional/india/IndiaIncomeTaxCalculator';
import IrelandIncomeTaxCalculator from '../components/calculators/regional/ireland/IrelandIncomeTaxCalculator';
import MexicoISRCalculator from '../components/calculators/regional/mexico/MexicoISRCalculator';
import BrazilCLTCalculator from '../components/calculators/regional/brazil/BrazilCLTCalculator';
import SouthAfricaTaxCalculator from '../components/calculators/regional/southafrica/SouthAfricaTaxCalculator';

const checkNoNaN = () => {
    const bodyText = document.body.textContent;
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('Infinity');
};

describe('Regional Calculators Batch 2 Smoke Tests', () => {
    test('Singapore Tax Calculator renders without errors', async () => {
        render(<SingaporeTaxCalculator currency="SGD" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Singapore Income Tax/i).length).toBeGreaterThan(0);
    });

    test('UAE Gratuity Calculator renders without errors', async () => {
        render(<UAEGratuityCalculator currency="AED" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/UAE Gratuity/i).length).toBeGreaterThan(0);
    });

    test('NZ Paycheck Calculator renders without errors', async () => {
        render(<NZPaycheckCalculator currency="NZD" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/New Zealand PAYE/i).length).toBeGreaterThan(0);
    });

    test('India Income Tax Calculator renders without errors', async () => {
        render(<IndiaIncomeTaxCalculator currency="INR" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/India Income Tax/i).length).toBeGreaterThan(0);
    });

    test('Ireland Income Tax Calculator renders without errors', async () => {
        render(<IrelandIncomeTaxCalculator currency="EUR" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Ireland Income Tax/i).length).toBeGreaterThan(0);
    });

    test('Mexico ISR Calculator renders without errors', async () => {
        render(<MexicoISRCalculator currency="MXN" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Mexico ISR/i).length).toBeGreaterThan(0);
    });

    test('Brazil CLT Calculator renders without errors', async () => {
        render(<BrazilCLTCalculator currency="BRL" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/Brazil CLT/i).length).toBeGreaterThan(0);
    });

    test('South Africa Tax Calculator renders without errors', async () => {
        render(<SouthAfricaTaxCalculator currency="ZAR" />);
        await act(async () => { await new Promise(r => setTimeout(r, 0)); });
        checkNoNaN();
        expect(screen.getAllByText(/South Africa Tax/i).length).toBeGreaterThan(0);
    });
});
