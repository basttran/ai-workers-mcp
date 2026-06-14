import { load } from "cheerio";
import { gemini, MODEL } from "../gemini.js";

export async function qa(url: string, question: string): Promise<string> {
  const html = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status} ${r.statusText}`);
    return r.text();
  });

  const $ = load(html);
  $("script, style, nav, footer, header, aside").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 50_000);

  if (!text) throw new Error("No readable content found at URL");

  const response = await gemini.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Answer the question based only on the provided text. If the answer is not present in the text, say so explicitly.\n\nText:\n${text}\n\nQuestion: ${question}`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "No response from Gemini";
}
