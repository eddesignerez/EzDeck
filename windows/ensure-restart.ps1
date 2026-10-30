param([Parameter(Mandatory=$true)][string]$InstallRoot)
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath($InstallRoot)
$taskDesktopScript=Join-Path $taskRoot 'windows\desktop.ps1'
$taskStarted=$false
for ($taskAttempt=0; $taskAttempt -lt 10; $taskAttempt++) {
  $taskStarted=@(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction Stop | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($taskDesktopScript,[StringComparison]::OrdinalIgnoreCase) -ge 0 }).Count -gt 0
  if ($taskStarted) { break }
  Start-Sleep -Seconds 1
}
if (!$taskStarted) {
  $taskLauncher=Join-Path $taskRoot 'EzDeck.vbs'
  if (!(Test-Path -LiteralPath $taskLauncher -PathType Leaf)) { throw 'Launcher do EzDeck não encontrado' }
  Start-Process -FilePath wscript.exe -ArgumentList ('"'+$taskLauncher+'"') -WorkingDirectory $taskRoot -WindowStyle Hidden
}
