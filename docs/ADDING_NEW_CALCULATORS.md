# Adding New Calculators - Testing Checklist

## Automatic Test Synchronization

When you add a new calculator, the test suite needs to know about it. We have **3 methods** to handle this:

---

## Method 1: Auto-Sync Script (Recommended) ⭐

**When to use:** After adding any new calculator to `calculatorsManifest.js`

**How:**
```bash
npm run sync:tests
```

**What it does:**
- Automatically extracts all slugs from `calculatorsManifest.js`
- Updates `test-all-calculators.js` with the new list
- Ensures tests stay in sync with your manifest

**Add this to your workflow:**
1. Add new calculator to `src/utils/calculatorsManifest.js`
2. Run `npm run sync:tests`
3. Run `npm run test:ui` to verify
4. Commit changes

---

## Method 2: Manual Update

**If you prefer manual control:**

1. Open `scripts/test-all-calculators.js`
2. Find the `CALCULATOR_SLUGS` array (around line 9)
3. Add your new calculator slug to the array:

```javascript
const CALCULATOR_SLUGS = [
  'stock-average-calculator',
  'rental-yield-calculator',
  // ... existing calculators ...
  'your-new-calculator-slug',  // ← Add here
];
```

4. Run `npm run test:ui` to verify

---

## Method 3: Pre-Push Hook (Automatic)

**Already configured!** The git pre-push hook will:
- Automatically run tests on ALL calculators before push
- Fail the push if any calculator is broken
- Ensure you never push untested code

**No action needed** - it just works!

---

## Verification Workflow

### After Adding a New Calculator

**Step 1: Sync Tests**
```bash
npm run sync:tests
```

**Step 2: Test Your New Calculator**
```bash
# Test just your calculator manually
curl http://localhost:3000/calculators/your-new-slug
```

**Step 3: Run Full Test Suite**
```bash
npm run test:ui
```

**Expected Output:**
```
🚀 Comprehensive UI Test Suite
Testing 89 calculators at http://localhost:3000  ← Note: increased count
Running 5 tests in parallel

✅ 89/89 - your-new-calculator  ← Your new one appears here
✅ Passed: 89/89
```

**Step 4: Commit & Push**
```bash
git add .
git commit -m "Add new YourCalculator"
git push  # Tests run automatically
```

---

## Common Issues & Solutions

### Issue 1: "Test still shows 88 calculators"

**Problem:** Forgot to sync after adding calculator

**Solution:**
```bash
npm run sync:tests
```

---

### Issue 2: "My calculator test fails"

**Problem:** Calculator has bugs or isn't rendering

**Debug Steps:**
1. Check console for errors: Open `http://localhost:3000/calculators/your-slug`
2. Verify manifest entry is correct
3. Check calculator file exports properly
4. Review test-results.json for specific error

---

### Issue 3: "Pre-push hook blocks my push"

**Problem:** Some calculator is broken

**Solutions:**

**Option A:** Fix the broken calculator (recommended)
```bash
# Check which calculator failed
cat test-results.json
# Fix the issue
# Try push again
```

**Option B:** Emergency bypass (use sparingly!)
```bash
git push --no-verify  # Skip tests
```

⚠️ **Warning:** Only use `--no-verify` if absolutely necessary. Fix the tests ASAP!

---

## Best Practices

### ✅ DO:
- Run `npm run sync:tests` after adding calculators
- Test locally before pushing
- Check `test-results.json` when tests fail
- Keep dev server running during tests

### ❌ DON'T:
- Skip tests with `--no-verify` regularly
- Forget to add calculator to manifest first
- Push without running tests locally
- Ignore test failures

---

## Automation Summary

| Action | Automation | Your Action |
|--------|------------|-------------|
| **Add calculator to manifest** | Manual | Add entry to `calculatorsManifest.js` |
| **Sync test list** | `npm run sync:tests` | Run command |
| **Run tests** | `npm run test:ui` | Run command |
| **Pre-push testing** | Automatic | Nothing - runs on `git push` |

---

## Quick Reference Commands

```bash
# Sync tests with manifest
npm run sync:tests

# Run all UI tests manually
npm run test:ui

# Check test results
cat test-results.json

# Test specific calculator manually
curl http://localhost:3000/calculators/your-slug
```

---

**Status:** ✅ Automated  
**Maintenance:** Low - run sync script when adding calculators  
**Safety:** High - pre-push hook prevents broken deploys
