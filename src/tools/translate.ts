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

export async function translate(text: string, targetLangs: string[]): Promise<string> {
  const check = checkPrivacy(text);
  if (check.status === "block") throw new Error(check.reason);

  const langList = targetLangs.join(", ");

  let output: string;
  let provider: string;
  let model: string;

  if (text.length <= CHUNK_SIZE) {
    const messages: Message[] = [
      {
        role: "user",
        content:
          `Translate the following text into each of these languages: ${langList}.\n` +
          `For each language, output a section header like "## French" followed by the translation.\n` +
          `Return only the translations, no explanation:\n\n${text}`,
      },
    ];
    const result = await complete(messages);
    output = result.text || "No response";
    provider = result.provider;
    model = result.model;
  } else {
    const chunks = chunk(text);
    const perLangChunks: Record<string, string[]> = {};
    for (const lang of targetLangs) perLangChunks[lang] = [];
    let lastResult = { provider: "", model: "" };

    for (const c of chunks) {
      const messages: Message[] = [
        {
          role: "user",
          content:
            `Translate the following excerpt into each of these languages: ${langList}.\n` +
            `For each language, output a section header like "## French" followed by the translation.\n` +
            `Return only the translations, no explanation:\n\n${c}`,
        },
      ];
      const result = await complete(messages);
      lastResult = result;
      const raw = result.text || "";
      for (const lang of targetLangs) {
        const re = new RegExp(`##\\s*${lang}[^\n]*\n([\\s\\S]*?)(?=\\n##|$)`, "i");
        const m = raw.match(re);
        perLangChunks[lang].push(m ? m[1].trim() : "");
      }
    }

    const sections = targetLangs.map((lang) => `## ${lang}\n\n${perLangChunks[lang].join(" ")}`);
    output = sections.join("\n\n");
    provider = lastResult.provider;
    model = lastResult.model;
  }

  const result = check.status === "warn" ? `[WARNING: ${check.reason}]\n\n${output}` : output;
  return banner(result, { provider, model });
}
