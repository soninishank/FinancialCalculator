// src/components/common/FormattedInput.js

const GLOBAL_SAFE_MAX = 2000000000; 

// 1. ADD 'min' prop here and set a default of 0
export default function FormattedInput({ value, onChange, currency, className, max, min = 0, isDecimal = false }) {
  
  const currentValue = String(value);
  const limit = max ? Math.floor(Number(max)) : GLOBAL_SAFE_MAX; 
  // Get the integer minimum bound
  const minLimit = Math.floor(Number(min)); 

  const getLocale = (curr) => { /* ... */ };
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
    
    // B. Stop the input if the number is BELOW the minimum limit.
    // Allow an empty string or a partial number (like '1.') to pass, 
    // but reject a final integer like '100' if min is 1,000,000.
    if (minLimit > 0 && 
        integerValue < minLimit && 
        integerValue > 0 &&
        !isDecimal) { // Only enforce strictly for non-decimal inputs.
      return; 
    }
    
    // C. Handle Empty/Partial Inputs
    if (rawValue === "" || rawValue === ".") {
        return onChange(isDecimal ? rawValue : 0);
    }
    
    // 5. Update State
    let finalValue;
    if (isDecimal) {
        finalValue = rawValue;
    } else {
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