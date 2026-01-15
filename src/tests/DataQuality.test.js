
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Import ALL chart-using calculators
import AdvancedCarLoanEMI from '../components/calculators/loans/AdvancedCarLoanEMI';
import AdvancedHomeLoanEMI from '../components/calculators/loans/AdvancedHomeLoanEMI';
import AssetAllocation from '../components/calculators/utils/AssetAllocation';
import CAGRCalculator from '../components/calculators/investments/CAGRCalculator';
import CompareLoans from '../components/calculators/loans/CompareLoans';
import CompoundInterest from '../components/calculators/utils/CompoundInterest';
import CostOfDelay from '../components/calculators/decision/CostOfDelay';
import CreditCardPayoff from '../components/calculators/loans/CreditCardPayoff';
import EMIComparison from '../components/calculators/loans/EMIComparison';
import ExpenseRatioCalculator from '../components/calculators/investments/ExpenseRatioCalculator';
import FixedDeposit from '../components/calculators/savings/FixedDeposit';
import GoalPlanner from '../components/calculators/investments/GoalPlanner';
import HomeLoanEligibility from '../components/calculators/loans/HomeLoanEligibility';
import InflationImpact from '../components/calculators/utils/InflationImpact';
import LoanEMI from '../components/calculators/loans/LoanEMI';
import LumpSumOnly from '../components/calculators/investments/LumpSumOnly';
import MoratoriumLoanEMI from '../components/calculators/loans/MoratoriumLoanEMI';
import PPFCalculator from '../components/calculators/savings/PPFCalculator';
import PropertyLoanEligibility from '../components/calculators/loans/PropertyLoanEligibility';
import PureSIP from '../components/calculators/investments/PureSIP';
import RecurringDeposit from '../components/calculators/savings/RecurringDeposit';
import RefinanceCalculator from '../components/calculators/loans/RefinanceCalculator';
import RentVsBuy from '../components/calculators/decision/RentVsBuy';
import ROICalculator from '../components/calculators/investments/ROICalculator';
import RuleOf72 from '../components/calculators/utils/RuleOf72';
import SimpleInterest from '../components/calculators/utils/SimpleInterest';
import SIPWithLumpSum from '../components/calculators/investments/SIPWithLumpSum';
import StepDownWithdrawal from '../components/calculators/retirement/StepDownWithdrawal';
import StepUpLoanEMI from '../components/calculators/loans/StepUpLoanEMI';
import StepUpSIP from '../components/calculators/investments/StepUpSIP';
import StepUpSIPWithLump from '../components/calculators/investments/StepUpSIPWithLump';
import SWPCalculator from '../components/calculators/investments/SWPCalculator';
import SWRSimulator from '../components/calculators/retirement/SWRSimulator';
import TimeDurationCalculator from '../components/calculators/investments/TimeDurationCalculator';
import TimeToFIRE from '../components/calculators/retirement/TimeToFIRE';
import TopUpLoanEMI from '../components/calculators/loans/TopUpLoanEMI';
import XIRRCalculator from '../components/calculators/investments/XIRRCalculator';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock standard utils
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

/**
 * Enhanced Data Quality Mock for Chart.js
 */
const validateChartJSData = (componentName, props) => {
    const { data } = props;

    if (Array.isArray(data)) {
        throw new Error(
            `[${componentName}] Invalid 'data' prop! Expected object, got Array.`
        );
    }

    if (!data.datasets || data.datasets.length === 0) {
        throw new Error(`[${componentName}] No datasets found in chart data.`);
    }

    data.datasets.forEach((dataset, setIndex) => {
        if (!dataset.data) {
            throw new Error(`[${componentName}] Dataset ${setIndex} (${dataset.label}) has no data property.`);
        }

        if (dataset.data.length === 0) {
            return;
        }

        dataset.data.forEach((point, pointIndex) => {
            if (point === undefined || point === null || Number.isNaN(point)) {
                throw new Error(
                    `[${componentName}] Found invalid data point in Dataset ${setIndex} (${dataset.label}) at index ${pointIndex}: ${point}`
                );
            }
        });
    });

    return <div data-testid={`mock-${componentName}`} />;
};

