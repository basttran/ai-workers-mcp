import { complete, banner } from "../llm.js";

export async function sentiment(text: string): Promise<string> {
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Analyze the sentiment of the following text. Return JSON: { "label": "positive"|"negative"|"neutral", "confidence": 0.0-1.0, "summary": string }. Return only valid JSON with no markdown fences:\n\n${text}`,
    },
  ]);
  return banner(output || "No response", { provider, model });
}
