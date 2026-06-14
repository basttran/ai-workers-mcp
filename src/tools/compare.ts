import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function compare(textA: string, textB: string, focus?: string): Promise<string> {
  const checkA = checkPrivacy(textA);
  if (checkA.status === "block") throw new Error(`Text A: ${checkA.reason}`);

  const checkB = checkPrivacy(textB);
  if (checkB.status === "block") throw new Error(`Text B: ${checkB.reason}`);

  const focusClause = focus ? `, focusing on ${focus}` : "";
  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Compare the following two texts${focusClause}. Highlight key similarities and differences:\n\nText A:\n${textA}\n\nText B:\n${textB}`,
    },
  ]);

  const result = output || "No response";
  const warn = [checkA, checkB].find((c) => c.status === "warn");
  const body = warn && warn.status === "warn" ? `[WARNING: ${warn.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
