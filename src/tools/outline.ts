import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function outline(text: string, depth?: number): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const maxDepth = depth ?? 3;
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content:
        `Create a hierarchical markdown outline of the following text. ` +
        `Use heading levels H1 through H${maxDepth} only (no deeper than H${maxDepth}):\n\n${text}`,
    },
  ]);

  const result = output || "No response";
  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
