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
  foreach ($file in @('server.js', 'config.js', 'config.json', 'auth.js', 'obs.js', 'obs-ws.js', 'package.json', 'EzDeck.vbs', 'ezdeck.ico', 'Encerrar-EzDeck.bat')) {
    $source = Join-Path $root $file
    if (Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination (Join-Path $app $file) -Force }
  }
  New-Item -ItemType Directory -Force -Path (Join-Path $app 'runtime'), (Join-Path $app 'node_modules') | Out-Null
  Copy-Item -LiteralPath $node -Destination (Join-Path $app 'runtime\node.exe') -Force
  Copy-Item -LiteralPath (Join-Path $root 'node_modules\ws') -Destination (Join-Path $app 'node_modules\ws') -Recurse -Force
  $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
  if (-not (Test-Path -LiteralPath $compiler)) { $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
  if (-not (Test-Path -LiteralPath $compiler)) { throw 'Compilador .NET do Windows não foi encontrado.' }
  $uninstallerSource = @'
using System;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;
using System.Windows.Forms;

internal static class EzDeckUninstaller {
  private const string RegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EzDeck";
  private static readonly string Target = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EzDeck");
  private static readonly string DataDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "EzDeck");

  private static void StopInstalledHost() {
    var runtime = Path.Combine(Target, "runtime", "node.exe");
    foreach (var process in Process.GetProcessesByName("node")) {
      try {
        if (String.Equals(process.MainModule.FileName, runtime, StringComparison.OrdinalIgnoreCase)) {
          process.Kill();
          process.WaitForExit(2000);
        }
      } catch { }
    }
  }

  private static void RemoveLink(Environment.SpecialFolder folder, params string[] children) {
    try {
      var path = Environment.GetFolderPath(folder);
      foreach (var child in children) path = Path.Combine(path, child);
      if (File.Exists(path)) File.Delete(path);
    } catch { }
  }

  private static bool ConfirmUninstall(out bool eraseData) {
    eraseData = false;
    using (var dialog = new Form()) {
      dialog.Text = "Desinstalar EzDeck";
      dialog.StartPosition = FormStartPosition.CenterScreen;
      dialog.FormBorderStyle = FormBorderStyle.FixedDialog;
      dialog.MinimizeBox = false;
      dialog.MaximizeBox = false;
      dialog.ClientSize = new System.Drawing.Size(440, 180);

      var text = new Label {
        AutoSize = false,
        Location = new System.Drawing.Point(20, 18),
        Size = new System.Drawing.Size(400, 52),
        Text = "Desinstalar o EzDeck deste computador?\r\n\r\nPor padrão, seus botões e configurações serão preservados para uma futura reinstalação."
      };
      var purge = new CheckBox {
        AutoSize = true,
        Location = new System.Drawing.Point(20, 86),
        Text = "Apagar também meus botões, ícones e configurações"
      };
      var cancel = new Button { Text = "Cancelar", DialogResult = DialogResult.Cancel, Location = new System.Drawing.Point(245, 132), Size = new System.Drawing.Size(82, 28) };
      var uninstall = new Button { Text = "Desinstalar", DialogResult = DialogResult.OK, Location = new System.Drawing.Point(338, 132), Size = new System.Drawing.Size(82, 28) };
      dialog.Controls.AddRange(new Control[] { text, purge, cancel, uninstall });
      dialog.AcceptButton = uninstall;
      dialog.CancelButton = cancel;
      if (dialog.ShowDialog() != DialogResult.OK) return false;
      eraseData = purge.Checked;
      return true;
    }
  }

  [STAThread]
  private static void Main() {
    bool eraseData;
    if (!ConfirmUninstall(out eraseData)) return;
    try {
      StopInstalledHost();
      RemoveLink(Environment.SpecialFolder.DesktopDirectory, "EzDeck.lnk");
      RemoveLink(Environment.SpecialFolder.ApplicationData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "EzDeck.lnk");
      Registry.CurrentUser.DeleteSubKeyTree(RegistryPath, false);
      var command = "/c timeout /t 1 /nobreak > nul & rmdir /s /q \"" + Target + "\"";
      if (eraseData) command += " & rmdir /s /q \"" + DataDirectory + "\"";
      Process.Start(new ProcessStartInfo("cmd.exe", command) { CreateNoWindow = true, UseShellExecute = false });
      MessageBox.Show(eraseData ? "EzDeck e todos os seus dados foram removidos." : "EzDeck foi desinstalado. Suas configurações foram preservadas para uma futura reinstalação.", "EzDeck", MessageBoxButtons.OK, MessageBoxIcon.Information);
    } catch (Exception error) {
      MessageBox.Show(error.Message, "EzDeck", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
  }
}
'@
  $uninstallerFile = Join-Path $stage 'EzDeckUninstaller.cs'
  $uninstallerOutput = Join-Path $app 'EzDeck-Uninstall.exe'
  Set-Content -LiteralPath $uninstallerFile -Value $uninstallerSource -Encoding UTF8
  & $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$uninstallerOutput" "/win32icon:$($app + '\\ezdeck.ico')" /r:System.Windows.Forms.dll $uninstallerFile
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $uninstallerOutput)) { throw 'Não foi possível criar o desinstalador EzDeck-Uninstall.exe.' }
  Compress-Archive -LiteralPath (Get-ChildItem -LiteralPath $app -Force | Select-Object -ExpandProperty FullName) -DestinationPath $archive -Force

  $launcherSource = @'
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

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
      var uninstaller = Path.Combine(target, "EzDeck-Uninstall.exe");
      if (!File.Exists(uninstaller)) throw new InvalidOperationException("Desinstalador interno do EzDeck não foi encontrado.");
      using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\EzDeck")) {
        key.SetValue("DisplayName", "EzDeck");
        key.SetValue("DisplayVersion", "0.2.8");
        key.SetValue("Publisher", "EzDeck");
        key.SetValue("InstallLocation", target);
        key.SetValue("DisplayIcon", Path.Combine(target, "ezdeck.ico"));
        key.SetValue("UninstallString", "\"" + uninstaller + "\"");
        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
      }
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
  & $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$Output" "/win32icon:$($app + '\\ezdeck.ico')" "/resource:$archive,EzDeck.payload.zip" /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /r:System.Windows.Forms.dll $sourceFile
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $Output)) { throw 'Não foi possível criar o instalador EzDeck-Setup.exe.' }
  Get-Item -LiteralPath $Output | Select-Object FullName, Length, LastWriteTime
} finally {
  Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
}
