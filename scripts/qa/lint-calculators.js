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
const SHOULD_FIX = process.argv.includes('--fix');

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
    let modified = false;

    lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

        // Pattern: variable / variable (not in comments)
        const divisionPattern = /([\w]+(?:\.[\w]+)*)\s*\/\s*([\w]+(?:\.[\w]+)*)/g;
        let match;

        while ((match = divisionPattern.exec(line)) !== null) {
            const fullMatch = match[0];
            const divisor = match[2];

            // Skip if it's clearly a constant number
            if (/^\d+(\.\d+)?$/.test(divisor)) continue;

            const beforeMatch = line.substring(0, match.index);
            if (beforeMatch.includes('//') || beforeMatch.includes('/*')) continue;
            if (beforeMatch.split('"').length % 2 === 0) continue; // Inside string
            if (beforeMatch.split("'").length % 2 === 0) continue; // Inside string
            if (beforeMatch.split('`').length % 2 === 0) continue; // Inside template literal

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

                if (SHOULD_FIX) {
                    const fixedLine = line.replace(fullMatch, `(${divisor} !== 0 ? ${fullMatch} : 0)`);
                    lines[index] = fixedLine;
                    modified = true;
                }
            }
        }
    });

    return { content: lines.join('\n'), modified };
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
    let modified = false;

    lines.forEach((line, index) => {
        if (line.includes('.toFixed(')) {
            const contextStart = Math.max(0, index - 3);
            const contextLines = lines.slice(contextStart, index + 1).join('\n');

            const hasGuard = contextLines.includes('isNaN') ||
                contextLines.includes('isFinite') ||
                contextLines.includes('> 0 ?') ||
                contextLines.includes('?');

            if (!hasGuard) {
                ISSUES.push({
                    type: 'POTENTIAL_NAN',
                    severity: 'WARNING',
                    file: path.relative(process.cwd(), filePath),
                    line: index + 1,
                    code: line.trim(),
                    message: 'Using .toFixed() without NaN check - could display "NaN"'
                });

                if (SHOULD_FIX) {
                    const toFixedRegex = /([\w\d\.]+(?:\?\.[\w\d]+)*)\.toFixed\((\d+)\)/g;
                    const newLine = line.replace(toFixedRegex, (match, variable, decimals) => {
                        return `Number.isFinite(${variable}) ? ${match} : "0.${'0'.repeat(parseInt(decimals))}"`;
                    });

                    if (newLine !== line) {
                        lines[index] = newLine;
                        modified = true;
                    }
                }
            }
        }
    });

    return { content: lines.join('\n'), modified };
}

/**
 * Check for missing React/Hook imports
 */
function checkMissingImports(content, filePath) {
    const lines = content.split('\n');
    const first50Lines = lines.slice(0, 50).join('\n');

    // If the file has a default React import, React.useState etc. are all covered
    const hasDefaultReactImport = /import\s+React\b/.test(first50Lines);

    const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext'];
    hooks.forEach(hook => {
        // Check if the hook is used as a bare call (not React.hook)
        const isUsedBare = new RegExp(`(?<!React\\.)\\b${hook}\\s*\\(`).test(content);
        if (!isUsedBare) return; // Only React.hook() usage — no bare import needed

        const isImported =
            hasDefaultReactImport ||
            new RegExp(`import.*\\b${hook}\\b.*from ['"]react['"]`).test(first50Lines);

        if (!isImported) {
            ISSUES.push({
                type: 'MISSING_IMPORT',
                severity: 'ERROR',
                file: path.relative(process.cwd(), filePath),
                line: 1,
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
        let content = fs.readFileSync(filePath, 'utf8');
        let fileModified = false;

        const divRes = checkUnsafeDivision(content, filePath);
        if (divRes.modified) {
            content = divRes.content;
            fileModified = true;
        }

        checkHardcodedCurrency(content, filePath);
        checkMissingDefaults(content, filePath);

        const nanRes = checkNaNIssues(content, filePath);
        if (nanRes.modified) {
            content = nanRes.content;
            fileModified = true;
        }

        checkMissingImports(content, filePath);

        if (fileModified && SHOULD_FIX) {
            fs.writeFileSync(filePath, content);
            console.log(`${GREEN}FIXED:${RESET} ${path.relative(process.cwd(), filePath)}`);
        }
    });

    if (ISSUES.length === 0) {
        console.log(`${GREEN}✅ No issues found! All calculators pass linting.${RESET}\n`);
        process.exit(0);
    }

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

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${RED}Errors: ${errors.length}${RESET} | ${YELLOW}Warnings: ${warnings.length}${RESET}`);
    console.log(`${'='.repeat(60)}\n`);

    if (SHOULD_FIX) {
        console.log(`${GREEN}Autofix complete. Please review the changes.${RESET}\n`);
    }

    if (errors.length > 0 && !SHOULD_FIX) {
        console.log(`${RED}❌ Linting failed. Please fix the errors above.${RESET}\n`);
        process.exit(1);
    } else {
        console.log(`${GREEN}✅ Linting passed (or fixes applied).${RESET}\n`);
        process.exit(0);
    }
}

// Run the linter
lintCalculators();
