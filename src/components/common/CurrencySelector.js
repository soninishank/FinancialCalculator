// src/components/common/CurrencySelector.js
import React from "react";
import { currencyOptions } from "../../utils/currency";
import { useCurrency as useCurrencyContext } from "../../contexts/CurrencyContext";

/**
 * Backward-compatible CurrencySelector.
 * - prefers props (currency, setCurrency) when provided
 * - otherwise uses the context value from useCurrency()
 * - useCurrency() is safe to call anywhere (returns fallback if provider missing)
 */
export default function CurrencySelector({ currency: propCurrency, setCurrency: propSetCurrency, compactHeader = false }) {
  // call the context hook unconditionally (safe fallback provided by the hook)
  const ctx = useCurrencyContext();
  const ctxCurrency = ctx?.currency ?? "INR";
  const ctxSetCurrency = ctx?.setCurrency ?? (() => {});

  const currency = propCurrency ?? ctxCurrency;
  const setCurrency = propSetCurrency ?? ctxSetCurrency;

  // Helper to extract symbol (unchanged)
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

  // Styling kept exactly as your original
  const baseClasses = "w-full appearance-none rounded-xl cursor-pointer font-medium transition-all duration-200 focus:outline-none focus:ring-2";
  const headerStyles = `
    bg-white/10 border-2 border-white/20 text-white
    py-1.5 px-3 pr-8 text-xs sm:text-sm shadow-md
    hover:bg-white/20 focus:ring-white
  `;
  const formStyles = `
    bg-white border border-gray-300 text-gray-700
    py-3 px-4 pr-8 text-sm
    shadow-sm focus:ring-teal-500 focus:border-teal-500
  `;
  const finalClasses = `${baseClasses} ${compactHeader ? headerStyles : formStyles}`;

  return (
    <div className={compactHeader ? "m-0 p-0" : "mb-6"}>
      {!compactHeader && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Currency
        </label>
      )}

      <div className="relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={finalClasses}
        >
          {currencyOptions.map((c) => {
            const symbol = getSymbol(c.locale, c.code);
            return (
              <option key={c.code} value={c.code} className="text-gray-900">
                {c.code} &nbsp; ({symbol})
              </option>
            );
          })}
        </select>

        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${compactHeader ? 'text-white/70' : 'text-gray-500'}`}>
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
