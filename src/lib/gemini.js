import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: "v1beta" });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let quotaExceededToday = false;
let nextResetTime = 0;

async function retryWithBackoff(fn, retries = 3, initialDelay = 2000) {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit = error.message.includes("429") || error.message.includes("quota");
            const isOverloaded = error.message.includes("503") || error.message.includes("overloaded");
            const isDailyQuota = error.message.toLowerCase().includes("daily") || (error.message.includes("exceeded") && error.message.includes("20"));

            if (isDailyQuota || (isRateLimit && error.message.includes("limit: 20"))) {
                console.error("[Gemini API] CRITICAL: Daily Quota (20 RPD) Exceeded. Disabling AI for today.");
                quotaExceededToday = true;
                // Set reset time to next midnight PST (approximate)
                const now = new Date();
                const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                nextResetTime = tomorrow.getTime();
                throw error;
            }

            if (i === retries - 1 || (!isRateLimit && !isOverloaded)) throw error;

            console.warn(`[Gemini API] Retry ${i + 1}/${retries} after ${delay}ms due to: ${error.message.substring(0, 50)}...`);
            await sleep(delay);
            delay *= 2; // Exponential backoff
        }
    }
}

/**
 * Batch tagging of news clusters using Gemini
 * @param {Array} clusters - Array of news cluster objects
 * @returns {Promise<Array>} - Enriched clusters
 */
export async function enrichClustersWithAI(clusters) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini API] GEMINI_API_KEY not found. Skipping AI enrichment.");
        return clusters;
    }

    // Daily Quota Safety Switch
    if (quotaExceededToday) {
        if (Date.now() < nextResetTime) {
            console.log("[Gemini API] Enrichment skipped: Daily quota exceeded. Waiting for reset.");
            return clusters;
        } else {
            quotaExceededToday = false; // Reset for the new day
        }
    }

    // Process in batches of 20 - Reduced requests per minute
    const BATCH_SIZE = 20;
    const enrichedClusters = [...clusters];

    for (let i = 0; i < clusters.length; i += BATCH_SIZE) {
        // Enforce 15-second pacer between batches to stay safely under the 5 RPM limit (60s / 4 = 15s)
        if (i > 0) {
            console.log(`[Gemini API] Pacing: Waiting 15s before next batch...`);
            await sleep(15000);
        }

        const batch = clusters.slice(i, i + BATCH_SIZE);
        const prompt = `
            You are a senior news editor for a high-authority financial news aggregator like Techmeme or Bloomberg.
            Analyze these ${batch.length} news clusters and provide high-quality, professional tags and extract key entities.
            
            INPUT (JSON):
            ${JSON.stringify(batch.map((c, idx) => ({ id: idx, title: c.main.title, description: c.main.description })))}

            RULES:
            1. Extract exactly 3-5 professional tags for each.
            2. Identify key entities: 'Companies', 'People', 'Products', 'Events'.
            3. Tags should be industry-specific (e.g., 'Monetary Policy', 'Venture Capital', 'Chip Design').
            4. Keep output STRICTLY as a JSON array of objects with keys: "id", "enhancedTags", "entities".

            OUTPUT FORMAT:
            [
                { "id": 0, "enhancedTags": ["Tag 1", "Tag 2"], "entities": { "Companies": ["X"], "People": ["Y"] } },
                ...
            ]
        `;

        try {
            const result = await retryWithBackoff(() => model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from potentially markdown-wrapped response
            const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || text;
            const aiData = JSON.parse(jsonStr);

            aiData.forEach((data, idx) => {
                const clusterIdx = i + data.id;
                if (enrichedClusters[clusterIdx]) {
                    enrichedClusters[clusterIdx].tags = [...new Set([...(enrichedClusters[clusterIdx].tags || []), ...data.enhancedTags])];
                    enrichedClusters[clusterIdx].entities = data.entities;
                }
            });
            console.log(`[Gemini API] Enriched batch ${i / BATCH_SIZE + 1} (${batch.length} items)`);
        } catch (error) {
            console.error(`[Gemini API] Error processing batch ${i / BATCH_SIZE + 1} after retries:`, error.message);
        }
    }

    return enrichedClusters;
}
