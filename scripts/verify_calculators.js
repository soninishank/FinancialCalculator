const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '../src/components/calculators');

// Banned patterns and their suggested replacements
const BANNED_PATTERNS = [
    {
        pattern: /<table[\s>]/i,
        message: 'Do not use raw <table> tags. Use <CollapsibleInvestmentTable> or <CollapsibleAmortizationTable> instead.'
    },
    {
        pattern: /<input[\s>]/i,
        message: 'Do not use raw <input> tags. Use <FormattedInput> or <InputWithSlider> instead.'
    },
    {
        pattern: /import.*from.*['"]react-chartjs-2['"]/i,
        message: 'Do not import react-chartjs-2 directly. Use wrappers in src/components/common/FinancialCharts.js.'
    },
    {
        pattern: /new jsPDF/i,
        message: 'Do not instantiate jsPDF directly. Use the downloadPDF utility from utils/export.'
    }
];

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(dir);
    let hasErrors = false;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recurse into subdirectories if necessary, though sticking to flat structure for now based on observe
            scanDirectory(filePath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');

            BANNED_PATTERNS.forEach(({ pattern, message }) => {
                if (pattern.test(content)) {
                    console.error(`\n[ERROR] ${file}: Violation detected`);
                    console.error(`   ${message}`);
                    hasErrors = true;
                }
            });
        }
    });

    return hasErrors;
}

console.log(`Scanning ${CALCULATORS_DIR} for standardization violations...`);
const foundErrors = scanDirectory(CALCULATORS_DIR);

if (foundErrors) {
    console.error('\nVerification FAILED. Please fix the above issues.');
    process.exit(1);
} else {
    console.log('\nVerification PASSED. All calculators look compliant.');
    process.exit(0);
}
