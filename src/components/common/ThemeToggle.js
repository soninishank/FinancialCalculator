'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative p-2.5 rounded-xl border transition-all duration-300 active:scale-90 group
                ${isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-yellow-400 hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                }
            `}
            aria-label="Toggle Theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
                {/* Sun Icon */}
                <div className={`
                    absolute transform transition-all duration-500
                    ${isDarkMode ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-8 opacity-0 -rotate-90'}
                `}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.364l-.707.707m12.728 0l-.707-.707M6.364 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                </div>
                {/* Moon Icon */}
                <div className={`
                    absolute transform transition-all duration-500
                    ${!isDarkMode ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-8 opacity-0 rotate-90'}
                `}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
