// AfroCurl Clarity — Vision Label Scanner
// Reads a product label photo and extracts product name + full ingredient list.
// Returns everything needed to score the product immediately.

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
      body: JSON.stringify({ error: "Invalid request body." }),
    };
  }

  const { image, mediaType, images } = body;

  // Support multiple images or single image
  const imgArray = images && images.length
    ? images
    : image ? [{ data: image, mediaType: mediaType || "image/jpeg" }] : [];

  if (!imgArray.length) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "No image data provided." }),
    };
  }

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  // Build image content blocks for all provided images
  const imageBlocks = imgArray.map(img => {
    const t = img.mediaType || "image/jpeg";
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: validTypes.includes(t) ? t : "image/jpeg",
        data: img.data,
      },
    };
  });

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: `You are an expert at reading hair product labels and identifying hair products. Examine ${imageBlocks.length > 1 ? 'all '+imageBlocks.length+' images — they show different sides of the same product' : 'this image'} carefully.

Your PRIMARY job is to identify the product and extract ingredients. Even if this is a marketing/shop photo rather than a direct label shot, extract whatever product information you can see.

Return a JSON object with this exact structure:

{
  "product_name": "full product name from the label",
  "brand": "brand name",
  "product_type": "e.g. conditioner, gel, shampoo, curl cream",
  "ingredients": "the FULL ingredient list exactly as written on the label, comma-separated",
  "ingredients_found": true or false,
  "label_quality": "clear", "partial", or "unclear",
  "confidence": "high", "medium", or "low",
  "notes": "any notes about what you could or couldn't read clearly"
}

Instructions:
- ALWAYS try to read the product name and brand — even from marketing images, shop photos, or product shots where the label text is small
- If you can see ANY ingredients, list ALL of them — do not truncate
- If the ingredient list is partially obscured, include what you can see and note it
- If you can read the product name but not the ingredients, set ingredients_found to false but STILL return product_name and brand — this is very important, we will search for ingredients by name
- Only set product_name to empty string if you genuinely cannot read ANY text on the product at all
- Common ingredient list indicators: "Ingredients:", "INCI:", "Contains:"
- Return ONLY the JSON object, no other text`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].text.trim();

    let parsed;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If we got text but can't parse JSON, try to salvage something
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          product_name: "",
          brand: "",
          ingredients: "",
          ingredients_found: false,
          label_quality: "unclear",
          confidence: "low",
          notes: "Could not parse label response",
        }),
      };
    }

    // If we got a product name but no ingredients from the photo,
    // flag it so the frontend can auto-search for ingredients by name
    if (parsed.product_name && !parsed.ingredients_found) {
      parsed.should_auto_search = true;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("Vision function error:", err);

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
        error: "Label scan failed. Please try again or search by name.",
        details: err.message,
      }),
    };
  }
};
