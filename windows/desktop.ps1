[CmdletBinding()]
param([ValidateRange(0,65535)][int]$Port = 0, [scriptblock]$OnReady)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
try {
  Add-Type -TypeDefinition @'
using System.Runtime.InteropServices;
public static class EzDeckShellIdentity {
  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  public static extern int SetCurrentProcessExplicitAppUserModelID(string appID);
}
'@ -ErrorAction Stop
  # Cria um grupo próprio na barra de tarefas em vez de usar o do PowerShell.
  [EzDeckShellIdentity]::SetCurrentProcessExplicitAppUserModelID('eddesignerez.EzDeck') | Out-Null
} catch {}
[System.Windows.Forms.Application]::EnableVisualStyles()
# A porta do host já é o bloqueio de instância. Evitamos um mutex persistente
# que pode ficar preso após um encerramento inesperado e ocultar a bandeja.
$script:child=$null; $script:closing=$false; $script:opened=$false
# GetNewClosure creates a module scope for callbacks. Share one object across
# that closure and the outer finally instead of assigning $script variables.
$lifecycle=@{restartPort=$null}
$root=Split-Path -Parent $PSScriptRoot
$settingsDirectory=if($env:EZDECK_DATA_DIR){$env:EZDECK_DATA_DIR}else{Join-Path $env:APPDATA 'EzDeck'}
$settingsFile=Join-Path $settingsDirectory 'settings.json'
function Write-DesktopError($failure) {
  try {
    [IO.Directory]::CreateDirectory($settingsDirectory)|Out-Null
    ('{0:o} {1} {2}' -f [DateTime]::Now,$failure.Exception.Message,$failure.ScriptStackTrace) | Add-Content -LiteralPath (Join-Path $settingsDirectory 'desktop-errors.log')
  } catch {}
}
if($Port -eq 0) {
  try {
    $savedSettings=Get-Content -LiteralPath $settingsFile -Raw -ErrorAction Stop|ConvertFrom-Json
    $savedPort=[int]$savedSettings.port
    if($savedPort -ge 1 -and $savedPort -le 65535){$Port=$savedPort}
  } catch {}
  if($Port -eq 0){$Port=3100}
}
$base="http://127.0.0.1:$Port"
$script:token=[guid]::NewGuid().ToString('N')+[guid]::NewGuid().ToString('N')

