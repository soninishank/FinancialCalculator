
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const tests = [
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-1.5-pro", version: "v1" },
        { model: "gemini-pro", version: "v1" }
    ];

    for (const t of tests) {
        try {
            console.log(`Checking ${t.model} (${t.version})...`);
            const model = genAI.getGenerativeModel({ model: t.model }, { apiVersion: t.version });
            const result = await model.generateContent("Say 'Hello'");
            const response = await result.response;
            console.log(`✅ Success with ${t.model} (${t.version}): ${response.text()}`);
            break; // Stop if we find a working one
        } catch (error) {
            console.error(`❌ Error with ${t.model} (${t.version}):`, error.message);
        }
    }
}

listModels();
