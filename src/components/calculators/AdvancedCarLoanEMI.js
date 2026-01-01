
import React, { useState, useMemo } from 'react';
import { useUrlState } from '../../hooks/useUrlState';
import InputWithSlider from '../common/InputWithSlider';
import MonthYearPicker from '../common/MonthYearPicker';
import CollapsibleAmortizationTable from '../common/CollapsibleAmortizationTable';
import { downloadPDF } from '../../utils/export';
import { moneyFormat } from '../../utils/formatting';
import { computeCarLoanAmortization } from '../../utils/finance';
import { FinancialCompoundingBarChart, FinancialLoanDoughnutChart, FinancialLineChart } from '../common/FinancialCharts';
import { Info, IndianRupee, CreditCard, ShieldCheck, Settings2, Wallet, Table, ChartPie, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ icon: Icon, title, children, isOpen, onToggle, isMandatory = false }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center gap-3 text-left">
                <div className={`p-2 rounded-xl ${isMandatory ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    {!isMandatory && !isOpen && <p className="text-xs text-slate-400 font-medium tracking-wide">CLICK TO CONFIGURE</p>}
                </div>
            </div>
            {!isMandatory && (
                <div className={`p-2 rounded-full ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            )}
        </button>
        {isOpen && (
            <div className="p-6 pt-0 border-t border-gray-50 animate-fade-in-down">
                {children}
            </div>
        )}
    </div>
);

