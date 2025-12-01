// src/components/CurrencySelector.js
import React from "react";
import { currencyOptions } from "../../utils/currency";

export default function CurrencySelector({ currency, setCurrency }) {
  
  // Helper to extract symbol (e.g., "$", "₹") from the locale automatically
  const getSymbol = (locale, code) => {
    return (0)
      .toLocaleString(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "") // Remove numbers
      .trim();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Currency
      </label>
      <div className="relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="
            w-full 
            appearance-none 
            bg-white 
            border border-gray-300 
            text-gray-700 
            py-3 px-4 
            pr-8 
            rounded-xl 
            shadow-sm 
            focus:outline-none 
            focus:ring-2 
            focus:ring-teal-500 
            focus:border-teal-500
            cursor-pointer
            font-medium
          "
        >
          {currencyOptions.map((c) => {
            const symbol = getSymbol(c.locale, c.code);
            return (
              <option key={c.code} value={c.code}>
                {c.code} &nbsp; ({symbol})
              </option>
            );
          })}
        </select>

        {/* Custom Arrow Icon for cleaner UI */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}