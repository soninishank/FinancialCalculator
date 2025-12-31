---
description: Verify calculator implementation standards (tables, charts, pdfs, inputs)
---

# Calculator Standardization Checklist

Use this workflow when creating or refactoring a calculator to ensure it meets all standard requirements.

## 1. UI Consistency Check
- [ ] **Table Component**: Does it use `CollapsibleInvestmentTable` (for investments) or `CollapsibleAmortizationTable` (for loans)?
- [ ] **Charts**: Does it use `FinancialLineChart`, `FinancialBarChart`, or `FinancialDoughnutChart`?
- [ ] **Inputs**: Does it use `InputWithSlider` or `CalculatorLayout`?
- [ ] **Start Date**: Does it allow the user to select a Start Month/Year?
- [ ] **Monthly Breakdown**: Does the table support expanding rows to show monthly details?

## 2. Feature Check
- [ ] **Export to PDF**: Is there a functional "Export PDF" button above the table?
- [ ] **URL Persistency**: Do inputs update the URL query params (if applicable/required)?
- [ ] **Responsive Design**: Does it look good on mobile (padding, font sizes)?

## 3. Code Quality
- [ ] **Linting**: Run `npm run lint` and ensure no errors/warnings.
- [ ] **Unused Code**: Remove any unused imports or variables.
- [ ] **Prop Drilling**: Are props like `currency` passed correctly?

## 4. Manual Verification Steps
1. Open the calculator page.
2. Change input values and verify charts/tables update.
3. specific check: Expand a year in the table to see monthly data (if applicable).
4. specific check: Click "Export PDF" and check the downloaded file content.
