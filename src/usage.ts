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

export function formatUsageTable(): string {
  const counts = loadUsage().counts;
  const entries = Object.entries(counts);
  if (entries.length === 0) return "No usage recorded today.";

  const rows = entries.map(([id, { ok, err }]) => {
    const [provider, key] = id.split("#");
    return { provider, key: `#${key}`, ok, err };
  });

  const colWidths = {
    provider: Math.max(8, ...rows.map((r) => r.provider.length)),
    key: Math.max(3, ...rows.map((r) => r.key.length)),
    ok: Math.max(16, ...rows.map((r) => String(r.ok).length)),
    err: Math.max(6, ...rows.map((r) => String(r.err).length)),
  };

  const pad = (s: string, n: number) => s.padEnd(n);
  const header =
    `${pad("Provider", colWidths.provider)}  ${pad("Key", colWidths.key)}  ` +
    `${pad("Requests Today", colWidths.ok)}  ${pad("Errors", colWidths.err)}`;
  const sep = "-".repeat(header.length);
  const body = rows
    .map(
      (r) =>
        `${pad(r.provider, colWidths.provider)}  ${pad(r.key, colWidths.key)}  ` +
        `${pad(String(r.ok), colWidths.ok)}  ${pad(String(r.err), colWidths.err)}`
    )
    .join("\n");

  return `${header}\n${sep}\n${body}`;
}
