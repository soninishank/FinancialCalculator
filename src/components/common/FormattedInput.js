import React from "react";

// GLOBAL SAFE LIMIT: 100 Crores (1 Billion). 
// No individual calculator usually needs more than this.
const GLOBAL_SAFE_MAX = 1000000000; 

export default function FormattedInput({ value, onChange, currency, className, max }) {
  
  // 1. Determine the effective maximum limit
  // If a specific 'max' is passed (from the slider), use that.
  // Otherwise, use the Global Safe Limit to prevent UI breakage.
  // We allow the input to go slightly higher than the slider max (e.g. 2x) 
  // for flexibility, OR strictly enforce the slider max. 
  // Here, we strictly enforce the passed 'max' or the global limit.
  const limit = max || GLOBAL_SAFE_MAX;

  // 2. Determine Locale
  const getLocale = (curr) => {
    switch (curr) {
      case "INR": return "en-IN";
      case "EUR": return "de-DE";
      default: return "en-US";
    }
  };

  const locale = getLocale(currency);

  // 3. Format for Display
  const displayValue = value !== undefined && value !== null 
    ? Number(value).toLocaleString(locale, { maximumFractionDigits: 0 }) 
    : "";

  // 4. Handle Input
  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Remove commas/spaces to get raw number
    const rawValue = inputValue.replace(/[^0-9]/g, "");
    const numberValue = Number(rawValue);

    // --- GENERIC CHECK: BOUNDARY PROTECTION ---
    if (numberValue > limit) {
      // Option A: Shake effect or visual feedback (Advanced)
      // Option B: Just ignore the input (Simple & Robust)
      
      // If the value is too big, simply don't update the state.
      // This "freezes" the input at the last valid number.
      return; 
    }

    onChange(rawValue === "" ? 0 : numberValue);
  };

  return (
    <input
      type="text"
      value={displayValue === "0" ? "" : displayValue}
      placeholder="0"
      onChange={handleChange}
      className={className}
    />
  );
}