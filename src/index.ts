import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { summarize } from "./tools/summarize.js";
import { translate } from "./tools/translate.js";
import { generate } from "./tools/generate.js";
import { rewrite } from "./tools/rewrite.js";
import { proofread } from "./tools/proofread.js";
import { bullet } from "./tools/bullet.js";
import { outline } from "./tools/outline.js";
import { classify } from "./tools/classify.js";
import { extract } from "./tools/extract.js";
import { qa } from "./tools/qa.js";
import { compare } from "./tools/compare.js";
import { emailDraft } from "./tools/email_draft.js";

const server = new McpServer({
  name: "gemini-worker",
  version: "0.1.0",
});

server.tool(
  "gemini_summarize",
  "Fetch and summarize a URL using Gemini Flash. URL only — do not pass code or secrets.",
  { url: z.string().url().describe("URL to fetch and summarize") },
  async ({ url }) => ({
    content: [{ type: "text" as const, text: await summarize(url) }],
  })
);

server.tool(
  "gemini_translate",
  "Translate plain text to a target language using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to translate"),
    target_lang: z.string().describe("Target language, e.g. 'French', 'Japanese'"),
  },
  async ({ text, target_lang }) => ({
    content: [{ type: "text" as const, text: await translate(text, target_lang) }],
  })
);

server.tool(
  "gemini_generate",
  "Generate text from a prompt using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    prompt: z.string().describe("Generation prompt (plain prose, no code)"),
    context: z.string().optional().describe("Optional system context (plain prose, no code)"),
  },
  async ({ prompt, context }) => ({
    content: [{ type: "text" as const, text: await generate(prompt, context) }],
  })
);

server.tool(
  "gemini_rewrite",
  "Rewrite plain text in a given style using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to rewrite"),
    style: z.string().describe("Target style, e.g. 'formal', 'casual', 'concise', 'technical'"),
  },
  async ({ text, style }) => ({
    content: [{ type: "text" as const, text: await rewrite(text, style) }],
  })
);

server.tool(
  "gemini_proofread",
  "Proofread plain text and list corrections using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  { text: z.string().describe("Plain text to proofread") },
  async ({ text }) => ({
    content: [{ type: "text" as const, text: await proofread(text) }],
  })
);

server.tool(
  "gemini_bullet",
  "Extract key points from plain text as a markdown bullet list using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  { text: z.string().describe("Plain text to extract bullet points from") },
  async ({ text }) => ({
    content: [{ type: "text" as const, text: await bullet(text) }],
  })
);

server.tool(
  "gemini_outline",
  "Create a hierarchical markdown outline from plain text using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  { text: z.string().describe("Plain text to outline") },
  async ({ text }) => ({
    content: [{ type: "text" as const, text: await outline(text) }],
  })
);

server.tool(
  "gemini_classify",
  "Classify plain text into one of the provided labels using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to classify"),
    labels: z.array(z.string()).min(1).describe("List of category labels to classify into"),
  },
  async ({ text, labels }) => ({
    content: [{ type: "text" as const, text: await classify(text, labels) }],
  })
);

server.tool(
  "gemini_extract",
  "Extract named fields from plain text as JSON using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    text: z.string().describe("Plain text to extract from"),
    fields: z.array(z.string()).min(1).describe("Field names to extract, e.g. ['author', 'date', 'title']"),
  },
  async ({ text, fields }) => ({
    content: [{ type: "text" as const, text: await extract(text, fields) }],
  })
);

server.tool(
  "gemini_qa",
  "Fetch a URL and answer a specific question about its content using Gemini Flash. URL only — do not pass code or secrets.",
  {
    url: z.string().url().describe("URL to fetch"),
    question: z.string().describe("Question to answer based on the page content"),
  },
  async ({ url, question }) => ({
    content: [{ type: "text" as const, text: await qa(url, question) }],
  })
);

server.tool(
  "gemini_compare",
  "Compare two plain texts and highlight similarities and differences using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
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
  "gemini_email_draft",
  "Draft an email body from bullet points using Gemini Flash. Plain prose only — no code, secrets, or file paths.",
  {
    bullets: z.union([z.string(), z.array(z.string())]).describe("Bullet points as a string or array of strings"),
    tone: z.string().optional().describe("Email tone, e.g. 'professional', 'friendly', 'assertive'. Defaults to 'professional'."),
  },
  async ({ bullets, tone }) => ({
    content: [{ type: "text" as const, text: await emailDraft(bullets, tone) }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
