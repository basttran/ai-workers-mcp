import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function rewrite(text: string, style: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Rewrite the following text in a ${style} style. Return only the rewritten text, no explanation:\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