function Get-PrimaryLanAddress {
  # Prefer the Windows interface with a default gateway. Virtual adapters are
  # deliberately omitted: they cannot be reached by a phone on the home LAN.
  $blocked='Hyper-V|WSL|Docker|ZeroTier|Tailscale|Virtual|Loopback|Bluetooth|WAN Miniport'
  try {
    $candidate=Get-NetIPConfiguration -ErrorAction Stop | Where-Object {
      $_.IPv4Address -and $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' -and
      ($_.InterfaceAlias+' '+$_.NetAdapter.InterfaceDescription -notmatch $blocked)
    } | Select-Object -First 1
    if ($candidate) { return [string]$candidate.IPv4Address.IPAddress }
  } catch {}
  try {
    $candidate=Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | Where-Object {
      $_.IPAddress -notmatch '^(127|169\.254|172\.(1[6-9]|2[0-9]|3[0-1]))\.'
    } | Select-Object -First 1
    if ($candidate) { return [string]$candidate.IPAddress }
  } catch {}
  return $null
}
function Api([string]$Path,[string]$Method='GET',$Body=$null) {
  $args=@{Uri="$base$Path";Method=$Method;Headers=@{'X-EzDeck-Host'=$script:token};UseBasicParsing=$true;TimeoutSec=5}
  if($null -ne $Body){$args.ContentType='application/json; charset=utf-8';$args.Body=[Text.Encoding]::UTF8.GetBytes(($Body|ConvertTo-Json -Compress))}
  Invoke-RestMethod @args
}
function Import-WebView2 {
  $candidateDirectories=@(
    (Join-Path $PSScriptRoot 'vendor\webview2'),
    'C:\Program Files\Microsoft Office\root\Office16\ADDINS\Microsoft Power Query for Excel Integrated\bin',
    'C:\Program Files\Dell\Dell Display and Peripheral Manager'
  )
  foreach($directory in $candidateDirectories) {
    $core=Join-Path $directory 'Microsoft.Web.WebView2.Core.dll'
    $forms=Join-Path $directory 'Microsoft.Web.WebView2.WinForms.dll'
    if((Test-Path $core) -and (Test-Path $forms)) {
      try { Add-Type -Path $core -ErrorAction SilentlyContinue; Add-Type -Path $forms -ErrorAction Stop; return $true } catch {}
    }
  }
  return $false
}
function Open-ControlCenter {
  if (-not $script:child -or $script:child.HasExited) { return }
  $url="$base/windows.html?token=$($script:token)"
  # Show the form even while WebView2 is initializing. A second tray click must
  # never call Navigate on a CoreWebView2 that does not exist yet.
  $form.Show();$form.WindowState='Normal';$form.Activate()
  if(-not $script:web) {
    if(-not (Import-WebView2)){ throw 'O componente WebView2 não foi encontrado. Reinstale o Microsoft Edge WebView2 Runtime.' }
    $script:web=New-Object Microsoft.Web.WebView2.WinForms.WebView2
    $script:web.Dock='Fill'; $script:web.DefaultBackgroundColor=[Drawing.Color]::FromArgb(22,9,4)
    $form.Controls.Add($script:web)
    $script:navigationUrl=$url
    $script:web.add_CoreWebView2InitializationCompleted({ param($sender,$event)
      if($event.IsSuccess){
        $sender.CoreWebView2.Settings.AreDefaultContextMenusEnabled=$false; $sender.CoreWebView2.Settings.AreDevToolsEnabled=$false
        $sender.CoreWebView2.add_WebMessageReceived({param($core,$message)
          try {
            $request=$message.WebMessageAsJson|ConvertFrom-Json
            if($request.type -eq 'shutdown'){
              # Fechar dentro do evento do WebView pode deixar a janela branca.
              # Agenda o encerramento para a próxima volta do loop da interface.
              $null=$form.BeginInvoke([Action]{ Stop-EzDeck })
              return
            }
            if($request.type -eq 'restart'){
              $requestedPort=[int]$request.port
              if($requestedPort -lt 1 -or $requestedPort -gt 65535){throw 'Informe uma porta entre 1 e 65535.'}
              [IO.Directory]::CreateDirectory($settingsDirectory)|Out-Null
              @{port=$requestedPort}|ConvertTo-Json|Set-Content -LiteralPath $settingsFile -Encoding UTF8
              $lifecycle.restartPort=$requestedPort
              $null=$form.BeginInvoke([Action]{ Stop-EzDeck })
              return
            }
            if($request.type -ne 'choose-file'){return}
            $dialog=New-Object Windows.Forms.OpenFileDialog
            $dialog.Title='Adicionar aplicativo, atalho ou script';$dialog.Filter='Apps, atalhos e scripts|*.exe;*.lnk;*.appref-ms;*.bat;*.cmd'
            try { if($dialog.ShowDialog($form) -eq 'OK'){ $core.PostWebMessageAsJson((@{type='file';path=$dialog.FileName;name=[IO.Path]::GetFileName($dialog.FileName)}|ConvertTo-Json -Compress)) } } finally { $dialog.Dispose() }
          }catch{
            $core.PostWebMessageAsJson((@{type='host-error';error=$_.Exception.Message}|ConvertTo-Json -Compress))
          }
        })
        $sender.CoreWebView2.Navigate($script:navigationUrl)
        [IO.File]::WriteAllText((Join-Path $settingsDirectory 'desktop-ready.json'),(@{pid=$PID;port=$Port;readyAt=[DateTime]::UtcNow.ToString('o')}|ConvertTo-Json -Compress))
      }
      else { [Windows.Forms.MessageBox]::Show('Não foi possível iniciar o painel: '+$event.InitializationException.Message,'EzDeck')|Out-Null }
    })
    # PowerShell is hosted from a protected Windows folder.  If WebView2 chooses
    # that executable folder for its default profile, it fails with 0x80070005
    # (E_ACCESSDENIED). Keep the embedded browser profile in the user's AppData.
    $webViewData=Join-Path $env:LOCALAPPDATA 'EzDeck\WebView2'
    if($env:EZDECK_DATA_DIR){$webViewData=Join-Path $settingsDirectory 'WebView2'}
    [IO.Directory]::CreateDirectory($webViewData) | Out-Null
    $properties=New-Object Microsoft.Web.WebView2.WinForms.CoreWebView2CreationProperties
    $properties.UserDataFolder=$webViewData
    $script:web.CreationProperties=$properties
    # Do not block the UI message loop with GetResult: initialization completes
    # asynchronously on that same loop.
    $null=$script:web.EnsureCoreWebView2Async($null)
  } elseif($script:web.CoreWebView2) {
    # Reopening the tray only restores the existing page; no reload or lost edits.
  }
  $label.Visible=$false; $open.Visible=$false; $exit.Visible=$false
  $form.ClientSize=New-Object Drawing.Size(1280,820);$form.MinimumSize=New-Object Drawing.Size(900,620);$form.FormBorderStyle='Sizable';$form.MaximizeBox=$true;$form.MinimizeBox=$true
  $form.Show();$form.WindowState='Normal';$form.Activate();$script:opened=$true
}
function Stop-EzDeck {
  $script:closing=$true; $timer.Stop()
  if($script:child -and -not $script:child.HasExited){
    try{Api '/api/windows/shutdown' 'POST' @{}|Out-Null}catch{}
    if(-not $script:child.WaitForExit(4000)){try{$script:child.Kill()}catch{}}
  }
  $form.Close()
}

