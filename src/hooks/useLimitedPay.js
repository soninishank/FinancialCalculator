import { useState } from "react";
import { useUrlState } from "./useUrlState";
import { MAX_YEARS } from "../utils/constants";

export function useLimitedPay(initialYears = 10) {

  // Clean initial value (ensures initial value is NOT a string like "40.")
  const cleanInitialValue = String(initialYears).endsWith('.') ?
    String(initialYears).replace('.', '') :
    initialYears;

  // Cap initial value at MAX_YEARS
  const initialValue = Math.min(Number(cleanInitialValue), MAX_YEARS);

  // State holds the value as a string for display consistency
  const [totalYears, setTotalYears] = useUrlState('tY', String(initialValue));
  const [sipYears, setSipYears] = useUrlState('sY', String(initialValue));
  const [isLimitedPay, setIsLimitedPay] = useUrlState('lim', false);

  // Helper to safely convert state string to a comparable number
  const safeNumber = (val) => Number(String(val).replace(/\.$/, ''));

  // Logic: When Total Tenure changes
  const handleTotalYearsChange = (newVal) => {
    // 1. Enforce Max Years: Check the integer part of the number
    if (Math.floor(safeNumber(newVal)) > MAX_YEARS) {
      // Stop the update if the integer part is over 40 (or the max)
      return;
    }

    // 2. Update Total Years State (keeps it as a string if '10.')
    setTotalYears(newVal);

    // 3. Sync Logic
    const totalYearsNum = safeNumber(newVal);
    const sipYearsNum = safeNumber(sipYears);

    if (isLimitedPay) {
      // Only set SIP years down if the validated Total Years is lower
      if (sipYearsNum > totalYearsNum) setSipYears(String(totalYearsNum));
    } else {
      // If Limited Pay is OFF, they must match exactly
      setSipYears(newVal);
    }
  };

  // Logic: When Checkbox changes
  const handleLimitedPayToggle = (inputValue) => {
    // Support both event object (e.target.checked) and direct boolean value (from ToggleSwitch)
    const checked = (inputValue && typeof inputValue === 'object' && inputValue.target)
      ? inputValue.target.checked
      : inputValue;

    setIsLimitedPay(checked);
    // If turning OFF, reset SIP years to match Total years immediately
    if (!checked) setSipYears(totalYears);
  };

  // Logic: Direct SIP Years Change
  const handleSipYearsChange = (newVal) => {
    const totalYearsNum = safeNumber(totalYears);
    const newSipYearsNum = safeNumber(newVal);

    // Safety check against Total Years Max
    if (newSipYearsNum > totalYearsNum) {
      setSipYears(totalYears); // Set to max possible (Total Years)
    } else {
      setSipYears(newVal); // Update with string (e.g. "10.")
    }
  };


  return {
    // Return values as numbers for calculation, but keep state as string
    totalYears: safeNumber(totalYears),
    sipYears: isLimitedPay ? safeNumber(sipYears) : safeNumber(totalYears), // Force match when OFF
    setSipYears: handleSipYearsChange, // Bind the SIP slider's onChange to this new handler
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle,
  };
}