// Mock Chart Components (React Chartjs 2)
jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        Bar: React.forwardRef((props, ref) => validateChartJSData('Bar', props)),
        Line: React.forwardRef((props, ref) => validateChartJSData('Line', props)),
        Pie: React.forwardRef((props, ref) => validateChartJSData('Pie', props)),
        Doughnut: React.forwardRef((props, ref) => validateChartJSData('Doughnut', props)),
    };
});

// Mock Chart.js internals
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


// --- NEW: Mock Recharts (EMI Comparison uses this) ---
// Pure manual mock to avoid circular dependency issues with requireActual
jest.mock('recharts', () => {
    const React = require('react');
    const MockGraph = ({ children }) => <div data-testid="mock-graph">{children}</div>;
    const MockComponent = () => null;

    return {
        ResponsiveContainer: ({ children }) => (
            <div style={{ width: 500, height: 300 }} data-testid="mock-responsive-container">
                {children}
            </div>
        ),
        LineChart: MockGraph,
        BarChart: MockGraph,
        PieChart: MockGraph,
        AreaChart: MockGraph,
        // Mock sub-components
        Line: MockComponent,
        Bar: MockComponent,
        Pie: MockComponent,
        XAxis: MockComponent,
        YAxis: MockComponent,
        CartesianGrid: MockComponent,
        Tooltip: MockComponent,
        Legend: MockComponent,
        Cell: MockComponent,
        Sector: MockComponent,
    };
});


describe('Chart Data Quality Sanity Checks', () => {
    const calculators = [
        { name: 'AdvancedCarLoanEMI', Component: AdvancedCarLoanEMI },
        { name: 'AdvancedHomeLoanEMI', Component: AdvancedHomeLoanEMI },
        { name: 'AssetAllocation', Component: AssetAllocation },
        { name: 'CAGRCalculator', Component: CAGRCalculator },
        { name: 'CompareLoans', Component: CompareLoans },
        { name: 'CompoundInterest', Component: CompoundInterest },
        { name: 'CostOfDelay', Component: CostOfDelay },
        { name: 'CreditCardPayoff', Component: CreditCardPayoff },
        { name: 'EMIComparison', Component: EMIComparison },
        { name: 'ExpenseRatioCalculator', Component: ExpenseRatioCalculator },
        { name: 'FixedDeposit', Component: FixedDeposit },
        { name: 'GoalPlanner', Component: GoalPlanner },
        { name: 'HomeLoanEligibility', Component: HomeLoanEligibility },
        { name: 'InflationImpact', Component: InflationImpact },
        { name: 'LoanEMI', Component: LoanEMI },
        { name: 'LumpSumOnly', Component: LumpSumOnly },
        { name: 'MoratoriumLoanEMI', Component: MoratoriumLoanEMI },
        { name: 'PPFCalculator', Component: PPFCalculator },
        { name: 'PropertyLoanEligibility', Component: PropertyLoanEligibility },
        { name: 'PureSIP', Component: PureSIP },
        { name: 'RecurringDeposit', Component: RecurringDeposit },
        { name: 'RefinanceCalculator', Component: RefinanceCalculator },
        { name: 'RentVsBuy', Component: RentVsBuy },
        { name: 'ROICalculator', Component: ROICalculator },
        { name: 'RuleOf72', Component: RuleOf72 },
        { name: 'SimpleInterest', Component: SimpleInterest },
        { name: 'SIPWithLumpSum', Component: SIPWithLumpSum },
        { name: 'StepDownWithdrawal', Component: StepDownWithdrawal },
        { name: 'StepUpLoanEMI', Component: StepUpLoanEMI },
        { name: 'StepUpSIP', Component: StepUpSIP },
        { name: 'StepUpSIPWithLump', Component: StepUpSIPWithLump },
        { name: 'SWPCalculator', Component: SWPCalculator },
        { name: 'SWRSimulator', Component: SWRSimulator },
        { name: 'TimeDurationCalculator', Component: TimeDurationCalculator },
        { name: 'TimeToFIRE', Component: TimeToFIRE },
        { name: 'TopUpLoanEMI', Component: TopUpLoanEMI },
        { name: 'XIRRCalculator', Component: XIRRCalculator },
    ];

    calculators.forEach(({ name, Component }) => {
        test(`${name} renders charts with valid numerical data`, () => {
            // Some calculators might need extra props or context mock if they crash
            // But our previous smoke test suggests they render fine with defaults.
            render(<Component />);
        });
    });
});
