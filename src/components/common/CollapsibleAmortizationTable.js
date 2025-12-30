import React, { useState, Fragment } from 'react';
import { moneyFormat } from '../../utils/formatting';

/**
 * CollapsibleAmortizationTable
 * 
 * @param {Array} yearlyData - Array of year-wise summary objects
 * @param {Array} monthlyData - Array of month-wise detailed objects
 * @param {String} currency - Currency symbol (e.g., 'INR', 'USD')
 * @param {Boolean} isFinancial - Whether to use Financial Year labels (Apr-Mar)
 * @param {Object} customColumn - Optional custom column to display { header: string, key: string, bgColor: string, textColor: string }
 */
export default function CollapsibleAmortizationTable({
    yearlyData,
    monthlyData,
    currency,
    isFinancial = false,
    customColumn = null // { header: "Car Value", key: "carValue", bgColor: "bg-indigo-600", textColor: "text-white" }
}) {
    const [expandedYears, setExpandedYears] = useState({});

    const toggleYear = (year) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    // Helper to group monthly data by year
    const getMonthsForYear = (year) => {
        if (isFinancial) {
            return monthlyData.filter(m => m.fyYear === year);
        }
        return monthlyData.filter(m => m.year === year);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* TABLE BODY CONTAINER WITH HORIZONTAL SCROLL */}
            <div className="overflow-auto max-h-[600px] w-full">
                <div className={`min-w-[900px] ${customColumn ? 'min-w-[1000px]' : ''}`}>
                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-12 bg-slate-900 border-b border-slate-300 text-xs sm:text-[11px] font-black uppercase tracking-widest text-center items-stretch">
                        <div className="col-span-1 p-3 flex items-center justify-center bg-slate-800 text-slate-100 border-r border-slate-700">Year</div>

                        <div className="col-span-2 p-3 flex items-center justify-center bg-[#8DB63F] text-white border-r border-white/20 leading-tight">
                            Principal<br />(A)
                        </div>

                        <div className="col-span-2 p-3 flex items-center justify-center bg-[#F39237] text-white border-r border-white/20 leading-tight">
                            Interest<br />(B)
                        </div>

                        {customColumn ? (
                            <div className={`col-span-2 p-3 flex items-center justify-center ${customColumn.bgColor || 'bg-indigo-600'} ${customColumn.textColor || 'text-white'} border-r border-white/20 leading-tight`}>
                                {customColumn.header}
                            </div>
                        ) : (
                            <div className="col-span-2 p-3 flex items-center justify-center bg-[#5E3C5E] text-white border-r border-white/20 leading-tight">
                                Expenses<br />(C)
                            </div>
                        )}

                        <div className="col-span-2 p-3 flex items-center justify-center bg-slate-100 text-slate-900 border-r border-slate-300 leading-tight">
                            Total Payment<br />{customColumn ? '(A + B)' : '(A + B + C)'}
                        </div>

                        <div className="col-span-2 p-3 flex items-center justify-center bg-[#9B4A11] text-white border-r border-white/20">
                            Balance
                        </div>

                        <div className="col-span-1 p-3 flex items-center justify-center bg-slate-800 text-slate-100 leading-tight text-[10px] sm:text-xs">
                            Paid %
                        </div>
                    </div>

                    {yearlyData.map((yearRow) => {
                        const isExpanded = expandedYears[yearRow.year];
                        const months = getMonthsForYear(yearRow.year);

                        const prinA = yearRow.principalPaid + (yearRow.prepayment || 0);
                        const intB = yearRow.interestPaid;
                        const expC = yearRow.totalExpense || 0;
                        const totalABC = yearRow.totalOwnershipCost || (prinA + intB + expC);

                        return (
                            <Fragment key={yearRow.year}>
                                {/* YEAR ROW */}
                                <div
                                    className={`grid grid-cols-12 border-b-2 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer group items-center ${isExpanded ? 'bg-indigo-50/50' : ''}`}
                                    onClick={() => toggleYear(yearRow.year)}
                                >
                                    <div className="col-span-1 p-4 flex items-center font-black text-slate-900 border-r border-slate-200 justify-center">
                                        <button className="mr-2 w-5 h-5 flex items-center justify-center rounded border-2 border-indigo-400 bg-white text-indigo-700 text-sm font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                                            {isExpanded ? '−' : '+'}
                                        </button>
                                        <span className="text-xs sm:text-sm tracking-tighter">
                                            {yearRow.label ? String(yearRow.label).replace('FY ', '') : String(yearRow.year).slice(2)}
                                        </span>
                                    </div>

                                    <div className="col-span-2 p-4 text-right font-black text-slate-950 border-r border-slate-200 text-xs sm:text-base">
                                        {moneyFormat(prinA, currency)}
                                    </div>

                                    <div className="col-span-2 p-4 text-right font-black text-slate-950 border-r border-slate-200 text-xs sm:text-base">
                                        {moneyFormat(intB, currency)}
                                    </div>

                                    {customColumn ? (
                                        <div className="col-span-2 p-4 text-right font-black text-slate-950 border-r border-slate-200 text-xs sm:text-base bg-indigo-50/30">
                                            {moneyFormat(yearRow[customColumn.key] || 0, currency)}
                                        </div>
                                    ) : (
                                        <div className="col-span-2 p-4 text-right font-black text-[#5E3C5E] border-r border-slate-200 text-xs sm:text-base bg-purple-50/30">
                                            {expC > 0 ? moneyFormat(expC, currency) : '₹0'}
                                        </div>
                                    )}

                                    <div className="col-span-2 p-4 text-right font-black text-slate-950 border-r border-slate-200 text-xs sm:text-base bg-slate-100/80 shadow-inner">
                                        {moneyFormat(totalABC, currency)}
                                    </div>

                                    <div className="col-span-2 p-4 text-right font-black text-[#9B4A11] border-r border-slate-200 text-xs sm:text-base">
                                        {moneyFormat(yearRow.closingBalance, currency)}
                                    </div>

                                    <div className="col-span-1 p-4 text-center text-xs sm:text-sm font-black text-slate-600">
                                        {(yearRow.totalPaidPercent || 0).toFixed(0)}%
                                    </div>
                                </div>

                                {/* MONTHLY ROWS (Expanded) */}
                                {isExpanded && months.map((monthRow, idx) => {
                                    const mPrinA = monthRow.principalPaid + (monthRow.prepayment || 0);
                                    const mIntB = monthRow.interestPaid;
                                    const mExpC = monthRow.totalExpense || 0;
                                    const mTotalABC = monthRow.totalOwnershipCost || (mPrinA + mIntB + mExpC);

                                    return (
                                        <div key={`${yearRow.year}-${idx}`} className="grid grid-cols-12 border-b border-slate-200 bg-white text-xs sm:text-sm animate-fade-in-down items-center">
                                            <div className="col-span-1 p-2 text-center text-slate-500 font-black border-r border-slate-100 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-indigo-600">{String(monthRow.monthName).toUpperCase()}</span>
                                            </div>

                                            <div className="col-span-2 p-2 text-right text-slate-900 font-bold border-r border-slate-100">
                                                {moneyFormat(mPrinA, currency)}
                                            </div>

                                            <div className="col-span-2 p-2 text-right text-slate-900 font-bold border-r border-slate-100">
                                                {moneyFormat(mIntB, currency)}
                                            </div>

                                            {customColumn ? (
                                                <div className="col-span-2 p-2 text-right text-indigo-700 font-bold border-r border-slate-100">
                                                    {moneyFormat(monthRow[customColumn.key] || 0, currency)}
                                                </div>
                                            ) : (
                                                <div className="col-span-2 p-2 text-right text-purple-700 font-bold border-r border-slate-100">
                                                    {mExpC > 0 ? moneyFormat(mExpC, currency) : '₹0'}
                                                </div>
                                            )}

                                            <div className="col-span-2 p-2 text-right text-black font-black border-r border-slate-100 bg-slate-50">
                                                {moneyFormat(mTotalABC, currency)}
                                            </div>

                                            <div className="col-span-2 p-2 text-right text-[#9B4A11] font-bold border-r border-slate-100">
                                                {moneyFormat(monthRow.closingBalance, currency)}
                                            </div>

                                            <div className="col-span-1 p-2 text-center text-[9px] text-slate-400 font-bold">
                                                -
                                            </div>
                                        </div>
                                    );
                                })}
                            </Fragment>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER / LEGEND */}
            <div className="bg-slate-900 p-4 text-[10px] text-slate-300 border-t-2 border-slate-300 flex flex-col sm:flex-row justify-between shadow-2xl">
                <span className="font-black tracking-wide"><span className="text-white bg-indigo-600 px-1.5 py-0.5 rounded mr-1">TIP</span> Click on <strong>[+]</strong> to view monthly breakdown. Principal (A) includes monthly EMIs and any prepayments made.</span>
                <div className="flex gap-4 font-black">
                    <span className="text-white">* Values rounded</span>
                </div>
            </div>
        </div>
    );
}
