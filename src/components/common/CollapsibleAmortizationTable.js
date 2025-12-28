import React, { useState, Fragment } from 'react';
import { moneyFormat } from '../../utils/formatting';

export default function CollapsibleAmortizationTable({ yearlyData, monthlyData, currency }) {
    const [expandedYears, setExpandedYears] = useState({});

    const toggleYear = (year) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    // Helper to group monthly data by year
    const getMonthsForYear = (year) => {
        return monthlyData.filter(m => m.year === year);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-200 text-sm font-bold text-gray-700">
                <div className="col-span-2 p-4 flex items-center bg-indigo-100 text-indigo-900 border-r border-indigo-200 rounded-tl-xl">Year</div>
                <div className="col-span-2 p-4 text-right bg-emerald-100 text-emerald-900 border-r border-emerald-200">Principal (A)</div>
                <div className="col-span-2 p-4 text-right bg-amber-100 text-amber-900 border-r border-amber-200">Interest (B)</div>
                <div className="col-span-2 p-4 text-right bg-blue-100 text-blue-900 border-r border-blue-200">Total (A+B)</div>
                <div className="col-span-3 p-4 text-right bg-rose-100 text-rose-900 border-r border-rose-200">Balance</div>
                <div className="col-span-1 p-4 text-right text-xs flex items-center justify-end bg-teal-100 text-teal-900 rounded-tr-xl">% Paid</div>
            </div>

            {/* TABLE BODY */}
            <div className="overflow-auto max-h-[500px]">
                {yearlyData.map((yearRow) => {
                    const isExpanded = expandedYears[yearRow.year];
                    const months = getMonthsForYear(yearRow.year);

                    return (
                        <Fragment key={yearRow.year}>
                            {/* YEAR ROW */}
                            <div
                                className={`grid grid-cols-12 border-b border-gray-300 hover:bg-indigo-50/30 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/50' : ''}`}
                                onClick={() => toggleYear(yearRow.year)}
                            >
                                <div className="col-span-2 p-3 sm:p-4 flex items-center font-bold text-indigo-900 border-r border-gray-300">
                                    <button className="mr-2 w-5 h-5 flex items-center justify-center rounded border border-indigo-200 bg-white text-indigo-500 text-xs font-mono group-hover:border-indigo-400 group-hover:text-indigo-700 transition-colors shadow-sm">
                                        {isExpanded ? '−' : '+'}
                                    </button>
                                    {yearRow.year}
                                </div>
                                <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-gray-800 border-r border-gray-300">
                                    {moneyFormat(yearRow.principalPaid, currency)}
                                </div>
                                <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-gray-800 border-r border-gray-300">
                                    {moneyFormat(yearRow.interestPaid, currency)}
                                </div>
                                <div className="col-span-2 p-3 sm:p-4 text-right font-bold text-gray-800 border-r border-gray-300">
                                    {moneyFormat(yearRow.principalPaid + yearRow.interestPaid, currency)}
                                </div>
                                <div className="col-span-3 p-3 sm:p-4 text-right font-bold text-gray-800 bg-rose-50/40 border-r border-gray-300">
                                    {moneyFormat(yearRow.closingBalance, currency)}
                                </div>
                                <div className="col-span-1 p-3 sm:p-4 text-right text-xs font-semibold text-teal-700 flex items-center justify-end">
                                    {(yearRow.totalPaidPercent || 0).toFixed(2)}%
                                </div>
                            </div>

                            {/* MONTHLY ROWS (Expanded) */}
                            {isExpanded && months.map((monthRow, idx) => (
                                <div key={`${yearRow.year}-${idx}`} className="grid grid-cols-12 border-b border-gray-50 bg-white text-sm animate-fade-in-down">
                                    <div className="col-span-2 p-2 pl-12 text-gray-700 font-medium border-r border-gray-300 flex items-center gap-2">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">M{monthRow.month}</span>
                                        <span>{monthRow.monthName}</span>
                                    </div>
                                    <div className="col-span-2 p-2 text-right text-gray-700 border-r border-gray-300">
                                        {moneyFormat(monthRow.principalPaid, currency)}
                                    </div>
                                    <div className="col-span-2 p-2 text-right text-gray-700 border-r border-gray-300">
                                        {moneyFormat(monthRow.interestPaid, currency)}
                                    </div>
                                    <div className="col-span-2 p-2 text-right text-gray-700 border-r border-gray-300">
                                        {moneyFormat(monthRow.principalPaid + monthRow.interestPaid, currency)}
                                    </div>
                                    <div className="col-span-3 p-2 text-right text-gray-700 bg-rose-50/20 border-r border-gray-300">
                                        {moneyFormat(monthRow.closingBalance, currency)}
                                    </div>
                                    <div className="col-span-1 p-2 text-right text-[10px] text-gray-400">
                                        -
                                    </div>
                                </div>
                            ))}
                        </Fragment>
                    );
                })}
            </div>

            {/* FOOTER / LEGEND if needed */}
            <div className="bg-gray-50 p-3 text-xs text-gray-500 border-t border-gray-200 flex flex-col">
                <span>Click on <strong>[+]</strong> to view monthly breakdown.</span>
                <span>* Values are rounded for display.</span>
            </div>
        </div>
    );
}
