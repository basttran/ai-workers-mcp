import { complete, banner } from "../llm.js";

export async function titleSuggest(text: string, count?: number): Promise<string> {
  const n = count ?? 5;
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Generate ${n} title suggestions for the following text. Return as a numbered list:\n\n${text}`,
    },
  ]);
  return banner(output || "No response", { provider, model });
}
