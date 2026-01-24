# Comprehensive UI Testing Suite

## Overview

Automated UI testing for **all 88 calculators** that runs before every git push to prevent regression issues.

## Features

- ✅ **Tests all 88 calculators** automatically
- ✅ **Runs in parallel** (5 at a time) for speed (~3-5 minutes total)
- ✅ **Git hook integration** - blocks pushes if tests fail
- ✅ **Comprehensive checks** - page load, inputs, charts, errors
- ✅ **Detailed reporting** - `test-results.json` with full details
- ✅ **Mobile responsiveness** - checks for horizontal scroll

## What Gets Tested

For each of the 88 calculators:

1. **Page Load** - HTTP 200, no 404s
2. **Title Exists** - Valid page title
3. **Component Renders** - Calculator UI appears
4. **No JS Errors** - No console errors or crashes
5. **Has Inputs** - Input elements exist
6. **Inputs Interactive** - Can click/focus inputs
7. **Mobile Responsive** - No horizontal scroll on 375px
8. **UI Elements** - Headings, buttons, breadcrumbs present

## Running Tests

### Manual Run

```bash
# Ensure dev server is running
npm run dev

# In another terminal
npm run test:ui
```

### Automatic (Git Hook)

Tests run automatically before every `git push`:

```bash
git push origin main

# Output:
# 🔍 Running pre-push checks...
# 🧪 Running UI tests on 88 calculators...
# ✅ 1/88 - stock-average-calculator
# ✅ 2/88 - rental-yield-calculator
# ...
# ✅ 88/88 - south-africa-tax
#
# ✅ All tests passed! Proceeding with push...
```

If any test fails, the push is blocked:

```bash
❌ Tests failed! Push blocked.
   Fix the issues and try again.
```

## Test Results

### Console Output

```
🚀 Comprehensive UI Test Suite
======================================================================
Testing 88 calculators at http://localhost:3000
Running 5 tests in parallel

✅ 88/88 - south-africa-tax                                           

======================================================================
📊 TEST RESULTS
======================================================================
✅ Passed: 88/88
❌ Failed: 0/88
⚠️  Warnings: 0
⏱️  Duration: 245.3s
======================================================================

✅ All tests passed! Safe to push.
```

### JSON Report

Detailed results saved to `test-results.json`:

```json
{
  "timestamp": "2026-01-24T06:30:00.000Z",
  "duration": "245.3s",
  "total": 88,
  "passed": 88,
  "failed": 0,
  "warnings": 0,
  "failedTests": [],
  "warningTests": []
}
```

## Performance

- **Total Calculators:** 88
- **Parallel Tests:** 5 at a time
- **Time per Calculator:** ~3-5 seconds
- **Total Duration:** ~3-5 minutes

## Troubleshooting

### Dev Server Not Running

```
❌ Dev server is not running!
   Please start it with: npm run dev
```

**Solution:** Start dev server first

### Tests Timing Out

**Increase timeout** in `test-all-calculators.js`:

```javascript
timeout: 15000 // Increase from 15s to 30s
```

### False Positives (Lazy Loading)

Some calculators use lazy loading. The test waits 1.5 seconds for hydration. If still failing:

```javascript
await page.waitForTimeout(1500); // Increase to 3000
```

## Skipping Tests (Emergency)

If you need to push urgently and tests are failing:

```bash
git push --no-verify
```

**⚠️ Only use in emergencies!** Fix the failing tests ASAP.

## Disabling the Hook

Temporary:
```bash
git push --no-verify
```

Permanent:
```bash
rm .husky/pre-push
```

## Adding More Tests

Edit `scripts/test-all-calculators.js`:

```javascript
// Add new test function
async function testDarkMode(page, calculator) {
  // Your test logic
  return { test: 'Dark Mode', status: 'PASS' };
}

// Call in testCalculator()
testResult.tests.darkMode = await testDarkMode(page, calc);
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm start & sleep 5
      - run: npm run test:ui
```

## Best Practices

1. **Always run dev server before testing**
2. **Review test-results.json after failures**
3. **Don't skip tests with --no-verify (unless emergency)**
4. **Fix failing tests immediately**
5. **Run tests locally before pushing**

## FAQ

**Q: Can I test a single calculator?**  
A: Edit the script to filter by slug:
```javascript
const CALCULATORS = calculatorsManifest.filter(c => c.slug === 'pure-sip');
```

**Q: Tests are too slow. Can I speed them up?**  
A: Increase parallel tests:
```javascript
const PARALLEL_TESTS = 10; // From 5 to 10
```

**Q: Do tests catch calculation errors?**  
A: No, these are UI tests. They verify rendering, not math accuracy.

**Q: What if a calculator doesn't have inputs?**  
A: The test will show a warning but won't fail.

---

**Status:** ✅ Ready  
**Coverage:** 88/88 Calculators  
**Integration:** Git Pre-Push Hook Active
