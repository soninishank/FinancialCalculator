import React, { useState, Fragment } from 'react';
import { moneyFormat } from '../../utils/formatting';

export default function CollapsibleInvestmentTable({ yearlyData, monthlyData, currency, labels }) {
    const defaultLabels = {
        year: "Year",
        invested: "Total Invested",
        interest: "Interest Earned",
        balance: "Maturity Value"
    };
    const finalLabels = { ...defaultLabels, ...labels };
    const [expandedYears, setExpandedYears] = useState({});

    const toggleYear = (year) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    // Helper to group monthly data by year
    const getMonthsForYear = (year) => {
        return monthlyData ? monthlyData.filter(m => m.year === year) : [];
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* TABLE BODY CONTAINER WITH HORIZONTAL SCROLL */}
            <div className="overflow-auto max-h-[500px] w-full">
                <div className="min-w-[700px]">
                    {/* TABLE HEADER - Inside scroll container for alignment */}
                    <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-200 text-xs sm:text-sm font-bold text-gray-700 items-stretch">
                        <div className="col-span-2 p-4 flex items-center bg-indigo-100 text-indigo-900 border-r border-indigo-200 rounded-tl-xl truncate">{finalLabels.year}</div>
                        <div className="col-span-4 p-4 text-right bg-emerald-100 text-emerald-900 border-r border-emerald-200 truncate">{finalLabels.invested}</div>
                        <div className="col-span-3 p-4 text-right bg-amber-100 text-amber-900 border-r border-amber-200 truncate">{finalLabels.interest}</div>
                        <div className="col-span-3 p-4 text-right bg-blue-100 text-blue-900 rounded-tr-xl truncate">{finalLabels.balance}</div>
                    </div>

                    {yearlyData.map((yearRow) => {
                        const isExpanded = expandedYears[yearRow.year];
                        const months = getMonthsForYear(yearRow.year);
                        const hasMonths = months && months.length > 0;

                        return (
                            <Fragment key={yearRow.year}>
                                {/* YEAR ROW */}
                                <div
                                    className={`grid grid-cols-12 border-b border-gray-300 hover:bg-indigo-50/30 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/50' : ''}`}
                                    onClick={() => hasMonths && toggleYear(yearRow.year)}
                                >
                                    <div className="col-span-2 p-3 sm:p-4 flex items-center font-bold text-indigo-900 border-r border-gray-300">
                                        {hasMonths && (
                                            <button className="mr-2 w-5 h-5 flex items-center justify-center rounded border border-indigo-200 bg-white text-indigo-500 text-xs font-mono group-hover:border-indigo-400 group-hover:text-indigo-700 transition-colors shadow-sm">
                                                {isExpanded ? '−' : '+'}
                                            </button>
                                        )}
                                        <span className={!hasMonths ? "ml-7" : ""}>{yearRow.year}</span>
                                    </div>
                                    <div className="col-span-4 p-3 sm:p-4 text-right font-bold text-gray-800 border-r border-gray-300">
                                        {moneyFormat(yearRow.totalInvested, currency)}
                                    </div>
                                    <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-green-600 border-r border-gray-300">
                                        +{moneyFormat(yearRow.growth, currency)}
                                    </div>
                                    <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-blue-700 bg-blue-50/20">
                                        {moneyFormat(yearRow.balance ?? yearRow.overallValue, currency)}
                                    </div>
                                </div>

                                {/* MONTHLY ROWS (Expanded) */}
                                {isExpanded && months.map((monthRow, idx) => (
                                    <div key={`${yearRow.year}-${idx}`} className="grid grid-cols-12 border-b border-gray-50 bg-white text-xs sm:text-sm animate-fade-in-down">
                                        <div className="col-span-2 p-2 pl-12 text-gray-700 font-medium border-r border-gray-300 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">M{monthRow.month}</span>
                                            <span>{monthRow.monthName}</span>
                                        </div>
                                        <div className="col-span-4 p-2 text-right text-gray-700 border-r border-gray-300">
                                            {moneyFormat(monthRow.invested, currency)}
                                        </div>
                                        <div className="col-span-3 p-2 text-right text-green-600 border-r border-gray-300">
                                            +{moneyFormat(monthRow.interest ?? monthRow.growth, currency)}
                                        </div>
                                        <div className="col-span-3 p-2 text-right text-gray-700 bg-blue-50/10">
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
            <div className="bg-gray-50 p-3 text-xs text-gray-500 border-t border-gray-200 flex flex-col">
                <span>Click on <strong>[+]</strong> to view monthly breakdown.</span>
            </div>
        </div>
    );
}
