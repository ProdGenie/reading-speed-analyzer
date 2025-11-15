// netlify/functions/gemini-wordcount.js

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const payload = body.payload;

    if (!payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'payload' in request body" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not set" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // NOTE: use a concrete model name that exists for v1beta
    
    const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      body: text,
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error", details: err.message }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
