
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function verify() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const models = [
        "gemini-3-flash-preview",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ];

    for (const modelName of models) {
        try {
            console.log(`Verifying ${modelName} (v1beta)...`);
            const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
            const result = await model.generateContent("Say 'Hello, Gemini Intelligence is here!'");
            const response = await result.response;
            console.log(`✅ Success with ${modelName}:`, response.text());
            return; // Stop on first success
        } catch (error) {
            console.error(`❌ ${modelName} failed:`, error.message);
        }
    }
}

verify();
