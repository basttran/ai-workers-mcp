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

export async function outline(text: string, depth?: number): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const maxDepth = depth ?? 3;
  const depthClause = `Use heading levels H1 through H${maxDepth} only (no deeper than H${maxDepth})`;

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE) {
    const messages: Message[] = [
      {
        role: "user",
        content: `Create a hierarchical markdown outline of the following text. ${depthClause}:\n\n${text}`,
      },
    ];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    // Chunk-outline-merge: H3+ per chunk, H1/H2 in final merge
    const chunks = chunk(text);
    const chunkOutlines: string[] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [
        {
          role: "user",
          content: `Create a detailed markdown outline of the following excerpt. Use H3 and deeper headings only (no H1 or H2 — those will be added in a final merge step):\n\n${c}`,
        },
      ];
      const result = await complete(messages);
      lastResult = result;
      chunkOutlines.push(result.text || "");
    }

    const combined = chunkOutlines.join("\n\n");
    const mergeMessages: Message[] = [
      {
        role: "user",
        content:
          `Merge the following partial outlines into a single coherent hierarchical outline. ` +
          `Add H1 and H2 headings to organize the sections. ${depthClause}:\n\n${combined}`,
      },
    ];
    const mergeResult = await complete(mergeMessages);
    output = mergeResult.text || "No response";
    provider = mergeResult.provider;
    model = mergeResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
