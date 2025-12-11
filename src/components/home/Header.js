import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
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
      </div>
    </header>
  );
};

export default Header;
