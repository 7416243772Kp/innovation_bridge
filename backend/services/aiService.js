const OpenAI = require('openai');
require('dotenv').config({ path: '../../.env' });

// Initialize OpenAI SDK to point to your LOCAL Ollama server
const openai = new OpenAI({
    baseURL: process.env.LOCAL_AI_URL || "http://localhost:11434/v1",
    apiKey: "ollama", // The SDK requires an API key string, but Ollama ignores it!
});

// Set this to the exact name of the model you are running in Ollama
const AI_MODEL = process.env.LOCAL_AI_MODEL || "gemma:7b"; 

const aiService = {
    enhanceDescription: async (rawText) => {
        const prompt = `
        You are an expert technology and business analyst. Take the following raw idea description and enhance it.
        Return ONLY a JSON object with the following keys:
        - aiTitle (Professional Title)
        - aiSummary (Executive Summary)
        - aiTechnicalDescription (Technical Description)
        - aiBenefits (Key Benefits)
        
        Raw Description: "${rawText}"
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" } // Gemma in Ollama supports JSON mode!
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Local AI Enhancement Error:", error);
            throw new Error("Failed to enhance text using local Gemma");
        }
    },

    evaluateInnovation: async (enhancedData) => {
        const prompt = `
        Evaluate the following innovation and provide scores from 0-100 for: novelty, impact, scalability, sustainability, commercial, and feasibility.
        Also calculate an 'overall' average score.
        Determine the 'readinessLevel' strictly as an integer from 1 to 5 (1=Idea, 2=Proof of Concept, 3=Prototype, 4=Field Tested, 5=Commercial Ready).
        Determine a 'similarityScore' percentage (0-100) based on how common this idea is.
        
        Return ONLY a JSON object matching these exact keys.
        
        Innovation Title: ${enhancedData.aiTitle}
        Description: ${enhancedData.aiSummary}
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Local AI Evaluation Error:", error);
            throw new Error("Failed to evaluate innovation using local Gemma");
        }
    }
};

module.exports = aiService;