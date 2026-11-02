param(
  [Parameter(Mandatory=$true)][string]$Installer,
  [Parameter(Mandatory=$true)][string]$ExpectedHash,
  [Parameter(Mandatory=$true)][int]$HostPid,
  [Parameter(Mandatory=$true)][int]$DesktopPid,
  [Parameter(Mandatory=$true)][string]$InstallRoot,
  [Parameter(Mandatory=$true)][string]$Version,
  [Parameter(Mandatory=$true)][string]$OperationId
)
$ErrorActionPreference='Stop'
$taskStatus=$null; $taskStage='validation'; $taskCommitted=$false; $taskInstaller=$null
$taskData=if($env:EZDECK_DATA_DIR){$env:EZDECK_DATA_DIR}else{Join-Path $env:APPDATA 'EzDeck'}
$taskUpdates=Join-Path $taskData 'updates'
function Write-UpdateStage([string]$Stage,[string]$ErrorCode='') {
  $record=@{operationId=$OperationId;version=$Version;stage=$Stage;pid=$PID;at=[DateTime]::UtcNow.ToString('o');errorCode=$ErrorCode}
  $text=$record|ConvertTo-Json -Compress
  if($taskStatus){
    $temp=$taskStatus+'.tmp'
    [IO.File]::WriteAllText($temp,$text,(New-Object Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $temp -Destination $taskStatus -Force
  }
  if($Stage -in @('complete','failed') -and $taskCommitted){
    [IO.File]::WriteAllText((Join-Path $taskUpdates 'last-result.json'),$text,(New-Object Text.UTF8Encoding($false)))
  }
}
function Get-OwnedProcess([int]$Id,[bool]$Desktop) {
  $p=Get-CimInstance Win32_Process -Filter "ProcessId=$Id" -ErrorAction Stop
  if(!$p){return $null}
  $own=if($Desktop){$p.Name -eq 'powershell.exe' -and $p.CommandLine -and $p.CommandLine.IndexOf((Join-Path $taskRoot 'windows\desktop.ps1'),[StringComparison]::OrdinalIgnoreCase) -ge 0}else{$p.ExecutablePath -eq (Join-Path $taskRoot 'runtime\node.exe')}
  if(!$own){throw 'Process identity does not match this installation'}
  return $p
}
try {
  $taskRoot=[IO.Path]::GetFullPath($InstallRoot).TrimEnd('\')
  $taskExe=[IO.Path]::GetFullPath($Installer)
  $allowed=[IO.Path]::GetFullPath($taskUpdates).TrimEnd('\')+'\'
  if($Version -notmatch '^\d+\.\d+\.\d+$' -or $OperationId -notmatch '^[a-f0-9-]{36}$'){throw 'Invalid update identity'}
  $filename='EzDeck'+($Version -replace '\.','')+'-Setup.exe'
  if(!$taskExe.StartsWith($allowed,[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($taskExe) -ne $filename){throw 'Installer outside updates directory'}
  $folder=Split-Path -Parent $taskExe
  $taskStatus=Join-Path $folder 'handoff.json'
  if($ExpectedHash -notmatch '^[a-fA-F0-9]{64}$' -or (Get-FileHash -LiteralPath $taskExe -Algorithm SHA256).Hash -ne $ExpectedHash){throw 'Invalid installer checksum'}
  $hostIdentity=Get-OwnedProcess $HostPid $false
  $desktopIdentity=Get-OwnedProcess $DesktopPid $true
  if(!$hostIdentity -or !$desktopIdentity -or $hostIdentity.ParentProcessId -ne $DesktopPid){throw 'Installed host and desktop must both be running'}
  Write-UpdateStage 'ready'
  $taskStage='confirmation'
  $deadline=[DateTime]::UtcNow.AddSeconds(20)
  $commitFile=Join-Path $folder 'commit.json'
  while([DateTime]::UtcNow -lt $deadline){
    if(Test-Path -LiteralPath $commitFile){
      try{$commit=Get-Content -LiteralPath $commitFile -Raw -Encoding UTF8|ConvertFrom-Json}catch{$commit=$null}
      if($commit.operationId -eq $OperationId -and $commit.version -eq $Version){$taskCommitted=$true;break}
    }
    Start-Sleep -Milliseconds 100
  }
  if(!$taskCommitted){throw 'Host did not confirm handoff'}
  $taskStage='closing'; Write-UpdateStage $taskStage
  $hostProcess=Get-Process -Id $HostPid -ErrorAction SilentlyContinue
  try{if($hostProcess -and !$hostProcess.WaitForExit(15000)){throw 'Host did not exit'}}finally{if($hostProcess){$hostProcess.Dispose()}}
  $desktopProcess=Get-Process -Id $DesktopPid -ErrorAction SilentlyContinue
  try{if($desktopProcess -and !$desktopProcess.WaitForExit(5000)){
    # Recover an old tray window only after its host exited. Verify creation
    # time before stopping exactly that window, never a process tree.
    $same=Get-OwnedProcess $DesktopPid $true
    if($same -and $same.CreationDate -eq $desktopIdentity.CreationDate){
      Stop-Process -Id $DesktopPid -Force
      if(!$desktopProcess.WaitForExit(5000)){throw 'Desktop did not exit'}
    } elseif($same){throw 'Desktop identity changed'}
  }}finally{if($desktopProcess){$desktopProcess.Dispose()}}
  if((Get-FileHash -LiteralPath $taskExe -Algorithm SHA256).Hash -ne $ExpectedHash){throw 'Installer changed after validation'}
  $taskStage='installing';Write-UpdateStage $taskStage
  $startedAfter=[DateTime]::UtcNow
  $taskInstaller=Start-Process -FilePath $taskExe -ArgumentList @('/quiet','/dir',('"'+$taskRoot+'"')) -PassThru
  if(!$taskInstaller.WaitForExit(120000)){throw 'Installer timed out'}
  if($taskInstaller.ExitCode -ne 0){throw 'Installer returned an error'}
  $taskStage='restarting';Write-UpdateStage $taskStage
  & (Join-Path $PSScriptRoot 'ensure-restart.ps1') -InstallRoot $taskRoot -ExpectedVersion $Version -StartedAfter $startedAfter -NoLaunch
  Write-UpdateStage 'complete'
} catch {
  $failure=$_
  try{Write-UpdateStage 'failed' $taskStage}catch{}
  try{[IO.File]::AppendAllText((Join-Path $taskUpdates 'update-errors.log'),([DateTime]::UtcNow.ToString('o')+' '+$OperationId+' '+$taskStage+' '+$failure.Exception.Message+[Environment]::NewLine))}catch{}
  # Keep a live host intact on handshake failure. Recover after shutdown only
  # when no installer remains active and no installed host is still running.
  if($taskCommitted -and (!$taskInstaller -or $taskInstaller.HasExited)){
    try{
      $alive=Get-OwnedProcess $HostPid $false
      if(!$alive){& (Join-Path $PSScriptRoot 'ensure-restart.ps1') -InstallRoot $taskRoot}
    }catch{}
  }
  exit 1
}
