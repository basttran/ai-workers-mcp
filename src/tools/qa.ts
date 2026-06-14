import { load } from "cheerio";
import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";
import type { Message } from "../llm.js";

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

export async function qa(args: { url?: string; text?: string; question: string }): Promise<string> {
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

  let output: string;
  let provider: string;
  let model: string;

  if (content.length <= CHUNK_SIZE) {
    const messages: Message[] = [
      {
        role: "user",
        content: `Answer the question based only on the provided text. If the answer is not present in the text, say so explicitly.\n\nText:\n${content}\n\nQuestion: ${args.question}`,
      },
    ];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    // Map-reduce: answer per chunk, then synthesize
    const chunks = chunk(content);
    const partialAnswers: string[] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [
        {
          role: "user",
          content: `Answer the following question based only on this excerpt. If the answer is not in this excerpt, say "Not found in this section."\n\nExcerpt:\n${c}\n\nQuestion: ${args.question}`,
        },
      ];
      const result = await complete(messages);
      lastResult = result;
      const answer = result.text || "";
      if (answer && !answer.toLowerCase().includes("not found in this section")) {
        partialAnswers.push(answer);
      }
    }

    if (partialAnswers.length === 0) {
      output = "The answer was not found in the provided text.";
    } else if (partialAnswers.length === 1) {
      output = partialAnswers[0];
    } else {
      const synthMessages: Message[] = [
        {
          role: "user",
          content: `Synthesize the following partial answers to the question "${args.question}" into a single coherent response:\n\n${partialAnswers.map((a, i) => `[${i + 1}] ${a}`).join("\n\n")}`,
        },
      ];
      const synthResult = await complete(synthMessages);
      output = synthResult.text || partialAnswers[0];
      lastResult = synthResult;
    }

    provider = lastResult.provider;
    model = lastResult.model;
  }

  return banner(output, { provider, model });
}
