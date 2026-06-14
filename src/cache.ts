import { createHash } from "node:crypto";
import type { Message, CompletionResult } from "./llm.js";

const DEFAULT_TTLS: Record<string, number> = {
  summarize: 3_600_000,
  qa: 3_600_000,
};
const DEFAULT_TTL = 300_000;

const store = new Map<string, { result: CompletionResult; expiresAt: number }>();
const ttlOverrides = new Map<string, number>();

export function setTtl(toolName: string, ttlMs: number): void {
  ttlOverrides.set(toolName, ttlMs);
}

export async function cachedComplete(
  toolName: string,
  messages: Message[],
  completeFn: () => Promise<CompletionResult>
): Promise<CompletionResult> {
  const key = createHash("sha1")
    .update(toolName + JSON.stringify(messages))
    .digest("hex");

  const now = Date.now();
  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  const result = await completeFn();
  const ttl = ttlOverrides.get(toolName) ?? DEFAULT_TTLS[toolName] ?? DEFAULT_TTL;
  store.set(key, { result, expiresAt: now + ttl });
  return result;
}
