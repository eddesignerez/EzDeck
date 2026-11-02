param(
  [Parameter(Mandatory=$true)][string]$InstallRoot,
  [string]$ExpectedVersion,
  [datetime]$StartedAfter=[DateTime]::UtcNow.AddSeconds(-5),
  [switch]$NoLaunch,
  [ValidateRange(1,60)][int]$ReadyTimeoutSeconds=35
)
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath($InstallRoot).TrimEnd('\')
$taskDesktopScript=Join-Path $taskRoot 'windows\desktop.ps1'
$taskData=if($env:EZDECK_DATA_DIR){$env:EZDECK_DATA_DIR}else{Join-Path $env:APPDATA 'EzDeck'}
if(!$ExpectedVersion){$ExpectedVersion=(Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8|ConvertFrom-Json).version}
if($ExpectedVersion -notmatch '^\d+\.\d+\.\d+$'){throw 'Invalid installed version'}
function Get-Desktop {
  @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction Stop|Where-Object{$_.CommandLine -and $_.CommandLine.IndexOf($taskDesktopScript,[StringComparison]::OrdinalIgnoreCase) -ge 0})
}
function Test-Ready {
  try{
    $marker=Get-Content -LiteralPath (Join-Path $taskData 'desktop-ready.json') -Raw -Encoding UTF8|ConvertFrom-Json
    if($marker.version -ne $ExpectedVersion -or $marker.root -ne $taskRoot -or [DateTime]::Parse($marker.readyAt).ToUniversalTime() -lt $StartedAfter.ToUniversalTime()){return $false}
    $desktop=Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$marker.pid)" -ErrorAction Stop
    if(!$desktop -or $desktop.Name -ne 'powershell.exe' -or !$desktop.CommandLine -or $desktop.CommandLine.IndexOf($taskDesktopScript,[StringComparison]::OrdinalIgnoreCase) -lt 0){return $false}
    if($desktop.CreationDate.ToUniversalTime() -gt [DateTime]::Parse($marker.readyAt).ToUniversalTime()){return $false}
    $port=[int]$marker.port
    if($port -lt 1 -or $port -gt 65535){return $false}
    $health=Invoke-RestMethod -Uri "http://127.0.0.1:$port/health" -UseBasicParsing -TimeoutSec 2
    $package=Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8|ConvertFrom-Json
    return $health.service -eq 'EzDeck' -and $package.version -eq $ExpectedVersion
  }catch{return $false}
}
if(Test-Ready){return}
if(!$NoLaunch -and @(Get-Desktop).Count -eq 0){
  $launcher=Join-Path $taskRoot 'EzDeck.vbs'
  if(!(Test-Path -LiteralPath $launcher -PathType Leaf)){throw 'EzDeck launcher missing'}
  Start-Process -FilePath wscript.exe -ArgumentList ('"'+$launcher+'"') -WorkingDirectory $taskRoot -WindowStyle Hidden
}
$deadline=[DateTime]::UtcNow.AddSeconds($ReadyTimeoutSeconds)
while([DateTime]::UtcNow -lt $deadline){
  if(Test-Ready){return}
  Start-Sleep -Milliseconds 250
}
throw 'EzDeck did not confirm a fresh panel and a responding host after installation'
