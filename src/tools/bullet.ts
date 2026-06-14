import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";
import type { Message } from "../llm.js";

const CHUNK_SIZE = 50_000;

function chunk(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export async function bullet(text: string, max?: number): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const prompt = max
    ? `Extract the key points from the following text as a concise markdown bullet list. Return at most ${max} bullet points:`
    : `Extract the key points from the following text as a concise markdown bullet list:`;

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE) {
    const messages: Message[] = [{ role: "user", content: `${prompt}\n\n${text}` }];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    const chunks = chunk(text);
    const allBullets: string[] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [
        {
          role: "user",
          content: `Extract the key points from the following excerpt as a concise markdown bullet list:\n\n${c}`,
        },
      ];
      const result = await complete(messages);
      lastResult = result;
      allBullets.push(result.text || "");
    }

    let merged = allBullets.join("\n");
    // Dedupe exact duplicate lines
    const seen = new Set<string>();
    const deduped = merged
      .split("\n")
      .filter((line) => {
        const key = line.trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join("\n");

    const lines = deduped.split("\n").filter((l) => l.trim());
    output = max ? lines.slice(0, max).join("\n") : lines.join("\n");
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
