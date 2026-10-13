param([Parameter(Mandatory=$true)][string]$Installer)
$ErrorActionPreference='Stop'
$taskInstaller=(Resolve-Path -LiteralPath $Installer).Path
$taskChecksum=Join-Path ([IO.Path]::GetDirectoryName($taskInstaller)) 'SHA256SUMS.txt'
$taskHash=(Get-FileHash -LiteralPath $taskInstaller -Algorithm SHA256).Hash.ToLowerInvariant()
# The release asset has this canonical name, even for a locally named test build.
[IO.File]::WriteAllText($taskChecksum, "$taskHash  EzDeck-Setup.exe`n", [Text.Encoding]::ASCII)
