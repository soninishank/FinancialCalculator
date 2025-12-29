import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Import all calculators
import AdvancedHomeLoanEMI from '../components/calculators/AdvancedHomeLoanEMI';
import AssetAllocation from '../components/calculators/AssetAllocation';
import CAGRCalculator from '../components/calculators/CAGRCalculator';
import CompareLoans from '../components/calculators/CompareLoans';
import CompoundInterest from '../components/calculators/CompoundInterest';
import CostOfDelay from '../components/calculators/CostOfDelay';
import CreditCardPayoff from '../components/calculators/CreditCardPayoff';
import FixedDeposit from '../components/calculators/FixedDeposit';
import GoalPlanner from '../components/calculators/GoalPlanner';
import HomeLoanEligibility from '../components/calculators/HomeLoanEligibility';
import InflationImpact from '../components/calculators/InflationImpact';
import LoanEMI from '../components/calculators/LoanEMI';
import LumpSumOnly from '../components/calculators/LumpSumOnly';
import MoratoriumLoanEMI from '../components/calculators/MoratoriumLoanEMI';
import PPFCalculator from '../components/calculators/PPFCalculator';
import PropertyLoanEligibility from '../components/calculators/PropertyLoanEligibility';
import PureSIP from '../components/calculators/PureSIP';
import ROICalculator from '../components/calculators/ROICalculator';
import RecurringDeposit from '../components/calculators/RecurringDeposit';
import RefinanceCalculator from '../components/calculators/RefinanceCalculator';
import RentVsBuy from '../components/calculators/RentVsBuy';
import RuleOf72 from '../components/calculators/RuleOf72';
import SIPWithLumpSum from '../components/calculators/SIPWithLumpSum';
import SWPCalculator from '../components/calculators/SWPCalculator';
import SWRSimulator from '../components/calculators/SWRSimulator';
import SimpleInterest from '../components/calculators/SimpleInterest';
import StepDownWithdrawal from '../components/calculators/StepDownWithdrawal';
import StepUpLoanEMI from '../components/calculators/StepUpLoanEMI';
import StepUpSIP from '../components/calculators/StepUpSIP';
import StepUpSIPWithLump from '../components/calculators/StepUpSIPWithLump';
import TimeToFIRE from '../components/calculators/TimeToFIRE';
import TopUpLoanEMI from '../components/calculators/TopUpLoanEMI';
import VehicleLoanEMI from '../components/calculators/VehicleLoanEMI';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock standard utils that use heavy libs
jest.mock('../utils/export', () => ({
    downloadPDF: jest.fn(),
    downloadCSV: jest.fn(),
}));

// Mock Chart.js components if used
jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        Line: React.forwardRef((props, ref) => <div data-testid="mock-chart-line" ref={ref} />),
        Bar: React.forwardRef((props, ref) => <div data-testid="mock-chart-bar" ref={ref} />),
        Pie: React.forwardRef((props, ref) => <div data-testid="mock-chart-pie" ref={ref} />),
        Doughnut: React.forwardRef((props, ref) => <div data-testid="mock-chart-doughnut" ref={ref} />),
    };
});
// Also mock chart.js registration to prevent errors
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

describe('Calculator Smoke Tests', () => {
    const calculators = [
        { name: 'AdvancedHomeLoanEMI', Component: AdvancedHomeLoanEMI },
        { name: 'AssetAllocation', Component: AssetAllocation },
        { name: 'CAGRCalculator', Component: CAGRCalculator },
        { name: 'CompareLoans', Component: CompareLoans },
        { name: 'CompoundInterest', Component: CompoundInterest },
        { name: 'CostOfDelay', Component: CostOfDelay },
        { name: 'CreditCardPayoff', Component: CreditCardPayoff },
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
        { name: 'VehicleLoanEMI', Component: VehicleLoanEMI },
    ];

    calculators.forEach(({ name, Component }) => {
        test(`${name} renders without crashing`, () => {
            render(<Component />);
        });
    });
});
