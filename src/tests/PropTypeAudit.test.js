
import React from 'react';
import { render } from '@testing-library/react';
import manifest from '../utils/calculatorsManifest';
import { importCalculatorBySlug } from '../utils/calculatorImports';

// Polyfill for ResizeObserver which is often missing in Jest/SDOM
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock Component Helper
const MockChart = React.forwardRef((props, ref) => <div data-testid="mock-chart" ref={ref}>Chart</div>);

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
    Line: React.forwardRef((props, ref) => <MockChart {...props} ref={ref} />),
    Bar: React.forwardRef((props, ref) => <MockChart {...props} ref={ref} />),
    Pie: React.forwardRef((props, ref) => <MockChart {...props} ref={ref} />),
    Doughnut: React.forwardRef((props, ref) => <MockChart {...props} ref={ref} />),
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

// Mock Recharts components - Fully mocked to avoid import issues
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div style={{ width: 500, height: 500 }}>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    BarChart: ({ children }) => <div>{children}</div>,
    PieChart: ({ children }) => <div>{children}</div>,
    Bar: () => <div>Bar</div>,
    Line: () => <div>Line</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>Grid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>,
    Cell: () => <div>Cell</div>,
}));

// Mock Canvas for Chart.js
HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => { },
    clearRect: () => { },
    getImageData: (x, y, w, h) => {
        return {
            data: new Array(w * h * 4)
        };
    },
    putImageData: () => { },
    createImageData: () => [],
    setTransform: () => { },
    drawImage: () => { },
    save: () => { },
    restore: () => { },
    beginPath: () => { },
    moveTo: () => { },
    lineTo: () => { },
    closePath: () => { },
    stroke: () => { },
    translate: () => { },
    scale: () => { },
    rotate: () => { },
    arc: () => { },
    fill: () => { },
    measureText: () => {
        return { width: 0 };
    },
    transform: () => { },
    rect: () => { },
    clip: () => { },
});

/**
 * PropType Audit Test
 * 
 * This test acts as a strict "Gatekeeper". 
 * It iterates through every calculator in the manifest, renders it, and 
 * fails if ANY console.error or console.warn is triggered (including PropType warnings).
 */
describe('Calculator PropType & Runtime Audit', () => {
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        // Spy on console.error and console.warn
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore mocks
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    // Iterate dynamically over the manifest
    manifest.forEach((calculator) => {
        const { slug, title } = calculator;

        test(`[${title}] should render without PropType warnings or runtime errors`, async () => {
            // 1. Dynamic Import
            const module = await importCalculatorBySlug(slug);
            const Component = module.default;

            expect(Component).toBeDefined();

            // 2. Render Component
            // Most calculators take "currency" props or handle their own state.
            // We just render them 'naked' or with basic props if absolutely needed.
            // Adjust props here if specific components strictly require them to boot.
            try {
                // Determine props based on common patterns if needed, or default to empty
                const props = {
                    currency: 'INR',
                    setCurrency: jest.fn(), // mock setter
                };

                render(<Component {...props} />);

            } catch (error) {
                // Catch standard runtime crashes (though ErrorBoundary usually handles app side, this catches test side)
                throw new Error(`CRASH: "${title}" (${slug}) threw an error during render: ${error.message}`);
            }

            // 3. Check for Console Errors (including PropTypes)
            if (consoleErrorSpy.mock.calls.length > 0) {
                const errors = consoleErrorSpy.mock.calls.map(args => args.join(' ')).join('\n');
                throw new Error(`PROPTYPE/RUNTIME ERROR in "${title}" (${slug}):\n${errors}`);
            }

            // 4. Check for Console Warnings
            if (consoleWarnSpy.mock.calls.length > 0) {
                const warnings = consoleWarnSpy.mock.calls.map(args => args.join(' ')).join('\n');
                throw new Error(`CONSOLE WARNING in "${title}" (${slug}):\n${warnings}`);
            }
        });
    });
});
