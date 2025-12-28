const pdfParse = require('pdf-parse');

/**
 * MOCK Extraction logic taken from DocumentProcessingService.js to verify regex
 */
function testRegex(text) {
    const sectionKeywords = ["ISSUE STRUCTURE", "ALLOCATION", "THE ISSUE"];
    let sectionText = "";
    for (const kw of sectionKeywords) {
        const match = text.match(new RegExp(kw, 'i'));
        if (match) {
            sectionText = text.substring(match.index, match.index + 5000);
            console.log(`[TEST] Found section: ${kw}`);
            break;
        }
    }

    if (!sectionText) {
        console.log("[TEST] NO SECTION FOUND");
        return null;
    }

    const data = {};

    // 1. Parse Total Issue Size and Market Maker
    const totalMatch = text.match(/Total\s+Issue\s+Size\s*(?::|of)?\s*([\d,]+)/i);
    const marketMakerMatch = text.match(/Market\s+Maker\s+Reservation\s*(?:Portion)?\s*(?::|of)?\s*([\d,]+)/i);
    const netIssueMatch = text.match(/Net\s+Issue\s*(?:to\s+the\s+Public)?\s*(?::|of)?\s*([\d,]+)/i);

    if (totalMatch) data.total_issue_shares = parseInt(totalMatch[totalMatch.length - 1].replace(/,/g, ''));
    if (marketMakerMatch) data.market_maker_shares = parseInt(marketMakerMatch[1].replace(/,/g, ''));
    if (netIssueMatch) data.net_issue_shares = parseInt(netIssueMatch[1].replace(/,/g, ''));

    // 2. Parse Percentages (Retail, NII, QIB)
    const categories = [
        { key: 'retail_reservation_pct', names: ["\\bIndividual\\s+(?:Investors|Bidders)\\b", "\\bRetail\\b"] },
        { key: 'nii_reservation_pct', names: ["\\bNon\\s*-?\\s*Institutional\\b", "\\bNII\\b"] },
        { key: 'qib_reservation_pct', names: ["\\bQualified\\s+Institutional\\b", "\\bQIB\\b"] }
    ];

    for (const cat of categories) {
        for (const nameStr of cat.names) {
            console.log(`[DEBUG] Attempting Category: ${cat.key} with name: ${nameStr}`);

            // Style A: Same-line mapping (Table/List)
            const p1 = new RegExp(`${nameStr}[^%\\n\\r]{1,100}?\\s*(\\d+(?:\\.\\d+)?)\\s*%`, 'i');
            const match1 = sectionText.match(p1);
            if (match1) {
                console.log(`[DEBUG] Style A Match for ${cat.key}: "${match1[0]}" -> ${match1[1]}`);
                data[cat.key] = parseFloat(match1[1]);
                break;
            }

            // Style B: Legalese mapping (must have bridge words)
            const p2 = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%[^%]{1,150}?(?:available|allocated)[^%]{1,50}?to\\s+[^%]{1,30}?${nameStr}`, 'i');
            const match2 = sectionText.match(p2);
            if (match2) {
                console.log(`[DEBUG] Style B Match for ${cat.key}: "${match2[0]}" -> ${match2[1]}`);
                data[cat.key] = parseFloat(match2[1]);
                break;
            }

            // Style C: Simple reverse mapping (Percentage followed by Name)
            const p3 = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%[^%\\n\\r]{1,100}?\\s*${nameStr}`, 'i');
            const match3 = sectionText.match(p3);
            if (match3) {
                console.log(`[DEBUG] Style C Match for ${cat.key}: "${match3[0]}" -> ${match3[1]}`);
                data[cat.key] = parseFloat(match3[1]);
                break;
            }
        }
    }

    return data;
}

