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

export async function classify(
  text: string,
  labels: string[],
  strategy?: "truncate" | "vote"
): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  if (labels.length === 0) throw new Error("labels must be a non-empty array");

  const prompt = (content: string) =>
    `Classify the following text into exactly one of these categories: ${labels.join(", ")}. Return only the category name, nothing else:\n\n${content}`;

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE || strategy === "truncate") {
    const content = text.slice(0, CHUNK_SIZE);
    const messages: Message[] = [{ role: "user", content: prompt(content) }];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    // Chunk-vote: classify each chunk, pick majority label
    const chunks = chunk(text);
    const votes: string[] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [{ role: "user", content: prompt(c) }];
      const result = await complete(messages);
      lastResult = result;
      const label = (result.text || "").trim();
      if (label) votes.push(label);
    }

    // Majority vote
    const counts: Record<string, number> = {};
    for (const v of votes) {
      const normalized = labels.find((l) => l.toLowerCase() === v.toLowerCase()) ?? v;
      counts[normalized] = (counts[normalized] ?? 0) + 1;
    }
    output = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? votes[0] ?? "No response";
    if (chunks.length > 1) {
      output += `\n\n*(chunk-vote across ${chunks.length} sections: ${Object.entries(counts).map(([k, v]) => `${k}×${v}`).join(", ")})*`;
    }
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
