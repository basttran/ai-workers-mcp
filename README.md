# gemini-worker-mcp

MCP server that routes commodity NLP tasks (summarize, translate, generate) to Gemini 2.0 Flash via its free tier, saving Claude tokens for work that actually needs them.

**Free tier limits:** 15 req/min · 1 500 req/day · no billing required.

## Tools

| Tool | Input | What it does |
|---|---|---|
| `gemini_summarize` | `url` | Fetches the page, strips boilerplate, returns a concise summary |
| `gemini_translate` | `text`, `target_lang` | Translates plain prose to the target language |
| `gemini_generate` | `prompt`, `context?` | Generates text from a prompt with an optional system context |

All tools reject code, file paths, and secrets before sending anything to Gemini (see [Privacy](#privacy)).

## Setup

### 1. Get a free Gemini API key

Go to [aistudio.google.com](https://aistudio.google.com), sign in, and create an API key. The key starts with `AIza…`.

### 2. Build

```bash
git clone <this-repo> gemini-worker-mcp
cd gemini-worker-mcp
npm install
npm run build
```

### 3. Register with Claude Code

Add the `mcpServers` block to your Claude Code `settings.json` (`~/.claude/settings.json` for global, or `.claude/settings.json` in a project):

```json
{
  "mcpServers": {
    "gemini-worker": {
      "command": "node",
      "args": ["/path/to/gemini-worker-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "AIza…your-key-here"
      }
    }
  }
}
```

Replace `/path/to/gemini-worker-mcp/` with the absolute path to where you cloned the repo.

### 4. Restart Claude Code

MCP servers load at startup. Fully quit and reopen. Run `/mcp` to confirm `gemini-worker` appears as connected.

## Usage

Tell Claude explicitly to delegate:

```
Use gemini_summarize on https://example.com/some-long-article
```

```
Use gemini_translate to translate this paragraph to Japanese: "…"
```

```
Use gemini_generate to write a short product description for a CLI dev tool
```

## Privacy

A rules-based filter runs before any text is sent to Gemini. It **blocks** (returns an error, sends nothing):

- File paths (`/home/`, `./src/`, `~/`)
- Code patterns (backtick blocks, `function`, `const`, `import`)
- Credential patterns (`API_KEY=`, `SECRET=`, `TOKEN=`, `PASSWORD=`)

It **warns** (prepends a notice, still sends):

- Email addresses
- Phone numbers

Keep inputs plain prose. Passing code or config to these tools will error intentionally.

## Rebuilding after changes

```bash
npm run build
```

Then restart Claude Code to reload the server.

## Extending

Each tool is a self-contained module under `src/tools/`. The Gemini client in `src/gemini.ts` uses the OpenAI-compatible endpoint — swapping to Groq, Mistral, or OpenRouter is a one-line change (base URL + key).
