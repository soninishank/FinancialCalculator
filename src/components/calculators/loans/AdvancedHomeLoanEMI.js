
import React, { useState, useMemo } from 'react';
import { useUrlState } from '../../../hooks/useUrlState';
import InputWithSlider from '../../common/InputWithSlider';
import MonthYearPicker from '../../common/MonthYearPicker';
import FormattedInput from '../../common/FormattedInput';
import CollapsibleAmortizationTable from '../../common/CollapsibleAmortizationTable';
import { downloadPDF } from '../../../utils/export';
import { moneyFormat } from '../../../utils/formatting';
import { computeAdvancedLoanAmortization } from '../../../utils/finance';
import { FinancialCompoundingBarChart, FinancialLoanDoughnutChart } from '../../common/FinancialCharts';

const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const InfoIcon = ({ tooltip }) => (
    <div className="group relative inline-block ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 cursor-help hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs leading-relaxed rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-2xl border border-slate-700">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
    </div>
);

export default function AdvancedHomeLoanEMI({ currency = 'INR' }) {
    // --- STATE: Loan Details ---
    const [homeValue, setHomeValue] = useUrlState('hv', 5000000);
    const [downPaymentPercent, setDownPaymentPercent] = useUrlState('dpP', 20);
    const [interestRate, setInterestRate] = useUrlState('r', 9);
    const [tenureYears, setTenureYears] = useUrlState('y', 20);
    const [startDate, setStartDate] = useUrlState('start', new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Derived Loan Amount
    const downPaymentAmount = homeValue * (downPaymentPercent / 100);
    const [loanInsurance, setLoanInsurance] = useUrlState('ins', 0);

    // Loan Fees States
    const [loanFeesMode, setLoanFeesMode] = useUrlState('fMode', 'amount'); // 'amount' | 'percent'
    const [loanFeesAmount, setLoanFeesAmount] = useUrlState('fAmt', 0);
    const [loanFeesPercent, setLoanFeesPercent] = useUrlState('fPerc', 0);

    const actualLoanFees = loanFeesMode === 'amount'
        ? loanFeesAmount
        : (homeValue + loanInsurance - downPaymentAmount) * (loanFeesPercent / 100);

    const finalLoanAmount = homeValue + loanInsurance - downPaymentAmount;

    // --- STATE: Advanced Loan Options ---
    const [showAdvancedLoan, setShowAdvancedLoan] = useUrlState('showAdv', false);
    const [emiStepUp, setEmiStepUp] = useUrlState('stepUp', 0); // % Annual increase in EMI
    // rateChanges is an array, sync as JSON string if needed, but for now skip complex objects
    const [rateChanges, setRateChanges] = useState([]);
    const [newRateDate, setNewRateDate] = useState(new Date().toISOString().slice(0, 7));
    const [newRate, setNewRate] = useState('');

    // --- STATE: Expenses ---
    const [showExpenses, setShowExpenses] = useUrlState('showExp', false);
    const [oneTimeMode, setOneTimeMode] = useUrlState('otMode', 'amount');
    const [oneTimeValue, setOneTimeValue] = useState(0);
    const [propertyTaxMode, setPropertyTaxMode] = useState('amount');
    const [propertyTaxValue, setPropertyTaxValue] = useState(0);
    const [homeInsuranceMode, setHomeInsuranceMode] = useState('amount');
    const [homeInsuranceValue, setHomeInsuranceValue] = useState(0);
    const [maintenanceMode, setMaintenanceMode] = useState('amount');
    const [maintenanceValue, setMaintenanceValue] = useState(0);

    // Expense Calculations
    const actualOneTimeExpenses = oneTimeMode === 'amount' ? oneTimeValue : homeValue * (oneTimeValue / 100);
    const actualPropertyTaxYearly = propertyTaxMode === 'amount' ? propertyTaxValue : homeValue * (propertyTaxValue / 100);
    const actualHomeInsuranceYearly = homeInsuranceMode === 'amount' ? homeInsuranceValue : homeValue * (homeInsuranceValue / 100);
    const actualMaintenanceMonthly = maintenanceMode === 'amount' ? maintenanceValue : homeValue * (maintenanceValue / 100);

    // --- STATE: Prepayments ---
    const [showPrepayments, setShowPrepayments] = useState(false);

    const [monthlyPrepayment, setMonthlyPrepayment] = useUrlState('mPre', 0);
    const [quarterlyPrepayment, setQuarterlyPrepayment] = useUrlState('qPre', 0);
    const [yearlyPrepayment, setYearlyPrepayment] = useUrlState('yPre', 0);

    const [prepaymentStepUp, setPrepaymentStepUp] = useUrlState('pStep', 0);
    const [prepaymentStrategy, setPrepaymentStrategy] = useUrlState('pStr', 'reduce_tenure'); // 'reduce_tenure' | 'reduce_emi'

    // Custom One-Time Prepayments
    const [customPrepayments, setCustomPrepayments] = useState([]);
    const [newPrepaymentDate, setNewPrepaymentDate] = useState(new Date().toISOString().slice(0, 7));
    const [newPrepaymentAmount, setNewPrepaymentAmount] = useState('');

    // --- STATE: Advanced Comparison & Views
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'financial'

    // Handlers
    const handleAddRateChange = () => {
        if (!newRate || Number(newRate) <= 0) return;
        setRateChanges([...rateChanges, { date: newRateDate, rate: Number(newRate) }]);
        setNewRate('');
    };

    const handleRemoveRateChange = (index) => {
        const updated = [...rateChanges];
        updated.splice(index, 1);
        setRateChanges(updated);
    };

    const handleAddPrepayment = () => {
        if (!newPrepaymentAmount || Number(newPrepaymentAmount) <= 0) return;
        if (newPrepaymentDate < startDate) {
            alert("Payment date cannot be before loan start date!");
            return;
        }

        // Validate against Pending Principal
        if (results && results.monthlyRows) {
            const [pYear, pMonth] = newPrepaymentDate.split('-').map(Number);

            // Find the row for this month
            // Note: results.monthlyRows contains the schedule *without* this new prepayment yet
            const targetRow = results.monthlyRows.find(r => r.year === pYear && r.month === pMonth);

            // Logic:
            // 1. If row found, max allowed is the opening balance of that month.
            // 2. If row NOT found:
            //    - If date is later than the last row, the loan is already finished -> Balance is 0.
            //    - If date is valid but just not generated properly? Unlikely with infinite loop guard.

            let maxAllowed = 0;
            if (targetRow) {
                maxAllowed = targetRow.openingBalance;
            } else {
                // Check if loan is finished before this date
                const lastRow = results.monthlyRows[results.monthlyRows.length - 1];
                if (lastRow) {
                    // If my date is after the last row's date
                    // Convert to comparable value
                    const lastDateVal = lastRow.year * 12 + lastRow.month;
                    const targetDateVal = pYear * 12 + pMonth;

                    if (targetDateVal > lastDateVal) {
                        maxAllowed = 0; // Loan fully paid
                    } else {
                        // Fallback? Should theoretically find it if within range.
                        // Maybe filtered out?
                        maxAllowed = 0;
                    }
                }
            }

            if (Number(newPrepaymentAmount) > maxAllowed) {
                alert(`Lump-sum amount cannot exceed the total pending loan balance.\n\nPending Balance for ${newPrepaymentDate}: ${moneyFormat(maxAllowed, currency)}\n\nYour loan might be closing earlier than this date!`);
                return;
            }
        }

        setCustomPrepayments([...customPrepayments, { date: newPrepaymentDate, amount: Number(newPrepaymentAmount) }]);
        setNewPrepaymentAmount('');
    };

    const handleRemovePrepayment = (index) => {
        const updated = [...customPrepayments];
        updated.splice(index, 1);
        setCustomPrepayments(updated);
    };

    // --- COMPUTATION ---
    const results = useMemo(() => {
        return computeAdvancedLoanAmortization({
            principal: finalLoanAmount,
            annualRate: interestRate,
            years: tenureYears,
            startDate,

            monthlyExtra: monthlyPrepayment,
            quarterlyExtra: quarterlyPrepayment,
            yearlyExtra: yearlyPrepayment,
            oneTimePrepayments: customPrepayments,

            emiStepUpYearly: emiStepUp,
            prepaymentStepUpYearly: prepaymentStepUp,
            prepaymentStrategy,
            interestRateChanges: rateChanges,
            loanFees: actualLoanFees,

            propertyTaxYearly: showExpenses ? actualPropertyTaxYearly : 0,
            homeInsuranceYearly: showExpenses ? actualHomeInsuranceYearly : 0,
            maintenanceMonthly: showExpenses ? actualMaintenanceMonthly : 0
        });
    }, [finalLoanAmount, interestRate, tenureYears, startDate,
        monthlyPrepayment, quarterlyPrepayment, yearlyPrepayment, customPrepayments,
        actualPropertyTaxYearly, actualHomeInsuranceYearly, actualMaintenanceMonthly,
        emiStepUp, prepaymentStepUp, prepaymentStrategy, rateChanges,
        showExpenses, actualLoanFees]);

    // Compare Simulation
    const resultsCompare = useMemo(() => {
        if (!isComparisonMode) return null;
        const oppositeStrategy = prepaymentStrategy === 'reduce_tenure' ? 'reduce_emi' : 'reduce_tenure';

        return computeAdvancedLoanAmortization({
            principal: finalLoanAmount,
            annualRate: interestRate,
            years: tenureYears,
            startDate,
            monthlyExtra: monthlyPrepayment,
            quarterlyExtra: quarterlyPrepayment,
            yearlyExtra: yearlyPrepayment,
            oneTimePrepayments: customPrepayments,
            emiStepUpYearly: emiStepUp,
            prepaymentStepUpYearly: prepaymentStepUp,
            prepaymentStrategy: oppositeStrategy,
            interestRateChanges: rateChanges,
            loanFees: actualLoanFees,
            propertyTaxYearly: showExpenses ? actualPropertyTaxYearly : 0,
            homeInsuranceYearly: showExpenses ? actualHomeInsuranceYearly : 0,
            maintenanceMonthly: showExpenses ? actualMaintenanceMonthly : 0
        });
    }, [isComparisonMode, prepaymentStrategy, finalLoanAmount, interestRate, tenureYears, startDate,
        monthlyPrepayment, quarterlyPrepayment, yearlyPrepayment, customPrepayments,
        actualPropertyTaxYearly, actualHomeInsuranceYearly, actualMaintenanceMonthly,
        emiStepUp, prepaymentStepUp, rateChanges, showExpenses, actualLoanFees]);

    const { summary, monthlyRows, yearlyRows, financialYearlyRows } = results || {};

    // Derived Closing Date
    const closingDateDisplay = useMemo(() => {
        if (monthlyRows && monthlyRows.length > 0) {
            const lastRow = monthlyRows[monthlyRows.length - 1];
            // If loan is paid off exactly, balance should be 0.
            // Check if there are rows with 0 balance (prepaid early).
            // Actually monthlyRows usually stops when balance is 0?
            // Let's check computeAdvancedLoanAmortization. Typically it pushes rows until balance <= 0.
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mName = monthNames[lastRow.month - 1] || "";
            return `${mName} ${lastRow.year}`;
        }
        return "-";
    }, [monthlyRows]);

    // Safety check
    if (!summary || !monthlyRows) return <div className="p-8 text-center text-red-500 font-bold">Error calculating loan data. Please check inputs.</div>;

    const displayRows = viewMode === 'financial' ? financialYearlyRows : yearlyRows;

    return (
        <div className="animate-fade-in space-y-8">


            {/* SECTION 1: LOAN DETAILS */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b-2 border-indigo-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                    Home Loan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Row 1 */}
                    <div className="lg:col-span-1">
                        <InputWithSlider
                            label="Home Value (HV)"
                            value={homeValue}
                            onChange={setHomeValue}
                            min={100000}
                            max={50000000}
                            step={50000}
                            currency={currency}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <InputWithSlider
                            label={`Margin / Down Payment (DP) (${downPaymentPercent}%)`}
                            value={downPaymentPercent}
                            onChange={setDownPaymentPercent}
                            min={0}
                            max={90}
                            symbol="%"
                        />
                        <p className="text-xs text-slate-950 font-bold -mt-2 ml-1 bg-slate-50 px-2 py-1 rounded inline-block">Amount: {moneyFormat(downPaymentAmount, currency)}</p>
                    </div>

                    <div className="lg:col-span-1">
                        <InputWithSlider
                            label="Loan Insurance (LI)"
                            value={loanInsurance}
                            onChange={setLoanInsurance}
                            min={0}
                            max={500000}
                            step={1000}
                            currency={currency}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="lg:col-span-1 flex items-center h-full">
                        <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 flex flex-col justify-center shadow-inner">
                            <span className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Loan Amount (HV + LI - DP)</span>
                            <span className="text-3xl font-black text-indigo-700">
                                {moneyFormat(finalLoanAmount, currency)}
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <InputWithSlider
                            label="Interest Rate"
                            value={interestRate}
                            onChange={setInterestRate}
                            min={1}
                            max={15}
                            step={0.1}
                            symbol="%"
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <InputWithSlider
                            label="Loan Tenure (Years)"
                            value={tenureYears}
                            onChange={setTenureYears}
                            min={1}
                            max={30}
                        />
                    </div>

                    {/* Loan Fees with Toggle */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Bank Fees & Charges</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setLoanFeesMode('amount')}
                                    className={`px-3 py-1 rounded-md transition-all text-[10px] font-black ${loanFeesMode === 'amount' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    ₹ AMT
                                </button>
                                <button
                                    onClick={() => setLoanFeesMode('percent')}
                                    className={`px-3 py-1 rounded-md transition-all text-[10px] font-black ${loanFeesMode === 'percent' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    % AGE
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            {loanFeesMode === 'amount' ? (
                                <InputWithSlider
                                    label="Loan Fees Amount"
                                    value={loanFeesAmount}
                                    onChange={setLoanFeesAmount}
                                    min={0}
                                    max={500000}
                                    step={500}
                                    currency={currency}
                                    hideLabel
                                />
                            ) : (
                                <InputWithSlider
                                    label="Loan Fees Percent"
                                    value={loanFeesPercent}
                                    onChange={setLoanFeesPercent}
                                    min={0}
                                    max={5}
                                    step={0.01}
                                    symbol="%"
                                    isDecimal
                                    hideLabel
                                />
                            )}
                            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Effective Fee Cost</span>
                                <span className="text-xs font-black text-indigo-600">
                                    {loanFeesMode === 'percent' ? moneyFormat(actualLoanFees, currency) : `${((actualLoanFees / finalLoanAmount) * 100).toFixed(2)}% of Loan`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <label className="text-xs font-black text-slate-900 mb-4 block uppercase tracking-widest">Start Month & Year</label>
                        <div className="p-1">
                            <MonthYearPicker value={startDate} onChange={setStartDate} />
                        </div>
                    </div>
                </div>

                {/* ADVANCED LOAN TOGGLE */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => setShowAdvancedLoan(!showAdvancedLoan)}
                        className={`group flex items-center w-full md:w-auto px-6 py-3 rounded-xl transition-all shadow-sm border-2 ${showAdvancedLoan ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-900 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                    >
                        <div className={`transition-transform duration-300 ${showAdvancedLoan ? 'rotate-180' : ''}`}>
                            <ChevronDown />
                        </div>
                        <span className="ml-3 font-black uppercase tracking-widest text-xs">Advanced Loan Options</span>
                        <span className={`ml-4 text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${showAdvancedLoan ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>Insurance, Step-Up, Var. Rates</span>
                    </button>

                    {showAdvancedLoan && (
                        <div className="mt-6 animate-fade-in bg-indigo-50/30 p-5 rounded-xl border border-indigo-100/50 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-black text-slate-900 uppercase tracking-tighter">Annual EMI Step-Up %</label>
                                    </div>
                                    <InputWithSlider label="" value={emiStepUp} onChange={setEmiStepUp} min={0} max={20} step={1} symbol="%" />
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Example: A 5% increase every year helps combat inflation.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Variable Interest Rate</h4>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 mb-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black text-slate-950 uppercase mb-2 tracking-widest">Effective Date</label>
                                        <MonthYearPicker value={newRateDate} onChange={setNewRateDate} />
                                    </div>
                                    <div className="md:col-span-4">
                                        <InputWithSlider
                                            label="New Rate"
                                            value={newRate}
                                            onChange={setNewRate}
                                            min={0}
                                            max={20}
                                            step={0.1}
                                            symbol="%"
                                            isDecimal
                                            placeholder="e.g. 9.5"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <button
                                            onClick={handleAddRateChange}
                                            disabled={!newRate}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all disabled:opacity-50 text-base shadow-lg shadow-indigo-100 uppercase tracking-widest border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1"
                                        >
                                            ADD RATE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {rateChanges.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Planned Rate Changes:</h5>
                                    {rateChanges.sort((a, b) => a.date.localeCompare(b.date)).map((r, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm group hover:border-indigo-300 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Effective Date</span>
                                                    <span className="text-lg font-black text-indigo-700">{r.date}</span>
                                                </div>
                                                <div className="w-px h-10 bg-slate-100"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">New Interest Rate</span>
                                                    <span className="text-2xl font-black text-slate-900">{r.rate}%</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveRateChange(idx)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-slate-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 2: HOMEOWNER EXPENSES (Toggle) - Moved up as requested */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-600 p-3 rounded-xl shadow-lg shadow-orange-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Homeowner Expenses</h3>
                    </div>
                    <button
                        onClick={() => setShowExpenses(!showExpenses)}
                        className={`text-xs font-black px-6 py-2.5 rounded-full transition-all shadow-md border-2 ${showExpenses ? 'bg-orange-600 text-white border-orange-600 shadow-orange-200' : 'bg-white text-orange-700 border-orange-100 hover:bg-orange-50 hover:border-orange-200'}`}
                    >
                        {showExpenses ? 'HIDE DETAILS' : 'ADD TAXES & INSURANCE'}
                    </button>
                </div>

                {showExpenses && (
                    <div className="mt-8 animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {/* One-time */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-black text-slate-900 tracking-widest uppercase">One-time Expenses</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button onClick={() => setOneTimeMode('amount')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${oneTimeMode === 'amount' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>AMT</button>
                                        <button onClick={() => setOneTimeMode('percent')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${oneTimeMode === 'percent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                                    </div>
                                </div>
                                <InputWithSlider
                                    label=""
                                    value={oneTimeValue}
                                    onChange={setOneTimeValue}
                                    min={0}
                                    max={oneTimeMode === 'amount' ? 1000000 : 20}
                                    step={oneTimeMode === 'amount' ? 5000 : 0.1}
                                    symbol={oneTimeMode === 'percent' ? '%' : ''}
                                    currency={oneTimeMode === 'amount' ? currency : null}
                                    hideLabel
                                />
                                <p className="text-[10px] font-black text-slate-900 border-l-2 border-slate-300 pl-2">
                                    {oneTimeMode === 'percent' ? `Amount: ${moneyFormat(actualOneTimeExpenses, currency)}` : `${((actualOneTimeExpenses / homeValue) * 100).toFixed(2)}% of Value`}
                                </p>
                            </div>

                            {/* Property Tax */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-black text-slate-900 tracking-widest uppercase">Property Taxes (Yearly)</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button onClick={() => setPropertyTaxMode('amount')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${propertyTaxMode === 'amount' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>AMT</button>
                                        <button onClick={() => setPropertyTaxMode('percent')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${propertyTaxMode === 'percent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                                    </div>
                                </div>
                                <InputWithSlider
                                    label=""
                                    value={propertyTaxValue}
                                    onChange={setPropertyTaxValue}
                                    min={0}
                                    max={propertyTaxMode === 'amount' ? 500000 : 5}
                                    step={propertyTaxMode === 'amount' ? 1000 : 0.01}
                                    symbol={propertyTaxMode === 'percent' ? '%' : ''}
                                    currency={propertyTaxMode === 'amount' ? currency : null}
                                    isDecimal={propertyTaxMode === 'percent'}
                                    hideLabel
                                />
                                <p className="text-[10px] font-black text-slate-900 border-l-2 border-slate-300 pl-2">
                                    {propertyTaxMode === 'percent' ? `Amount: ${moneyFormat(actualPropertyTaxYearly, currency)}` : `${((actualPropertyTaxYearly / homeValue) * 100).toFixed(2)}% of Value`}
                                </p>
                            </div>

                            {/* Home Insurance */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-black text-slate-900 tracking-widest uppercase">Home Insurance (Yearly)</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button onClick={() => setHomeInsuranceMode('amount')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${homeInsuranceMode === 'amount' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>AMT</button>
                                        <button onClick={() => setHomeInsuranceMode('percent')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${homeInsuranceMode === 'percent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                                    </div>
                                </div>
                                <InputWithSlider
                                    label=""
                                    value={homeInsuranceValue}
                                    onChange={setHomeInsuranceValue}
                                    min={0}
                                    max={homeInsuranceMode === 'amount' ? 200000 : 2}
                                    step={homeInsuranceMode === 'amount' ? 500 : 0.01}
                                    symbol={homeInsuranceMode === 'percent' ? '%' : ''}
                                    currency={homeInsuranceMode === 'amount' ? currency : null}
                                    isDecimal={homeInsuranceMode === 'percent'}
                                    hideLabel
                                />
                                <p className="text-[10px] font-black text-slate-900 border-l-2 border-slate-300 pl-2">
                                    {homeInsuranceMode === 'percent' ? `Amount: ${moneyFormat(actualHomeInsuranceYearly, currency)}` : `${((actualHomeInsuranceYearly / homeValue) * 100).toFixed(2)}% of Value`}
                                </p>
                            </div>

                            {/* Maintenance */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-black text-slate-900 tracking-widest uppercase">Maintenance (Monthly)</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button onClick={() => setMaintenanceMode('amount')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${maintenanceMode === 'amount' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>AMT</button>
                                        <button onClick={() => setMaintenanceMode('percent')} className={`px-2 py-0.5 rounded transition-all text-[10px] font-black ${maintenanceMode === 'percent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                                    </div>
                                </div>
                                <InputWithSlider
                                    label=""
                                    value={maintenanceValue}
                                    onChange={setMaintenanceValue}
                                    min={0}
                                    max={maintenanceMode === 'amount' ? 50000 : 1}
                                    step={maintenanceMode === 'amount' ? 500 : 0.01}
                                    symbol={maintenanceMode === 'percent' ? '%' : ''}
                                    currency={maintenanceMode === 'amount' ? currency : null}
                                    isDecimal={maintenanceMode === 'percent'}
                                    hideLabel
                                />
                                <p className="text-[10px] font-black text-slate-900 border-l-2 border-slate-300 pl-2">
                                    {maintenanceMode === 'percent' ? `Amount: ${moneyFormat(actualMaintenanceMonthly, currency)}` : `${((actualMaintenanceMonthly / (homeValue / 12)) * 100).toFixed(2)}% of Value`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 2: PREPAYMENTS (Toggle) */}
            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-xl relative z-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-30"></div>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl shadow-lg shadow-emerald-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Extra Part-Payments</h3>
                    </div>
                    <button
                        onClick={() => setShowPrepayments(!showPrepayments)}
                        className={`text-xs font-black px-6 py-2.5 rounded-full transition-all shadow-md border-2 ${showPrepayments ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' : 'bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'}`}
                    >
                        {showPrepayments ? 'HIDE OPTIONS' : 'ADD PREPAYMENTS'}
                    </button>
                </div>

                {showPrepayments && (
                    <div className="mt-8 animate-fade-in space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            <InputWithSlider label="Monthly Extra" value={monthlyPrepayment} onChange={setMonthlyPrepayment} min={0} max={100000} step={1000} currency={currency} />
                            <InputWithSlider label="Quarterly Extra" value={quarterlyPrepayment} onChange={setQuarterlyPrepayment} min={0} max={500000} step={5000} currency={currency} />
                            <InputWithSlider label="Yearly Extra" value={yearlyPrepayment} onChange={setYearlyPrepayment} min={0} max={1000000} step={10000} currency={currency} />
                        </div>

                        {/* STRATEGY & ADVANCED PREPAYMENT */}
                        <div className="bg-teal-50/30 p-6 rounded-2xl border border-teal-100 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Strategy Selector */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-1 mb-3">
                                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Prepayment Strategy</label>
                                        <InfoIcon tooltip="Reduce Tenure: Keeps EMI same, finishes loan earlier (Recommended). Reduce EMI: Recalculates EMI to be smaller, keeps original tenure." />
                                    </div>
                                    <div className="flex bg-white p-1.5 rounded-xl border border-teal-100 shadow-sm max-w-md relative">
                                        <button
                                            onClick={() => setPrepaymentStrategy('reduce_tenure')}
                                            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${prepaymentStrategy === 'reduce_tenure' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 hover:bg-teal-50'}`}
                                        >
                                            Reduce Tenure
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${prepaymentStrategy === 'reduce_tenure' ? 'bg-teal-400 text-white' : 'bg-teal-50 text-teal-600'} font-bold`}>
                                                Recommended
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setPrepaymentStrategy('reduce_emi')}
                                            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${prepaymentStrategy === 'reduce_emi' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 hover:bg-teal-50'}`}
                                        >
                                            Reduce EMI
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Settings */}
                                <div className="flex flex-col gap-4">
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <div
                                            onClick={() => setIsComparisonMode(!isComparisonMode)}
                                            className={`relative inline-block w-12 h-6 rounded-full border border-gray-300 transition-colors duration-200 ease-in-out cursor-pointer ${isComparisonMode ? 'bg-teal-600 border-teal-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`absolute left-0 top-0 bottom-0 w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${isComparisonMode ? 'translate-x-6' : 'translate-x-0'}`}
                                            />
                                        </div>
                                        <span
                                            onClick={() => setIsComparisonMode(!isComparisonMode)}
                                            className="ms-3 text-sm font-bold text-gray-700 group-hover:text-teal-700 transition-colors cursor-pointer"
                                        >
                                            Compare with {prepaymentStrategy === 'reduce_tenure' ? 'Reduce EMI' : 'Reduce Tenure'}
                                        </span>
                                    </label>

                                    {monthlyPrepayment > 0 && (
                                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-teal-100 shadow-sm">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Annual Prepayment Step-Up %</label>
                                                <InputWithSlider label="" value={prepaymentStepUp} onChange={setPrepaymentStepUp} min={0} max={50} symbol="%" />
                                            </div>
                                            <div className="text-[10px] text-gray-400 w-24 leading-tight italic">
                                                Increase extra monthly payments by {prepaymentStepUp}% annually.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* VARIABLE / ONE-TIME PREPAYMENTS */}
                        <div className="pt-8 border-t border-gray-100">
                            <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl">
                                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-4 bg-emerald-600 rounded-sm"></span>
                                    Step-Up Part-Payments
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-6 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                                        <div className="md:col-span-5">
                                            <label className="text-xs font-black text-slate-900 mb-2 block uppercase tracking-wide">Payment Month</label>
                                            <MonthYearPicker value={newPrepaymentDate} onChange={setNewPrepaymentDate} minDate={startDate} />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className="text-xs font-black text-slate-900 mb-2 block uppercase tracking-wide">Lump-Sum Amount</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 font-bold text-sm">₹</span>
                                                </div>
                                                <FormattedInput
                                                    value={newPrepaymentAmount}
                                                    onChange={setNewPrepaymentAmount}
                                                    currency={currency}
                                                    className="w-full bg-white border-2 border-slate-200 pl-8 pr-3 py-3 rounded-xl focus:border-teal-500 outline-none font-bold text-slate-900 transition-all text-sm"
                                                    max={100000000}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={handleAddPrepayment}
                                                disabled={!newPrepaymentAmount || Number(newPrepaymentAmount) <= 0}
                                                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {customPrepayments.length > 0 ? (
                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Planned Extra Payments:</h5>
                                        {customPrepayments.sort((a, b) => a.date.localeCompare(b.date)).map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm group hover:border-teal-300 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Payment Month</span>
                                                        <span className="text-lg font-black text-teal-700 italic">{p.date}</span>
                                                    </div>
                                                    <div className="w-px h-10 bg-slate-100"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Lump-Sum Amount</span>
                                                        <span className="text-2xl font-black text-slate-900">{moneyFormat(Number(p.amount), currency)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePrepayment(idx)}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-slate-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center italic mt-2">No variable prepayments added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 4: HOW IT WORKS / EDUCATIONAL */}
            <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full -ml-24 -mb-24 opacity-20"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                        <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                        Mastering Your Home Loan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-indigo-100 italic">01</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Initial Payment</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-black">This is your out-of-pocket cash. It includes the <strong>Down Payment (Margin Money)</strong> and bank processing <strong>Fees & Charges</strong>. Higher DP means lower loan EMI.</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-emerald-100 italic">02</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Impact of Prepayments</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-black">Making small <strong>Extra Payments</strong> early in the tenure drastically reduces the total <strong>Interest</strong> paid and shortens the loan period significantly.</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-amber-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-amber-100 italic">03</div>
                            <h4 className="font-black text-slate-900 mb-3 text-lg">Recurring Costs</h4>
                            <p className="text-sm text-slate-900 leading-relaxed font-black">Don't forget <strong>Taxes, Insurance, and Maintenance</strong>. These are ongoing monthly/yearly expenses that contribute to the "True Cost" of ownership.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AMORTIZATION TABLE */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Detailed Amortization Schedule</h3>
                    <button
                        onClick={() => {
                            const data = yearlyRows.map(r => [
                                `Year ${r.year}`,
                                Math.round(r.principalPaid),
                                Math.round(r.interestPaid),
                                Math.round(r.totalOwnershipCost || 0),
                                Math.round(r.closingBalance)
                            ]);
                            const headers = ['Year', 'Principal Paid', 'Interest Paid', 'Expenses', 'Balance'];
                            downloadPDF(data, headers, 'advanced_home_loan_amortization.pdf');
                        }}
                        className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition-colors"
                    >
                        Export PDF
                    </button>
                </div>
                <div className="mt-4">
                    <CollapsibleAmortizationTable
                        yearlyData={yearlyRows}
                        monthlyData={monthlyRows}
                        currency={currency}
                    />
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-10 mb-20 text-center">
                <p className="text-xs text-slate-900 font-bold leading-relaxed max-w-2xl mx-auto px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed italic">
                    Disclaimer: This calculator is for estimation only. Actual bank interest rates, processing fees, and tax implications may vary. Consult with your financial advisor or bank representative before making decisions.
                </p>
            </div>

            {/* SECTION 5: SUMMARY & CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Summary Cards */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
                    {/* 1. Initial Payment (Upfront) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-slate-700 shadow-xl ring-1 ring-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Initial Payment (DP + Fees)</p>
                        <p className="text-2xl font-black text-slate-800 leading-none truncate" title={moneyFormat(Math.round(downPaymentAmount + actualLoanFees + (showExpenses ? actualOneTimeExpenses : 0)), currency)}>
                            {moneyFormat(Math.round(downPaymentAmount + actualLoanFees + (showExpenses ? actualOneTimeExpenses : 0)), currency, true)}
                        </p>
                    </div>

                    {/* 2. Regular Monthly EMI (Recurring Base) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-600 shadow-xl ring-1 ring-indigo-50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Regular Monthly EMI</p>
                        <p className="text-2xl font-black text-indigo-700 leading-none truncate" title={moneyFormat(Math.round(summary.baseEMI), currency)}>{moneyFormat(Math.round(summary.baseEMI), currency, true)}</p>
                    </div>

                    {/* 3. Monthly Breakdown (Recurring Detail) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Monthly Payment</p>
                            <p className="text-2xl font-black text-emerald-700 leading-none truncate mb-4" title={moneyFormat(Math.round(summary.baseEMI + monthlyPrepayment + (showExpenses ? (actualPropertyTaxYearly / 12 + actualHomeInsuranceYearly / 12 + actualMaintenanceMonthly) : 0)), currency)}>
                                {moneyFormat(Math.round(summary.baseEMI + monthlyPrepayment + (showExpenses ? (actualPropertyTaxYearly / 12 + actualHomeInsuranceYearly / 12 + actualMaintenanceMonthly) : 0)), currency, true)}
                            </p>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="pt-3 border-t border-emerald-50 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-medium">Principal & Interest (EMI)</span>
                                <span className="font-bold text-gray-700">{moneyFormat(Math.round(summary.baseEMI), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-medium">Monthly Extra Payment</span>
                                <span className="font-bold text-emerald-600">{moneyFormat(Math.round(monthlyPrepayment), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-medium">Property Taxes</span>
                                <span className="font-bold text-slate-700">{moneyFormat(Math.round(showExpenses ? actualPropertyTaxYearly / 12 : 0), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-medium">Home Insurance</span>
                                <span className="font-bold text-slate-700">{moneyFormat(Math.round(showExpenses ? actualHomeInsuranceYearly / 12 : 0), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-medium">Maintenance Charges</span>
                                <span className="font-bold text-slate-700">{moneyFormat(Math.round(showExpenses ? actualMaintenanceMonthly : 0), currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Extra Part-Payments (Strategy) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-600 shadow-xl ring-1 ring-emerald-50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Extra Part-Payments</p>
                        <p className="text-2xl font-black text-emerald-700 leading-none truncate" title={moneyFormat(Math.round(summary.totalPrepayments), currency)}>{moneyFormat(Math.round(summary.totalPrepayments), currency, true)}</p>
                    </div>

                    {/* 5. Effective Tenure (Outcome Time) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-600 shadow-xl ring-1 ring-indigo-50 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Effective Tenure</p>
                            <p className="text-2xl font-black text-indigo-700 leading-none">
                                {summary.actualTenureYears.toFixed(1)} <span className="text-sm text-indigo-400 font-bold">Years</span>
                            </p>
                        </div>
                        <div className="text-right border-l-2 border-slate-100 pl-6">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Original</p>
                            <p className="text-sm font-black text-slate-700 leading-none">{tenureYears} <span className="text-[9px]">Years</span></p>
                        </div>
                    </div>

                    {/* 6. Total Interest (Outcome Cost) */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-xl ring-1 ring-amber-50">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Interest Paid</p>
                            {summary.savedInterest > 0 && (
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                    Saved {moneyFormat(Math.round(summary.savedInterest), currency, true)}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-black text-amber-700 leading-none truncate" title={moneyFormat(Math.round(summary.totalInterest), currency)}>{moneyFormat(Math.round(summary.totalInterest), currency, true)}</p>
                    </div>

                    {/* 7. Loan End Date */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-cyan-500 shadow-xl ring-1 ring-cyan-50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Loan Ends In</p>
                        <p className="text-2xl font-black text-cyan-700 leading-none">
                            {closingDateDisplay}
                        </p>
                    </div>
                </div>



                {/* Doughnut Chart */}
                <div className="md:col-span-2 bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl transition-all hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                            Total Outflow Breakdown
                        </h4>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mb-8 italic">Breakdown of the absolute total financial commitment over the loan life.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <FinancialLoanDoughnutChart
                                upfront={downPaymentAmount + actualLoanFees + (showExpenses ? actualOneTimeExpenses : 0)}
                                principal={finalLoanAmount}
                                prepayments={summary.totalPrepayments}
                                interest={summary.totalInterest}
                                taxes={summary.totalTaxes}
                                insurance={summary.totalInsurance + summary.totalMaintenance}
                                total={summary.totalCostOfOwnership + downPaymentAmount + (showExpenses ? actualOneTimeExpenses : 0)}
                                currency={currency}
                            />
                        </div>

                        {/* Detailed Legend/Breakdown */}
                        <div className="h-full flex flex-col justify-center pl-4 lg:pl-8">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-3">ESTIMATED TOTAL BREAKDOWN</h5>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#94a3b8] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Initial Payment (DP + Fees)</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 text-right">{moneyFormat(downPaymentAmount + actualLoanFees + (showExpenses ? actualOneTimeExpenses : 0), currency, true)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#6366f1] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Principal Amount</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 text-right">{moneyFormat(finalLoanAmount, currency, true)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#2dd4bf] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Extra Part-Payments</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-emerald-600 text-right">{moneyFormat(summary.totalPrepayments, currency, true)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#f59e0b] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Interest Paid</span>
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 text-right">{moneyFormat(summary.totalInterest, currency, true)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#f97316] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Property Taxes</span>
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 text-right">{moneyFormat(summary.totalTaxes, currency)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#a855f7] ring-2 ring-white shadow-sm"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Home Insurance</span>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600 text-right">{moneyFormat(summary.totalInsurance + summary.totalMaintenance, currency)}</span>
                                </div>

                                <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">TOTAL PAYABLE :</span>
                                    <span className="text-xl font-bold text-indigo-600 leading-none text-right">
                                        {moneyFormat(summary.totalCostOfOwnership + downPaymentAmount + (showExpenses ? actualOneTimeExpenses : 0), currency, true)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Summary (Only if enabled) */}
                {isComparisonMode && resultsCompare && (
                    <div className="md:col-span-4 bg-indigo-900 text-white p-6 rounded-xl shadow-lg">
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 0 00-2-2H5a2 0 00-2 2v6a2 0 002 2h2a2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Strategy Comparison
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Current Strategy */}
                            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700">
                                <p className="text-xs uppercase font-bold text-indigo-300 mb-2">Current: {prepaymentStrategy === 'reduce_tenure' ? 'Reduce Tenure' : 'Reduce EMI'}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-indigo-200 text-sm">Total Interest</span>
                                        <span className="font-bold">{moneyFormat(Math.round(summary.totalInterest), currency, true)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-indigo-200 text-sm">Total Amount</span>
                                        <span className="font-bold">{moneyFormat(Math.round(summary.totalAmountPaid), currency, true)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-indigo-200 text-sm">Tenure</span>
                                        <span className="font-bold">{summary.actualTenureYears.toFixed(1)} Years</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Strategy */}
                            <div className="bg-white/10 p-4 rounded-lg border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">ALTERNATIVE</div>
                                <p className="text-xs uppercase font-bold text-yellow-300 mb-2">Option: {prepaymentStrategy === 'reduce_tenure' ? 'Reduce EMI' : 'Reduce Tenure'}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-indigo-100 text-sm">Total Interest</span>
                                        <span className="font-bold">{moneyFormat(Math.round(resultsCompare.summary.totalInterest), currency, true)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-indigo-100 text-sm">Total Amount</span>
                                        <span className="font-bold">{moneyFormat(Math.round(resultsCompare.summary.totalAmountPaid), currency, true)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-indigo-100 text-sm">Tenure</span>
                                        <span className="font-bold">{resultsCompare.summary.actualTenureYears.toFixed(1)} Years</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-center">
                                    {summary.totalInterest < resultsCompare.summary.totalInterest
                                        ? <div className="bg-emerald-500/20 text-emerald-300 p-2 rounded-lg font-bold border border-emerald-500/30">
                                            ✅ Current strategy is RECOMMENDED. It saves {moneyFormat(Math.round(resultsCompare.summary.totalInterest - summary.totalInterest), currency, true)} more interest!
                                        </div>
                                        : <div className="bg-yellow-500/20 text-yellow-300 p-2 rounded-lg font-bold border border-yellow-500/30">
                                            💡 RECOMMENDED: Switch to {prepaymentStrategy === 'reduce_tenure' ? 'Reduce EMI' : 'Reduce Tenure'} to save {moneyFormat(Math.round(summary.totalInterest - resultsCompare.summary.totalInterest), currency, true)}!
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 5: SCHEDULE & PROJECTION */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Schedule & Loan Projection</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <div className="flex items-center gap-2 px-2">
                                <span className="text-xs font-black text-slate-900 uppercase">View:</span>
                                <InfoIcon tooltip="Calendar Year: Jan to Dec. Financial Year: Apr to Mar (standard for Indian tax reporting)." />
                            </div>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setViewMode('financial')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'financial' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Financial
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M3 4v16M3 4l18 16" /></svg>
                        Loan Balance Projection
                    </h4>
                    <FinancialCompoundingBarChart data={yearlyRows} currency={currency} type="loan" />
                </div>

                <CollapsibleAmortizationTable
                    yearlyData={displayRows}
                    monthlyData={monthlyRows}
                    currency={currency}
                    isFinancial={viewMode === 'financial'}
                />
            </div>

            {/* SECTION 6: HOW IT WORKS / DOCUMENTATION */}
            <div className="bg-slate-900 text-slate-100 p-8 rounded-2xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500 p-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        Understanding Your Advanced Loan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                ROI vs Base Rate
                            </h4>
                            <p className="text-sm text-slate-100 leading-relaxed font-bold">
                                Most home loans have **floating interest rates**. Our Variable Rate feature allows you to input "Repo Rate" hikes. A 0.5% rate hike on a 20-year loan can add nearly 2 years to your tenure if not compensated.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-teal-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                                Part-Payment Power
                            </h4>
                            <p className="text-sm text-slate-100 leading-relaxed font-bold">
                                <strong>Extra Part-Payments</strong> go directly towards your **Principal**. Reducing the principal early saves on all future interest compounding. Using **Step-Up EMI** or **Step-Up Part-Payments** ensures you pay off the loan exponentially faster.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                Reduce Tenure vs EMI
                            </h4>
                            <p className="text-sm text-slate-100 leading-relaxed font-bold">
                                **Reduce Tenure** is mathematically superior as it maintains high monthly payments, crushing the interest faster. **Reduce EMI** is better for cash-flow flexibility but results in higher total interest paid.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-600">
                            <h5 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">The "Wealth Destroyer" Hidden Cost</h5>
                            <p className="text-xs text-slate-100 leading-relaxed font-bold">
                                Home ownership includes Maintenance, Property Taxes, and Insurance. These are often ignored in simple calculators. Our **Homeowner Expenses** section ensures you know the "Real Cost of Ownership" beyond just the EMI.
                            </p>
                        </div>
                        <div className="bg-indigo-600/10 p-5 rounded-xl border border-indigo-500/30">
                            <h5 className="text-sm font-black text-indigo-300 mb-2 uppercase tracking-wider">Pro-Tip for Fast Freedom</h5>
                            <p className="text-xs text-slate-200 leading-relaxed font-bold">
                                Set a **5% EMI Step-Up** annually. Since most salaries increase year-over-year, this keeps your relative loan burden same while cutting a 20-year loan down to ~12 years automatically!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
