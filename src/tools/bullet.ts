import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function bullet(text: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Extract the key points from the following text as a concise markdown bullet list:\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
