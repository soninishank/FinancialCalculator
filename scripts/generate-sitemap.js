
const fs = require('fs');
const path = require('path');

// Read manifest. Since it's an ES module export, and we are running in Node context without babel sometimes, 
// we might need to do some trickery. However, for simplicity, let's assume we can read the file as text and parse it 
// or require it if it's CommonJS. 
// Actually, `calculatorsManifest.js` uses `export default`. Node won't like that natively if not .mjs.
// Let's rewrite this to read the file content andregex extract or just redefine the manifest here if it's static enough?
// BETTER: Let's make a manual list or try to require it. 
// Best approach: Parse the file content to be safe.

// ACTUALLY: Let's just hardcode the logic to read the file content and `eval` safely or just duplicate the list? 
// Duplicating is bad. 
// Let's try to convert the manifest to CommonJS compatible format temporarily or use a regex to extract the array.

const manifestPath = path.join(__dirname, '../src/utils/calculatorsManifest.js');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Simple regex to extract the array content. 
// Warning: Vulnerable to formatting changes, but sufficient for this task.
const match = manifestContent.match(/const calculators = (\[[\s\S]*?\]);/);

if (!match) {
    console.error("Could not find calculators array in manifest.");
    process.exit(1);
}

// Evaluate the array string to get the object (safe-ish in build environment)
let calculators;
try {
    // We need to make sure the string is valid JS. 
    // The manifest usually has keys without quotes. `eval` handles that.
    calculators = eval(match[1]);
} catch (e) {
    console.error("Failed to parse manifest array:", e);
    process.exit(1);
}

const BASE_URL = 'https://hashmatic.in';
const TODAY = new Date().toISOString().split('T')[0];

const staticPages = [
    '/',
    '/calculators',
    // '/articles' // if you have articles
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Static Pages
staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
});

// Calculator Pages
calculators.forEach(calc => {
    sitemap += `  <url>
    <loc>${BASE_URL}/calculators/${calc.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

sitemap += `</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log(`✅ Generated sitemap.xml with ${calculators.length + staticPages.length} URLs`);
