import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import OpenAI from "openai";
import { z } from "zod";
import { track } from "./usage.js";

const CONFIG_PATH = join(homedir(), ".config", "ai-workers.json");

const ProviderConfigSchema = z.object({
  baseURL: z.string().url(),
  model: z.string().min(1),
  keys: z.array(z.string().min(1)).min(1),
});
const LlmConfigSchema = z.object({
  order: z.array(z.string()).min(1),
  providers: z.record(ProviderConfigSchema),
});
type LlmConfig = z.infer<typeof LlmConfigSchema>;

function loadConfig(): LlmConfig {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    return LlmConfigSchema.parse(JSON.parse(raw));
  } catch (err) {
    // Backward-compat: synthesize a single-provider config from GEMINI_API_KEY.
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      return {
        order: ["gemini"],
        providers: {
          gemini: {
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            model: "gemini-2.5-flash",
            keys: [key],
          },
        },
      };
    }
    throw new Error(
      `No LLM config at ${CONFIG_PATH} and GEMINI_API_KEY is unset (${(err as Error).message})`
    );
  }
}

let config = loadConfig();

export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type CompletionResult = { text: string; provider: string; model: string };

// State below is module-level and persists for the lifetime of the (long-running) server.
const cursor: Record<string, number> = {}; // round-robin position per provider
const cooldownUntil = new Map<string, number>(); // keyId -> epoch ms until usable
const failCount = new Map<string, number>(); // keyId -> consecutive failures (for backoff)
const clients = new Map<string, OpenAI>(); // keyId -> cached client

function clientFor(provider: string, idx: number): OpenAI {
  const id = `${provider}#${idx}`;
  let c = clients.get(id);
  if (!c) {
    const p = config.providers[provider];
    c = new OpenAI({ baseURL: p.baseURL, apiKey: p.keys[idx] });
    clients.set(id, c);
  }
  return c;
}

// Escalating backoff: 60s, 2m, 4m, ... capped at 1h. Reset on the key's next success.
function backoffMs(id: string): number {
  const n = (failCount.get(id) ?? 0) + 1;
  failCount.set(id, n);
  return Math.min(60_000 * 2 ** (n - 1), 3_600_000);
}

/**
 * Send a chat completion through the configured providers.
 * Tries each provider in `order`; within a provider, rotates round-robin across its
 * keys, skipping any in cooldown. 429 -> escalating cooldown, 401/403 -> long cooldown
 * (bad key), other errors -> short cooldown. Falls through to the next provider when a
 * provider's keys are all exhausted.
 */
export async function complete(
  messages: Message[],
  opts?: { model?: string }
): Promise<CompletionResult> {
  const errors: string[] = [];

  for (const provider of config.order) {
    const p = config.providers[provider];
    if (!p) continue;
    const n = p.keys.length;
    const start = cursor[provider] ?? 0;

    for (let attempt = 0; attempt < n; attempt++) {
      const idx = (start + attempt) % n;
      const id = `${provider}#${idx}`;
      if ((cooldownUntil.get(id) ?? 0) > Date.now()) continue;

      try {
        const model = opts?.model ?? p.model;
        const resp = await clientFor(provider, idx).chat.completions.create({ model, messages });
        cursor[provider] = (idx + 1) % n; // advance so the next call starts on the next key
        failCount.delete(id);
        track(provider, idx, true);
        return { text: resp.choices[0]?.message?.content ?? "", provider, model };
      } catch (err) {
        const status = (err as { status?: number }).status;
        const cd =
          status === 401 || status === 403
            ? 3_600_000
            : status === 429
              ? backoffMs(id)
              : 10_000;
        cooldownUntil.set(id, Date.now() + cd);
        track(provider, idx, false);
        errors.push(`${id}: ${status ?? (err as Error).message}`);
      }
    }
  }

  throw new Error(`All LLM providers/keys exhausted — ${errors.join("; ")}`);
}

export function reloadConfig(): void {
  config = loadConfig();
  for (const key of Object.keys(cursor)) delete cursor[key];
  cooldownUntil.clear();
  failCount.clear();
  clients.clear();
}

export function banner(body: string, meta: { provider: string; model: string }): string {
  return `🔷 **${meta.provider} · ${meta.model}** ────────────────\n\n${body}\n\n────────────────`;
}
