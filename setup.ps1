# Windows installer for ai-workers (Claude Code runs on Windows; the Node server runs in WSL).
# - Builds the server inside WSL (no Node on Windows)
# - Deploys the 36 slash commands to the Windows user scope (%USERPROFILE%\.claude\commands)
# - Registers the MCP server in %USERPROFILE%\.claude.json, launched via wsl.exe
# - Seeds ~/.config/ai-workers.json (WSL side) from the example if missing
#
# On macOS / Linux / inside WSL, use setup.sh instead.
$ErrorActionPreference = "Stop"

# wsl.exe mangles backslashes in args, so convert Windows paths to WSL paths in PowerShell.
function ConvertTo-WslPath([string]$winPath) {
  $full = [System.IO.Path]::GetFullPath($winPath)
  if ($full -match '^\\\\wsl(?:\.localhost|\$)\\[^\\]+\\(.*)$') {
    return '/' + ($matches[1] -replace '\\', '/')          # \\wsl.localhost\Distro\home\x -> /home/x
  }
  elseif ($full -match '^([A-Za-z]):\\(.*)$') {
    return "/mnt/$($matches[1].ToLower())/" + ($matches[2] -replace '\\', '/')  # C:\x -> /mnt/c/x
  }
  throw "Cannot convert to WSL path: $winPath"
}

$winRepo = $PSScriptRoot
$wslRepo = ConvertTo-WslPath $winRepo
Write-Host "==> Repo (WSL path): $wslRepo"

# nvm bootstrap reused across WSL calls.
$nvm = 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1;'

Write-Host "==> Building in WSL (npm install + build)"
wsl bash -c "$nvm cd '$wslRepo' && npm install && npm run build"
if ($LASTEXITCODE -ne 0) { throw "WSL build failed" }

Write-Host "==> Deploying slash commands to user scope"
$cmdDir = Join-Path $env:USERPROFILE ".claude\commands"
New-Item -ItemType Directory -Force $cmdDir | Out-Null
Copy-Item "$winRepo\.claude\commands\*-ai*.md" $cmdDir -Force
Write-Host "    $((Get-ChildItem "$cmdDir\*-ai*.md").Count) commands deployed to $cmdDir"

Write-Host "==> Registering MCP server in %USERPROFILE%\.claude.json (launch via wsl.exe)"
$winConfig = Join-Path $env:USERPROFILE ".claude.json"
$wslConfig = ConvertTo-WslPath $winConfig
$entry = '{\"command\":\"wsl.exe\",\"args\":[\"bash\",\"' + $wslRepo + '/run.sh\"]}'
wsl bash -c "$nvm cd '$wslRepo' && node scripts/patch-mcp.mjs '$wslConfig' ai-workers '$entry'"
if ($LASTEXITCODE -ne 0) { throw "MCP registration failed" }

Write-Host "==> Seeding ~/.config/ai-workers.json (WSL side) if missing"
wsl bash -c "CFG=`$HOME/.config/ai-workers.json; if [ ! -f `$CFG ]; then mkdir -p `$HOME/.config && cp '$wslRepo/ai-workers.example.json' `$CFG && chmod 600 `$CFG && echo '    seeded (add your key!)'; else echo '    already exists, untouched'; fi"

Write-Host ""
Write-Host "Done. Edit ~/.config/ai-workers.json in WSL to add your API key(s), then reload Claude Code."
