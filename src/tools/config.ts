import { reloadConfig } from "../llm.js";
import { setTtl } from "../cache.js";

export function runReloadConfig(): string {
  reloadConfig();
  return "Config reloaded. Provider order, keys, cooldowns, and clients have been reset.";
}

export function runSetTtl(toolName: string, ttlMs: number): string {
  setTtl(toolName, ttlMs);
  const seconds = ttlMs / 1000;
  const display = seconds >= 3600 ? `${seconds / 3600}h` : seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`;
  return `Cache TTL for "${toolName}" set to ${display} (${ttlMs}ms).`;
}
