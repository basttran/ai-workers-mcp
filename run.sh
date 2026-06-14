#!/usr/bin/env bash
# Launch the ai-workers MCP server.
# - Resolves its own location so the repo can live anywhere (portable).
# - Sources nvm so `node` resolves to the current default version (survives node upgrades).
# - Secrets/config live in ~/.config/ai-workers.json (read by the server itself), NOT here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
# Optional legacy env file (GEMINI_API_KEY fallback). Harmless if absent.
[ -f "$HOME/.config/ai-workers.env" ] && set -a && . "$HOME/.config/ai-workers.env" && set +a
exec node "$DIR/dist/index.js"
