import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyToolsWorkspace from '../components/home/MyToolsWorkspace';

describe('MyToolsWorkspace', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.localStorage.setItem('calc_favorites_v1', JSON.stringify(['pure-sip']));
        window.localStorage.setItem('calc_recent_v1', JSON.stringify(['loan-emi', 'pure-sip']));
        window.localStorage.setItem('calc_view_presets_v1', JSON.stringify([
            {
                id: 'preset-1',
                name: 'Tax focus',
                filters: { q: 'tax', selectedCategory: 'Tax' }
            }
        ]));
    });

    test('renders saved calculators and view presets', async () => {
        render(<MyToolsWorkspace />);

        expect(await screen.findByText('Your saved calculator workspace')).toBeInTheDocument();
        expect(screen.getAllByText('SIP Calculator').length).toBeGreaterThan(0);
        expect(screen.getByText('Tax focus')).toBeInTheDocument();
        expect(screen.getByText('Recently opened')).toBeInTheDocument();
    });
});
