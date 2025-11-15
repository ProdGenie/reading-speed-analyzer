import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const body = JSON.parse(event.body);

    // Convert base64 image into part for Gemini
    const imagePart = {
      inlineData: {
        data: body.imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const prompt = "Count the NUMBER OF WORDS in this page. Return ONLY the number.";

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ raw: text }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
