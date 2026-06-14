import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { bullet } from "./tools/bullet.js";
import { classify } from "./tools/classify.js";
import { compare } from "./tools/compare.js";
import { emailDraft } from "./tools/email_draft.js";
import { extract } from "./tools/extract.js";
import { generate } from "./tools/generate.js";
import { keywords } from "./tools/keywords.js";
import { outline } from "./tools/outline.js";
import { proofread } from "./tools/proofread.js";
import { qa } from "./tools/qa.js";
import { rewrite } from "./tools/rewrite.js";
import { sentiment } from "./tools/sentiment.js";
import { summarize } from "./tools/summarize.js";
import { titleSuggest } from "./tools/title.js";
import { translate } from "./tools/translate.js";

const server = new McpServer({
  name: "ai-workers",
  version: "0.3.0",
});

server.tool(
  "ai_summarize",
  "Summarize a URL or plain text using a configured free LLM. Pass url OR text (not both). Plain text only — no code or secrets.",
  {
    url: z.string().url().optional().describe("URL to fetch and summarize"),
    text: z.string().optional().describe("Plain text to summarize"),
    format: z.enum(["paragraph", "bullets"]).optional().describe("Output format (default: paragraph)"),
  },
  async ({ url, text, format }) => ({
    content: [{ type: "text" as const, text: await summarize({ url, text, format }) }],
  })
);

server.tool(
  "ai_translate",
  "Translate plain text to one or more target languages using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to translate"),
    target_langs: z.array(z.string()).min(1).describe("Target languages, e.g. ['French', 'Japanese']"),
  },
  async ({ text, target_langs }) => ({
    content: [{ type: "text" as const, text: await translate(text, target_langs) }],
  })
);

server.tool(
  "ai_generate",
  "Generate text from a prompt using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    prompt: z.string().describe("Generation prompt (plain prose, no code)"),
    context: z.string().optional().describe("Optional system context (plain prose, no code)"),
  },
  async ({ prompt, context }) => ({
    content: [{ type: "text" as const, text: await generate(prompt, context) }],
  })
);

server.tool(
  "ai_rewrite",
  "Rewrite plain text in one or more styles using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to rewrite"),
    styles: z.array(z.string()).min(1).describe("Target styles, e.g. ['formal', 'concise']"),
  },
  async ({ text, styles }) => ({
    content: [{ type: "text" as const, text: await rewrite(text, styles) }],
  })
);

server.tool(
  "ai_proofread",
  "Proofread plain text and list corrections using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to proofread"),
    language: z.string().optional().describe("Language or variant to proofread for, e.g. 'French', 'British English' (default: auto-detect)"),
  },
  async ({ text, language }) => ({
    content: [{ type: "text" as const, text: await proofread(text, language) }],
  })
);

server.tool(
  "ai_bullet",
  "Extract key points from plain text as a markdown bullet list using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to extract bullet points from"),
    max: z.number().int().positive().optional().describe("Maximum number of bullet points to return"),
  },
  async ({ text, max }) => ({
    content: [{ type: "text" as const, text: await bullet(text, max) }],
  })
);

server.tool(
  "ai_outline",
  "Create a hierarchical markdown outline from plain text using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to outline"),
    depth: z.number().int().min(1).max(6).optional().describe("Maximum heading depth (default: 3)"),
  },
  async ({ text, depth }) => ({
    content: [{ type: "text" as const, text: await outline(text, depth) }],
  })
);

server.tool(
  "ai_classify",
  "Classify plain text into one of the provided labels using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to classify"),
    labels: z.array(z.string()).min(1).describe("List of category labels to classify into"),
  },
  async ({ text, labels }) => ({
    content: [{ type: "text" as const, text: await classify(text, labels) }],
  })
);

server.tool(
  "ai_extract",
  "Extract named fields from plain text as JSON using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to extract from"),
    fields: z.array(z.string()).min(1).describe("Field names to extract, e.g. ['author', 'date', 'title']"),
  },
  async ({ text, fields }) => ({
    content: [{ type: "text" as const, text: await extract(text, fields) }],
  })
);

server.tool(
  "ai_qa",
  "Answer a question about a URL or plain text using a configured free LLM. Pass url OR text (not both). Plain text only — no code or secrets.",
  {
    url: z.string().url().optional().describe("URL to fetch"),
    text: z.string().optional().describe("Plain text to answer from"),
    question: z.string().describe("Question to answer based on the content"),
  },
  async ({ url, text, question }) => ({
    content: [{ type: "text" as const, text: await qa({ url, text, question }) }],
  })
);

server.tool(
  "ai_compare",
  "Compare two plain texts and highlight similarities and differences using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    text_a: z.string().describe("First text"),
    text_b: z.string().describe("Second text"),
    focus: z.string().optional().describe("Optional aspect to focus the comparison on, e.g. 'tone', 'structure'"),
  },
  async ({ text_a, text_b, focus }) => ({
    content: [{ type: "text" as const, text: await compare(text_a, text_b, focus) }],
  })
);

server.tool(
  "ai_email_draft",
  "Draft an email body from bullet points using a configured free LLM. Plain prose only — no code, secrets, or file paths.",
  {
    bullets: z.union([z.string(), z.array(z.string())]).describe("Bullet points as a string or array of strings"),
    tone: z.string().optional().describe("Email tone, e.g. 'professional', 'friendly', 'assertive'. Defaults to 'professional'."),
  },
  async ({ bullets, tone }) => ({
    content: [{ type: "text" as const, text: await emailDraft(bullets, tone) }],
  })
);

server.tool(
  "ai_keywords",
  "Extract top keywords from plain text.",
  {
    text: z.string().describe("Plain text to extract keywords from"),
    count: z.number().int().positive().optional().describe("Number of keywords (default 10)"),
  },
  async ({ text, count }) => ({
    content: [{ type: "text" as const, text: await keywords(text, count) }],
  })
);

server.tool(
  "ai_sentiment",
  "Analyze sentiment of plain text. Returns label, confidence, and summary.",
  {
    text: z.string().describe("Plain text to analyze"),
  },
  async ({ text }) => ({
    content: [{ type: "text" as const, text: await sentiment(text) }],
  })
);

server.tool(
  "ai_title",
  "Generate title suggestions for plain text.",
  {
    text: z.string().describe("Plain text to generate titles for"),
    count: z.number().int().positive().optional().describe("Number of titles to generate (default 5)"),
  },
  async ({ text, count }) => ({
    content: [{ type: "text" as const, text: await titleSuggest(text, count) }],
  })
);

const transport = new StdioServerTransport();

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

try {
  await server.connect(transport);
} catch (err) {
  console.error("Failed to connect server:", err);
  process.exit(1);
}
