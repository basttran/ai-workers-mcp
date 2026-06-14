import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function rewrite(text: string, style: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Rewrite the following text in a ${style} style. Return only the rewritten text, no explanation:\n\n${text}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";
  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
