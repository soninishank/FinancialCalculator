#!/usr/bin/env node
// Auto-sync script: Updates test-all-calculators.js with latest calculator slugs

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../src/utils/calculatorsManifest.js');
const testFilePath = path.join(__dirname, 'test-all-calculators.js');

console.log('🔄 Syncing calculator tests with manifest...\n');

// Extract slugs from manifest
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const slugMatches = manifestContent.match(/slug:\s*['"]([^'"]+)['"]/g);

if (!slugMatches) {
    console.error('❌ Could not find calculator slugs in manifest');
    process.exit(1);
}

const slugs = slugMatches.map(match => {
    const slug = match.match(/slug:\s*['"]([^'"]+)['"]/)[1];
    return slug;
});

console.log(`✓ Found ${slugs.length} calculators in manifest`);

// Read current test file
const testContent = fs.readFileSync(testFilePath, 'utf8');

// Find the CALCULATOR_SLUGS array
const arrayStart = testContent.indexOf('const CALCULATOR_SLUGS = [');
const arrayEnd = testContent.indexOf('];', arrayStart);

if (arrayStart === -1 || arrayEnd === -1) {
    console.error('❌ Could not find CALCULATOR_SLUGS array in test file');
    process.exit(1);
}

// Create new array content with proper formatting
const formattedSlugs = [];
for (let i = 0; i < slugs.length; i += 3) {
    const batch = slugs.slice(i, i + 3);
    formattedSlugs.push(`  ${batch.map(s => `'${s}'`).join(', ')}`);
}

const newArray = `const CALCULATOR_SLUGS = [\n${formattedSlugs.join(',\n')}\n];`;

// Replace the array
const beforeArray = testContent.substring(0, arrayStart);
const afterArray = testContent.substring(arrayEnd + 2);
const newContent = beforeArray + newArray + afterArray;

// Write back
fs.writeFileSync(testFilePath, newContent, 'utf8');

console.log(`✓ Updated test file with ${slugs.length} calculators`);
console.log('\n✅ Sync complete!\n');
