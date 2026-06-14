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

function mergeExtractions(
  results: Array<Record<string, unknown>>,
  fields: string[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const field of fields) {
    for (const r of results) {
      const val = r[field];
      if (val === null || val === undefined || val === "") continue;
      if (Array.isArray(val)) {
        const existing = merged[field];
        merged[field] = Array.isArray(existing) ? [...existing, ...val] : val;
      } else {
        if (merged[field] === undefined || merged[field] === null || merged[field] === "") {
          merged[field] = val;
        }
      }
    }
    if (merged[field] === undefined) merged[field] = null;
  }
  return merged;
}

export async function extract(text: string, fields: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (fields.length === 0) throw new Error("fields must be a non-empty array");

  const promptBase = `Extract the following fields from the text and return as JSON: ${fields.join(", ")}. Return only valid JSON with no markdown fences:`;

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE) {
    const messages: Message[] = [{ role: "user", content: `${promptBase}\n\n${text}` }];
    const result = await complete(messages);
    provider = result.provider;
    model = result.model;
    const raw = result.text || "No response";
    try {
      JSON.parse(raw);
      output = raw;
    } catch {
      output = `[WARNING: LLM returned non-JSON output]\n\n${raw}`;
    }
  } else {
    const chunks = chunk(text);
    const parsed: Array<Record<string, unknown>> = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [{ role: "user", content: `${promptBase}\n\n${c}` }];
      const result = await complete(messages);
      lastResult = result;
      try {
        parsed.push(JSON.parse(result.text || "{}") as Record<string, unknown>);
      } catch {
        // skip unparseable chunks
      }
    }

    const merged = mergeExtractions(parsed, fields);
    output = JSON.stringify(merged, null, 2);
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const body = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(body, { provider, model });
}
