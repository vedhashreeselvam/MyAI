require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

// Connect to Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const messages = req.body.messages;

        // Check user messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        // Prepare conversation history for Gemini
        const safeMessages = messages
            .filter(message =>
                ["user", "assistant"].includes(message.role)
            )
            .map(message => ({
                role: message.role === "assistant" ? "model" : "user",
                parts: [{
                    text: String(message.content).slice(0, 10000)
                }]
            }));

        if (safeMessages.length === 0) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        // Get response from Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: safeMessages,
            config: {
                systemInstruction:
                    "You are a helpful AI assistant. " +
                    "Answer questions clearly and accurately. " +
                    "Explain difficult concepts in simple language when needed."
            }
        });

        // Send answer to website
        res.json({
            answer: response.text
        });

    } catch (error) {
        console.error("Gemini API Error:", error);

        res.status(500).json({
            error: "Unable to get an AI response. Check your Gemini API configuration."
        });
    }
});

// Start website
app.listen(PORT, () => {
    console.log(`Website running at http://localhost:${PORT}`);
});