#!/usr/bin/env node

/**
 * Custom Calculator Linter
 * Scans all calculator files for common logic errors:
 * 1. Division operations without zero checks
 * 2. Hardcoded currency values
 * 3. Missing prop validation
 * 4. Potential NaN/Infinity issues
 */

const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '../../src/components/calculators');
const ISSUES = [];

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Recursively find all .js files in a directory
 */
function findJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJSFiles(filePath, fileList);
        } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Check for division operations without zero checks
 */
function checkUnsafeDivision(content, filePath) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

        // Pattern: variable / variable (not in comments)
        // Matches things like: a / b, obj.prop / obj.prop, result.newRegime.tax / Math.max(...)
        const divisionPattern = /([\w]+(?:\.[\w]+)*)\s*\/\s*([\w]+(?:\.[\w]+)*)/g;
        let match;

        while ((match = divisionPattern.exec(line)) !== null) {
            const divisor = match[2];

            // Skip if it's clearly a constant number (integer or decimal)
            if (/^\d+(\.\d+)?$/.test(divisor)) continue;

            // Skip if it's in a string or comment
            const beforeMatch = line.substring(0, match.index);
            if (beforeMatch.includes('//') || beforeMatch.includes('/*')) continue;
            if (beforeMatch.split('"').length % 2 === 0) continue; // Inside string
            if (beforeMatch.split("'").length % 2 === 0) continue; // Inside string
            if (beforeMatch.split('`').length % 2 === 0) continue; // Inside template literal

            // Check if there's a zero check nearby (within 5 lines before)
            const contextStart = Math.max(0, index - 5);
            const contextLines = lines.slice(contextStart, index + 1).join('\n');

            const hasZeroCheck =
                contextLines.includes(`${divisor} > 0`) ||
                contextLines.includes(`${divisor} !== 0`) ||
                contextLines.includes(`${divisor} != 0`) ||
                contextLines.includes(`${divisor} === 0`) ||
                contextLines.includes(`${divisor} == 0`) ||
                contextLines.includes(`${divisor} <= 0`) ||
                contextLines.includes(`${divisor} < 0`) ||
                contextLines.includes(`${divisor} >= 0`) ||
                contextLines.includes(`if (${divisor})`) ||
                contextLines.includes(`? ${divisor}`) ||
                contextLines.includes(`${divisor} ?`);

            if (!hasZeroCheck) {
                ISSUES.push({
                    type: 'UNSAFE_DIVISION',
                    severity: 'ERROR',
                    file: path.relative(process.cwd(), filePath),
                    line: index + 1,
                    code: line.trim(),
                    message: `Division by '${divisor}' without zero check`
                });
            }
        }
    });
}

/**
 * Check for hardcoded currency values
 */
function checkHardcodedCurrency(content, filePath) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Pattern: currency: 'INR' or currency: 'USD' or currency="INR"
        const currencyPattern = /currency:\s*['"]([A-Z]{3})['"]/g;
        let match;

        while ((match = currencyPattern.exec(line)) !== null) {
            const currencyCode = match[1];

            // Skip if it's in a comment
            if (line.trim().startsWith('//')) continue;

            ISSUES.push({
                type: 'HARDCODED_CURRENCY',
                severity: 'ERROR',
                file: path.relative(process.cwd(), filePath),
                line: index + 1,
                code: line.trim(),
                message: `Hardcoded currency '${currencyCode}' - should use currency prop`
            });
        }
    });
}

/**
 * Check for missing default props
 */
function checkMissingDefaults(content, filePath) {
    const lines = content.split('\n');

    // Check if component uses useState without default value
    lines.forEach((line, index) => {
        if (line.includes('useState(') && line.includes("useState('')")) {
            ISSUES.push({
                type: 'EMPTY_INITIAL_STATE',
                severity: 'WARNING',
                file: path.relative(process.cwd(), filePath),
                line: index + 1,
                code: line.trim(),
                message: 'Empty string initial state - consider using a default number'
            });
        }
    });
}

/**
 * Check for potential NaN issues
 */
