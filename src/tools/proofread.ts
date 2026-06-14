import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function proofread(text: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Proofread the following text. Return the corrected text, then a brief bullet list of changes made (write "No changes needed." if the text is clean):\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