$form=New-Object Windows.Forms.Form
$form.Text='EzDeck'; $form.ClientSize=New-Object Drawing.Size(330,110); $form.StartPosition='CenterScreen'; $form.FormBorderStyle='FixedDialog'; $form.MaximizeBox=$false; $form.MinimizeBox=$false; $form.BackColor=[Drawing.Color]::FromArgb(25,12,7)
try{$form.Icon=New-Object Drawing.Icon((Join-Path $root 'ezdeck.ico'))}catch{}
$label=New-Object Windows.Forms.Label
$label.Text='Iniciando EzDeck…';$label.ForeColor=[Drawing.Color]::White;$label.Location=New-Object Drawing.Point(25,22);$label.Size=New-Object Drawing.Size(280,25);$form.Controls.Add($label)
$open=New-Object Windows.Forms.Button
$open.Text='Abrir configuracao';$open.Location=New-Object Drawing.Point(25,58);$open.Size=New-Object Drawing.Size(180,32);$open.Enabled=$false;$form.Controls.Add($open)
$exit=New-Object Windows.Forms.Button
$exit.Text='Desligar';$exit.Location=New-Object Drawing.Point(214,58);$exit.Size=New-Object Drawing.Size(90,32);$form.Controls.Add($exit)
$tray=New-Object Windows.Forms.NotifyIcon
$tray.Text='EzDeck - clique duas vezes para configurar';$tray.Icon=[Drawing.SystemIcons]::Application
try{$tray.Icon=New-Object Drawing.Icon((Join-Path $root 'ezdeck.ico'))}catch{}
$tray.Visible=$true
$menu=New-Object Windows.Forms.ContextMenuStrip;$mOpen=$menu.Items.Add('Abrir configuracao');$mQuit=$menu.Items.Add('Desligar EzDeck');$tray.ContextMenuStrip=$menu
$open.add_Click({Open-ControlCenter});$mOpen.add_Click({Open-ControlCenter});$tray.add_DoubleClick({Open-ControlCenter});$exit.add_Click({Stop-EzDeck});$mQuit.add_Click({Stop-EzDeck})
$form.add_FormClosing({param($sender,$eventArgs) if(-not $script:closing -and $eventArgs.CloseReason -eq 'UserClosing'){$eventArgs.Cancel=$true;$form.Hide()}})

