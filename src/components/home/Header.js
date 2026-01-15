'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? isDarkMode
          ? 'bg-slate-900/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/10 py-3'
          : 'bg-white/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/20 py-3'
        : isDarkMode
          ? 'bg-slate-900 py-5'
          : 'bg-white py-5'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <span className={`text-xl font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white group-hover:text-teal-400' : 'text-gray-900 group-hover:text-teal-600'}`}>
            Hash<span className="text-indigo-600">matic</span>
          </span>
        </Link>

        {/* nav */}
        <nav className={`hidden md:flex items-center p-1 rounded-full border transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-100/50 border-gray-200/50'
          }`}>
          <NavItem to="/" label="Home" isDarkMode={isDarkMode} />
          <NavItem to="/calculators" label="Calculators" isDarkMode={isDarkMode} />
        </nav>

        {/* actions */}
        <div className="flex items-center gap-4">
          {pathname !== '/' && (
            <div className="relative group">
              <select
                id="currency-select"
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`appearance-none text-xs font-bold rounded-full pl-4 pr-10 py-2 outline-none transition-all cursor-pointer ${isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:ring-teal-500/20 focus:border-teal-500 hover:bg-slate-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 focus:ring-teal-500/20 focus:border-teal-500 hover:bg-white hover:shadow-sm'
                  }`}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-teal-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, label, isDarkMode }) => {
  const pathname = usePathname();
  // Simple check for active state. Logic can be improved if needed (e.g. startsWith)
  const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));

  return (
    <Link
      href={to}
      className={`
        px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
        ${isActive
          ? isDarkMode
            ? 'bg-slate-700 text-teal-400 shadow-sm border border-slate-600'
            : 'bg-white text-indigo-600 shadow-sm border border-gray-100'
          : isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </Link>
  );
};

export default Header;
