---
description: Standard workflow for creating or refactoring a financial calculator component.
---

# Calculator Creation Workflow

Follow this checklist to ensure consistency across the application. **Do not reinvent the wheel.**

## 1. UI Components (Charts)
**NEVER usage raw `react-chartjs-2` directly in the calculator component.** Always use the pre-configured wrappers in `src/components/common/FinancialCharts.js`.

- **For Compounding/Growth (Investments):**
  - Use `<FinancialCompoundingBarChart />`
  - *Data Prop:* `yearlyData` (Access `totalInvested` and `growth`)
  
- **For Pie/Distribution (Allocations):**
  - Use `<FinancialInvestmentPieChart />`
  - *Props:* `invested`, `gain`, `total`, `currency`

- **For Loans/EMI Breakdowns:**
  - Use `<FinancialLoanDoughnutChart />` or `<FinancialLoanPieChart />`
  - *Props:* `principal`, `interest`, `fees`, etc.

## 2. Data Tables
**NEVER build a raw HTML `<table>`.** Use the standardized collapsible tables.

- **For Investment/Growth Schedules:**
  - Use `<CollapsibleInvestmentTable />`
  - *Path:* `src/components/common/CollapsibleInvestmentTable.js`
  - *Props:* `yearlyData`, `monthlyData`, `currency`, `labels` (optional override)

- **For Loan/Amortization Schedules:**
  - Use `<CollapsibleAmortizationTable />`
  - *Path:* `src/components/common/CollapsibleAmortizationTable.js`

## 3. PDF Export
**NEVER write a new `jsPDF` implementation.** Use the central utility.

- **Values:**
  - Import `{ downloadPDF }` from `../../utils/export`
  - *Usage:* `downloadPDF(headers, rows, filename)`

## 4. Input Fields
**NEVER use standard `<input>` tags for money or sliders.**

- **For Currency Inputs with Sliders:**
  - Use `<InputWithSlider />`
  - *Path:* `src/components/common/InputWithSlider.js`

- **For Standard Formatted Inputs:**
  - Use `<FormattedInput />`
  - *Path:* `src/components/common/FormattedInput.js`

## 5. Layout Structure
Wrap your entire calculator in the standard layout:

```jsx
import CalculatorLayout from '../common/CalculatorLayout';
import { calculatorDetails } from '../../data/calculatorDetails';

return (
    <CalculatorLayout
        inputs={/* Your Inputs Component */}
        summary={/* Your Results & Charts Component */}
        details={calculatorDetails.your_calculator_key.render()}
    />
);
```
