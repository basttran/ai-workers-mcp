import { load } from "cheerio";
import { checkPrivacy } from "../privacy.js";
import { complete, banner } from "../llm.js";

async function fetchAndExtract(url: string): Promise<string> {
  const html = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status} ${r.statusText}`);
    return r.text();
  });
  const $ = load(html);
  $("script, style, nav, footer, header, aside").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 50_000);
  if (!text) throw new Error("No readable content found at URL");
  return text;
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

  const { text: output, provider, model } = await complete([
    {
      role: "user",
      content: `Answer the question based only on the provided text. If the answer is not present in the text, say so explicitly.\n\nText:\n${content}\n\nQuestion: ${args.question}`,
    },
  ]);

  return banner(output || "No response", { provider, model });
}
