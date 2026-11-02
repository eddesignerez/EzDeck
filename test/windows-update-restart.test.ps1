$ErrorActionPreference='Stop'
$taskHelper=Join-Path (Split-Path -Parent $PSScriptRoot) 'windows\ensure-restart.ps1'
$fixtureRoot='C:\Fixture\EzDeck'
$env:EZDECK_DATA_DIR='C:\Fixture\Data'
$script:fixtureExists=$true
$script:fixtureReady=$true
$script:fixtureHealth=$true
$script:fixtureLaunches=0
$fixtureStart=[DateTime]::UtcNow.AddMinutes(-1)
function Get-Content {
  [CmdletBinding()] param($LiteralPath,[switch]$Raw,$Encoding)
  if($LiteralPath.EndsWith('package.json')){return '{"version":"0.2.18"}'}
  @{pid=111;port=3100;root=$fixtureRoot;version='0.2.18';readyAt=$(if($script:fixtureReady){[DateTime]::UtcNow.ToString('o')}else{[DateTime]::UtcNow.AddDays(-1).ToString('o')})}|ConvertTo-Json -Compress
}
function Get-CimInstance {
  [CmdletBinding()] param($ClassName,$Filter)
  if($script:fixtureExists){[pscustomobject]@{ProcessId=111;Name='powershell.exe';CreationDate=$fixtureStart;CommandLine='powershell.exe -File "C:\Fixture\EzDeck\windows\desktop.ps1"'}}
}
function Invoke-RestMethod {
  param($Uri,[switch]$UseBasicParsing,$TimeoutSec)
  if(!$script:fixtureHealth){throw 'Offline host'}
  [pscustomobject]@{service='EzDeck'}
}
function Test-Path { param($LiteralPath,$PathType) return $true }
function Start-Process {
  param($FilePath,$ArgumentList,$WorkingDirectory,$WindowStyle)
  if($FilePath -ne 'wscript.exe'){throw 'Unexpected executable'}
  $script:fixtureLaunches++;$script:fixtureExists=$true;$script:fixtureReady=$true
}
foreach($case in @(
  @{exists=$true;ready=$true;health=$true;noLaunch=$false;launches=0;fails=$false},
  @{exists=$false;ready=$false;health=$true;noLaunch=$false;launches=1;fails=$false},
  @{exists=$true;ready=$false;health=$true;noLaunch=$false;launches=0;fails=$true},
  @{exists=$false;ready=$true;health=$true;noLaunch=$true;launches=0;fails=$true},
  @{exists=$true;ready=$true;health=$false;noLaunch=$false;launches=0;fails=$true}
)){
  $script:fixtureExists=$case.exists;$script:fixtureReady=$case.ready;$script:fixtureHealth=$case.health;$script:fixtureLaunches=0
  $failed=$false
  try{. $taskHelper -InstallRoot $fixtureRoot -ExpectedVersion '0.2.18' -StartedAfter $fixtureStart -NoLaunch:$case.noLaunch -ReadyTimeoutSeconds 1}catch{$failed=$true}
  if($failed -ne $case.fails -or $script:fixtureLaunches -ne $case.launches){throw ('Incorrect readiness result '+($case|ConvertTo-Json -Compress)+' failed='+$failed+' launches='+$script:fixtureLaunches)}
}
'Restart scenarios: 5 passed'
