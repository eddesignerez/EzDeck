param([Parameter(Mandatory=$true)][string]$TestDirectory,[Parameter(Mandatory=$true)][int]$TestPort)
$ErrorActionPreference='Stop'
$env:EZDECK_DATA_DIR=$TestDirectory
$taskDesktop=Join-Path (Split-Path -Parent $PSScriptRoot) 'windows\desktop.ps1'
# Exercise the actual host shutdown used by update handoff, without installing
# over the user's app or touching their settings/shortcuts/registration.
for ($taskCycle=0; $taskCycle -lt 2; $taskCycle++) {
  $taskState=@{readyCalls=0;timedOut=$false}
  try {
    & $taskDesktop -Port $TestPort -OnReady {
      $taskState.readyCalls++
      $script:taskDeadline=New-Object Windows.Forms.Timer
      $script:taskDeadline.Interval=8000
      $script:taskDeadline.add_Tick({
        $script:taskDeadline.Stop();$taskState.timedOut=$true;Stop-EzDeck
      })
      $script:taskDeadline.Start()
      Api '/api/windows/shutdown' 'POST' @{} | Out-Null
    }
    if($taskState.readyCalls -ne 1){throw 'Startup callback must run exactly once'}
    if($taskState.timedOut){throw 'The desktop did not close after the host exited'}
  } finally {
    if($script:taskDeadline){$script:taskDeadline.Stop();$script:taskDeadline.Dispose()}
  }
}
'Update lifecycle: close and reopen passed'
