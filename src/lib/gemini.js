import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Process in batches of 15 to stay within token/rate limits
    const BATCH_SIZE = 15;
    const enrichedClusters = [...clusters];

    for (let i = 0; i < clusters.length; i += BATCH_SIZE) {
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
            const result = await model.generateContent(prompt);
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
            console.error(`[Gemini API] Error processing batch ${i / BATCH_SIZE + 1}:`, error.message);
        }
    }

    return enrichedClusters;
}
