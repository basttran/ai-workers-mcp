import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function classify(text: string, labels: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (labels.length === 0) throw new Error("labels must be a non-empty array");

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Classify the following text into exactly one of these categories: ${labels.join(", ")}. Return only the category name, nothing else:\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
