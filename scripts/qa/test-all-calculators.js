// Comprehensive UI Test Suite for All Calculators
// Tests all 88 calculators before git push to prevent regressions

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// All 88 calculator slugs from manifest
const CALCULATOR_SLUGS = [
  'stock-average-calculator', 'rental-yield-calculator', 'dividend-yield-calculator',
  'car-affordability-calculator', 'emergency-fund-calculator', 'pure-sip',
  'time-to-goal', 'lump-sum', 'sip-plus-lump',
  'compound-interest', 'step-up-sip', 'loan-emi',
  'car-loan-emi', 'advanced-car-loan-emi', 'step-up-loan-emi',
  'moratorium-loan-emi', 'compare-loans', 'advanced-home-loan',
  'cagr-calculator', 'ultimate-fire-planner', 'target-amount-calculator',
  'rent-vs-buy', 'step-up-plus-lump', 'swp-calculator',
  'swr-simulator', 'cost-of-delay', 'step-down-withdrawal',
  'inflation-impact', 'asset-allocation', 'recurring-deposit',
  'fixed-deposit', 'ppf-calculator', 'credit-card-payoff',
  'roi-calculator', 'rule-of-72', 'refinance-calculator',
  'topup-loan-emi', 'emi-comparison', 'simple-interest',
  'home-loan-eligibility', 'property-loan-eligibility', 'expense-ratio-calculator',
  'xirr-calculator', 'gst-calculator', 'nps-calculator',
  'ssy-calculator', '401k-calculator', 'roth-ira-calculator',
  '529-college-savings', 'us-mortgage-calculator', 'rmd-calculator',
  'us-capital-gains', 'social-security-break-even', 'us-paycheck-calculator',
  'hsa-calculator', 'hourly-to-salary', 'salary-hike',
  'margin-markup', 'break-even-point', 'discount-calculator',
  'student-loan-payoff', 'student-loan-forgiveness', 'medicare-cost-estimator',
  'aca-marketplace-calculator', 'child-tax-credit', 'fsa-calculator',
  'traditional-ira-calculator', 'home-affordability-calculator', 'auto-lease-vs-buy',
  'property-tax-estimator', 'debt-avalanche-snowball', 'fico-score-impact',
  'uk-income-tax', 'australia-income-tax', 'canada-income-tax',
  'europe-vat', 'japan-paycheck', 'hongkong-salary-tax',
  'china-income-tax', 'switzerland-income-tax', 'singapore-tax',
  'uae-gratuity', 'nz-paycheck', 'india-tax',
  'ireland-tax', 'mexico-isr', 'brazil-clt',
  'south-africa-tax', 'net-worth-tracker', 'budget-50-30-20',
  'inflation-adjusted-return', 'wedding-cost-planner', 'tip-calculator',
  'federal-income-tax-2025', 'retirement-savings', 'bnpl-cost-calculator'
];

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const PARALLEL_TESTS = 15;

const results = {
    passed: [],
    failed: [],
    warnings: [],
    startTime: Date.now()
};

