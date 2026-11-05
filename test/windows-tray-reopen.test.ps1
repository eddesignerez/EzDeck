param([Parameter(Mandatory=$true)][string]$TestDirectory,[Parameter(Mandatory=$true)][int]$TestPort)
$ErrorActionPreference='Stop'
$env:EZDECK_DATA_DIR=$TestDirectory
$taskDesktop=Join-Path (Split-Path -Parent $PSScriptRoot) 'windows\desktop.ps1'
$taskState=@{phase='initial';restores=0;failure=$null;secondary=$null;hostId=0;hashes=@{};deadline=[DateTime]::UtcNow.AddSeconds(32)}
try {
  & $taskDesktop -Port $TestPort -OnReady {
    Write-Output 'Tray fixture: host ready'
    $taskState.hostId=$script:child.Id
    foreach($name in @('config.json','.j5-pin','j5-sessions.json','updates\preferences.json')){
      $file=Join-Path $TestDirectory $name
      if(Test-Path -LiteralPath $file){$taskState.hashes[$name]=(Get-FileHash -LiteralPath $file).Hash}
    }
    try{Open-ControlCenter}catch{$taskState.failure=$_.Exception.Message;Stop-EzDeck;return}
    Write-Output 'Tray fixture: panel requested'
    $script:reopenTestTimer=New-Object Windows.Forms.Timer
    $script:reopenTestTimer.Interval=100
    $script:reopenTestTimer.add_Tick({
      try {
        if([DateTime]::UtcNow -gt $taskState.deadline){throw ('Tray reopen timed out in '+$taskState.phase)}
        if($script:child.HasExited -or $script:child.Id -ne $taskState.hostId){throw 'Original host was replaced or stopped'}
        if($taskState.phase -eq 'initial'){
          $markerFile=Join-Path $TestDirectory 'desktop-ready.json'
          if(!(Test-Path -LiteralPath $markerFile)){return}
          $marker=Get-Content -LiteralPath $markerFile -Raw|ConvertFrom-Json
          if($marker.pid -ne $PID -or !$form.Visible){return}
          # The same FormClosing event used by the X button hides to the tray.
          $form.Close()
          if($form.Visible -or $form.IsDisposed){throw 'Close did not preserve the hidden tray window'}
          $taskState.secondary=Start-Process -FilePath powershell.exe -ArgumentList @('-NoLogo','-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',('"'+$taskDesktop+'"'),'-Port',[string]$TestPort) -WindowStyle Hidden -PassThru
          $taskState.phase='restore'
        } elseif($taskState.phase -eq 'restore') {
          if(!$taskState.secondary.HasExited -or !$form.Visible){return}
          if($taskState.secondary.ExitCode -ne 0){throw 'Second shortcut did not exit successfully'}
          $taskState.secondary.Dispose();$taskState.secondary=$null
          if($form.WindowState -ne 'Normal'){throw 'Existing window was not restored'}
          if((Api '/api/windows/status').port -ne $TestPort){throw 'Original host no longer responds'}
          foreach($name in $taskState.hashes.Keys){if((Get-FileHash -LiteralPath (Join-Path $TestDirectory $name)).Hash -ne $taskState.hashes[$name]){throw ('Protected fixture changed: '+$name)}}
          $taskState.restores++
          if($taskState.restores -eq 2){$script:reopenTestTimer.Stop();Stop-EzDeck}else{$taskState.phase='initial'}
        }
      } catch {
        $taskState.failure=$_.Exception.Message
        $script:reopenTestTimer.Stop();Stop-EzDeck
      }
    })
    $script:reopenTestTimer.Start()
  }
  if($taskState.failure){throw $taskState.failure}
  if($taskState.restores -ne 2){throw 'Both tray restores must complete'}
  if(Get-Process -Id $taskState.hostId -ErrorAction SilentlyContinue){throw 'Host remained alive after explicit shutdown'}
  'Tray reopen: two restores, same host, unchanged data, clean shutdown'
} finally {
  if($script:reopenTestTimer){$script:reopenTestTimer.Stop();$script:reopenTestTimer.Dispose()}
  if($taskState.secondary){if(!$taskState.secondary.HasExited){$taskState.secondary.Kill()};$taskState.secondary.Dispose()}
}
