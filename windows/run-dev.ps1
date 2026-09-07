[CmdletBinding()]
param(
  [ValidateRange(1, 65535)]
  [int]$Port = 3100,
  [switch]$Console
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
  Write-Error "Node.js 20+ não foi encontrado. Instale-o antes de iniciar o EzDeck pelo código-fonte."
  exit 1
}

$env:PORT = "$Port"
if (-not $Console) {
  $desktop = Join-Path $PSScriptRoot 'desktop.ps1'
  Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoLogo', '-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $desktop + '"'), '-Port', "$Port")
  Write-Host 'EzDeck aberto na bandeja. Clique duas vezes no icone para configurar; use Desligar EzDeck para encerrar.'
  return
}
Write-Host "Iniciando EzDeck para Windows. Use Ctrl+C para encerrar."
& $node.Source (Join-Path $projectRoot "server.js")
