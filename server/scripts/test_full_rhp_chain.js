const documentProcessingService = require('../services/DocumentProcessingService');
const fs = require('fs');
const path = require('path');

async function testRealPdf() {
    // This is a known RHP URL structure from NSE
    const url = "https://nsearchives.nseindia.com/emerge/corporates/content/Red_Herring_Prospectus_EPW_India.zip";
    const ipoId = 999; // Mock ID

    console.log(`[TEST] Starting full processing for: ${url}`);

    try {
        const processingId = `test-${Date.now()}`;
        const zipPath = path.join(documentProcessingService.tempDir, `${processingId}.zip`);
        const extractPath = path.join(documentProcessingService.tempDir, processingId);

        console.log("[TEST] Downloading...");
        await documentProcessingService.downloadFile(url, zipPath);
        console.log("[TEST] Extracting...");
        const files = await documentProcessingService.extractZipFile(zipPath, extractPath);

        console.log("[TEST] Finding PDF...");
        const rhpPdfPath = documentProcessingService.findRhpPdf(files);
        console.log("[TEST] PDF Found:", rhpPdfPath);

        if (rhpPdfPath) {
            console.log("[TEST] Parsing Structure...");
            const structure = await documentProcessingService.parseIssueStructure(rhpPdfPath);
            console.log("[TEST] STRUTURE EXTRACTED:", JSON.stringify(structure, null, 2));

            console.log("[TEST] Parsing Timetable...");
            const dates = await documentProcessingService.parseIndicativeTimetable(rhpPdfPath);
            console.log("[TEST] DATES EXTRACTED:", JSON.stringify(dates, null, 2));

            if (structure.total_issue_shares > 0) {
                console.log("\n✅ SUCCESS: Full extraction chain verified!");
            } else {
                console.log("\n❌ FAILED: Structure extraction returned no data.");
            }
        } else {
            console.log("\n❌ FAILED: No RHP PDF found in ZIP.");
        }

        // Cleanup
        documentProcessingService.cleanupFiles(zipPath, extractPath);
    } catch (e) {
        console.error("\n❌ ERROR during test:", e);
    }
}

testRealPdf();