export default function AdvancedCarLoanEMI({ currency = 'INR' }) {
    // --- SECTION TOGGLES ---
    const [openSections, setOpenSections] = useState({
        details: true,
        fees: false,
        credit: false,
        protection: false,
        advanced: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- MAIN INPUTS ---
    const [purchasePrice, setPurchasePrice] = useUrlState('price', 1000000);
    const [downPayment, setDownPayment] = useUrlState('down', 200000);
    const [tradeInValue, setTradeInValue] = useUrlState('trade', 0);
    const [loanTerm, setLoanTerm] = useUrlState('term', 60);
    const [annualRate, setAnnualRate] = useUrlState('rate', 9.5);
    const [startDate, setStartDate] = useUrlState('start', new Date().toISOString().slice(0, 7));

    // --- FEES & CHARGES ---
    const [processingFeeMode, setProcessingFeeMode] = useUrlState('pfMode', 'flat');
    const [processingFeeFlat, setProcessingFeeFlat] = useUrlState('pfFlat', 5000);
    const [processingFeePercent, setProcessingFeePercent] = useUrlState('pfPerc', 0.5);
    const [docFee, setDocFee] = useUrlState('docFee', 2000);
    const [salesTaxPercent, setSalesTaxPercent] = useUrlState('tax', 12);
    const [registrationCharges, setRegistrationCharges] = useUrlState('reg', 7500);
    const [addOnProducts, setAddOnProducts] = useUrlState('addons', 0);

    // --- CREDIT IMPACT ---
    const [creditScoreRange, setCreditScoreRange] = useState('Good (670-739)');
    const [manualRateEnabled, setManualRateEnabled] = useState(false);

    // --- PROTECTION PRODUCTS ---
    const [gapInsurance, setGapInsurance] = useState(0);
    const [otherInsurance, setOtherInsurance] = useState(0);

    // --- ADVANCED OPTIONS ---
    const [prepaymentPenalty, setPrepaymentPenalty] = useState(0);
    const [inflationRate, setInflationRate] = useState(5);
    const [depreciationRate, setDepreciationRate] = useState(15);

    // --- AFFORDABILITY ---
    const [monthlyIncome, setMonthlyIncome] = useState(0);

    // Derived Fees
    const actualProcessingFee = processingFeeMode === 'flat' ? processingFeeFlat : purchasePrice * (processingFeePercent / 100);
    const actualSalesTax = purchasePrice * (salesTaxPercent / 100);

    // --- COMPUTATION ---
    const results = useMemo(() => {
        return computeCarLoanAmortization({
            purchasePrice,
            downPayment,
            tradeInValue,
            annualRate,
            months: loanTerm,
            startDate,
            processingFee: actualProcessingFee,
            docFee,
            salesTax: actualSalesTax,
            registrationCharges,
            addOnProducts,
            inflationRate,
            depreciationRate,
            gapInsurance,
            otherInsurance
        });
    }, [purchasePrice, downPayment, tradeInValue, annualRate, loanTerm, startDate,
        actualProcessingFee, docFee, actualSalesTax, registrationCharges, addOnProducts,
        inflationRate, depreciationRate, gapInsurance, otherInsurance]);

    const { monthlyRows, yearlyRows, emi, loanAmount, totalInterest, totalPaid, totalCostOfOwnership, totalFees } = results;

    const handleExport = () => {
        const headers = ["Month", "Opening Balance", "EMI", "Interest", "Principal", "Closing Balance", "Car Value"];
        const data = monthlyRows.map(r => [
            `${r.monthName} ${r.year}`,
            moneyFormat(Math.round(r.openingBalance), currency),
            moneyFormat(Math.round(emi), currency),
            moneyFormat(Math.round(r.interestPaid), currency),
            moneyFormat(Math.round(r.principalPaid), currency),
            moneyFormat(Math.round(r.closingBalance), currency),
            moneyFormat(Math.round(r.carValue), currency)
        ]);
        downloadPDF(data, headers, "Car_Loan_Amortization.pdf");
    };

    // Chart Data for Car Value vs Loan Balance
    const trendChartData = {
        labels: monthlyRows.filter((_, i) => i % 6 === 0 || i === monthlyRows.length - 1).map(r => `${r.monthName} ${r.year}`),
        datasets: [
            {
                label: 'Loan Balance',
                data: monthlyRows.filter((_, i) => i % 6 === 0 || i === monthlyRows.length - 1).map(r => r.closingBalance),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Car Value',
                data: monthlyRows.filter((_, i) => i % 6 === 0 || i === monthlyRows.length - 1).map(r => r.carValue),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COL: INPUTS */}
                <div className="space-y-4">
                    {/* 1. VEHICLE & LOAN DETAILS */}
                    <CollapsibleSection
                        icon={IndianRupee}
                        title="Vehicle & Loan Details"
                        isOpen={openSections.details}
                        onToggle={() => toggleSection('details')}
                        isMandatory
                    >
                        <div className="space-y-6">
                            <InputWithSlider label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} min={100000} max={10000000} step={10000} currency={currency} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputWithSlider label="Down Payment" value={downPayment} onChange={setDownPayment} min={0} max={purchasePrice} step={5000} currency={currency} />
                                <InputWithSlider label="Trade-In Value" value={tradeInValue} onChange={setTradeInValue} min={0} max={purchasePrice} step={5000} currency={currency} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputWithSlider label="Loan Term (months)" value={loanTerm} onChange={setLoanTerm} min={12} max={120} step={1} />
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        <Calendar size={14} /> Start Date
                                    </label>
                                    <MonthYearPicker value={startDate} onChange={setStartDate} />
                                </div>
                            </div>
                            <InputWithSlider label="Annual Interest Rate (%)" value={annualRate} onChange={setAnnualRate} min={1} max={30} step={0.1} symbol="%" />
                        </div>
                    </CollapsibleSection>

                    {/* 2. FEES & CHARGES */}
                    <CollapsibleSection
                        icon={CreditCard}
                        title="Fees & Charges"
                        isOpen={openSections.fees}
                        onToggle={() => toggleSection('fees')}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-tight">Processing Fee</label>
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button onClick={() => setProcessingFeeMode('flat')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${processingFeeMode === 'flat' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-400'}`}>FIXED</button>
                                        <button onClick={() => setProcessingFeeMode('percent')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${processingFeeMode === 'percent' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-400'}`}>%</button>
                                    </div>
                                </div>
                                {processingFeeMode === 'flat' ?
                                    <InputWithSlider label="Processing Fee (Flat)" value={processingFeeFlat} onChange={setProcessingFeeFlat} min={0} max={50000} step={500} currency={currency} hideLabel /> :
                                    <InputWithSlider label="Processing Fee (%)" value={processingFeePercent} onChange={setProcessingFeePercent} min={0} max={5} step={0.1} symbol="%" hideLabel />
                                }
                            </div>
                            <InputWithSlider label="Documentation Fee" value={docFee} onChange={setDocFee} min={0} max={10000} step={500} currency={currency} />
                            <InputWithSlider label="Sales Tax/GST (%)" value={salesTaxPercent} onChange={setSalesTaxPercent} min={0} max={28} step={1} symbol="%" />
                            <InputWithSlider label="Registration Charges" value={registrationCharges} onChange={setRegistrationCharges} min={0} max={50000} step={500} currency={currency} />
                            <InputWithSlider label="Add-on Products" value={addOnProducts} onChange={setAddOnProducts} min={0} max={100000} step={1000} currency={currency} />
                        </div>
                    </CollapsibleSection>

                    {/* 3. CREDIT IMPACT */}
                    <CollapsibleSection
                        icon={ShieldCheck}
                        title="Credit Impact"
                        isOpen={openSections.credit}
                        onToggle={() => toggleSection('credit')}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="credit-score-select" className="text-xs font-black text-slate-900 uppercase tracking-tight">Credit Score Range</label>
                                <select
                                    id="credit-score-select"
                                    value={creditScoreRange}
                                    onChange={(e) => {
                                        const range = e.target.value;
                                        setCreditScoreRange(range);
                                        if (!manualRateEnabled) {
                                            const rateMap = {
                                                'Excellent (740-850)': 6.5,
                                                'Good (670-739)': 8.2,
                                                'Fair (580-669)': 11.5,
                                                'Poor (300-579)': 16.5
                                            };
                                            setAnnualRate(rateMap[range]);
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                                >
                                    <option>Excellent (740-850)</option>
                                    <option>Good (670-739)</option>
                                    <option>Fair (580-669)</option>
                                    <option>Poor (300-579)</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="pr-4">
                                    <p className="text-sm font-bold text-gray-800">Fixed Rate Mode</p>
                                    <p className="text-[10px] text-gray-500">Lock the interest rate and ignore credit score suggestions.</p>
                                </div>
                                <button
                                    onClick={() => setManualRateEnabled(!manualRateEnabled)}
                                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${manualRateEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${manualRateEnabled ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* 4. PROTECTION PRODUCTS */}
                    <CollapsibleSection
                        icon={ShieldCheck}
                        title="Protection Products"
                        isOpen={openSections.protection}
                        onToggle={() => toggleSection('protection')}
                    >
                        <div className="space-y-6">
                            <InputWithSlider label="Gap Insurance Cost" value={gapInsurance} onChange={setGapInsurance} min={0} max={50000} step={500} currency={currency} />
                            <InputWithSlider label="Loan Protection Insurance" value={otherInsurance} onChange={setOtherInsurance} min={0} max={50000} step={500} currency={currency} />
                        </div>
                    </CollapsibleSection>

                    {/* 5. ADVANCED OPTIONS */}
                    <CollapsibleSection
                        icon={Settings2}
                        title="Advanced Options"
                        isOpen={openSections.advanced}
                        onToggle={() => toggleSection('advanced')}
                    >
                        <div className="space-y-6">
                            <InputWithSlider label="Inflation Adjuster (%)" value={inflationRate} onChange={setInflationRate} min={0} max={15} step={0.1} symbol="%" />
                            <InputWithSlider label="Annual Depreciation (%)" value={depreciationRate} onChange={setDepreciationRate} min={0} max={40} step={1} symbol="%" />
                            <InputWithSlider label="Prepayment Penalty (%)" value={prepaymentPenalty} onChange={setPrepaymentPenalty} min={0} max={5} step={0.1} symbol="%" />
                        </div>
                    </CollapsibleSection>

                    {/* AFFORDABILITY CHECK */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Wallet size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Affordability Check</h3>
                        </div>
                        <div className="space-y-6">
                            <InputWithSlider label="Monthly Take-Home Income" value={monthlyIncome} onChange={setMonthlyIncome} min={0} max={1000000} step={5000} currency={currency} />
                            {monthlyIncome > 0 && (
                                <div className={`p-4 rounded-xl border ${emi > monthlyIncome * 0.4 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">EMI to Income Ratio</span>
                                        <span className={`text-sm font-black ${emi > monthlyIncome * 0.4 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {((emi / monthlyIncome) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${emi > monthlyIncome * 0.4 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, (emi / monthlyIncome) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: RESULTS */}
                <div className="space-y-6 lg:sticky lg:top-8 h-fit">
                    {/* 1. PAYMENT SUMMARY */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ChartPie size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Payment Summary</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Monthly EMI</p>
                                <p className="text-3xl font-black text-indigo-900">{moneyFormat(Math.round(emi), currency)}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Loan Amount</p>
                                <p className="text-2xl font-black text-slate-800">{moneyFormat(Math.round(loanAmount), currency)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Interest</span>
                                <span className="text-lg font-black text-gray-900">{moneyFormat(Math.round(totalInterest), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Fees</span>
                                <span className="text-lg font-black text-gray-900">{moneyFormat(Math.round(totalFees), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Amount Paid</span>
                                <span className="text-lg font-black text-gray-900">{moneyFormat(Math.round(totalPaid), currency)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <span className="text-sm font-black text-emerald-600 uppercase">Total Cost Of Ownership</span>
                                <span className="text-2xl font-black text-emerald-900">{moneyFormat(Math.round(totalCostOfOwnership), currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. BREAKDOWN | DOUGHNUT CHART */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                <ChartPie size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Cost Breakdown</h3>
                        </div>
                        <div className="h-[400px]">
                            <FinancialLoanDoughnutChart
                                upfront={downPayment + tradeInValue + totalFees}
                                principal={loanAmount - totalFees}
                                prepayments={0}
                                interest={totalInterest}
                                taxes={0}
                                insurance={0}
                                total={totalCostOfOwnership}
                                currency={currency}
                            />
                        </div>
                    </div>

                    {/* 3. PRINCIPAL VS INTEREST REPAYMENT */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <TrendingDown size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Repayment Structure</h3>
                        </div>
                        <FinancialCompoundingBarChart data={yearlyRows} currency={currency} type="loan" />
                    </div>
                </div>
            </div>

            {/* EQUITY TREND CHART */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <TrendingDown size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Vehicle Equity Trend</h3>
                    <p className="text-xs text-slate-400 font-medium ml-auto">CAR VALUE VS. LOAN BALANCE</p>
                </div>
                <div className="h-[350px]">
                    <FinancialLineChart data={trendChartData} currency={currency} />
                </div>
            </div>

            {/* 4. AMORTIZATION SCHEDULE */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                            <Table size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Amortization Schedule</h3>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
                    >
                        Download PDF
                    </button>
                </div>

                <CollapsibleAmortizationTable
                    yearlyData={yearlyRows}
                    monthlyData={monthlyRows}
                    currency={currency}
                    customColumn={{
                        header: "Car Value",
                        key: "carValue",
                        bgColor: "bg-[#6366f1]",
                        textColor: "text-white"
                    }}
                />
            </div>

            {/* 5. NEW INFO CONTENT */}
            <div className="bg-slate-900 text-slate-100 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl font-black mb-6 tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-indigo-500 rounded-xl"><Info size={24} className="text-white" /></span>
                            Maximizing Your Advanced Car Loan EMI
                        </h3>
                        <div className="space-y-6">
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <h4 className="text-indigo-400 font-bold mb-2 uppercase text-xs tracking-widest">The "Underwater" Risk</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Vehicles are depreciating assets. If your loan balance is higher than the car's market value (negative equity), you are "underwater". Our **Vehicle Equity Trend** chart helps you visualize when you'll reach positive equity. This is critical for long-term financial health, as selling a car while underwater requires you to pay the bank the difference out of pocket.
                                </p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <h4 className="text-emerald-400 font-bold mb-2 uppercase text-xs tracking-widest">Down Payment Strategy</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    A higher down payment reduces the capitalized loan amount, which significantly lowers the interest burden over 5-7 years. Aim for at least 20% to stay ahead of the depreciation curve. By reducing the principal from day one, you also lower your monthly EMI, giving you more breathing room in your monthly budget for maintenance and insurance.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <h4 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                                <ShieldCheck size={20} /> Smart Protection Tip
                            </h4>
                            <p className="text-indigo-50 text-sm leading-relaxed mb-6 font-medium">
                                If you are financing more than 80% of the car's value, **GAP Insurance** is highly recommended. It covers the financial gap between your insurance payout and the outstanding loan if the car is totaled. Without GAP coverage, you could be left owing thousands of dollars to a lender for a vehicle you can no longer drive.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-widest bg-black/20 p-3 rounded-xl">
                                <Info size={14} /> This tool uses standard reducing balance amortization.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional SEO Content Section */}
                <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-400 text-sm">
                    <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <TrendingDown size={18} className="text-indigo-400" />
                            Understanding Depreciation
                        </h4>
                        <p className="leading-relaxed">
                            New cars typically lose 20% of their value in the first year and 15% each year after. Our calculator factors this into the equity trend, helping you plan for your next upgrade. Understanding this curve is vital for deciding the optimal time to trade in or sell your vehicle.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-emerald-400" />
                            Total Cost of Ownership
                        </h4>
                        <p className="leading-relaxed">
                            Your monthly payment is just part of the story. Fuel, insurance, registration fees, and regular maintenance can add 30-50% to your monthly car-related expenses. We recommend keeping your total car-related costs under 15% of your gross monthly income.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-purple-400" />
                            Credit Score Impact
                        </h4>
                        <p className="leading-relaxed">
                            A credit score above 740 can save you thousands in interest over the life of a car loan. Even a 1% difference in your interest rate can translate to substantial savings. Before applying for a loan, check your credit report and clear any disputes.
                        </p>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 text-slate-300">
                    <h4 className="text-white font-bold mb-4 text-center">Frequently Asked Questions (FAQ)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="font-bold text-indigo-300 mb-2 italic">How is car loan EMI calculated?</p>
                            <p className="text-sm">The EMI is calculated using a standard formula: [P x R x (1+R)^N]/[(1+R)^N-1], where P is principal, R is monthly interest rate, and N is the number of installments.</p>
                        </div>
                        <div>
                            <p className="font-bold text-indigo-300 mb-2 italic">Is it better to have a longer or shorter loan term?</p>
                            <p className="text-sm">A shorter term saves you money on interest but requires higher monthly payments. A longer term is easier on your monthly budget but costs more in the long run.</p>
                        </div>
                        <div>
                            <p className="font-bold text-indigo-300 mb-2 italic">Can I pay off my car loan early?</p>
                            <p className="text-sm">Most lenders allow early repayment, but some may charge a prepayment penalty. It's usually financially beneficial to pay early if there are no heavy penalties.</p>
                        </div>
                        <div>
                            <p className="font-bold text-indigo-300 mb-2 italic">What factors affect my car loan interest rate?</p>
                            <p className="text-sm">Your credit score, loan amount, vehicle type (new vs used), and the loan tenure are the primary factors lenders consider when determining your rate.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
