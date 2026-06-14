import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function emailDraft(bullets: string | string[], tone?: string): Promise<string> {
  const bulletsText = Array.isArray(bullets) ? bullets.join("\n") : bullets;
  const check = checkPrivacy(bulletsText);
  if (check.status === "block") throw new Error(check.reason);

  const toneClause = tone ?? "professional";
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Draft an email based on these bullet points. Tone: ${toneClause}. Return only the email body, no subject line:\n\n${bulletsText}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
