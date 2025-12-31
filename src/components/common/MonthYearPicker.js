import React, { useState, useRef, useEffect } from 'react';

export default function MonthYearPicker({ value, onChange, minDate }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Parse initial value (YYYY-MM) or default to current
    const dateObj = value ? new Date(value + "-01") : new Date();
    const initialYear = dateObj.getFullYear();

    const [selectedYear, setSelectedYear] = useState(initialYear);
    // We don't need selectedMonth state as we fire onChange immediately on month click

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Sync internal state if external value changes (optional)
    useEffect(() => {
        if (value) {
            const d = new Date(value + "-01");
            setSelectedYear(d.getFullYear());
        }
    }, [value]);

    const handleYearChange = (e) => {
        setSelectedYear(Number(e.target.value));
    };

    const handleMonthClick = (monthIndex) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        const newDateStr = `${selectedYear}-${monthStr}`;
        if (minDate && newDateStr < minDate) return; // Prevent selection below minDate
        onChange(newDateStr);
        setIsOpen(false);
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Formatting for display
    const displayDate = value ? new Date(value + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Select Date";

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* INPUT TRIGGER */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="relative block w-full pl-4 pr-10 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
            >
                {displayDate}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {/* POPOVER */}
            {isOpen && (
                <div className="absolute z-[100] mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in-down transform origin-top left-0 ring-1 ring-black ring-opacity-5">
                    {/* TRIANGLE ARROW (Optional CSS trick, omitted for simplicity) */}

                    {/* HEADER: YEAR SLIDER */}
                    <div className="mb-4 text-center">
                        <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Select Year</label>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <button
                                onClick={() => setSelectedYear(y => y - 1)}
                                disabled={minDate && (selectedYear - 1) < Number(minDate.split('-')[0])}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-2xl font-extrabold text-indigo-700 font-mono tracking-tight">{selectedYear}</span>
                            <button
                                onClick={() => setSelectedYear(y => y + 1)}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <input
                            type="range"
                            min={new Date().getFullYear() - 100}
                            max={new Date().getFullYear() + 100}
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    {/* BODY: MONTH GRID */}
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((m, idx) => {
                            const currentMonthStr = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
                            const isSelected = (value === currentMonthStr);
                            const isDisabled = minDate && currentMonthStr < minDate;

                            return (
                                <button
                                    key={m}
                                    onClick={() => !isDisabled && handleMonthClick(idx)}
                                    disabled={isDisabled}
                                    className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                ${isSelected
                                            ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                            : isDisabled
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                                        }
                            `}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                        <button
                            onClick={() => {
                                // Set to current month/year
                                const now = new Date();
                                const currentY = now.getFullYear();
                                const currentM = String(now.getMonth() + 1).padStart(2, '0');
                                setSelectedYear(currentY);
                                onChange(`${currentY}-${currentM}`);
                                setIsOpen(false);
                            }}
                            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700"
                        >
                            Reset to This Month
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
