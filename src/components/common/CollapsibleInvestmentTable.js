import React, { useState, Fragment } from 'react';
import { moneyFormat } from '../../utils/formatting';

export default function CollapsibleInvestmentTable({ yearlyData, monthlyData, currency, labels, isTenureView = false }) {
    const hasYearlyGrowth = Array.isArray(yearlyData) && yearlyData.some(r => r.yearlyGrowth !== undefined);
    const defaultLabels = {
        year: isTenureView ? "Tenure Year" : "Year",
        invested: "Total Invested",
        yearlyGrowth: "Yearly Growth",
        interest: hasYearlyGrowth ? "Total Growth" : "Interest Earned",
        balance: "Maturity Value"
    };
    const finalLabels = { ...defaultLabels, ...labels };
    const [expandedYears, setExpandedYears] = useState({});

    const toggleYear = (key) => {
        setExpandedYears(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Helper to group monthly data by calendar year or tenure year
    const getMonthsForYear = (yearRow) => {
        if (!monthlyData) return [];
        if (isTenureView || yearRow.periodLabel) {
            const yNum = yearRow.yearNumber ?? yearRow.year;
            return monthlyData.filter(m => Math.ceil(m.id / 12) === yNum);
        }
        return monthlyData.filter(m => m.year === yearRow.year);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* TABLE BODY CONTAINER WITH HORIZONTAL SCROLL */}
            <div className="overflow-auto max-h-[500px] w-full">
                <div className="min-w-[700px]">
                    {/* TABLE HEADER - Inside scroll container for alignment */}
                    {hasYearlyGrowth ? (
                        <div className="grid grid-cols-12 bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 items-stretch">
                            <div className="col-span-3 p-4 flex items-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 border-r border-indigo-200 dark:border-indigo-800 rounded-tl-xl truncate">{finalLabels.year}</div>
                            <div className="col-span-2 p-4 text-right bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 border-r border-emerald-200 dark:border-emerald-800 truncate">{finalLabels.invested}</div>
                            <div className="col-span-2 p-4 text-right bg-teal-100 dark:bg-teal-900/50 text-teal-900 dark:text-teal-100 border-r border-teal-200 dark:border-teal-800 truncate">{finalLabels.yearlyGrowth}</div>
                            <div className="col-span-2 p-4 text-right bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-r border-amber-200 dark:border-amber-800 truncate">{finalLabels.interest}</div>
                            <div className="col-span-3 p-4 text-right bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded-tr-xl truncate">{finalLabels.balance}</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 items-stretch">
                            <div className="col-span-2 p-4 flex items-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 border-r border-indigo-200 dark:border-indigo-800 rounded-tl-xl truncate">{finalLabels.year}</div>
                            <div className="col-span-4 p-4 text-right bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 border-r border-emerald-200 dark:border-emerald-800 truncate">{finalLabels.invested}</div>
                            <div className="col-span-3 p-4 text-right bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-r border-amber-200 dark:border-amber-800 truncate">{finalLabels.interest}</div>
                            <div className="col-span-3 p-4 text-right bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded-tr-xl truncate">{finalLabels.balance}</div>
                        </div>
                    )}

                    {yearlyData.map((yearRow) => {
                        const rowKey = yearRow.yearLabel || yearRow.year;
                        const isExpanded = expandedYears[rowKey];
                        const months = getMonthsForYear(yearRow);
                        const hasMonths = months && months.length > 0;
                        const displayYearText = yearRow.yearLabel || yearRow.displayYear || yearRow.year;

                        if (hasYearlyGrowth) {
                            return (
                                <Fragment key={rowKey}>
                                    {/* YEAR ROW - 5 COLUMNS */}
                                    <div
                                        className={`grid grid-cols-12 border-b border-gray-300 dark:border-slate-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-900/30' : ''}`}
                                        onClick={() => hasMonths && toggleYear(rowKey)}
                                    >
                                        <div className="col-span-3 p-3 sm:p-4 flex items-center font-bold text-indigo-900 dark:text-indigo-200 border-r border-gray-300 dark:border-slate-700">
                                            {hasMonths && (
                                                <button className="mr-2 w-5 h-5 flex items-center justify-center rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-300 text-xs font-mono group-hover:border-indigo-400 dark:group-hover:border-indigo-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-100 transition-colors shadow-sm shrink-0">
                                                    {isExpanded ? '−' : '+'}
                                                </button>
                                            )}
                                            <span className={!hasMonths ? "ml-7 truncate" : "truncate"}>{displayYearText}</span>
                                        </div>
                                        <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-slate-700">
                                            {moneyFormat(yearRow.totalInvested, currency)}
                                        </div>
                                        <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-teal-600 dark:text-teal-400 border-r border-gray-300 dark:border-slate-700">
                                            +{moneyFormat(yearRow.yearlyGrowth ?? yearRow.growth, currency)}
                                        </div>
                                        <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-green-600 dark:text-green-400 border-r border-gray-300 dark:border-slate-700">
                                            +{moneyFormat(yearRow.growth, currency)}
                                        </div>
                                        <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-blue-700 dark:text-blue-300 bg-blue-50/20 dark:bg-blue-900/10">
                                            {moneyFormat(yearRow.balance ?? yearRow.overallValue, currency)}
                                        </div>
                                    </div>

                                    {/* MONTHLY ROWS (Expanded) - 5 COLUMNS */}
                                    {isExpanded && months.map((monthRow, idx) => (
                                        <div key={`${rowKey}-${idx}`} className="grid grid-cols-12 border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs sm:text-sm animate-fade-in-down">
                                            <div className="col-span-3 p-2 pl-8 sm:pl-10 text-gray-700 dark:text-gray-300 font-medium border-r border-gray-300 dark:border-slate-700 flex items-center gap-2 truncate">
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 shrink-0">
                                                    {monthRow.label || `M${monthRow.id || monthRow.month}`}
                                                </span>
                                                <span className="truncate">{monthRow.monthName}</span>
                                            </div>
                                            <div className="col-span-2 p-2 text-right text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-slate-700">
                                                {moneyFormat(monthRow.invested, currency)}
                                            </div>
                                            <div className="col-span-2 p-2 text-right text-teal-600 dark:text-teal-400 border-r border-gray-300 dark:border-slate-700">
                                                +{moneyFormat(monthRow.monthlyGrowth ?? monthRow.interest ?? monthRow.growth, currency)}
                                            </div>
                                            <div className="col-span-2 p-2 text-right text-green-600 dark:text-green-400 border-r border-gray-300 dark:border-slate-700">
                                                +{moneyFormat(monthRow.growth, currency)}
                                            </div>
                                            <div className="col-span-3 p-2 text-right text-gray-700 dark:text-gray-300 bg-blue-50/10 dark:bg-blue-900/5">
                                                {moneyFormat(monthRow.balance, currency)}
                                            </div>
                                        </div>
                                    ))}
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment key={rowKey}>
                                {/* YEAR ROW - 4 COLUMNS */}
                                <div
                                    className={`grid grid-cols-12 border-b border-gray-300 dark:border-slate-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-900/30' : ''}`}
                                    onClick={() => hasMonths && toggleYear(rowKey)}
                                >
                                    <div className="col-span-2 p-3 sm:p-4 flex items-center font-bold text-indigo-900 dark:text-indigo-200 border-r border-gray-300 dark:border-slate-700">
                                        {hasMonths && (
                                            <button className="mr-2 w-5 h-5 flex items-center justify-center rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-300 text-xs font-mono group-hover:border-indigo-400 dark:group-hover:border-indigo-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-100 transition-colors shadow-sm shrink-0">
                                                {isExpanded ? '−' : '+'}
                                            </button>
                                        )}
                                        <span className={!hasMonths ? "ml-7 truncate" : "truncate"}>{displayYearText}</span>
                                    </div>
                                    <div className="col-span-4 p-3 sm:p-4 text-right font-bold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-slate-700">
                                        {moneyFormat(yearRow.totalInvested, currency)}
                                    </div>
                                    <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-green-600 dark:text-green-400 border-r border-gray-300 dark:border-slate-700">
                                        +{moneyFormat(yearRow.growth, currency)}
                                    </div>
                                    <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-blue-700 dark:text-blue-300 bg-blue-50/20 dark:bg-blue-900/10">
                                        {moneyFormat(yearRow.balance ?? yearRow.overallValue, currency)}
                                    </div>
                                </div>

                                {/* MONTHLY ROWS (Expanded) - 4 COLUMNS */}
                                {isExpanded && months.map((monthRow, idx) => (
                                    <div key={`${yearRow.year}-${idx}`} className="grid grid-cols-12 border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs sm:text-sm animate-fade-in-down">
                                        <div className="col-span-2 p-2 pl-8 sm:pl-10 text-gray-700 dark:text-gray-300 font-medium border-r border-gray-300 dark:border-slate-700 flex items-center gap-2 truncate">
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 shrink-0">
                                                {monthRow.label || `M${monthRow.id || monthRow.month}`}
                                            </span>
                                            <span className="truncate">{monthRow.monthName}</span>
                                        </div>
                                        <div className="col-span-4 p-2 text-right text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-slate-700">
                                            {moneyFormat(monthRow.invested, currency)}
                                        </div>
                                        <div className="col-span-3 p-2 text-right text-green-600 dark:text-green-400 border-r border-gray-300 dark:border-slate-700">
                                            +{moneyFormat(monthRow.interest ?? monthRow.growth, currency)}
                                        </div>
                                        <div className="col-span-3 p-2 text-right text-gray-700 dark:text-gray-300 bg-blue-50/10 dark:bg-blue-900/5">
                                            {moneyFormat(monthRow.balance, currency)}
                                        </div>
                                    </div>
                                ))}
                            </Fragment>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-gray-50 dark:bg-slate-900 p-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 flex flex-col">
                <span>Click on <strong>[+]</strong> to view monthly breakdown.</span>
            </div>
        </div>
    );
}
