# Automated Calculator Testing

## Overview

Automated test suite that verifies all 10 modified calculators using Puppeteer.

## What It Tests

For each calculator, the suite automatically verifies:

1. ✅ **Page Load** - No HTTP errors, no React crashes
2. ✅ **Input Bounds** - Min/max values enforced on sliders
3. ✅ **Chart Rendering** - Charts display with actual data
4. ✅ **Table Display** - Tables show rows with data
5. ✅ **PDF Export** - Export button exists and is clickable
6. ✅ **Mobile Responsive** - No horizontal scroll on 375px width  
7. ✅ **Dark Mode** - Toggle works, classes applied correctly
8. ✅ **Inflation Warning** - Warning appears (investment calculators only)

## Quick Start

### 1. Ensure Dev Server is Running

```bash
# In one terminal
npm run dev
```

### 2. Run Automated Tests

```bash
# In another terminal
npm run test:modified
```

## Expected Output

```
🚀 Starting Automated Calculator Tests

Testing 10 calculators...

📊 Testing: break-even-calculator
──────────────────────────────────────────────────
  ✓ Testing: break-even-calculator - Page Load
  ✓ Testing: break-even-calculator - Input Bounds
  ✓ Testing: break-even-calculator - Chart Rendering
  ✓ Testing: break-even-calculator - Table Display
  ✓ Testing: break-even-calculator - PDF Export
  ✓ Testing: break-even-calculator - Mobile Responsive
  ✓ Testing: break-even-calculator - Dark Mode

[... continues for all 10 calculators ...]

======================================================================
📊 TEST SUMMARY
======================================================================

✅ Passed: 10/10
❌ Failed: 0/10
⚠️  Warnings: 0

Detailed Results:
──────────────────────────────────────────────────

✅ break-even-calculator
  ✓ Page Load: PASS
  ✓ Input Bounds: PASS
  ✓ Chart Rendering: PASS
  ✓ Table Display: SKIP - No tables in this calculator
  ✓ PDF Export: SKIP - No PDF export in this calculator
  ✓ Mobile Responsive: PASS
  ✓ Dark Mode: PASS

[... results for all calculators ...]

======================================================================
```

## Test Duration

- **Per Calculator:** ~5-10 seconds
- **Total (10 calculators):** ~1-2 minutes

## Troubleshooting

### Error: "Cannot connect to localhost:3000"

**Solution:** Ensure dev server is running first:
```bash
npm run dev
```

### Error: "Timeout waiting for selector"

**Solution:** Some calculators take longer to load. The script has 10s timeout, which should be sufficient.

### Error: "Browser Error: ..."

**Solution:** Check browser console for actual errors. May indicate a real bug in the calculator.

## What Tests DON'T Cover

- **Calculation Accuracy** - Tests verify UI, not math formulas
- **Currency Switching** - Not automated yet
- **Complex Interactions** - Like adding multiple prepayments
- **Visual Regression** - No screenshot comparison

## Future Enhancements

Consider adding:
1. **Visual Regression Tests** - Screenshot comparison
2. **Calculation Tests** - Verify math formulas
3. **Performance Tests** - Page load speed
4. **Accessibility Tests** - Screen reader compatibility

## Integration with CI/CD

Add to `.github/workflows/test.yml`:

```yaml
- name: Run Calculator Tests
  run: |
    npm run dev &
    sleep 5  # Wait for server
    npm run test:modified
```

## FAQ

**Q: Can I test a single calculator?**
A: Yes, modify the script to filter `MODIFIED_CALCULATORS` array.

**Q: Can I run tests in visible browser (not headless)?**
A: Yes, change `headless: true` to `headless: false` in the script.

**Q: What if a test fails?**
A: The script will:
- Print the error message
- Continue testing other calculators
- Exit with code 1 (fail) if any calculator fails

**Q: How do I add more tests?**
A: Add new test functions (like `testPageLoad`) and call them in `testCalculator`.

## Maintenance

Update `MODIFIED_CALCULATORS` array when:
- Adding new calculators that need testing
- Refactoring additional calculators
- Removing calculators

---

**Status:** ✅ Ready to Run  
**Last Updated:** 2026-01-24
