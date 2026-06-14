import { complete, banner } from "../llm.js";

export async function keywords(text: string, count?: number): Promise<string> {
  const n = count ?? 10;
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Extract the ${n} most important keywords from the following text. Return as a comma-separated list:\n\n${text}`,
    },
  ]);
  return banner(output || "No response", { provider, model });
}
