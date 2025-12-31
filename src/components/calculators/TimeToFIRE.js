import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../common/CalculatorLayout';
import InputWithSlider from '../common/InputWithSlider';
import { FinancialLineChart } from '../common/FinancialCharts';
import ResultsTable from '../common/ResultsTable';
import { calculateTimeToFIRE, calculateFIRELevel, calculateCoastFIRE } from '../../utils/finance';
import { downloadPDF } from '../../utils/export';
import { moneyFormat } from '../../utils/formatting';
import {
    DEFAULT_SWR,
    DEFAULT_EXPENSE,
    DEFAULT_RATE,
    MAX_CORPUS,
    STEP_LARGE,
    MAX_EXPENSE,
    STEP_AMOUNT,
    MAX_SIP,
    MIN_AMOUNT,
    MAX_RATE,
    MIN_RATE,
    MIN_SWR,
    MAX_SWR,
    MIN_AGE,
    MAX_AGE,
    DEFAULT_CURRENT_AGE,
    DEFAULT_RETIREMENT_AGE
} from '../../utils/constants';

// Local fallbacks if not in constants
const LOC_MIN_EXPENSE = 5000;

const LOC_DEFAULT_INFLATION = 6;
const DEFAULT_INFLATION_HEALTH = 10;

export default function TimeToFIRE({ currency }) {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Life & Retirement State
    const [currentAge, setCurrentAge] = useState(DEFAULT_CURRENT_AGE || 30);
    const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE || 60);

    const [currentCorpus, setCurrentCorpus] = useState(1000000); // 10 Lakh

    // Simple Mode State
    const [monthlyExpensesSimple, setMonthlyExpensesSimple] = useState(DEFAULT_EXPENSE);

    // Advanced Mode State (Expense Breakdown)
    const [expHousing, setExpHousing] = useState(15000);
    const [expHealthcare, setExpHealthcare] = useState(5000);
    const [expFood, setExpFood] = useState(10000);
    const [expTransport, setExpTransport] = useState(5000);
    const [expDiscretionary, setExpDiscretionary] = useState(15000);

    const [monthlyInvestment, setMonthlyInvestment] = useState(20000); // 20k
    const [annualReturn, setAnnualReturn] = useState(DEFAULT_RATE);

    // Inflation State
    const [inflationGen, setInflationGen] = useState(LOC_DEFAULT_INFLATION);
    const [inflationHealth, setInflationHealth] = useState(DEFAULT_INFLATION_HEALTH);

    const [swr, setSwr] = useState(DEFAULT_SWR);

    // Individual Toggles for Advanced Mode
    const [useHousing, setUseHousing] = useState(true);
    const [useHealthcare, setUseHealthcare] = useState(true);
    const [useFood, setUseFood] = useState(true);
    const [useTransport, setUseTransport] = useState(true);
    const [useDiscretionary, setUseDiscretionary] = useState(true);

    // Derived Values
    const totalMonthlyExpenses = isAdvancedMode
        ? (useHousing ? Number(expHousing) : 0) +
        (useHealthcare ? Number(expHealthcare) : 0) +
        (useFood ? Number(expFood) : 0) +
        (useTransport ? Number(expTransport) : 0) +
        (useDiscretionary ? Number(expDiscretionary) : 0)
        : Number(monthlyExpensesSimple);

    // CRITICAL VALIDATION: Ensure totalMonthlyExpenses is at least 1 to avoid division by zero
    const safeTotalMonthlyExpenses = Math.max(1, totalMonthlyExpenses);

    // Blended Personal Inflation Rate
    const blendedInflation = useMemo(() => {
        if (!isAdvancedMode) return inflationGen;

        if (safeTotalMonthlyExpenses <= 1) return Number(inflationGen);

        const weighted = (
            (useHousing ? Number(expHousing) : 0) * Number(inflationGen) +
            (useFood ? Number(expFood) : 0) * Number(inflationGen) +
            (useTransport ? Number(expTransport) : 0) * Number(inflationGen) +
            (useDiscretionary ? Number(expDiscretionary) : 0) * Number(inflationGen) +
            (useHealthcare ? Number(expHealthcare) : 0) * Number(inflationHealth)
        ) / safeTotalMonthlyExpenses;
        return parseFloat(weighted.toFixed(2));
    }, [isAdvancedMode, inflationGen, expHousing, expFood, expTransport, expDiscretionary, expHealthcare, inflationHealth, safeTotalMonthlyExpenses, useHousing, useFood, useTransport, useDiscretionary, useHealthcare]);

    const result = useMemo(() => {
        // Validation for SWR
        const safeSWR = Math.max(0.1, Number(swr));

        return calculateTimeToFIRE({
            currentCorpus: Number(currentCorpus),
            monthlyExpenses: safeTotalMonthlyExpenses,
            monthlyInvestment: Number(monthlyInvestment),
            annualReturn: Number(annualReturn),
            swr: safeSWR,
            inflation: Number(blendedInflation)
        });
    }, [currentCorpus, safeTotalMonthlyExpenses, monthlyInvestment, annualReturn, swr, blendedInflation]);

    const coastResult = useMemo(() => calculateCoastFIRE({
        currentAge: Number(currentAge),
        retirementAge: Number(retirementAge),
        monthlyExpenses: safeTotalMonthlyExpenses,
        swr: Number(swr),
        annualReturn: Number(annualReturn),
        inflation: Number(blendedInflation)
    }), [currentAge, retirementAge, safeTotalMonthlyExpenses, swr, annualReturn, blendedInflation]);

    const isCoasted = Number(currentCorpus) >= coastResult.neededToday;


    // Essentials Calculation (Memoized for use in Barista and FIRE Level)
    const monthlyEssentials = useMemo(() => {
        if (!isAdvancedMode) return safeTotalMonthlyExpenses * 0.8; // Default to 80% essentials in simple mode
        return (useHousing ? Number(expHousing) : 0) +
            (useHealthcare ? Number(expHealthcare) : 0) +
            (useFood ? Number(expFood) : 0) +
            (useTransport ? Number(expTransport) : 0);
    }, [isAdvancedMode, safeTotalMonthlyExpenses, useHousing, useHealthcare, useFood, useTransport, expHousing, expHealthcare, expFood, expTransport]);

    // Barista FIRE Calculation
    const baristaNumber = (monthlyEssentials * 12) / (Math.max(0.1, Number(swr)) / 100);
    const isBarista = Number(currentCorpus) >= baristaNumber;

    const fireLevel = useMemo(() => {
        if (!isAdvancedMode) return null;
        return calculateFIRELevel(monthlyEssentials * 12, safeTotalMonthlyExpenses * 12);
    }, [isAdvancedMode, monthlyEssentials, safeTotalMonthlyExpenses]);

    // Sensitivity Analysis
    const resultStress = useMemo(() => calculateTimeToFIRE({
        currentCorpus: Number(currentCorpus),
        monthlyExpenses: Number(totalMonthlyExpenses) * 1.10, // +10% shock
        monthlyInvestment: Number(monthlyInvestment),
        annualReturn: Number(annualReturn),
        swr: Number(swr),
        inflation: Number(blendedInflation)
    }), [currentCorpus, totalMonthlyExpenses, monthlyInvestment, annualReturn, swr, blendedInflation]);

    const getSWRDescription = (rate) => {
        if (rate <= 3) return "Conservative: Targeted to last indefinitely (preserves real capital).";
        if (rate <= 4.0) return "Standard (The 4% Rule): Targeted to last ~30+ years.";
        if (rate <= 5.0) return "Aggressive: Targeted to last ~20-25 years. Risk of depletion.";
        return "Very Aggressive: High risk of depleting corpus in roughly 10-15 years.";
    };

    const inputs = (
        <>
            <div className="md:col-span-2 mb-2">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 rounded-2xl shadow-lg border border-teal-500/30 flex justify-between items-center text-white">
                    <div>
                        <h4 className="text-base font-black uppercase tracking-widest">Ultimate FIRE Planner</h4>
                        <p className="text-[10px] opacity-80 font-medium">Lean • Coast • Standard • Fat FIRE Analysis</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex items-center border border-white/20">
                        <button
                            onClick={() => setIsAdvancedMode(false)}
                            className={`px-4 py-1.5 text-xs rounded-lg transition-all font-bold ${!isAdvancedMode ? 'bg-white text-teal-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
                        >
                            Essentials
                        </button>
                        <button
                            onClick={() => setIsAdvancedMode(true)}
                            className={`px-4 py-1.5 text-xs rounded-lg transition-all font-bold ${isAdvancedMode ? 'bg-white text-teal-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
                        >
                            Advanced
                        </button>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 border-b pb-4 mb-2">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Life & Retirement
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputWithSlider
                        label="Current Age"
                        value={currentAge}
                        onChange={setCurrentAge}
                        min={MIN_AGE || 18} max={70}
                    />
                    <InputWithSlider
                        label="Retirement Age"
                        value={retirementAge}
                        onChange={setRetirementAge}
                        min={currentAge + 1} max={MAX_AGE || 100}
                    />
                </div>
            </div>

            <div className="md:col-span-1">
                <InputWithSlider
                    label="Current Portfolio Value"
                    value={currentCorpus}
                    onChange={setCurrentCorpus}
                    min={MIN_AMOUNT}
                    max={MAX_CORPUS}
                    step={STEP_LARGE}
                    currency={currency}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Your existing assets for this goal.
                </p>
            </div>

            <div className="md:col-span-1">
                <InputWithSlider
                    label="Monthly Investment"
                    value={monthlyInvestment}
                    onChange={setMonthlyInvestment}
                    min={MIN_AMOUNT}
                    max={MAX_SIP}
                    step={STEP_AMOUNT}
                    currency={currency}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Amount you invest monthly.
                </p>
            </div>

            <div className="md:col-span-2">
                {!isAdvancedMode ? (
                    <div className="mb-4">
                        <InputWithSlider
                            label="Monthly Expenses (Current)"
                            value={monthlyExpensesSimple}
                            onChange={setMonthlyExpensesSimple}
                            min={LOC_MIN_EXPENSE}
                            max={MAX_EXPENSE}
                            step={STEP_AMOUNT}
                            currency={currency}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Your <b>current</b> monthly spending.
                        </p>
                    </div>
                ) : (
                    <div className="mb-4 border p-5 rounded-2xl bg-gray-50/50 shadow-inner">
                        <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                            Target Monthly Expenses Breakdown
                        </h4>
                        <div className="space-y-5">
                            <CategoryInput
                                label="Housing & Utilities"
                                value={expHousing}
                                onChange={setExpHousing}
                                active={useHousing}
                                onToggle={() => setUseHousing(!useHousing)}
                                min={0} max={100000} step={500}
                                currency={currency}
                            />
                            <div className={`bg-red-50/30 p-3 rounded-xl border border-red-100/50 transition-opacity ${!useHealthcare ? 'opacity-50' : ''}`}>
                                <CategoryInput
                                    label="Healthcare (Premiums + OOP)"
                                    value={expHealthcare}
                                    onChange={setExpHealthcare}
                                    active={useHealthcare}
                                    onToggle={() => setUseHealthcare(!useHealthcare)}
                                    min={0} max={50000} step={500}
                                    currency={currency}
                                />
                                <p className="text-[10px] text-red-500 mt-1 font-medium">*Healthcare costs often inflate faster.</p>
                            </div>
                            <CategoryInput
                                label="Food & Essentials"
                                value={expFood}
                                onChange={setExpFood}
                                active={useFood}
                                onToggle={() => setUseFood(!useFood)}
                                min={0} max={50000} step={500}
                                currency={currency}
                            />
                            <CategoryInput
                                label="Transport"
                                value={expTransport}
                                onChange={setExpTransport}
                                active={useTransport}
                                onToggle={() => setUseTransport(!useTransport)}
                                min={0} max={30000} step={500}
                                currency={currency}
                            />
                            <CategoryInput
                                label="Discretionary / Lifestyle"
                                value={expDiscretionary}
                                onChange={setExpDiscretionary}
                                active={useDiscretionary}
                                onToggle={() => setUseDiscretionary(!useDiscretionary)}
                                min={0} max={100000} step={500}
                                currency={currency}
                            />
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Total Monthly:</span>
                            <span className="text-xl font-black text-teal-700">{moneyFormat(totalMonthlyExpenses, currency)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <div>
                    <InputWithSlider
                        label="Expected Annual Return (%)"
                        value={annualReturn}
                        onChange={(val) => setAnnualReturn(Number(val))}
                        min={MIN_RATE}
                        max={MAX_RATE}
                        step={0.1}
                        symbol="%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Nominal annual return. Real Rate: {Math.max(0, (1 + annualReturn / 100) / (1 + blendedInflation / 100) - 1).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}.
                    </p>
                </div>
                <div>
                    {!isAdvancedMode ? (
                        <>
                            <InputWithSlider
                                label="Expected Inflation (%)"
                                value={inflationGen}
                                onChange={setInflationGen}
                                min={0}
                                max={15}
                                step={0.1}
                                symbol="%"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Average inflation rate.
                            </p>
                        </>
                    ) : (
                        <>
                            <InputWithSlider
                                label="General Inflation (%)"
                                value={inflationGen}
                                onChange={setInflationGen}
                                min={0} max={15} step={0.1} symbol="%"
                            />
                            <div className="mt-4">
                                <InputWithSlider
                                    label="Healthcare Inflation (%)"
                                    value={inflationHealth}
                                    onChange={setInflationHealth}
                                    min={0} max={20} step={0.1} symbol="%"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Blended Inflation: <b>{blendedInflation}%</b>
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <div className="md:col-span-2">
                    <InputWithSlider
                        label="Withdrawal Rate (SWR %)"
                        value={swr}
                        onChange={setSwr}
                        min={MIN_SWR}
                        max={MAX_SWR}
                        step={0.1}
                        symbol="%"
                    />
                    <div className="mt-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                        <p className={`text-sm font-medium ${swr > 5 ? 'text-orange-600' : 'text-teal-800'}`}>
                            {getSWRDescription(swr)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Withdrawals start after <b>{result.years >= 100 ? "reaching goal" : `${result.years} Years ${result.months} Months`}</b>
                        </p>
                    </div>
                </div>
            </div>


        </>
    );

    const handleExport = () => {
        if (!result.rows) return;
        const headers = ["Year", "Annual Inv.", "Total Invested", "Growth", "Portfolio Value", "Annual Expenses", "SWR", "Target Corpus"];
        const data = result.rows.map(r => [
            `Year ${r.year}`,
            Math.round(r.annualInvestment),
            Math.round(r.totalInvested),
            Math.round(r.growth),
            Math.round(r.overallValue),
            Math.round(r.annualExpenses),
            r.swr + '%',
            Math.round(r.targetCorpus)
        ]);
        downloadPDF(data, headers, "time_to_fire_report.pdf");
    };

    const tableColumns = [
        { key: 'year', label: 'Year', align: 'left' },
        { key: 'annualInvestment', label: 'Ann. Inv.', align: 'right', format: 'money' },
        { key: 'totalInvested', label: 'Total Inv.', align: 'right', format: 'money' },
        { key: 'growth', label: 'Growth', align: 'right', format: 'money', color: 'green' },
        { key: 'overallValue', label: 'Portfolio', align: 'right', format: 'money', highlight: true },
        { key: 'annualExpenses', label: 'Ann. Exp.', align: 'right', format: 'money' },
        { key: 'swr', label: 'SWR', align: 'right', format: 'percent' },
        { key: 'targetCorpus', label: 'Target', align: 'right', format: 'money' }
    ];

    const details = (
        <div className="mt-8 bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50 outline outline-4 outline-white -outline-offset-4">
            <h3 className="text-blue-900 font-black text-xl mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                About the Ultimate FIRE Planner
            </h3>
            <div className="text-sm text-blue-800/80 leading-relaxed space-y-4">
                <p>
                    This is a comprehensive financial independence tool that unifies <b>Lean</b>, <b>Coast</b>, <b>Standard</b>, and <b>Fat FIRE</b> strategies. It uses your specific life stages and budget breakdown to give you the most accurate path forward.
                </p>
                <h5 className="font-bold text-blue-900 mt-4 uppercase tracking-wider text-xs">Core Strategies:</h5>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <b>Barista FIRE:</b> You have enough to cover bare <b>essentials</b> (Housing/Food). You only need a low-stress job to cover extra fun spending.
                    </li>
                    <li>
                        <b>Coast FIRE:</b> You have saved enough today that compound interest alone will carry you to a full retirement at age {retirementAge}. You can stop saving!
                    </li>
                    <li>
                        <b>Fat / Chubby FIRE:</b> You want a luxurious lifestyle. This calculator accounts for that via the "FIRE Levels" badge.
                    </li>
                </ul>
                <h5 className="font-bold text-blue-900 mt-4 uppercase tracking-wider text-xs">Calculation Logic:</h5>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <b>Target Corpus:</b> The "Finish Line". Calculated as <code>Annual Expenses / (SWR / 100)</code>. For example, if you spend {moneyFormat(50000, currency)}/mo ({moneyFormat(600000, currency)}/year) and use a 4% SWR, you need {moneyFormat(15000000, currency, true)}.
                    </li>
                    <li>
                        <b>Safe Withdrawal Rate (SWR):</b> The standard advice is 4%, derived from the "Trinity Study". It suggests that with a balanced portfolio, withdrawing 4% initially and adjusting for inflation gives a very high probability of your money lasting 30 years.
                    </li>
                    <li>
                        <b>Blended Inflation:</b> In Advanced Mode, we use a higher inflation rate (7%) for healthcare and 4% for others to reflect real-world cost increases.
                    </li>
                </ul>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            inputs={inputs}
            summary={
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
                        {/* Time to FIRE */}
                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${result.years >= 100 ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 ${result.years >= 100 ? 'text-red-800' : 'text-teal-800'}`}>Time to FIRE</h3>
                            <div className={`text-4xl font-extrabold ${result.years >= 100 ? 'text-red-600' : 'text-teal-600'}`}>
                                {result.years >= 100 ? (
                                    <span>Never <span className="text-sm font-normal text-gray-500 block mt-1">(Metrics Unsustainable)</span></span>
                                ) : (
                                    <>{result.years}<span className="text-lg font-medium ml-1">Y</span> {result.months}<span className="text-lg font-medium ml-1">M</span></>
                                )}
                            </div>
                            {result.years < 100 && <p className="text-xs opacity-70 mt-2 font-medium">Until Financial Independence</p>}
                        </div>


                        {/* FIRE Milestones Card */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">FIRE Milestones</h4>
                            <div className="space-y-4">
                                {/* Barista FIRE */}
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isBarista ? 'text-purple-700' : 'text-gray-600'}`}>
                                            ☕ Barista FIRE
                                        </span>
                                        <span className="text-[10px] text-gray-400">Cover Essentials ({moneyFormat(monthlyEssentials, currency)}/mo)</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isBarista ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {isBarista ? 'ACHIEVED' : moneyFormat(baristaNumber - Number(currentCorpus), currency) + ' left'}
                                    </div>
                                </div>

                                {/* Coast FIRE */}
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isCoasted ? 'text-emerald-700' : 'text-gray-600'}`}>
                                            🌴 Coast FIRE
                                        </span>
                                        <span className="text-[10px] text-gray-400">Stop Saving Now</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isCoasted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {isCoasted ? 'ACHIEVED' : moneyFormat(coastResult.neededToday - Number(currentCorpus), currency) + ' left'}
                                    </div>
                                </div>
                            </div>

                            {isCoasted && (
                                <p className="text-[10px] text-emerald-600 font-bold italic leading-tight mt-4 text-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    "You are Coast FIRE! Your corpus will grow to cover full retirement by age {retirementAge}."
                                </p>
                            )}
                        </div>

                        {/* Target Corpus */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Target FIRE Corpus</h3>
                            <div className="text-3xl font-extrabold text-gray-900">
                                {moneyFormat(result.targetCorpus, currency, true)}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Annual Exp. ÷ {swr}% (SWR) (Real Terms)</span>
                            </div>

                            {fireLevel && (
                                <div
                                    className="absolute top-4 right-4 animate-fade-in cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => setShowInfo(!showInfo)}
                                    title="Click for definition"
                                >
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border shadow-sm ${fireLevel === 'LeanFIRE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        fireLevel === 'FIRE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            fireLevel === 'ChubbyFIRE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-pink-50 text-pink-700 border-pink-200'
                                        }`}>
                                        {fireLevel} ℹ️
                                    </span>
                                </div>
                            )}
                            {showInfo && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
                                        <button
                                            onClick={() => setShowInfo(false)}
                                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-black text-gray-900">FIRE Level Definitions</h4>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Based on the ratio of your <b>Essential Expenses</b> to your <b>Total Withdrawal Capacity (SWR)</b>.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { level: 'LeanFIRE', range: 'Needs > 80%', color: 'yellow', desc: 'Covering only essentials. Little room for luxury.' },
                                                { level: 'FIRE', range: 'Needs 40-80%', color: 'blue', desc: 'A balanced lifestyle with comfort and some play.' },
                                                { level: 'ChubbyFIRE', range: 'Needs 20-40%', color: 'purple', desc: 'Secure and high-quality lifestyle with regular travel.' },
                                                { level: 'FatFIRE', range: 'Needs < 20%', color: 'pink', desc: 'Luxury lifestyle. Essential costs are a minor fraction.' }
                                            ].map((item) => (
                                                <div key={item.level} className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:shadow-md ${item.color === 'yellow' ? 'bg-yellow-50/50 border-yellow-100' :
                                                    item.color === 'blue' ? 'bg-blue-50/50 border-blue-100' :
                                                        item.color === 'purple' ? 'bg-purple-50/50 border-purple-100' :
                                                            'bg-pink-50/50 border-pink-100'
                                                    }`}>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`font-bold text-sm ${item.color === 'yellow' ? 'text-yellow-700' :
                                                                item.color === 'blue' ? 'text-blue-700' :
                                                                    item.color === 'purple' ? 'text-purple-700' :
                                                                        'text-pink-700'
                                                                }`}>{item.level}</span>
                                                            <span className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full border">{item.range}</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setShowInfo(false)}
                                            className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                                        >
                                            Got it
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stress Test (Advanced Only) */}
                    {isAdvancedMode && (
                        <div className="mb-8 bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 flex items-center justify-between">
                            <div>
                                <h5 className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">Sensitivity Stress Test</h5>
                                <p className="text-xs text-gray-600">
                                    If expenses are <b>10% higher</b> ({moneyFormat(Math.round(totalMonthlyExpenses * 1.1), currency)}):
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-700">Need: <span className="font-bold text-orange-800">{moneyFormat(resultStress.targetCorpus, currency)}</span></div>
                                <div className={`text-sm font-bold ${resultStress.years > result.years ? 'text-red-600' : 'text-orange-800'}`}>
                                    {resultStress.years >= 100 ? "Unreachable" : `+${resultStress.years * 12 + resultStress.months - (result.years * 12 + result.months)} months`}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHART */}
                    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block">
                        <h3 className="text-gray-800 font-bold text-lg mb-4">Path to FIRE (Real Value)</h3>
                        <FinancialLineChart
                            data={{
                                labels: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, (_, i) => `Year ${i}`),
                                datasets: [
                                    {
                                        label: 'Projected Portfolio (Real)',
                                        data: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, (_, i) => {
                                            // Calculate Real Rate for Chart Consistency
                                            let effectiveAnnualRate = annualReturn;
                                            if (blendedInflation > 0) {
                                                effectiveAnnualRate = ((1 + annualReturn / 100) / (1 + blendedInflation / 100) - 1) * 100;
                                            }

                                            // Simple yearly projection for chart using REAL RATE
                                            const r = effectiveAnnualRate / 100;
                                            const months = i * 12;
                                            const r_m_chart = Math.pow(1 + r, 1 / 12) - 1;

                                            // FV of Corpus
                                            const valCorpus = currentCorpus * Math.pow(1 + r_m_chart, months);

                                            // FV of SIP (Real SIP remains constant in Real Terms)
                                            let valSIP;
                                            if (r_m_chart === 0) {
                                                valSIP = monthlyInvestment * months;
                                            } else {
                                                valSIP = monthlyInvestment * ((Math.pow(1 + r_m_chart, months) - 1) / r_m_chart);
                                            }

                                            return Math.round(valCorpus + valSIP);
                                        }),
                                        borderColor: '#0D9488', // Teal-600
                                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                                        fill: true,
                                        tension: 0.4
                                    },
                                    {
                                        label: 'FIRE Target (Constant Real)',
                                        data: Array.from({ length: Math.ceil(Math.min(result.years, 50) + 2) }, () => result.targetCorpus),
                                        borderColor: '#EF4444', // Red-500
                                        borderDash: [5, 5],
                                        fill: false,
                                        pointRadius: 0
                                    }
                                ]
                            }}
                            currency={currency}
                            height={300}
                        />
                    </div>
                </>
            }
            table={
                <ResultsTable
                    data={result.rows}
                    currency={currency}
                    onExport={handleExport}
                    columns={tableColumns}
                />
            }
            details={details}
        />
    );
}

// Helper component for toggled categories
function CategoryInput({ label, value, onChange, active, onToggle, ...props }) {
    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-1 pr-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggle}
                        className={`w-8 h-4 rounded-full transition-colors relative flex items-center ${active ? 'bg-teal-500' : 'bg-gray-300'}`}
                        title={active ? "Deactivate this category" : "Activate this category"}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-teal-700' : 'text-gray-400 line-through'}`}>
                        {label}
                    </span>
                </div>
            </div>
            <div className={active ? '' : 'filter grayscale opacity-30 pointer-events-none'}>
                <InputWithSlider
                    label=""
                    value={value}
                    onChange={onChange}
                    {...props}
                />
            </div>
        </div>
    );
}
