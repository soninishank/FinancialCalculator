// Simplified Automated Calculator Testing Suite
// Tests all modified calculators for basic functionality

const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';
const MODIFIED_CALCULATORS = [
    'break-even-calculator',
    'margin-calculator',
    'emergency-fund-calculator',
    'pure-sip',
    'lump-sum',
    'sip-with-lumpsum',
    'step-up-sip',
    'step-up-sip-with-lumpsum',
    'goal-planner',
    'swp-calculator',
];

const results = { passed: 0, failed: 0, details: [] };

async function testCalculator(browser, slug) {
    const page = await browser.newPage();
    const url = `${BASE_URL}/calculators/${slug}`;

    console.log(`\n📊 Testing: ${slug}`);
    console.log('─'.repeat(50));

    const tests = {
        pageLoad: false,
        inputs: false,
        charts: false,
        noErrors: false
    };

    try {
        // Test 1: Page loads
        const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        tests.pageLoad = response.ok();
        console.log(`  ${tests.pageLoad ? '✅' : '❌'} Page Load (HTTP ${response.status()})`);

        // Wait for content
        await new Promise(r => setTimeout(r, 1000));

        // Test 2: Has inputs
        const inputCount = await page.$$eval('input', inputs => inputs.length);
        tests.inputs = inputCount > 0;
        console.log(`  ${tests.inputs ? '✅' : '⚠️ '} Inputs (${inputCount} found)`);

        // Test 3: Has charts
        const canvasCount = await page.$$eval('canvas', canvases => canvases.length);
        tests.charts = canvasCount > 0;
        console.log(`  ${tests.charts ? '✅' : '⊝ '} Charts (${canvasCount} charts)`);

        // Test 4: No console errors
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await new Promise(r => setTimeout(r, 500));
        tests.noErrors = errors.length === 0;
        console.log(`  ${tests.noErrors ? '✅' : '❌'} No Errors (${errors.length} errors)`);

        if (errors.length > 0) {
            errors.forEach(e => console.log(`      ⚠️  ${e}`));
        }

        const allPassed = Object.values(tests).every(t => t === true);

        if (allPassed) {
            results.passed++;
        } else {
            results.failed++;
        }

        results.details.push({ slug, tests, passed: allPassed });

    } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}`);
        results.failed++;
        results.details.push({ slug, error: error.message, passed: false });
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('\n🚀 Automated Calculator Testing');
    console.log(`Testing ${MODIFIED_CALCULATORS.length} calculators...\n`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const slug of MODIFIED_CALCULATORS) {
        await testCalculator(browser, slug);
    }

    await browser.close();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${results.passed}/${MODIFIED_CALCULATORS.length}`);
    console.log(`❌ Failed: ${results.failed}/${MODIFIED_CALCULATORS.length}`);
    console.log('='.repeat(70) + '\n');

    if (results.failed > 0) {
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
});
