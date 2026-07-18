import OpenAI from "openai";

export async function generateAIReview(code, findings, metrics) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "AI review preview generated. Add OPENAI_API_KEY to enable live AI analysis.",
      suggestions: [
        "Use meaningful variable and function names.",
        "Keep functions small and focused on one responsibility.",
        "Avoid hardcoded sensitive values.",
        "Add validation and error handling where required."
      ],
      bugs: [],
      codeSmells: ["Review the code for unnecessary complexity and duplicated logic."],
      performance: ["Optimize repeated calculations and avoid unnecessary loops."]
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a senior software engineer. Return concise JSON with summary, suggestions, bugs, codeSmells and performance."
      },
      {
        role: "user",
        content: JSON.stringify({ code, findings, metrics })
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}