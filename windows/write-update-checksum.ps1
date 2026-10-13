param([Parameter(Mandatory=$true)][string]$Installer)
$ErrorActionPreference='Stop'
$taskInstaller=(Resolve-Path -LiteralPath $Installer).Path
$taskChecksum=Join-Path ([IO.Path]::GetDirectoryName($taskInstaller)) 'SHA256SUMS.txt'
$taskHash=(Get-FileHash -LiteralPath $taskInstaller -Algorithm SHA256).Hash.ToLowerInvariant()
$taskName=[IO.Path]::GetFileName($taskInstaller)
$taskMatch=[regex]::Match($taskName,'^EzDeck(\d+)-Setup\.exe$')
if (!$taskMatch.Success) { throw 'Nome de instalador inválido para a release' }
$taskLines=@("$taskHash  $taskName")
$taskApk=Join-Path ([IO.Path]::GetDirectoryName($taskInstaller)) ('EzDeck'+$taskMatch.Groups[1].Value+'.apk')
if (Test-Path -LiteralPath $taskApk -PathType Leaf) {
  $taskLines+=((Get-FileHash -LiteralPath $taskApk -Algorithm SHA256).Hash.ToLowerInvariant()+'  '+[IO.Path]::GetFileName($taskApk))
}
foreach ($taskLegacyName in @('EzDeck-Setup.exe','ezdeck.apk')) {
  $taskLegacy=Join-Path ([IO.Path]::GetDirectoryName($taskInstaller)) $taskLegacyName
  if (Test-Path -LiteralPath $taskLegacy -PathType Leaf) {
    $taskLines+=((Get-FileHash -LiteralPath $taskLegacy -Algorithm SHA256).Hash.ToLowerInvariant()+'  '+$taskLegacyName)
  }
}
[IO.File]::WriteAllText($taskChecksum, (($taskLines -join "`n")+"`n"), [Text.Encoding]::ASCII)