// Sleep utility for older Puppeteer versions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test a single calculator
async function testCalculator(browser, slug) {
    const page = await browser.newPage();
    const url = `${BASE_URL}/calculators/${slug}`;

    const testResult = {
        slug,
        tests: {},
        passed: true,
        errors: []
    };

    try {
        // Test 1: Page loads
        const response = await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        testResult.tests.pageLoad = response.ok();
        if (!response.ok()) {
            testResult.errors.push(`HTTP ${response.status()}`);
            testResult.passed = false;
        }

        // Wait for React hydration
        await sleep(800);

        // Test 2: Title exists
        const title = await page.title();
        testResult.tests.hasTitle = title.length > 0 && !title.includes('404');
        if (!testResult.tests.hasTitle) {
            testResult.errors.push('Invalid title');
            testResult.passed = false;
        }

        // Test 3: Calculator renders
        const hasContent = await page.evaluate(() => {
            return document.querySelector('input, button, canvas') !== null;
        });
        testResult.tests.componentRenders = hasContent;
        if (!hasContent) {
            testResult.errors.push('Component not rendering');
            testResult.passed = false;
        }

        // Test 4: No JS errors
        const jsErrors = [];
        page.on('pageerror', error => jsErrors.push(error.message));
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('DevTools')) {
                jsErrors.push(`Console: ${msg.text()}`);
            }
        });

        await sleep(500);

        testResult.tests.noJSErrors = jsErrors.length === 0;
        if (jsErrors.length > 0) {
            testResult.errors.push(...jsErrors.slice(0, 2));
            testResult.passed = false;
        }

        // Test 5: Mobile responsive
        await page.setViewport({ width: 375, height: 667 });
        await sleep(300);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 5;
        });

        testResult.tests.mobileResponsive = !hasHorizontalScroll;
        if (hasHorizontalScroll) {
            testResult.warnings = testResult.warnings || [];
            testResult.warnings.push('Horizontal scroll on mobile');
        }

    } catch (error) {
        testResult.passed = false;
        testResult.errors.push(`Test crashed: ${error.message}`);
    } finally {
        await page.close();
    }

    return testResult;
}

// Run batch of tests
async function runTestBatch(browser, slugs) {
    const promises = slugs.map(slug => testCalculator(browser, slug));
    return await Promise.all(promises);
}

// Main
async function runAllTests() {
    console.log('\n🚀 Comprehensive UI Test Suite');
    console.log('='.repeat(70));
    console.log(`Testing ${CALCULATOR_SLUGS.length} calculators at ${BASE_URL}`);
    console.log(`Running ${PARALLEL_TESTS} tests in parallel\n`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const batches = [];
    for (let i = 0; i < CALCULATOR_SLUGS.length; i += PARALLEL_TESTS) {
        batches.push(CALCULATOR_SLUGS.slice(i, i + PARALLEL_TESTS));
    }

    let completed = 0;

    for (const batch of batches) {
        const batchResults = await runTestBatch(browser, batch);

        batchResults.forEach(result => {
            completed++;
            const symbol = result.passed ? '✅' : '❌';
            const warnings = result.warnings ? ` (${result.warnings.length} warnings)` : '';

            process.stdout.write(`\r${symbol} ${completed}/${CALCULATOR_SLUGS.length} - ${result.slug}${warnings}`.padEnd(80));

            if (result.passed) {
                results.passed.push(result.slug);
            } else {
                results.failed.push(result);
            }

            if (result.warnings && result.warnings.length > 0) {
                results.warnings.push({
                    slug: result.slug,
                    warnings: result.warnings
                });
            }
        });
    }

    await browser.close();

    console.log('\n');

    // Summary
    const duration = ((Date.now() - results.startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${results.passed.length}/${CALCULATOR_SLUGS.length}`);
    console.log(`❌ Failed: ${results.failed.length}/${CALCULATOR_SLUGS.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('='.repeat(70));

    if (results.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:\n');
        results.failed.forEach(result => {
            console.log(`  ${result.slug}`);
            result.errors.forEach(err => console.log(`    • ${err}`));
        });
    }

    if (results.warnings.length > 0 && results.warnings.length <= 10) {
        console.log('\n⚠️  WARNINGS:\n');
        results.warnings.forEach(w => {
            console.log(`  ${w.slug}:`);
            w.warnings.forEach(warning => console.log(`    • ${warning}`));
        });
    }


    if (results.failed.length > 0) {
        console.log('❌ Tests failed! Fix issues before pushing.\n');
        process.exit(1);
    }

    console.log('✅ All tests passed! Safe to push.\n');
    process.exit(0);
}

// Run
runAllTests().catch(error => {
    console.error('\n❌ Test suite crashed:', error.message);
    process.exit(1);
});
