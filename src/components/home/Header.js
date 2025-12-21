import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';

const Header = () => {
  const { currency, setCurrency } = useCurrency();
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
        ? 'bg-white/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/20 py-3'
        : 'bg-white py-5'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* logo */}
        <NavLink to="/" className="flex items-center gap-2 group outline-none">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-teal-600 transition-colors">
            Fin<span className="text-indigo-600">Calc</span>
          </span>
        </NavLink>

        {/* nav */}
        <nav className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
          <NavItem to="/" label="Home" />
          <NavItem to="/calculators" label="Calculators" />
          <NavItem to="/ipo-tracker" label="IPO Tracker" />
        </nav>

        {/* actions */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-full pl-4 pr-10 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer hover:bg-white hover:shadow-sm"
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
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
        ${isActive
          ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </NavLink>
  );
};

export default Header;
