import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function proofread(text: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Proofread the following text. Return the corrected text, then a brief bullet list of changes made (write "No changes needed." if the text is clean):\n\n${text}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";
  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
