exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { image_base64, media_type } = JSON.parse(event.body || "{}");
  if (!image_base64) {
    return { statusCode: 400, body: JSON.stringify({ error: "No image provided" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: media_type || "image/jpeg",
                data: image_base64
              }
            },
            {
              type: "text",
              text: `Extract the ingredients list from this hair product label image.

Return ONLY a JSON object in this exact format, no other text:
{
  "product_name": "product name if visible, otherwise empty string",
  "brand": "brand name if visible, otherwise empty string", 
  "ingredients": "full comma-separated ingredient list exactly as shown on label",
  "found": true
}

If no ingredient list is visible in the image, return:
{
  "found": false,
  "product_name": "",
  "brand": "",
  "ingredients": ""
}

Return ONLY the JSON. No explanation, no markdown, no backticks.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error("Vision error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Vision scan failed" })
    };
  }
};
