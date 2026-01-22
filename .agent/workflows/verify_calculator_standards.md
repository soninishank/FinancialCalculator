---
description: Verify calculator implementation standards (tables, charts, pdfs, inputs)
---

# Calculator Standardization Checklist

Use this workflow when creating or refactoring a calculator to ensure it meets all standard requirements.

> [!IMPORTANT]
> **Definition of Done**: You MUST read and adhere to [CALCULATOR_STANDARDS.md](../../CALCULATOR_STANDARDS.md).

## 1. Compliance Check
- [ ] **Standards Review**: Have you verified the calculator against the 5 Golden Rules in `CALCULATOR_STANDARDS.md`?
- [ ] **No Raw Inputs**: Confirm zero usage of `<input type="number">`.
- [ ] **No Raw Charts**: Confirm usage of `FinancialCharts.js` wrappers.
- [ ] **No Raw Tables**: Confirm usage of `CollapsibleInvestmentTable` or equivalent.

## 2. Logic Validation (Manual - Risk Assessment)
Validate logic **at least 3 times** before committing:
- [ ] **Happy Path**: Enter standard/expected values. Does the result matching a known reliable source (e.g., Google/Investopedia)?
- [ ] **Negative Path**: Enter `0`, negative numbers, or extremely high values. Does it crash? Does it show a useful error?
- [ ] **Edge Cases**: Enter decimals, empty strings, or special characters.

## 3. Automated Testing (REQUIRED)
- [ ] **Test File**: Create/Update `<CalculatorName>.test.js`.
- [ ] **Coverage**: Ensure tests cover:
    - Default render state.
    - User interaction (changing inputs).
    - Calculation correctness (mocked outputs if needed).
    - Validation messages (invalid inputs).

## 4. UI Consistency Check
- [ ] **Labels**: MUST use `text-sm font-medium text-gray-700 dark:text-gray-300`.
- [ ] **Inputs**: MUST use `InputWithSlider` where possible.
- [ ] **Responsive Design**: Verify layout on mobile (flex-col on small screens).

## 5. Feature Check
## 6. Automated Linting (CRITICAL - NEW)
- [ ] **Run Calculator Linter**: Execute `npm run lint:calculators`
- [ ] **Fix All Errors**: Address any division-by-zero, hardcoded currency, or NaN issues
- [ ] **Review Warnings**: Consider fixing warnings for better code quality

## 7. Regression Testing (CRITICAL)
- [ ] **Import Integrity**: Did you ensure you didn't accidentally remove `import React` or hooks during refactoring?
- [ ] **Run All Tests**: Execute `npm test` or `npm run test` to verify no regressions.
- [ ] **Fix Failures**: If any tests fail, **YOU MUST FIX THEM IMMEDIATELY** before marking the task as done. Do not proceed with broken tests.
