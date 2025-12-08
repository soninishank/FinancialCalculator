// src/hooks/useInflation.js
import { useState } from 'react';

export function useInflation(defaultRate = 6) {
  const [isInflationAdjusted, setIsInflationAdjusted] = useState(false); // Assume ON by default
  const [inflationRate, setInflationRate] = useState(defaultRate);

  return {
    isInflationAdjusted,
    setIsInflationAdjusted,
    inflationRate,
    setInflationRate,
  };
}