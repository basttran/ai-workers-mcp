import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function classify(text: string, labels: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (labels.length === 0) throw new Error("labels must be a non-empty array");

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Classify the following text into exactly one of these categories: ${labels.join(", ")}. Return only the category name, nothing else:\n\n${text}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";
  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
