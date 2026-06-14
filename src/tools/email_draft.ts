import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function emailDraft(bullets: string | string[], tone?: string): Promise<string> {
  const bulletsText = Array.isArray(bullets) ? bullets.join("\n") : bullets;
  const check = checkPrivacy(bulletsText);
  if (check.status === "block") throw new Error(check.reason);

  const toneClause = tone ?? "professional";
  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Draft an email based on these bullet points. Tone: ${toneClause}. Return only the email body, no subject line:\n\n${bulletsText}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";
  return check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
}
