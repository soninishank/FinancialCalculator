const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');
const MANIFEST_PATH = path.join(__dirname, '../src/utils/calculatorsManifest.js');
const BASE_URL = 'https://hashmatic.in';
const TODAY = new Date().toISOString().split('T')[0];

function generateSitemap(calculators) {
    const staticPages = [
        '/',
        '/calculators',
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
  </url>\n`;
    });

    // Calculator Pages
    calculators.forEach(calc => {
        sitemap += `  <url>
    <loc>${BASE_URL}/calculators/${calc.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    sitemap += `</urlset>`;

    fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap);
    console.log(`✅ Generated sitemap.xml with ${calculators.length + staticPages.length} URLs`);
}

function generateRobots() {
    const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), robots);
    console.log(`✅ Generated robots.txt`);
}

function getCalculators() {
    try {
        const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
        const match = manifestContent.match(/const calculators = (\[[\s\S]*?\]);/);
        if (!match) throw new Error("Could not find calculators array in manifest.");
        return eval(match[1]);
    } catch (e) {
        console.error("❌ Failed to parse manifest array:", e);
        process.exit(1);
    }
}

function main() {
    if (!fs.existsSync(BUILD_DIR)) {
        console.error("❌ Build directory not found. Run 'npm run build' first.");
        process.exit(1);
    }

    console.log("🚀 Starting post-build artifact generation...");
    const calculators = getCalculators();
    generateSitemap(calculators);
    generateRobots();
    console.log("✨ Post-build steps completed successfully.");
}

main();
