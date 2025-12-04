// src/components/common/CurrencySelector.js
import React from "react";
import { currencyOptions } from "../../utils/currency";

export default function CurrencySelector({ currency, setCurrency, compactHeader }) {
  
  // Helper to extract symbol
  const getSymbol = (locale, code) => {
    return (0)
      .toLocaleString(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "")
      .trim();
  };

  return (
    // Remove all margins/padding
    <div className="m-0 p-0"> 
      
      {/* DELETE LABEL: We are removing the label entirely */}
      {/* {!compactHeader && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Currency
        </label>
      )} */}

      <div className="relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={`
            w-full 
            appearance-none 
            bg-white 
            border-2 border-white/50      /* Thinner, semi-transparent white border */
            text-gray-900 
            py-1 px-3                   /* Minimal Vertical Padding */
            pr-7 
            rounded-xl 
            shadow-md
            focus:outline-none 
            focus:ring-1 focus:ring-white /* Focus ring is white for clean look */
            cursor-pointer
            font-medium
            text-sm
            transition-all
          `}
          // If in header, set the background to a lighter shade for contrast
          style={{ backgroundColor: compactHeader ? '#FFFFFF' : '#FFFFFF' }}
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

        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}