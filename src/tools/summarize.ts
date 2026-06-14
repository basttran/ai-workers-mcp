import { load } from "cheerio";
import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";
import { cachedComplete } from "../cache.js";

const CHUNK_SIZE = 50_000;

async function fetchAndExtract(url: string): Promise<string> {
  const html = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status} ${r.statusText}`);
    return r.text();
  });
  const $ = load(html);
  $("script, style, nav, footer, header, aside").remove();
  const text =
    ($("article").text() ||
      $("main").text() ||
      $("[role=main]").text() ||
      $("body").text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50_000);
  if (!text) throw new Error("No readable content found at URL");
  return text;
}

function chunk(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export async function summarize(args: {
  url?: string;
  text?: string;
  format?: "paragraph" | "bullets";
}): Promise<string> {
  let content: string;
  if (args.text) {
    const check = checkPrivacy(args.text);
    if (check.status === "block") throw new Error(check.reason);
    content = args.text;
  } else if (args.url) {
    content = await fetchAndExtract(args.url);
  } else {
    throw new Error("Provide either url or text");
  }

  const format = args.format ?? "paragraph";
  const formatInstruction =
    format === "bullets"
      ? "Summarize this content as a concise markdown bullet list:"
      : "Summarize this content concisely:";

  let output: string;
  let provider: string;
  let model: string;

  if (content.length <= CHUNK_SIZE) {
    const messages: import("../llm.js").Message[] = [
      { role: "user", content: `${formatInstruction}\n\n${content}` },
    ];
    const result = await cachedComplete("summarize", messages, () => complete(messages));
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    const chunks = chunk(content);
    const chunkSummaries: string[] = [];
    let lastResult = { provider: "", model: "" };
    for (const c of chunks) {
      const messages: import("../llm.js").Message[] = [
        { role: "user", content: `Summarize this excerpt concisely:\n\n${c}` },
      ];
      const result = await cachedComplete("summarize", messages, () => complete(messages));
      chunkSummaries.push(result.text || "");
      lastResult = result;
    }
    const combined = chunkSummaries.join("\n\n");
    const finalMessages: import("../llm.js").Message[] = [
      {
        role: "user",
        content: `${formatInstruction}\n\n${combined}`,
      },
    ];
    const finalResult = await cachedComplete("summarize", finalMessages, () => complete(finalMessages));
    output = finalResult.text || "No response";
    provider = finalResult.provider;
    model = finalResult.model;
  }

  return banner(output, { provider, model });
}
