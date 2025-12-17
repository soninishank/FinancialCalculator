import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';

const Header = () => {
  const { currency, setCurrency } = useCurrency();
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <NavLink to="/" className="text-2xl font-bold text-gray-800">
            Investment Calculator
          </NavLink>
        </div>
        <nav className="hidden md:flex space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/calculators"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }
          >
            Calculators
          </NavLink>
          <NavLink
            to="/ipo-tracker"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }
          >
            IPO Tracker
          </NavLink>
        </nav>

        {/* Currency Selector */}
        <div className="ml-4 flex items-center">
          <label htmlFor="currency-select" className="sr-only">Choose Currency</label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
        </div>
      </div>
    </header>
  );
};

export default Header;
