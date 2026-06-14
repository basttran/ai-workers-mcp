import { checkPrivacy, type PrivacyResult } from "../privacy.js";
import { complete, banner } from "../llm.js";

export async function generate(prompt: string, context?: string): Promise<string> {
  const promptCheck = checkPrivacy(prompt);
  if (promptCheck.status === "block") throw new Error(promptCheck.reason);

  const contextCheck: PrivacyResult = context ? checkPrivacy(context) : { status: "ok" };
  if (contextCheck.status === "block") throw new Error(`Context: ${contextCheck.reason}`);

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (context) messages.push({ role: "system", content: context });
  messages.push({ role: "user", content: prompt });

  const { text, provider, model } = await complete(messages);
  const result = text || "No response";

  const warn = [promptCheck, contextCheck].find((c) => c.status === "warn");
  const body = warn && warn.status === "warn" ? `[WARNING: ${warn.reason}]\n\n${result}` : result;
  return banner(body, { provider, model });
}
