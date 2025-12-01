// src/components/common/PrintableResults.js
import React from "react";

/**
 * PrintableResults
 * - Renders nothing visible on screen (it's intentionally simple).
 * - It renders the table inside #printable-content which the print CSS will pick.
 * - We keep this separate so the visual table (wrapped in AmortizationTableWrapper)
 *   can remain interactive on-screen while print uses this clean markup.
 */
export default function PrintableResults({ resultsTable }) {
  return (
    /* This container is hidden visually (display: none) during normal browsing,
       but made visible by the print stylesheet via `visibility`. */
    <div id="printable-content" style={{ display: "block", visibility: "hidden" }}>
      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", background: "#fff" }}>
        <h2 style={{ textAlign: "center", marginBottom: 12 }}>Amortization Schedule</h2>
        {resultsTable}
        <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
          {/* Optionally add a footer or page number placeholders */}
        </div>
      </div>
    </div>
  );
}
