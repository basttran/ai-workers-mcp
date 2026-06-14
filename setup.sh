#!/usr/bin/env bash
# Cross-platform installer for ai-workers (macOS, Linux, WSL).
# - Builds the server
# - Deploys the 36 slash commands to user scope (~/.claude/commands)
# - Registers the MCP server in ~/.claude.json (direct `node` launch)
# - Seeds ~/.config/ai-workers.json from the example if missing
#
# On native Windows, use setup.ps1 instead (it launches via wsl.exe).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1

echo "==> Building (npm install + build)"
npm install
npm run build

echo "==> Deploying slash commands to ~/.claude/commands"
mkdir -p "$HOME/.claude/commands"
cp "$REPO"/.claude/commands/*-ai*.md "$HOME/.claude/commands/"
echo "    $(ls "$REPO"/.claude/commands/*-ai*.md | wc -l) commands deployed"

echo "==> Registering MCP server in ~/.claude.json"
node "$REPO/scripts/patch-mcp.mjs" "$HOME/.claude.json" "ai-workers" \
  "{\"command\":\"node\",\"args\":[\"$REPO/dist/index.js\"]}"

CFG="$HOME/.config/ai-workers.json"
if [ ! -f "$CFG" ]; then
  echo "==> Seeding $CFG (add your API keys!)"
  mkdir -p "$HOME/.config"
  cp "$REPO/ai-workers.example.json" "$CFG"
  chmod 600 "$CFG"
else
  echo "==> Config $CFG already exists — leaving it untouched"
fi

echo ""
echo "Done. Edit $CFG to add your API key(s), then reload your editor / Claude Code."
