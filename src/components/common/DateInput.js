import React from 'react';

const DateInput = ({ label, value, onChange, min, max, className }) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-bold text-slate-900 ${className || ''}`}
            />
        </div>
    );
};

export default DateInput;
