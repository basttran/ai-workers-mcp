import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function outline(text: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Create a hierarchical markdown outline of the following text:\n\n${text}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";
  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
