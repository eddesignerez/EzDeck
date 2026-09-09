[CmdletBinding()]
param([string]$Output)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Output)) { $Output = Join-Path $root 'dist\EzDeck-Setup.exe' }
$node = (Get-Command node -ErrorAction Stop).Source
if (-not (Test-Path -LiteralPath $node)) { throw 'Node.js não foi encontrado para embutir no instalador.' }

$work = Join-Path ([IO.Path]::GetTempPath()) ('ezdeck-installer-' + [guid]::NewGuid().ToString('N'))
$stage = Join-Path $work 'stage'
$app = Join-Path $stage 'app'
$archive = Join-Path $stage 'app.zip'

try {
  New-Item -ItemType Directory -Force -Path $app, (Split-Path -Parent $Output) | Out-Null
  foreach ($directory in @('public', 'platform', 'windows')) {
    Copy-Item -LiteralPath (Join-Path $root $directory) -Destination (Join-Path $app $directory) -Recurse -Force
  }
  foreach ($file in @('server.js', 'config.js', 'config.json', 'auth.js', 'actions.js', 'apps.js', 'obs.js', 'obs-ws.js', 'package.json', 'EzDeck.vbs', 'ezdeck.ico', 'Encerrar-EzDeck.bat')) {
    $source = Join-Path $root $file
    if (Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination (Join-Path $app $file) -Force }
  }
  New-Item -ItemType Directory -Force -Path (Join-Path $app 'runtime'), (Join-Path $app 'node_modules') | Out-Null
  Copy-Item -LiteralPath $node -Destination (Join-Path $app 'runtime\node.exe') -Force
  Copy-Item -LiteralPath (Join-Path $root 'node_modules\ws') -Destination (Join-Path $app 'node_modules\ws') -Recurse -Force
  Compress-Archive -LiteralPath (Get-ChildItem -LiteralPath $app -Force | Select-Object -ExpandProperty FullName) -DestinationPath $archive -Force

  $launcherSource = @'
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;

internal static class EzDeckInstaller {
  [STAThread]
  private static void Main() {
    try {
      var target = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EzDeck");
      Directory.CreateDirectory(target);
      var archive = Path.Combine(Path.GetTempPath(), "EzDeck-" + Guid.NewGuid().ToString("N") + ".zip");
      using (var input = Assembly.GetExecutingAssembly().GetManifestResourceStream("EzDeck.payload.zip")) {
        if (input == null) throw new InvalidOperationException("Pacote interno do EzDeck não foi encontrado.");
        using (var output = File.Create(archive)) input.CopyTo(output);
      }
      using (var zip = ZipFile.OpenRead(archive)) {
        foreach (var entry in zip.Entries) {
          var destination = Path.GetFullPath(Path.Combine(target, entry.FullName));
          if (!destination.StartsWith(Path.GetFullPath(target) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Entrada inválida no pacote.");
          if (String.IsNullOrEmpty(entry.Name)) { Directory.CreateDirectory(destination); continue; }
          Directory.CreateDirectory(Path.GetDirectoryName(destination));
          entry.ExtractToFile(destination, true);
        }
      }
      File.Delete(archive);
      var launcher = Path.Combine(target, "EzDeck.vbs");
      Process.Start(new ProcessStartInfo("wscript.exe", "\"" + launcher + "\"") { WorkingDirectory = target, UseShellExecute = true });
    } catch (Exception error) {
      MessageBox.Show(error.Message, "EzDeck", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
  }
}
'@
  $sourceFile = Join-Path $stage 'EzDeckInstaller.cs'
  Set-Content -LiteralPath $sourceFile -Value $launcherSource -Encoding UTF8
  $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
  if (-not (Test-Path -LiteralPath $compiler)) { $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
  if (-not (Test-Path -LiteralPath $compiler)) { throw 'Compilador .NET do Windows não foi encontrado.' }
  & $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$Output" "/win32icon:$($app + '\\ezdeck.ico')" "/resource:$archive,EzDeck.payload.zip" /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /r:System.Windows.Forms.dll $sourceFile
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $Output)) { throw 'Não foi possível criar o instalador EzDeck-Setup.exe.' }
  Get-Item -LiteralPath $Output | Select-Object FullName, Length, LastWriteTime
} finally {
  Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
}
