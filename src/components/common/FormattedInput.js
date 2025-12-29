// src/components/common/FormattedInput.js

const GLOBAL_SAFE_MAX = 2000000000;

// 1. ADD 'min' prop here and set a default of 0
export default function FormattedInput({ value, onChange = () => { }, currency, className, max, min = 0, isDecimal = false }) {

  const currentValue = String(value);
  const limit = max ? Math.floor(Number(max)) : GLOBAL_SAFE_MAX;


  const getLocale = (curr) => {
    switch (curr) {
      case "INR": return "en-IN";
      case "USD": return "en-US";
      case "EUR": return "en-IE";
      case "GBP": return "en-GB";
      default: return "en-US";
    }
  };
  const locale = getLocale(currency);

  // Format the value for display
  let displayValue = "";
  if (value !== undefined && value !== null) {
    if (isDecimal) {
      // Split into integer and decimal parts
      const parts = currentValue.split('.');
      const integerPart = parts[0];
      const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

      // Format integer part ONLY if it's a valid number
      const formattedInteger = integerPart ? Number(integerPart).toLocaleString(locale, { maximumFractionDigits: 0 }) : '';

      displayValue = formattedInteger + decimalPart;
    } else {
      displayValue = Number(currentValue).toLocaleString(locale, { maximumFractionDigits: 0 });
    }
  }

  // 4. Handle Input (The Core Logic with Validation)
  const handleChange = (e) => {
    const inputValue = e.target.value;

    let regex = /[^0-9]/g;
    if (isDecimal) {
      regex = /[^0-9.]/g;
    }

    // 1. Clean the input string
    let rawValue = inputValue.replace(regex, "");

    // 2. Enforce Decimals (Existing logic is fine)
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
    const integerValue = Math.floor(numberValue);

    // --- CRITICAL VALIDATION FIX (Updated) ---
    // A. Stop the input if the integer part is OVER the max limit.
    if (integerValue > limit) {
      return;
    }

    // B. REMOVED Aggressive Min Check during typing.
    // Allow user to type "1" even if min is "500". Validation should happen on blur or submit.
    /*
    if (minLimit > 0 && 
        integerValue < minLimit && 
        integerValue > 0 &&
        !isDecimal) {
      return; 
    }
    */

    // C. Handle Empty/Partial Inputs
    if (rawValue === "" || rawValue === ".") {
      if (typeof onChange === 'function') {
        return onChange(isDecimal ? rawValue : 0);
      }
      return;
    }

    // 5. Update State
    let finalValue;
    if (isDecimal) {
      finalValue = rawValue;
    } else {
      finalValue = Number(rawValue);
    }

    if (typeof onChange === 'function') {
      onChange(finalValue);
    } else {
      console.warn(`FormattedInput: onChange is not a function. It is ${typeof onChange}. Value attempted:`, finalValue);
    }
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