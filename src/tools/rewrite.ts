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

export async function rewrite(text: string, styles: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const styleList = styles.join(", ");

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE) {
    const messages: Message[] = [
      {
        role: "user",
        content:
          `Rewrite the following text in each of these styles: ${styleList}.\n` +
          `For each style, output a section header like "## Formal" followed by the rewrite.\n` +
          `Return only the rewrites, no explanation:\n\n${text}`,
      },
    ];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    const chunks = chunk(text);
    const perStyleChunks: Record<string, string[]> = {};
    for (const style of styles) perStyleChunks[style] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [
        {
          role: "user",
          content:
            `Rewrite the following excerpt in each of these styles: ${styleList}.\n` +
            `For each style, output a section header like "## Formal" followed by the rewrite.\n` +
            `Return only the rewrites, no explanation:\n\n${c}`,
        },
      ];
      const result = await complete(messages);
      lastResult = result;
      const raw = result.text || "";
      for (const style of styles) {
        const re = new RegExp(`##\\s*${style}[^\n]*\n([\\s\\S]*?)(?=\\n##|$)`, "i");
        const m = raw.match(re);
        perStyleChunks[style].push(m ? m[1].trim() : "");
      }
    }

    const sections = styles.map((style) => `## ${style}\n\n${perStyleChunks[style].join(" ")}`);
    output = sections.join("\n\n");
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
