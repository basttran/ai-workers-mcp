import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function extract(text: string, fields: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (fields.length === 0) throw new Error("fields must be a non-empty array");

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Extract the following fields from the text and return as JSON: ${fields.join(", ")}. Return only valid JSON with no markdown fences:\n\n${text}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "No response from Gemini";

  let result: string;
  try {
    JSON.parse(raw);
    result = raw;
  } catch {
    result = `[WARNING: Gemini returned non-JSON output]\n\n${raw}`;
  }

  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
