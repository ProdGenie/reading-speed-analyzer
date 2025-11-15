// netlify/functions/gemini.js

// Simple Netlify function that calls Gemini over plain HTTP.
// No external npm packages required.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { imageBase64, mimeType } = JSON.parse(event.body || "{}");

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing imageBase64 in body" }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not set" }),
      };
    }

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      apiKey;

    const payload = {
      contents: [
        {
          parts: [
            {
              text:
                "Count how many WORDS are in this page. " +
                "Reply with ONLY the number, no extra words.",
            },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Gemini API error",
          details: data,
        }),
      };
    }

    const text =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
          .map((p) => p.text || "")
          .join("")) ||
      "";

    return {
      statusCode: 200,
      body: JSON.stringify({ rawText: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Request failed",
        details: err.message,
      }),
    };
  }
};
