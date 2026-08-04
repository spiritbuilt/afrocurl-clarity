exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { query } = JSON.parse(event.body || "{}");
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: "No search query provided" }) };
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
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3
        }],
        messages: [{
          role: "user",
          content: `Find the full ingredient list for this hair care product: "${query}".

Search the web for the product's official page, brand website, or a reliable beauty retailer (like Boots, Superdrug, Sephora, ULTA, or the brand's own site).

Return ONLY a JSON object in this exact format, no other text:
{
  "product_name": "exact product name",
  "brand": "brand name",
  "ingredients": "full comma-separated ingredient list exactly as listed on the product",
  "found": true
}

If you cannot find the ingredient list after searching, return:
{
  "found": false,
  "product_name": "",
  "brand": "",
  "ingredients": ""
}

Important: Return ONLY the JSON object. No explanation, no markdown, no backticks.`
        }]
      })
    });

    const data = await response.json();

    // Find the text content block
    const textBlock = data.content && data.content.find(b => b.type === "text");
    if (!textBlock || !textBlock.text) {
      return {
        statusCode: 200,
        body: JSON.stringify({ found: false, ingredients: "", product_name: "", brand: "" })
      };
    }

    // Parse the JSON response
    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error("Search error:", err);
    return {
      statusCode: 200,
      body: JSON.stringify({ found: false, ingredients: "", product_name: "", brand: "", error: "Search failed — try entering ingredients manually." })
    };
  }
};
