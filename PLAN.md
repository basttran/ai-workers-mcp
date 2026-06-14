# ai-workers-mcp Evolution Plan

> Session state as of 2026-06-14. Resume from any machine.

## What's already done

- `~/.config/rtk/filters.toml` — added `[filters.npm-build]` filter (strips npm script header noise from `npm run build`/typecheck output)
- `~/.config/rtk/config.toml` — reduced `grep_max_results` from 200 → 50
- Worktree `.claude/settings.local.json` — added `Write`, `Edit`, `Bash(npm run *)`, `Bash(find *)`, `Bash(mkdir -p *)` permissions for implementation (**revert these after implementation is done**)

---

## Sprint 1 — Core + Tool Enhancements (parallelizable)

Implement all items below in the worktree branch. Build-verify after each group.

### C1 — `src/cache.ts` (new, standalone — implement first, others import it)

```ts
// Exports:
export function cachedComplete(
  toolName: string,
  messages: Message[],
  completeFn: () => Promise<CompletionResult>
): Promise<CompletionResult>

export function setTtl(toolName: string, ttlMs: number): void
```

- Key = `sha1(toolName + JSON.stringify(messages))` (use node's `crypto.createHash('sha1')`)
- TTL per tool:
  - `summarize`, `qa` → 3_600_000 ms (1h, URL tools)
  - all others → 300_000 ms (5min, text tools)
- In-memory `Map<string, { result: CompletionResult; expiresAt: number }>`
- `setTtl(toolName, ttlMs)` overrides default for that tool at runtime (used by `/configure-ai`)
- No dependency on `llm.ts` — tools import both independently

### C2 — `src/usage.ts` (new) + `src/llm.ts` (add track + reloadConfig)

**`src/usage.ts`:**

```ts
// File: ~/.config/ai-workers-usage.json
// Shape: { date: "YYYY-MM-DD", counts: { "gemini#0": { ok: 12, err: 1 }, ... } }

export function track(provider: string, keyIdx: number, success: boolean): void
export function getUsage(): Record<string, { ok: number; err: number }>
// Resets counts when date (US Pacific midnight) changes
```

- Date comparison: `new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })`
- Writes file synchronously after each track call (small, infrequent)

**`src/llm.ts` additions:**

```ts
// After successful completion in complete():
track(provider, idx, true);
// After each catch in complete():
track(provider, idx, false);

// New export:
export function reloadConfig(): void {
  // re-reads ~/.config/ai-workers.json, clears cursor/cooldownUntil/failCount/clients maps
  // assigns new config to module-level variable
}
```

Note: `config` must become a `let` (not `const`) for reloadConfig to work.

### C3 — `ai-workers.example.json` (extend existing file)

Add Groq and Mistral provider blocks. Existing file has `gemini` block — add after it:

```json
{
  "order": ["gemini", "groq", "mistral"],
  "providers": {
    "gemini": { ... },
    "groq": {
      "baseURL": "https://api.groq.com/openai/v1/",
      "model": "llama-3.3-70b-versatile",
      "keys": ["YOUR_GROQ_KEY_HERE"],
      "dailyLimit": 1000
    },
    "mistral": {
      "baseURL": "https://api.mistral.ai/v1/",
      "model": "mistral-small-latest",
      "keys": ["YOUR_MISTRAL_KEY_HERE"],
      "dailyLimit": 1000
    }
  }
}
```

### A1 — `src/tools/summarize.ts`

1. Fix `fetchAndExtract`: before falling back to `body`, try `article`, `main`, `[role=main]` selectors in order
2. Add optional `format?: 'paragraph' | 'bullets'` param (default: paragraph)
3. Auto-chunk: if text > 50_000 chars, split into 50k chunks, summarize each, then summarize the summaries (map-reduce)
4. Use `cachedComplete` from `src/cache.ts` (import it)

**Updated tool registration in `src/index.ts`:**
```ts
{
  url: z.string().url().optional(),
  text: z.string().optional(),
  format: z.enum(['paragraph', 'bullets']).optional().describe("Output format (default: paragraph)"),
}
```

### A2 — `src/tools/qa.ts`

Same `fetchAndExtract` fix as A1 (target `article`/`main`/`[role=main]` before `body`).
No other changes for Sprint 1 (overflow strategy is Sprint 2).

### A3 — `src/tools/translate.ts`

- Change signature: `target_lang: string` → `target_langs: string[]`
- Single LLM call: ask for all target languages in one prompt, returning labeled sections
- Auto-chunk: if text > 50_000 chars, chunk and translate each chunk per language, concatenate
- Update `src/index.ts` registration: `target_langs: z.array(z.string()).min(1)`

### A4 — `src/tools/rewrite.ts`

- Change signature: `style: string` → `styles: string[]`
- Single LLM call returning all styles as labeled sections
- Auto-chunk + concatenate per style
- Update `src/index.ts` registration: `styles: z.array(z.string()).min(1)`

### A5 — `src/tools/bullet.ts`

- Add `max?: number` param (maximum bullet points to return)
- Auto-chunk: chunk at 50k, bullet each chunk, merge all bullets, dedupe by semantic similarity (simple: dedupe exact matches, keep top N if `max` set)
- Update `src/index.ts` registration: add `max: z.number().int().positive().optional()`

### A6 — `src/tools/outline.ts`

- Add `depth?: number` param (heading depth limit, default 3: H1/H2/H3)
- No auto-chunking in Sprint 1
- Update `src/index.ts` registration: add `depth: z.number().int().min(1).max(6).optional()`

### A7 — `src/tools/proofread.ts`

- Add `language?: string` param (e.g. 'French', 'British English'; default: auto-detect)
- Auto-chunk: chunk at 50k, proofread each, concatenate corrections
- Update `src/index.ts` registration: add `language: z.string().optional()`

### A8 — `src/tools/extract.ts`

- Auto-chunk: chunk at 50k, extract fields from each chunk, merge by field (union arrays, prefer non-null scalars from first chunk)
- No new params

### B1 — `src/tools/title.ts` (new)

```ts
export async function titleSuggest(text: string, count?: number): Promise<string>
// Prompt: "Generate {count ?? 5} title suggestions for the following text. Return as a numbered list."
// Returns the LLM response directly
```

### B2 — `src/tools/sentiment.ts` (new)

```ts
export async function sentiment(text: string): Promise<string>
// Prompt: "Analyze the sentiment of the following text. Return JSON: { label: 'positive'|'negative'|'neutral', confidence: 0.0-1.0, summary: string }"
// Returns formatted result
```

### B3 — `src/tools/keywords.ts` (new)

```ts
export async function keywords(text: string, count?: number): Promise<string>
// Prompt: "Extract the {count ?? 10} most important keywords from the following text. Return as a comma-separated list."
```

### `src/index.ts` — B1/B2/B3 registrations

Add alphabetically ordered imports and registrations:

```ts
import { keywords } from "./tools/keywords.js";
import { titleSuggest } from "./tools/title.js";
import { sentiment } from "./tools/sentiment.js";
```

Tool registrations:
```ts
server.tool("ai_keywords", "Extract top keywords from plain text.", {
  text: z.string(),
  count: z.number().int().positive().optional().describe("Number of keywords (default 10)"),
}, async ({ text, count }) => ({ content: [{ type: "text" as const, text: await keywords(text, count) }] }));

server.tool("ai_sentiment", "Analyze sentiment of plain text. Returns label, confidence, and summary.", {
  text: z.string(),
}, async ({ text }) => ({ content: [{ type: "text" as const, text: await sentiment(text) }] }));

server.tool("ai_title", "Generate title suggestions for plain text.", {
  text: z.string(),
  count: z.number().int().positive().optional().describe("Number of titles to generate (default 5)"),
}, async ({ text, count }) => ({ content: [{ type: "text" as const, text: await titleSuggest(text, count) }] }));
```

### Slash commands for B1/B2/B3

9 new files in `.claude/commands/`. Model existing commands (e.g. `list-ai.md`) for structure.

**`keywords-ai.md`** — extracts from current selection, optional `$COUNT` arg (split `/` not needed, single int)
**`keywords-ai-replace.md`** — replaces selection with keyword list
**`keywords-ai-append.md`** — appends keyword list below selection

**`sentiment-ai.md`** — analyzes selection
**`sentiment-ai-replace.md`** / **`sentiment-ai-append.md`**

**`title-ai.md`** — suggests titles for selection, optional `$COUNT`
**`title-ai-replace.md`** / **`title-ai-append.md`**

**Multi-value arg syntax for existing slash commands (update these):**
- `translate-ai.md`: `$ARGS` split on `/` → `target_langs` array, e.g. `/translate-ai en/es/nl`
- `rewrite-ai.md`: same split for `styles`, e.g. `/rewrite-ai formal/concise`

---

## Sprint 2 — Observability + Configure (implement after Sprint 1 builds clean)

### D1 — `/usage-ai` slash command

Calls `getUsage()` from `src/usage.ts` and renders a table:
```
Provider   Key   Requests Today   Errors
gemini     #0    47               2
groq       #0    12               0
```

### D2 — `/check-limits-ai` slash command

Uses `ai_qa` tool to query Google AI Studio quotas page for `dailyLimit` info.
Prompts user for a new URL if the page returns 404 or no limit is found.
Updates `dailyLimit` in `~/.config/ai-workers.json`.

### D3 — `/configure-ai` slash command (runtime config tool)

Supports:
- Setting/rotating API keys (guided flow for `~/.config/ai-workers.json`)
- Adjusting cache TTLs per tool at runtime (calls `setTtl()`)
- Calling `reloadConfig()` after config file changes
- Viewing current provider order and key count per provider

### D4 — Overflow slash commands for classify/qa/outline

When input exceeds Gemini's context window:
- `classify`: prompt user to choose: truncate / chunk-vote / skip
- `qa`: map-reduce (answer each chunk, synthesize)
- `outline`: chunk-outline-merge (H3+ per chunk, H1/H2 in final merge)

---

## Post-implementation checklist

- [ ] `npm run build` passes clean
- [ ] `npm run typecheck` passes clean
- [ ] All new tools registered in `src/index.ts`
- [ ] All slash commands created (9 new + 2 updated)
- [ ] Commit with message `feat: sprint 1 — cache, usage tracking, tool enhancements, 3 new tools`
- [ ] **REVERT** worktree `.claude/settings.local.json` — remove these lines added for implementation:
  ```json
  "Write(/home/basttran/code/ai-workers-mcp/**)",
  "Edit(/home/basttran/code/ai-workers-mcp/**)",
  "Bash(npm run *)",
  "Bash(npm install)",
  "Bash(find *)",
  "Bash(mkdir -p *)"
  ```
- [ ] Final commit: `chore: revert implementation permissions`

---

## Parallelization note

C1 (`cache.ts`) has no dependencies — implement it first (or in parallel with C3).
C2 (`usage.ts` + `llm.ts`) is independent of C1.
A1–A8 can each be done in parallel; they only need C1 to be importable.
B1–B3 are independent of A1–A8.
`src/index.ts` changes for B1–B3 are additive (alphabetical imports = no merge conflicts).