function checkNaNIssues(content, filePath) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Check for .toFixed() without NaN check
        if (line.includes('.toFixed(') && !line.includes('isNaN')) {
            const contextStart = Math.max(0, index - 3);
            const contextLines = lines.slice(contextStart, index + 1).join('\n');

            if (!contextLines.includes('isNaN') && !contextLines.includes('> 0 ?')) {
                ISSUES.push({
                    type: 'POTENTIAL_NAN',
                    severity: 'WARNING',
                    file: path.relative(process.cwd(), filePath),
                    line: index + 1,
                    code: line.trim(),
                    message: 'Using .toFixed() without NaN check - could display "NaN"'
                });
            }
        }
    });
}

/**
 * Check for missing React/Hook imports
 */
function checkMissingImports(content, filePath) {
    const lines = content.split('\n');
    const first50Lines = lines.slice(0, 50).join('\n');

    const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext'];
    hooks.forEach(hook => {
        // If hook is used but not in the first 50 lines (where imports usually are)
        const isUsed = new RegExp(`\\b${hook}\\b`).test(content);
        const isImported = new RegExp(`import.*\\b${hook}\\b.*from ['"]react['"]`).test(first50Lines);

        if (isUsed && !isImported) {
            ISSUES.push({
                type: 'MISSING_IMPORT',
                severity: 'ERROR',
                file: path.relative(process.cwd(), filePath),
                line: 1, // Reference first line for import errors
                code: `hook: ${hook}`,
                message: `React hook '${hook}' is used but not imported from 'react'`
            });
        }
    });

    // Check for React itself if JSX is used
    if (content.includes('<') && content.includes('/>') && !first50Lines.includes("import React")) {
        // Newer React allows no React import, but we've seen issues with some setups
        // Let's at least check if some React components are used without React import
    }
}

/**
 * Main linting function
 */
function lintCalculators() {
    console.log(`${BLUE}🔍 Scanning calculators for logic errors...${RESET}\n`);

    const files = findJSFiles(CALCULATORS_DIR);
    console.log(`Found ${files.length} calculator files\n`);

    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');

        checkUnsafeDivision(content, filePath);
        checkHardcodedCurrency(content, filePath);
        checkMissingDefaults(content, filePath);
        checkNaNIssues(content, filePath);
        checkMissingImports(content, filePath);
    });

    // Print results
    if (ISSUES.length === 0) {
        console.log(`${GREEN}✅ No issues found! All calculators pass linting.${RESET}\n`);
        process.exit(0);
    }

    // Group by severity
    const errors = ISSUES.filter(i => i.severity === 'ERROR');
    const warnings = ISSUES.filter(i => i.severity === 'WARNING');

    if (errors.length > 0) {
        console.log(`${RED}❌ ${errors.length} ERROR(S) FOUND:${RESET}\n`);
        errors.forEach(issue => {
            console.log(`${RED}ERROR${RESET} [${issue.type}] ${issue.file}:${issue.line}`);
            console.log(`  ${issue.message}`);
            console.log(`  ${issue.code}\n`);
        });
    }

    if (warnings.length > 0) {
        console.log(`${YELLOW}⚠️  ${warnings.length} WARNING(S) FOUND:${RESET}\n`);
        warnings.forEach(issue => {
            console.log(`${YELLOW}WARNING${RESET} [${issue.type}] ${issue.file}:${issue.line}`);
            console.log(`  ${issue.message}`);
            console.log(`  ${issue.code}\n`);
        });
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${RED}Errors: ${errors.length}${RESET} | ${YELLOW}Warnings: ${warnings.length}${RESET}`);
    console.log(`${'='.repeat(60)}\n`);

    // Exit with error code if there are errors
    if (errors.length > 0) {
        console.log(`${RED}❌ Linting failed. Please fix the errors above.${RESET}\n`);
        process.exit(1);
    } else {
        console.log(`${GREEN}✅ Linting passed with warnings.${RESET}\n`);
        process.exit(0);
    }
}

// Run the linter
lintCalculators();
