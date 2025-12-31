import React from 'react';
import { Clock, Calendar } from 'lucide-react';

/**
 * Common toggle between 'duration' and 'dates' mode.
 */
export const CalculationModeToggle = ({ mode, setMode }) => (
    <div className="flex bg-gray-100 p-1 rounded-xl w-full">
        <button
            onClick={() => setMode('duration')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all ${mode === 'duration' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            <Clock className="w-4 h-4" /> By Duration
        </button>
        <button
            onClick={() => setMode('dates')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all ${mode === 'dates' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            <Calendar className="w-4 h-4" /> By Date Range
        </button>
    </div>
);

/**
 * Common date range input fields with error messaging.
 */
export const DateRangeInputs = ({ startDate, setStartDate, endDate, setEndDate }) => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100;
    const maxYear = currentYear + 100;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const sy = start.getFullYear();
    const ey = end.getFullYear();

    const isYearInvalid = (y) => isNaN(y) || y < minYear || y > maxYear;
    const isStartYearInvalid = isYearInvalid(sy);
    const isEndYearInvalid = isYearInvalid(ey);
    const isRangeInvalid = !isStartYearInvalid && !isEndYearInvalid && end <= start;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 ${isStartYearInvalid || isRangeInvalid ? 'border-rose-300 bg-rose-50/30' : 'border-gray-300'}`}
                />
                {isStartYearInvalid && (
                    <p className="mt-1.5 text-[10px] font-semibold text-rose-600">
                        ⚠ Year must be {minYear}-{maxYear}
                    </p>
                )}
            </div>
            <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-2">End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 ${isEndYearInvalid || isRangeInvalid ? 'border-rose-300 bg-rose-50/30' : 'border-gray-300'}`}
                />
                {isEndYearInvalid && (
                    <p className="mt-1.5 text-[10px] font-semibold text-rose-600">
                        ⚠ Year must be {minYear}-{maxYear}
                    </p>
                )}
                {!isEndYearInvalid && isRangeInvalid && (
                    <p className="mt-1.5 text-[10px] font-semibold text-rose-600 animate-pulse">
                        ⚠ Must be after start date
                    </p>
                )}
            </div>
        </div>
    );
};
