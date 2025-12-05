// src/components/common/FormattedInput.js
import React from "react";

const GLOBAL_SAFE_MAX = 2000000000; 

export default function FormattedInput({ value, onChange, currency, className, max, isDecimal = false }) {
  
  // 1. Get the current, UNVALIDATED value from state (which might be '45' from the bug)
  const currentValue = String(value);
  const limit = max ? Math.floor(Number(max)) : GLOBAL_SAFE_MAX; 

  const getLocale = (curr) => {
    switch (curr) {
      case "INR": return "en-IN";
      case "EUR": return "de-DE";
      default: return "en-US";
    }
  };
  
  const locale = getLocale(currency);

  const displayValue = value !== undefined && value !== null 
    ? isDecimal ? currentValue : Number(currentValue).toLocaleString(locale, { maximumFractionDigits: 0 }) 
    : "";

  // 4. Handle Input (The Core Logic with Validation)
  const handleChange = (e) => {
    const inputValue = e.target.value;

    let regex = /[^0-9]/g; 
    if (isDecimal) {
      regex = /[^0-9.]/g; 
    }
    
    // 1. Clean the input string
    let rawValue = inputValue.replace(regex, "");
    
    // 2. Enforce Decimals
    if (isDecimal) {
        if (rawValue.split('.').length > 2) {
            rawValue = rawValue.replace(/\.+$/, '');
        }
        const parts = rawValue.split('.');
        if (parts.length === 2 && parts[1].length > 2) {
            rawValue = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }
    }
    
    const numberValue = Number(rawValue);

    // --- CRITICAL VALIDATION FIX ---
    // A. Stop the input if the number's integer part is over the limit.
    if (Math.floor(numberValue) > limit) {
      return; 
    }
    
    // B. Handle Empty/Partial Inputs
    if (rawValue === "" || rawValue === ".") {
        return onChange(isDecimal ? rawValue : 0);
    }
    
    // 5. Update State
    let finalValue;
    if (isDecimal) {
        // For decimal inputs, update with the raw string
        finalValue = rawValue;
    } else {
        // For money inputs, convert to number
        finalValue = Number(rawValue);
    }
    
    onChange(finalValue);
  };

  return (
    <input
      type="text"
      // Use the calculated displayValue which respects the current state
      value={displayValue === "0" ? "" : displayValue} 
      placeholder="0"
      onChange={handleChange}
      className={className}
    />
  );
}