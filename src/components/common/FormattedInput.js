import React from "react";

export default function FormattedInput({ value, onChange, currency, className }) {
  // 1. Determine Locale based on currency
  const getLocale = (curr) => {
    switch (curr) {
      case "INR": return "en-IN"; // 1,00,000
      case "EUR": return "de-DE"; // 100.000 (Europe uses dots for thousands usually)
      default: return "en-US";    // 100,000
    }
  };

  const locale = getLocale(currency);

  // 2. Format the value for Display (adds commas)
  // We check if value is 0 and the user isn't typing to keep it clean, 
  // but usually showing "0" or valid formatted number is best.
  const displayValue = value !== undefined && value !== null 
    ? Number(value).toLocaleString(locale, { maximumFractionDigits: 0 }) 
    : "";

  // 3. Handle User Input (removes commas)
  const handleChange = (e) => {
    // Get the value from input
    const inputValue = e.target.value;

    // Remove non-numeric characters (commas, spaces, etc)
    // We allow digits and a single decimal point if needed, but for this SIP calc, integers are usually safer.
    const rawValue = inputValue.replace(/[^0-9]/g, "");

    // Update parent state with the raw number
    onChange(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <input
      type="text" // Must be text to allow commas
      value={displayValue === "0" ? "" : displayValue} // Optional: clears input if 0
      placeholder="0"
      onChange={handleChange}
      className={className}
    />
  );
}