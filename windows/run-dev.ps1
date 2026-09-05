[CmdletBinding()]
param(
  [ValidateRange(1, 65535)]
  [int]$Port = 3000
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
  Write-Error "Node.js 20+ não foi encontrado. Instale-o antes de iniciar o Dokke pelo código-fonte."
  exit 1
}

$env:PORT = "$Port"
Write-Host "Iniciando Dokke para Windows. Use Ctrl+C para encerrar."
& $node.Source (Join-Path $projectRoot "server.js")
