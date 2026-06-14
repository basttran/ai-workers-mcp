import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { summarize } from "./tools/summarize.js";
import { translate } from "./tools/translate.js";
import { generate } from "./tools/generate.js";

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

const transport = new StdioServerTransport();
await server.connect(transport);
