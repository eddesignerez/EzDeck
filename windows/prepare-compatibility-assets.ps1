[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Directory)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$taskVersion=(Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw | ConvertFrom-Json).version
if ($taskVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Versão inválida' }
$taskDir=[IO.Path]::GetFullPath($Directory)
$taskInstaller=Join-Path $taskDir ('EzDeck'+($taskVersion -replace '\.','')+'-Setup.exe')
if (!(Test-Path -LiteralPath $taskInstaller -PathType Leaf)) { throw 'Instalador versionado ausente' }
if ($taskVersion -eq '0.2.15') {
  Copy-Item -LiteralPath $taskInstaller -Destination (Join-Path $taskDir 'EzDeck-Setup.exe') -Force
  $taskApk=Join-Path $taskDir 'EzDeck0215.apk'
  if (Test-Path -LiteralPath $taskApk -PathType Leaf) {
    Copy-Item -LiteralPath $taskApk -Destination (Join-Path $taskDir 'ezdeck.apk') -Force
  }
}
& (Join-Path $PSScriptRoot 'write-update-checksum.ps1') -Installer $taskInstaller
