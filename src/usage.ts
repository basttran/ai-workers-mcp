import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const USAGE_PATH = join(homedir(), ".config", "ai-workers-usage.json");

type DayUsage = {
  date: string;
  counts: Record<string, { ok: number; err: number }>;
};

function today(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function loadUsage(): DayUsage {
  try {
    const raw = readFileSync(USAGE_PATH, "utf8");
    const parsed = JSON.parse(raw) as DayUsage;
    if (parsed.date !== today()) {
      return { date: today(), counts: {} };
    }
    return parsed;
  } catch {
    return { date: today(), counts: {} };
  }
}

export function track(provider: string, keyIdx: number, success: boolean): void {
  const usage = loadUsage();
  const id = `${provider}#${keyIdx}`;
  const entry = usage.counts[id] ?? { ok: 0, err: 0 };
  if (success) entry.ok++;
  else entry.err++;
  usage.counts[id] = entry;
  writeFileSync(USAGE_PATH, JSON.stringify(usage, null, 2), "utf8");
}

export function getUsage(): Record<string, { ok: number; err: number }> {
  return loadUsage().counts;
}
