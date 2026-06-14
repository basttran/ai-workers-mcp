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

export async function proofread(text: string, language?: string): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const langClause = language ? ` for ${language}` : "";
  const prompt = `Proofread the following text${langClause}. Return the corrected text, then a brief bullet list of changes made (write "No changes needed." if the text is clean):`;

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
    const corrections: string[] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [{ role: "user", content: `${prompt}\n\n${c}` }];
      const result = await complete(messages);
      lastResult = result;
      corrections.push(result.text || "");
    }

    output = corrections.join("\n\n---\n\n");
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