$timer=New-Object Windows.Forms.Timer;$timer.Interval=150;$tries=0
$timer.add_Tick({
  if($script:child.HasExited){
    # O botão “Desligar EzDeck” do painel fecha o host. Encerrar também esta
    # janela remove o ícone da bandeja, sem exigir um segundo clique.
    $script:closing=$true;$timer.Stop();$form.Close();return
  }
  $tries++
  try{
    $health=Invoke-RestMethod -Uri "$base/health" -TimeoutSec 1 -UseBasicParsing
    if($health.service -ne 'EzDeck'){throw 'Porta ocupada'}
    $info=Api '/api/windows/status'
    $label.Text='PIN '+$info.pin+'  •  '+$(if($info.address){$info.address}else{'rede local'})
    $open.Enabled=$true;$timer.Stop()
    if($OnReady){& $OnReady}else{Open-ControlCenter}
  }catch{
    Write-DesktopError $_
    if(-not $timer.Enabled -or $tries -ge 20){$timer.Stop();$label.Text='Nao foi possivel iniciar.';$form.Show();[Windows.Forms.MessageBox]::Show($_.Exception.Message,'EzDeck')|Out-Null}
  }
})
try{
  # O instalador distribui o runtime Node junto do EzDeck. Durante o
  # desenvolvimento, mantém compatibilidade com o Node já instalado no Windows.
  $bundledNode=Join-Path $root 'runtime\node.exe'
  $node=if(Test-Path -LiteralPath $bundledNode){$bundledNode}else{(Get-Command node -ErrorAction Stop).Source}
  $probe=New-Object Net.Sockets.TcpClient;try{$probe.Connect('127.0.0.1',$Port);$busy=$true}catch{$busy=$false}finally{$probe.Dispose()}
  if($busy){throw "A porta $Port ja esta em uso. Encerre o EzDeck antigo no terminal com Ctrl+C."}
  # Start-Process preserva corretamente o ambiente do Node quando o EzDeck é
  # iniciado sem console pelo atalho da bandeja.
  $oldPort=$env:PORT;$oldToken=$env:EZDECK_HOST_TOKEN;$oldAddress=$env:EZDECK_LAN_ADDRESS
  try {
    # A descoberta do IP ocorre no próprio host, depois que ele estiver ativo.
    # Assim a janela inicial não espera os cmdlets lentos de rede do Windows.
    $env:PORT=[string]$Port;$env:EZDECK_HOST_TOKEN=$script:token;$env:EZDECK_LAN_ADDRESS=$null
    $script:child=Start-Process -FilePath $node -ArgumentList ('"'+(Join-Path $PSScriptRoot 'host.mjs')+'"') -WorkingDirectory $root -WindowStyle Hidden -PassThru
  } finally {
    $env:PORT=$oldPort;$env:EZDECK_HOST_TOKEN=$oldToken;$env:EZDECK_LAN_ADDRESS=$oldAddress
  }
  $timer.Start();[Windows.Forms.Application]::Run($form)
}catch{[Windows.Forms.MessageBox]::Show($_.Exception.Message,'EzDeck')|Out-Null}
finally{
  $timer.Stop();$timer.Dispose();$tray.Visible=$false;$tray.Dispose()
  if($script:child){if(-not $script:child.HasExited){try{Api '/api/windows/shutdown' 'POST' @{}|Out-Null}catch{};if(-not $script:child.WaitForExit(3500)){$script:child.Kill()}};$script:child.Dispose()}
  $form.Dispose()
  if($lifecycle.restartPort){
    # O launcher VBS cria uma nova instância independente e relê a porta que
    # acabou de ser salva. Iniciar outro PowerShell dentro do finally podia
    # herdar o encerramento da instância atual e desaparecer sem reabrir.
    $launcher=Join-Path $root 'EzDeck.vbs'
    Start-Process -FilePath 'wscript.exe' -ArgumentList ('"'+$launcher+'"') -WorkingDirectory $root -WindowStyle Hidden
  }
}
