// src/components/common/TaxToggle.js
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  MAX_LTCG_TAX_RATE_DECIMAL,
  getLTCGExemption,
} from "../../utils/tax";
import { moneyFormat } from "../../utils/formatting";

// Convert decimal max (0.30) to percent for UI (30)
const MAX_LTCG_PERCENT = Math.round(MAX_LTCG_TAX_RATE_DECIMAL * 100);

export default function TaxToggle({
  currency,
  isTaxApplied,
  setIsTaxApplied,
  taxRate, // stored as percent (e.g. 10) or empty string while editing
  onTaxRateChange,

  isExemptionApplied,
  setIsExemptionApplied,
  exemptionLimit, // number or empty string while editing
  onExemptionLimitChange,
}) {
  // Determine currency-specific max exemption
  const currencyExemptionMax = useMemo(() => getLTCGExemption(currency), [currency]);

  // Parse current values (null when editing empty string)
  const taxRateNum = taxRate === "" ? null : Number(taxRate);
  const exemptionNum = exemptionLimit === "" ? null : Number(exemptionLimit);

  // Errors
  const taxRateError =
    taxRateNum === null
      ? null
      : taxRateNum < 0
        ? "Tax rate cannot be negative."
        : taxRateNum > MAX_LTCG_PERCENT
          ? `Maximum allowed is ${MAX_LTCG_PERCENT}%.`
          : null;

  const exemptionError =
    exemptionNum === null
      ? null
      : exemptionNum < 0
        ? "Exemption cannot be negative."
        : exemptionNum > currencyExemptionMax
          ? `Maximum allowed is ${moneyFormat(currencyExemptionMax, currency)}.`
          : null;

  // Handlers: allow user to freely edit, clamp on blur
  const handleTaxRateChange = (raw) => {
    if (raw === "") {
      onTaxRateChange("");
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onTaxRateChange(Math.max(-999999, n)); // protect from absurd negative while typing
  };

  const handleTaxRateBlur = () => {
    let v = Number(taxRate) || 0;
    if (v > MAX_LTCG_PERCENT) v = MAX_LTCG_PERCENT;
    if (v < 0) v = 0;
    onTaxRateChange(v);
  };

  const handleExemptionChange = (raw) => {
    if (raw === "") {
      onExemptionLimitChange("");
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onExemptionLimitChange(Math.max(-999999999, Math.round(n)));
  };

  const handleExemptionBlur = () => {
    let v = Number(exemptionLimit) || 0;
    if (v < 0) v = 0;
    if (v > currencyExemptionMax) v = currencyExemptionMax;
    onExemptionLimitChange(v);
  };

  // Only show the currency max hint when the user has exceeded the max.
  const showCurrencyMaxHint = exemptionNum !== null && exemptionNum > currencyExemptionMax;

  // Tooltip text (concise and consistent across calculators)
  const taxTooltipText =
    "LTCG applies to the total gain at final redemption. Exemption reduces taxable gain up to the limit.";
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!popRef.current) return;
      if (
        popRef.current.contains(e.target) ||
        (triggerRef.current && triggerRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // show on hover/focus, hide on leave/blur (but keep click toggle as well)
  const openPopover = () => setOpen(true);
  const closePopover = () => setOpen(false);
  const togglePopover = () => setOpen((v) => !v);

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 h-full">
      <div className="flex items-center h-5">
        <input
          id="applyLTCG"
          type="checkbox"
          checked={isTaxApplied}
          onChange={(e) => setIsTaxApplied(e.target.checked)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
        />
      </div>

      <div className="flex-1 text-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="applyLTCG" className="font-medium text-gray-700 cursor-pointer">
            Apply Long-Term Capital Gains (LTCG) Tax
          </label>

          {/* Popover trigger */}
          <div
            ref={triggerRef}
            className="shrink-0"
            onMouseEnter={openPopover}
            onMouseLeave={closePopover}
            onFocus={openPopover}
            onBlur={closePopover}
            onClick={(e) => {
              e.stopPropagation();
              togglePopover();
            }}
            role="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            tabIndex={0}
            aria-label="LTCG information"
          >
            <div className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.75a.75.75 0 10-1.5 0V8.5a.75.75 0 001.5 0V6.25zM9.25 11a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Popover content */}
            {open && (
              <div
                ref={popRef}
                role="dialog"
                aria-label="LTCG details"
                className="absolute z-50 mt-2 w-64 bg-white border border-gray-100 rounded-md shadow-lg p-3 text-xs text-gray-700"
                style={{ transform: "translateY(4px)" }}
              >
                <div className="leading-tight">{taxTooltipText}</div>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-1">
          Calculates post-tax wealth based on the LTCG rate and exemption rules.
        </p>

        {isTaxApplied && (
          <>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">LTCG Tax Rate</span>
              <input
                type="number"
                min={0}
                max={MAX_LTCG_PERCENT}
                step={0.1}
                value={taxRate}
                onChange={(e) => handleTaxRateChange(e.target.value)}
                onBlur={handleTaxRateBlur}
                aria-invalid={!!taxRateError}
                aria-describedby={taxRateError ? "ltcg-rate-error" : undefined}
                className={`w-20 px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${taxRateError ? "border-rose-300 bg-rose-50" : "border-gray-300"
                  }`}
              />
              <span className="text-xs text-gray-500">%</span>
            </div>

            {taxRateError && (
              <div
                id="ltcg-rate-error"
                role="alert"
                aria-live="polite"
                className="text-rose-600 text-xs mt-1 ml-10"
              >
                {taxRateError}
              </div>
            )}

            <div className="mt-4 flex items-start gap-2">
              <input
                id="applyExemption"
                type="checkbox"
                checked={isExemptionApplied}
                onChange={(e) => setIsExemptionApplied(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
              />

              <label htmlFor="applyExemption" className="text-xs text-gray-700 cursor-pointer">
                Apply Exemption Limit
              </label>
            </div>

            {isExemptionApplied && (
              <>
                <div className="mt-2 flex items-center gap-2 ml-6">
                  <span className="text-xs text-gray-500">Exemption Limit</span>
                  <input
                    type="number"
                    min={0}
                    max={currencyExemptionMax}
                    step={1000}
                    value={exemptionLimit}
                    onChange={(e) => handleExemptionChange(e.target.value)}
                    onBlur={handleExemptionBlur}
                    aria-invalid={!!exemptionError}
                    aria-describedby={exemptionError ? "exemption-error" : undefined}
                    className={`w-32 px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${exemptionError ? "border-rose-300 bg-rose-50" : "border-gray-300"
                      }`}
                  />
                </div>

                {/* Show error when exceeding or negative */}
                {exemptionError && (
                  <div
                    id="exemption-error"
                    role="alert"
                    aria-live="polite"
                    className="text-rose-600 text-xs mt-1 ml-14"
                  >
                    {exemptionError}
                  </div>
                )}

                {/* ONLY show the currency max hint when the user has exceeded the max */}
                {showCurrencyMaxHint && (
                  <div className="text-gray-400 text-xs mt-1 ml-14">
                    Max allowed: {moneyFormat(currencyExemptionMax, currency)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
