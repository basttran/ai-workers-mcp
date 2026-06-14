import { checkPrivacy, type PrivacyResult } from "../privacy.js";
import { gemini, MODEL } from "../gemini.js";

export async function generate(prompt: string, context?: string): Promise<string> {
  const promptCheck = checkPrivacy(prompt);
  if (promptCheck.status === "block") throw new Error(promptCheck.reason);

  const contextCheck: PrivacyResult = context ? checkPrivacy(context) : { status: "ok" };
  if (contextCheck.status === "block") throw new Error(`Context: ${contextCheck.reason}`);

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (context) messages.push({ role: "system", content: context });
  messages.push({ role: "user", content: prompt });

  const response = await gemini.chat.completions.create({ model: MODEL, messages });
  const result = response.choices[0]?.message?.content ?? "No response from Gemini";

  const warn = [promptCheck, contextCheck].find((c) => c.status === "warn");
  return warn && warn.status === "warn" ? `[WARNING: ${warn.reason}]\n\n${result}` : result;
}