// Diverse sample texts based on different RHP styles
const testCases = [
    {
        name: "SME Fixed Price (EPW Style)",
        text: `
            ISSUE STRUCTURE
            Total Issue Size of 3,279,600 shares...
            Market Maker Reservation Portion of 1,64,400 shares...
            Net Issue of 31,15,200 shares...
            Not less than 35.00% of the Net Issue shall be available for allocation to Individual Investors...
            Not less than 15.00% of the Net Issue shall be available for allocation to Non-Institutional Investors...
        `,
        expected: { net: 3115200, ind: 35, nii: 15 }
    },
    {
        name: "Mainboard Book Building (Retail 35%)",
        text: `
            THE ISSUE
            Net Issue to the Public: 10,000,000 Equity Shares
            ALLOCATION
            Not less than 35% of the Net Issue to Retail Individual Investors
            Not more than 50% of the Net Issue to Qualified Institutional Buyers
            Not less than 15% of the Net Issue to Non-Institutional Investors
        `,
        expected: { net: 10000000, ind: 35, nii: 15, qib: 50 }
    },
    {
        name: "SME SME Platform (Retail 50%)",
        text: `
            ISSUE STRUCTURE
            The Net Issue of 5,00,000 Equity Shares...
            50% of the Net Issue shall be available for allocation to Retail Individual Investors...
            50% of the Net Issue shall be available for allocation to Non-Institutional Investors...
        `,
        expected: { net: 500000, ind: 50, nii: 50 }
    },
    {
        name: "Wording variation (Up to/At least)",
        text: `
            ALLOCATION
            Modified section:
            Individual Investors: 35.0%
            Non-Institutional: 15.0%
            QIB: 50.0%
        `,
        expected: { ind: 35, nii: 15, qib: 50 }
    },
    {
        name: "Mainboard with Sub-allocations (Anchor/MF)",
        text: `
            ISSUE STRUCTURE
            Not more than 50.00% of the Net Issue shall be available for allocation to Qualified Institutional Buyers ("QIB Portion").
            Our Company may allocate up to 60.00% of the QIB Portion to Anchor Investors on a discretionary basis.
            One-third of the Anchor Investor Portion shall be reserved for domestic Mutual Funds.
            Further, 5.00% of the Net QIB Portion shall be available for allocation to Mutual Funds only.
            Not less than 15.00% of the Net Issue shall be available for allocation to Non-Institutional Investors.
            Not less than 35.00% of the Net Issue shall be available for allocation to Retail Individual Investors.
        `,
        expected: { ind: 35, nii: 15, qib: 50 }
    },
    {
        name: "SME Bidders Phrasing",
        text: `
            THE ISSUE
            Net Issue to the Public: 2,500,000 Equity Shares
            ALLOCATION
            Qualified Institutional Buyers: Not more than 50.00% of the Net Issue
            Non-Institutional Bidders: Not less than 15.00% of the Net Issue
            Retail Individual Bidders: Not less than 35.00% of the Net Issue
        `,
        expected: { net: 2500000, ind: 35, nii: 15, qib: 50 }
    },
    {
        name: "Mixed dots and dashes style",
        text: `
            ISSUE STRUCTURE
            Retail Individual Investors .......... Not less than 35%
            Non-Institutional Investors ---------- Not less than 15%
            Qualified Institutional Buyers ........ Not more than 50%
        `,
        expected: { ind: 35, nii: 15, qib: 50 }
    }
];

testCases.forEach(case_ => {
    console.log(`\n--- Testing: ${case_.name} ---`);
    const result = testRegex(case_.text);
    console.log("Result:", JSON.stringify(result, null, 2));

    let pass = true;
    const errors = [];

    if (case_.expected.net && result.net_issue_shares !== case_.expected.net) {
        pass = false;
        errors.push(`net: expected ${case_.expected.net}, got ${result.net_issue_shares}`);
    }
    if (case_.expected.ind && result.retail_reservation_pct !== case_.expected.ind) {
        pass = false;
        errors.push(`ind: expected ${case_.expected.ind}, got ${result.retail_reservation_pct}`);
    }
    if (case_.expected.nii && result.nii_reservation_pct !== case_.expected.nii) {
        pass = false;
        errors.push(`nii: expected ${case_.expected.nii}, got ${result.nii_reservation_pct}`);
    }
    if (case_.expected.qib && result.qib_reservation_pct !== case_.expected.qib) {
        pass = false;
        errors.push(`qib: expected ${case_.expected.qib}, got ${result.qib_reservation_pct}`);
    }

    if (pass) {
        console.log("✅ PASS");
    } else {
        console.log(`❌ FAIL: ${errors.join(', ')}`);
    }
});
