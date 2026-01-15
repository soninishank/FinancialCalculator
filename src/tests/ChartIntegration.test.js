
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Import all calculators
import AdvancedHomeLoanEMI from '../components/calculators/loans/AdvancedHomeLoanEMI';
import AssetAllocation from '../components/calculators/utils/AssetAllocation';
import CAGRCalculator from '../components/calculators/investments/CAGRCalculator';
import CompareLoans from '../components/calculators/loans/CompareLoans';
import CompoundInterest from '../components/calculators/utils/CompoundInterest';
import CostOfDelay from '../components/calculators/decision/CostOfDelay';
import CreditCardPayoff from '../components/calculators/loans/CreditCardPayoff';
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
import ROICalculator from '../components/calculators/investments/ROICalculator';
import RecurringDeposit from '../components/calculators/savings/RecurringDeposit';
import RefinanceCalculator from '../components/calculators/loans/RefinanceCalculator';
import RentVsBuy from '../components/calculators/decision/RentVsBuy';
import RuleOf72 from '../components/calculators/utils/RuleOf72';
import SIPWithLumpSum from '../components/calculators/investments/SIPWithLumpSum';
import SWPCalculator from '../components/calculators/investments/SWPCalculator';
import SWRSimulator from '../components/calculators/retirement/SWRSimulator';
import SimpleInterest from '../components/calculators/utils/SimpleInterest';
import StepDownWithdrawal from '../components/calculators/retirement/StepDownWithdrawal';
import StepUpLoanEMI from '../components/calculators/loans/StepUpLoanEMI';
import StepUpSIP from '../components/calculators/investments/StepUpSIP';
import StepUpSIPWithLump from '../components/calculators/investments/StepUpSIPWithLump';
import TimeToFIRE from '../components/calculators/retirement/TimeToFIRE';
import TopUpLoanEMI from '../components/calculators/loans/TopUpLoanEMI';
import CarLoanEMI from '../components/calculators/loans/CarLoanEMI';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock standard utils
jest.mock('../utils/export', () => ({
    downloadPDF: jest.fn(),
    downloadCSV: jest.fn(),
}));

// VALIDATION MOCK
// This mock intercepts the 'data' prop passed to any Chart component.
// It throws an error if 'data' is an Array, which causes the test to fail.
const validateDataProp = (componentName, props) => {
    if (Array.isArray(props.data)) {
        throw new Error(
            `[${componentName}] Invalid 'data' prop detected! You passed an Array, but Chart.js expects a Data Object ({ labels, datasets }).`
        );
    }
    return <div data-testid={`mock-${componentName}`} />;
};

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
        Bar: React.forwardRef((props, ref) => validateDataProp('Bar', props)),
        Line: React.forwardRef((props, ref) => validateDataProp('Line', props)),
        Pie: React.forwardRef((props, ref) => validateDataProp('Pie', props)),
        Doughnut: React.forwardRef((props, ref) => validateDataProp('Doughnut', props)),
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

describe('Chart Integration & Data Validation', () => {
    const calculators = [
        { name: 'AdvancedHomeLoanEMI', Component: AdvancedHomeLoanEMI },
        { name: 'AssetAllocation', Component: AssetAllocation },
        { name: 'CAGRCalculator', Component: CAGRCalculator },
        { name: 'CompareLoans', Component: CompareLoans },
        { name: 'CompoundInterest', Component: CompoundInterest },
        { name: 'CostOfDelay', Component: CostOfDelay },
        { name: 'CreditCardPayoff', Component: CreditCardPayoff },
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
        { name: 'ROICalculator', Component: ROICalculator },
        { name: 'RecurringDeposit', Component: RecurringDeposit },
        { name: 'RefinanceCalculator', Component: RefinanceCalculator },
        { name: 'RentVsBuy', Component: RentVsBuy },
        { name: 'RuleOf72', Component: RuleOf72 },
        { name: 'SIPWithLumpSum', Component: SIPWithLumpSum },
        { name: 'SWPCalculator', Component: SWPCalculator },
        { name: 'SWRSimulator', Component: SWRSimulator },
        { name: 'SimpleInterest', Component: SimpleInterest },
        { name: 'StepDownWithdrawal', Component: StepDownWithdrawal },
        { name: 'StepUpLoanEMI', Component: StepUpLoanEMI },
        { name: 'StepUpSIP', Component: StepUpSIP },
        { name: 'StepUpSIPWithLump', Component: StepUpSIPWithLump },
        { name: 'TimeToFIRE', Component: TimeToFIRE },
        { name: 'TopUpLoanEMI', Component: TopUpLoanEMI },
        { name: 'CarLoanEMI', Component: CarLoanEMI },
    ];

    calculators.forEach(({ name, Component }) => {
        test(`${name} passes valid data to charts`, () => {
            // If this throws, the test fails automatically.
            render(<Component />);
        });
    });
});
