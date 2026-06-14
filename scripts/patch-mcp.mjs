#!/usr/bin/env node
// Idempotently register (or update) an MCP server in a Claude Code config file.
// Pure Node so it runs identically on macOS, Linux, WSL, and Windows.
//
// Usage:
//   node patch-mcp.mjs <configPath> <serverName> <entryJson>
//   entryJson e.g. '{"command":"node","args":["/abs/path/dist/index.js"]}'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [, , configPath, name, entryJson] = process.argv;
if (!configPath || !name || !entryJson) {
  console.error("usage: node patch-mcp.mjs <configPath> <serverName> <entryJson>");
  process.exit(1);
}

const entry = JSON.parse(entryJson);

let cfg = {};
if (existsSync(configPath)) {
  try {
    cfg = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (err) {
    console.error(`Refusing to overwrite unparseable config at ${configPath}: ${err.message}`);
    process.exit(1);
  }
}

cfg.mcpServers ??= {};
cfg.mcpServers[name] = entry;

mkdirSync(dirname(configPath), { recursive: true });
writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
console.log(`Registered MCP server "${name}" in ${configPath}`);
