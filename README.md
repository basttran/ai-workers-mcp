# ai-workers-mcp

MCP server that routes commodity NLP tasks (summarize, translate, rewrite, proofread, …) to **free-tier LLMs**, saving Claude tokens for work that actually needs them. Multi-provider, multi-account, with round-robin and automatic fallback.

## Tools

All exposed as `ai_*` MCP tools and as `/<verb>-ai` slash commands.

| Tool | Input | What it does |
|---|---|---|
| `ai_summarize` | `url` or `text` | Summarize a page or pasted prose |
| `ai_translate` | `text`, `target_lang` | Translate to a target language |
| `ai_generate` | `prompt`, `context?` | Generate text from a prompt |
| `ai_rewrite` | `text`, `style` | Rewrite in a given tone/style |
| `ai_proofread` | `text` | Correct and list fixes |
| `ai_bullet` | `text` | Turn prose into a bullet list |
| `ai_outline` | `text` | Build a hierarchical outline |
| `ai_classify` | `text`, `labels` | Classify into one label |
| `ai_extract` | `text`, `fields` | Extract fields as JSON |
| `ai_qa` | `url`/`text`, `question` | Answer a question about content |
| `ai_compare` | `text_a`, `text_b`, `focus?` | Compare two texts |
| `ai_email_draft` | `bullets`, `tone?` | Draft an email from notes |

Every response carries a banner showing which provider/model answered: `🔷 **gemini · gemini-2.5-flash** ────`.

## Slash commands

Each tool has three slash-command variants (36 total, in [.claude/commands/](.claude/commands/)):

- `/<verb>-ai` — result shown in chat (with banner)
- `/<verb>-ai-replace` — replaces the editor selection (banner stripped)
- `/<verb>-ai-append` — inserts the result after the selection (banner stripped)

Verbs: `generate`, `summarize`, `translate`, `rewrite`, `proofread`, `list`, `outline`, `classify`, `extract`, `ask`, `compare`, `draft`.

Input priority: **argument › editor selection › clipboard › interactive prompt**.

## Setup

### 1. Configure providers & keys

Copy the example and add your key(s):

```bash
cp ai-workers.example.json ~/.config/ai-workers.json
chmod 600 ~/.config/ai-workers.json
# edit ~/.config/ai-workers.json
```

Get a free Gemini key at [aistudio.google.com](https://aistudio.google.com). Use `gemini-2.5-flash` (the free tier; `gemini-2.0-flash` is paid-only). Add more keys to multiply your free quota, or add another provider block (Groq, Mistral, OpenRouter — any OpenAI-compatible endpoint) to `order` for cross-provider fallback.

### 2. Install (cross-platform)

**macOS / Linux / inside WSL:**

```bash
./setup.sh
```

**Windows (Claude Code on Windows, server in WSL):**

```powershell
.\setup.ps1
```

The installer builds the server, deploys the 36 slash commands to your user scope, and registers the MCP server in your Claude Code config (`node` launch on Unix, `wsl.exe` launch on Windows).

### 3. Reload Claude Code

Run `/mcp` to confirm `ai-workers` is connected.

## Portability

The core (`src/**`) is plain Node — runs identically on macOS, Linux, WSL, and Windows. The only platform-specific glue is the per-machine MCP registration, handled by the two setup scripts. Secrets live solely in `~/.config/ai-workers.json` (resolved via `homedir()`), never in the Claude config.

## Privacy

A rules-based filter runs before any text leaves your machine. It **blocks** file paths, code patterns, and credential patterns (sends nothing, returns an error), and **warns** on emails/phone numbers (prepends a notice, still sends). Keep inputs plain prose.

## Configuration reference

`~/.config/ai-workers.json` (read once at server start — reload Claude Code after edits):

```json
{
  "order": ["gemini"],
  "providers": {
    "gemini": {
      "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai/",
      "model": "gemini-2.5-flash",
      "keys": ["KEY_1", "KEY_2"]
    }
  }
}
```

Round-robin rotates across a provider's keys; `429` triggers escalating cooldown (60s → 1h), `401/403` a long cooldown, then it falls through to the next provider in `order`. Falls back to the `GEMINI_API_KEY` env var if no config file exists.

## Rebuilding after changes

```bash
npm run build   # in WSL on Windows
```

Then reload Claude Code.
