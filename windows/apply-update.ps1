param(
  [Parameter(Mandatory=$true)][string]$Installer,
  [Parameter(Mandatory=$true)][string]$ExpectedHash,
  [Parameter(Mandatory=$true)][int]$HostPid,
  [Parameter(Mandatory=$true)][int]$DesktopPid,
  [Parameter(Mandatory=$true)][string]$InstallRoot
)
$ErrorActionPreference='Stop'
try {
  $taskRoot=[IO.Path]::GetFullPath($InstallRoot)
  $taskExe=[IO.Path]::GetFullPath($Installer)
  $taskUpdates=[IO.Path]::GetFullPath((Join-Path $env:APPDATA 'EzDeck\updates')).TrimEnd('\')+'\'
  if (!$taskExe.StartsWith($taskUpdates,[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($taskExe) -ne 'EzDeck-Setup.exe') { throw 'Instalador fora do diretório de atualização' }
  if ($ExpectedHash -notmatch '^[a-fA-F0-9]{64}$' -or (Get-FileHash -LiteralPath $taskExe -Algorithm SHA256).Hash -ne $ExpectedHash) { throw 'Arquivo de atualização inválido' }
  # Wait only for the verified installed host and desktop, never unrelated Node apps.
  foreach ($taskId in @($HostPid,$DesktopPid)) {
    $taskProcess=Get-CimInstance Win32_Process -Filter "ProcessId=$taskId" -ErrorAction SilentlyContinue
    if (!$taskProcess) { continue }
    $taskOwn=($taskId -eq $HostPid -and $taskProcess.ExecutablePath -eq (Join-Path $taskRoot 'runtime\node.exe')) -or
      ($taskId -eq $DesktopPid -and $taskProcess.Name -eq 'powershell.exe' -and $taskProcess.CommandLine.Contains((Join-Path $taskRoot 'windows\desktop.ps1')))
    if (!$taskOwn) { throw 'A atualização precisa ser iniciada pelo EzDeck instalado' }
    $taskRunning=Get-Process -Id $taskId -ErrorAction SilentlyContinue
    if ($taskRunning -and !$taskRunning.WaitForExit(20000)) { throw 'O EzDeck não encerrou para atualizar' }
  }
  if ((Get-FileHash -LiteralPath $taskExe -Algorithm SHA256).Hash -ne $ExpectedHash) { throw 'O instalador mudou após a verificação' }
  $taskInstaller=Start-Process -FilePath $taskExe -PassThru
  $taskInstaller.WaitForExit() # Do not wait for the restarted app's descendant processes.
  if ($taskInstaller.ExitCode -ne 0) { throw 'O instalador não concluiu a atualização' }
} catch {
  Add-Type -AssemblyName System.Windows.Forms
  [Windows.Forms.MessageBox]::Show('Não foi possível concluir a atualização. Abra o EzDeck novamente e tente mais tarde.','EzDeck') | Out-Null
  $taskLauncher=Join-Path $InstallRoot 'EzDeck.vbs'
  if (Test-Path -LiteralPath $taskLauncher) { Start-Process -FilePath wscript.exe -ArgumentList ('"'+$taskLauncher+'"') -WindowStyle Hidden }
}
