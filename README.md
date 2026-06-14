# ai-workers-mcp

MCP server that routes commodity NLP tasks (summarize, translate, rewrite, proofread, …) to **free-tier LLMs**, saving Claude tokens for work that actually needs them. Multi-provider, multi-account, with round-robin, automatic fallback, in-memory caching, and daily usage tracking.

## Tools

All exposed as `ai_*` MCP tools and as `/<verb>-ai` slash commands.

### NLP tools

| Tool | Input | What it does |
|---|---|---|
| `ai_summarize` | `url`/`text`, `format?` | Summarize a page or prose (`paragraph` or `bullets`) |
| `ai_translate` | `text`, `target_langs` | Translate to one or more languages in one call |
| `ai_generate` | `prompt`, `context?` | Generate text from a prompt |
| `ai_rewrite` | `text`, `styles` | Rewrite in one or more styles in one call |
| `ai_proofread` | `text`, `language?` | Correct and list fixes (language-aware) |
| `ai_bullet` | `text`, `max?` | Turn prose into a bullet list (optional cap) |
| `ai_outline` | `text`, `depth?` | Build a hierarchical outline (H1–H`depth`, default 3) |
| `ai_classify` | `text`, `labels`, `strategy?` | Classify into one label; overflow: `truncate` or `vote` |
| `ai_extract` | `text`, `fields` | Extract fields as JSON |
| `ai_qa` | `url`/`text`, `question` | Answer a question about content (map-reduce for long texts) |
| `ai_compare` | `text_a`, `text_b`, `focus?` | Compare two texts |
| `ai_email_draft` | `bullets`, `tone?` | Draft an email from notes |
| `ai_keywords` | `text`, `count?` | Extract top keywords (default 10) |
| `ai_sentiment` | `text` | Sentiment analysis — label, confidence, summary |
| `ai_title` | `text`, `count?` | Generate title suggestions (default 5) |

### Observability & config tools

| Tool | Input | What it does |
|---|---|---|
| `ai_usage` | — | Show today's request/error counts per provider/key |
| `ai_reload_config` | — | Reload `~/.config/ai-workers.json` without restarting |
| `ai_set_ttl` | `tool_name`, `ttl_ms` | Override cache TTL for a tool at runtime |

Every response carries a provider/model banner: `🔷 **gemini · gemini-2.5-flash** ────`.

### Large-text support

All text tools auto-chunk inputs over 50 000 characters and merge results (map-reduce for summarize/qa, chunk-outline-merge for outline, majority-vote or truncate for classify, per-field merge for extract, concatenation for others). No manual splitting needed.

## Slash commands

Each NLP tool has three slash-command variants (48 total, in [.claude/commands/](.claude/commands/)):

- `/<verb>-ai` — result shown in chat (with banner)
- `/<verb>-ai-replace` — replaces the editor selection
- `/<verb>-ai-append` — inserts the result after the selection

NLP verbs: `generate`, `summarize`, `translate`, `rewrite`, `proofread`, `list`, `outline`, `classify`, `extract`, `ask`, `compare`, `draft`, `keywords`, `sentiment`, `title`.

Observability verbs (chat only): `usage`, `check-limits`, `configure`.

Input priority: **argument › editor selection › clipboard › interactive prompt**.

Multi-value arguments use `/` as separator:
- `/translate-ai en/es/nl` → translates into English, Spanish, and Dutch in one call
- `/rewrite-ai formal/concise` → returns both rewrites in one response

### Overflow handling

For very long inputs (> 50 000 chars), slash commands for `classify` ask which strategy to use:
1. **truncate** — classify the first 50 000 characters only
2. **vote** — classify each chunk independently, return the majority label
3. **skip** — cancel

`/ask-ai` and `/outline-ai` handle overflow automatically (map-reduce and chunk-outline-merge respectively).

## Setup

### 1. Configure providers & keys

Copy the example and add your key(s):

```bash
cp ai-workers.example.json ~/.config/ai-workers.json
chmod 600 ~/.config/ai-workers.json
# edit ~/.config/ai-workers.json
```

Get a free Gemini key at [aistudio.google.com](https://aistudio.google.com). Use `gemini-2.5-flash` (free tier). Add more keys to multiply your free quota, or add Groq/Mistral/OpenRouter blocks to `order` for cross-provider fallback.

### 2. Install (cross-platform)

**macOS / Linux / inside WSL:**

```bash
./setup.sh
```

**Windows (Claude Code on Windows, server in WSL):**

```powershell
.\setup.ps1
```

The installer builds the server, deploys the slash commands to your user scope, and registers the MCP server in your Claude Code config.

### 3. Reload Claude Code

Run `/mcp` to confirm `ai-workers` is connected.

## Portability

The core (`src/**`) is plain Node — runs identically on macOS, Linux, WSL, and Windows. The only platform-specific glue is the per-machine MCP registration, handled by the two setup scripts. Secrets live solely in `~/.config/ai-workers.json` (resolved via `homedir()`), never in the Claude config.

## Privacy

A rules-based filter runs before any text leaves your machine. It **blocks** file paths, code patterns, and credential patterns (sends nothing, returns an error), and **warns** on emails/phone numbers (prepends a notice, still sends). Keep inputs plain prose.

## Configuration reference

`~/.config/ai-workers.json` — read once at server start (use `/configure-ai reload` or `ai_reload_config` to apply changes live):

```json
{
  "order": ["gemini", "groq", "mistral"],
  "providers": {
    "gemini": {
      "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai/",
      "model": "gemini-2.5-flash",
      "keys": ["KEY_1", "KEY_2"],
      "dailyLimit": 1000
    },
    "groq": {
      "baseURL": "https://api.groq.com/openai/v1/",
      "model": "llama-3.3-70b-versatile",
      "keys": ["YOUR_GROQ_KEY"],
      "dailyLimit": 1000
    },
    "mistral": {
      "baseURL": "https://api.mistral.ai/v1/",
      "model": "mistral-small-latest",
      "keys": ["YOUR_MISTRAL_KEY"],
      "dailyLimit": 1000
    }
  }
}
```

Round-robin rotates across a provider's keys; `429` triggers escalating cooldown (60s → 1h), `401/403` a long cooldown, then falls through to the next provider in `order`. Falls back to the `GEMINI_API_KEY` env var if no config file exists.

## Caching

Text and URL results are cached in memory per tool:

| Tool | Default TTL |
|---|---|
| `ai_summarize`, `ai_qa` | 1 hour |
| all others | 5 minutes |

Override at runtime: `/configure-ai ttl <tool> <ms>` or call `ai_set_ttl` directly.

## Usage tracking

Every LLM call is recorded to `~/.config/ai-workers-usage.json` (per-key ok/error counts, reset at Pacific midnight). Run `/usage-ai` or call `ai_usage` to see today's table.

## Rebuilding after changes

```bash
npm run build
```

Then reload Claude Code (or use `ai_reload_config` if only the JSON config changed).
