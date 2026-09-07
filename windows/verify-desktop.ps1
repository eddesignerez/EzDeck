# Opens the Windows host on an isolated port and checks the control-center page.
[CmdletBinding()]
param([int]$Port = 3197)
$ErrorActionPreference='Stop'
$result=@{passed=$false;error='Control center did not become ready'}
& (Join-Path $PSScriptRoot 'desktop.ps1') -Port $Port -OnReady {
  try {
    $page=Invoke-WebRequest -Uri "http://127.0.0.1:$Port/windows.html" -UseBasicParsing -TimeoutSec 5
    if($page.StatusCode -ne 200 -or $page.Content -notmatch 'id="deck"'){throw 'Control center page was not served'}
    $health=Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -UseBasicParsing
    if($health.service -ne 'EzDeck'){throw 'Health check did not identify EzDeck'}
    $result.passed=$true
  }catch{$result.error=$_.Exception.Message}
  finally{Stop-EzDeck}
}
if(-not $result.passed){throw $result.error}
Write-Output 'PASS: Windows tray host served the card-based control center and shut down cleanly.'
