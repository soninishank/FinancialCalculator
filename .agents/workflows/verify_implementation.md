---
description: Verify calculator implementation standards (tables, charts, pdfs, inputs)
---

This workflow ensures that a financial calculator adheres to the project's standards for logic, UI, and functionality.

### 1. Logic & Safety Check
Run the custom linter to catch unsafe divisions, hardcoded values, and potential NaN issues.

// turbo
```bash
npm run lint:calculators
```

If errors are found, you can attempt an automatic fix:
```bash
node scripts/qa/lint-calculators.js --fix
```

### 2. UI Component Standards
Verify the following components are used:
- `CalculatorLayout`: For the bipartite input/summary view.
- `InputWithSlider`: For all numeric inputs.
- `UnifiedSummary` or custom safe cards: For results.
- `CollapsibleInvestmentTable`: For schedules.
- `FinancialCharts`: For visualizations.

### 3. Verification of Exports
Ensure PDF export is implemented using `downloadPDF`.
Check that `mapGoalPlannerExportRows` or similar mapping is used to format data correctly for the PDF generator.

### 4. Integration Check
Verify the calculator is registered in `src/utils/calculatorsManifest.js`.
Run the sync script to update the test suite:

// turbo
```bash
node scripts/qa/sync-test-calculators.js
```

### 5. Automated UI Regression
Run the full-suite UI tests on port 3001 (production build recommended).

// turbo
```bash
TEST_URL=http://localhost:3001 node scripts/qa/test-all-calculators.js
```
