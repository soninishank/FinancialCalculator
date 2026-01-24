# Calculator Development Standards

To ensure a high-quality, consistent user experience across our suite of 70+ financial calculators, all new and existing calculators must adhere to these 5 Golden Rules.

## 1. Input Handling (The "No Raw Inputs" Rule)
**NEVER** use a raw HTML `<input>` tag for user data entry.
- **For numeric inputs with ranges**: Use `<InputWithSlider />`.
  - Must provide `min`, `max`, and `step` props.
  - Must provide `currency` prop (if applicable).
- **For other formatted inputs**: Use `<FormattedInput />`.

## 2. Boundary Enforcement (The "No Negatives" Rule)
Calculators must prevent invalid states before they happen.
- **Input Level**: `InputWithSlider` automatically enforces `min` and `max`.
- **Logic Level**: Any calculation that could result in `NaN` or `Infinity` (e.g., division by zero) must be handled gracefully.
- **Output Level**: If a result is mathematically negative but practically impossible (e.g., negative loan tenure), clamp it to 0 or show a helpful error message.

## 3. Visual Feedback (The "Helpful Error" Rule)
If a user inputs a combination of values that breaks the calculation (e.g., monthly EMI > monthly income):
- **Do not** just show "0" or "Error".
- **Do** show a contextual alert explaining *why* the result is invalid (e.g., "Your expenses exceed your income.").

## 4. Visualizations (The "Chart" Rule)
Every calculator involving growth, amortization, or distribution must include a chart.
- **Use Standard Charts**: Import from `src/components/common/FinancialCharts.js`.
- **Do NOT** implement raw `Chart.js` logic in the component.

## 5. Structured Data (The "Table" Rule)
Every calculator involving a time series (yearly/monthly breakdown) must provide a detailed table.
- **Use Standard Tables**:
  - `<CollapsibleInvestmentTable />` for investments.
  - `<CollapsibleAmortizationTable />` for loans.
- **Currency**: Ensure all monetary values in tables respect the selected currency.

## 6. Code Hygiene (The "Import Integrity" Rule)
When refactoring or adding new components:
- **Preserve Imports**: Always check if `React`, `useState`, or `useEffect` are already imported before overwriting the top of the file.
- **Lint Before Commit**: Always run `npm run lint` to catch `undefined variable` errors (like missing specific hooks).
- **Regression Check**: Run `npm test` after *every* significant refactor to ensure no existing functionality is broken.
