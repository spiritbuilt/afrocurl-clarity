// AfroCurl Clarity — AI Product Search + Auto Ingredient Fetch
// When a product is identified by any method, ingredients are fetched automatically.
// No manual entry required from the user.

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { query, mode } = body;

  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "A product name or barcode is required." }),
    };
  }

  // mode = "search" (by name/barcode) or "ingredients_only" (already have name, just fetch ingredients)
  const searchMode = mode || "search";

  try {
    let prompt;

    if (searchMode === "ingredients_only") {
      // We already know the product — just fetch its ingredients
      prompt = `You are a hair product ingredient expert. I need the FULL ingredient list for this specific product:

Product: "${query.trim()}"

Search your knowledge for this product's INCI ingredient list. Return a JSON object with this exact structure:

{
  "found": true or false,
  "product_name": "exact product name",
  "brand": "brand name",
  "product_type": "e.g. conditioner, gel, shampoo, leave-in, oil",
  "ingredients": "FULL ingredient list exactly as it would appear on the packaging, comma-separated, in INCI order",
  "confidence": "high", "medium", or "low",
  "notes": "any relevant notes about this product"
}

If you cannot find the specific ingredient list, set found to false and ingredients to an empty string.
Return ONLY the JSON object, no other text.`;
    } else {
      // Search mode — find the product and return ingredients in one step
      prompt = `You are a hair product ingredient database expert. Find this hair care product and return its complete ingredient list.

Search query: "${query.trim()}"

This may be a product name, brand name, or partial name. Find the best match and return a JSON object:

{
  "found": true or false,
  "product_name": "full official product name",
  "brand": "brand name",
  "product_type": "e.g. conditioner, gel, shampoo, leave-in, curl cream, oil, butter",
  "ingredients": "FULL ingredient list exactly as it appears on the label, comma-separated INCI names in order",
  "confidence": "high", "medium", or "low",
  "notes": "any useful notes e.g. variant differences, reformulation info"
}

Important rules:
- Return the COMPLETE ingredient list, not a partial one
- Use INCI (International Nomenclature of Cosmetic Ingredients) names where possible
- If multiple variants exist (e.g. original vs enriched), note this and return the most common version
- If you cannot find reliable ingredient data, set found to false
- Return ONLY the JSON object, no other text, no markdown code blocks`;
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text.trim();

    // Parse the JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, try to extract useful info
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          found: false,
          error: "Could not parse product data",
          raw: responseText.substring(0, 200),
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("Search function error:", err);

    if (err.status === 401) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "API authentication failed. Check ANTHROPIC_API_KEY.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Search failed. Please try again.",
        details: err.message,
      }),
    };
  }
};
