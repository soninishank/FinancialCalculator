
const axios = require("axios");
require("dotenv").config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    try {
        console.log("Fetching models from v1beta...");
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("Models found:", response.data.models.map(m => m.name));
    } catch (error) {
        console.error("Error fetching models from v1beta:", error.response?.data || error.message);

        try {
            console.log("Fetching models from v1...");
            const responsev1 = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            console.log("Models found (v1):", responsev1.data.models.map(m => m.name));
        } catch (ev1) {
            console.error("Error fetching models from v1:", ev1.response?.data || ev1.message);
        }
    }
}

listModels();
