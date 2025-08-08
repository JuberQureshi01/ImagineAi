
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');
const fetch = require('node-fetch'); 
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY, { fetch });
router.post('/generate', authMiddleware, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ msg: 'A text prompt is required.' });
  }

  try {
    const promptEnhancer = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const enhancementPrompt = `Based on the user's simple prompt, create a highly detailed and descriptive prompt for an AI image generator. Focus on visual details, art style, lighting, and composition. User prompt: "${prompt}"`;
    
    const enhancementResult = await promptEnhancer.generateContent(enhancementPrompt);
    const detailedPrompt = await enhancementResult.response.text();
    console.log("Enhanced Prompt:", detailedPrompt);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(detailedPrompt);
    const response = await result.response;
    
    const imagePart = response.candidates[0].content.parts[0];

    if (!imagePart || !imagePart.inlineData) {
        throw new Error("The AI did not return an image. Please try a different prompt.");
    }

    const imageDataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    
    res.json({ imageUrl: imageDataUrl });

  } catch (error) {
    console.error("AI image generation error:", error);
    res.status(500).send("Error generating image with AI. Please check the server logs.");
  }
});

module.exports = router;
