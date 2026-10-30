$ErrorActionPreference='Stop'
$taskHelper=Join-Path (Split-Path -Parent $PSScriptRoot) 'windows\ensure-restart.ps1'
$taskRoot='C:\Fixture\EzDeck'
$env:APPDATA='C:\Fixture\AppData'
$taskHash='a'*64
$script:taskPolls=0
$script:taskLauncherCalls=0
$script:taskAppearsAt=0
function Get-FileHash { param($LiteralPath,$Algorithm) [pscustomobject]@{Hash=$taskHash} }
function Get-CimInstance {
  [CmdletBinding()] param($ClassName,$Filter)
  if ($Filter -like 'ProcessId=*') { return }
  $script:taskPolls++
  if ($script:taskAppearsAt -gt 0 -and $script:taskPolls -ge $script:taskAppearsAt) {
    return [pscustomobject]@{CommandLine='powershell.exe -File "C:\Fixture\EzDeck\windows\desktop.ps1"'}
  }
}
function Start-Sleep { param($Seconds) }
function Test-Path { param($LiteralPath,$PathType) return $true }
function Start-Process {
  param($FilePath,$ArgumentList,$WorkingDirectory,$WindowStyle,[switch]$PassThru)
  if ($PassThru) {
    $taskProcess=[pscustomobject]@{ExitCode=0}
    $taskProcess | Add-Member ScriptMethod WaitForExit { }
    return $taskProcess
  }
  if ($FilePath -eq 'wscript.exe') { $script:taskLauncherCalls++ }
}
foreach ($taskCase in @(@(1,0),@(3,0),@(0,1))) {
  $script:taskAppearsAt=$taskCase[0]; $script:taskPolls=0; $script:taskLauncherCalls=0
  . $taskHelper -InstallRoot $taskRoot
  if ($script:taskLauncherCalls -ne $taskCase[1]) { throw "Reinício esperado $($taskCase[1]), recebido $script:taskLauncherCalls" }
}
'Restart scenarios: 3 passed'
