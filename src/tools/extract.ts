import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function extract(text: string, fields: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (fields.length === 0) throw new Error("fields must be a non-empty array");

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Extract the following fields from the text and return as JSON: ${fields.join(", ")}. Return only valid JSON with no markdown fences:\n\n${text}`,
    },
  ]);

  const raw = output || "No response";

  let result: string;
  try {
    JSON.parse(raw);
    result = raw;
  } catch {
    result = `[WARNING: LLM returned non-JSON output]\n\n${raw}`;
  }

  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
