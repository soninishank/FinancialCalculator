// src/hooks/useLimitedPay.js
import { useState } from "react";

export function useLimitedPay(initialYears = 10) {
  const [totalYears, setTotalYears] = useState(initialYears);
  const [sipYears, setSipYears] = useState(initialYears);
  const [isLimitedPay, setIsLimitedPay] = useState(false);

  // Logic: When Total Tenure changes, sync SIP years if needed
  const handleTotalYearsChange = (newVal) => {
    setTotalYears(newVal);
    if (isLimitedPay) {
      if (sipYears > newVal) setSipYears(newVal);
    } else {
      setSipYears(newVal);
    }
  };

  // Logic: Toggle Checkbox
  const handleLimitedPayToggle = (e) => {
    const checked = e.target.checked;
    setIsLimitedPay(checked);
    if (!checked) setSipYears(totalYears);
  };

  return {
    totalYears,
    sipYears,
    setSipYears, // We need this to bind the SIP slider directly
    isLimitedPay,
    handleTotalYearsChange,
    handleLimitedPayToggle,
  };
}