import { checkPrivacy } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function compare(textA: string, textB: string, focus?: string): Promise<string> {
  const checkA = checkPrivacy(textA);
  if (checkA.status === "block") throw new Error(`Text A: ${checkA.reason}`);

  const checkB = checkPrivacy(textB);
  if (checkB.status === "block") throw new Error(`Text B: ${checkB.reason}`);

  const focusClause = focus ? `, focusing on ${focus}` : "";
  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Compare the following two texts${focusClause}. Highlight key similarities and differences:\n\nText A:\n${textA}\n\nText B:\n${textB}`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content ?? "No response from Gemini";

  const warn = [checkA, checkB].find((c) => c.status === "warn");
  return warn && warn.status === "warn" ? `[WARNING: ${warn.reason}]\n\n${result}` : result;
}
