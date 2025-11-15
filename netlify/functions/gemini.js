// netlify/functions/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { base64Image } = body;

    if (!base64Image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data sent" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY on server" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // FIXED MODEL NAME (v1-compatible)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const prompt = `
      Extract ONLY the full text content from this page image.
      Do NOT summarize.
      Return exactly the raw text.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text() || "";

    const wordCount = text
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length > 0).length;

    return {
      statusCode: 200,
      body: JSON.stringify({ wordCount, extractedText: text }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Gemini function error",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
