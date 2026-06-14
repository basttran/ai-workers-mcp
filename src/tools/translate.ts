import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function translate(text: string, targetLang: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Translate the following text to ${targetLang}. Return only the translation, no explanation:\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
