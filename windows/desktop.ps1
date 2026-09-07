[CmdletBinding()]
param([ValidateRange(1,65535)][int]$Port = 3100, [scriptblock]$OnReady)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$mutex = New-Object Threading.Mutex($false, "Local\EzDeck.Windows.$Port")
if (-not $mutex.WaitOne(0)) {
  [System.Windows.Forms.MessageBox]::Show('O EzDeck ja esta rodando. Clique duas vezes no icone da bandeja.', 'EzDeck') | Out-Null
  $mutex.Dispose(); exit
}
$script:child=$null; $script:closing=$false; $script:opened=$false
$root=Split-Path -Parent $PSScriptRoot; $base="http://127.0.0.1:$Port"
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
  if(-not $script:web) {
    if(-not (Import-WebView2)){ throw 'O componente WebView2 não foi encontrado. Reinstale o Microsoft Edge WebView2 Runtime.' }
    $script:web=New-Object Microsoft.Web.WebView2.WinForms.WebView2
    $script:web.Dock='Fill'; $script:web.DefaultBackgroundColor=[Drawing.Color]::FromArgb(22,9,4)
    $form.Controls.Add($script:web)
    $navigationUrl=$url
    $script:web.add_CoreWebView2InitializationCompleted(({ param($sender,$event)
      if($event.IsSuccess){
        $sender.CoreWebView2.Settings.AreDefaultContextMenusEnabled=$false; $sender.CoreWebView2.Settings.AreDevToolsEnabled=$false
        $sender.CoreWebView2.add_WebMessageReceived({param($core,$message)
          try {
            $request=$message.WebMessageAsJson|ConvertFrom-Json
            if($request.type -ne 'choose-file'){return}
            $dialog=New-Object Windows.Forms.OpenFileDialog
            $dialog.Title='Adicionar aplicativo, atalho ou script';$dialog.Filter='Apps, atalhos e scripts|*.exe;*.lnk;*.appref-ms;*.bat;*.cmd'
            try { if($dialog.ShowDialog($form) -eq 'OK'){ $core.PostWebMessageAsJson((@{type='file';path=$dialog.FileName;name=[IO.Path]::GetFileName($dialog.FileName)}|ConvertTo-Json -Compress)) } } finally { $dialog.Dispose() }
          }catch{}
        })
        $sender.CoreWebView2.Navigate($navigationUrl)
      }
      else { [Windows.Forms.MessageBox]::Show('Não foi possível iniciar o painel: '+$event.InitializationException.Message,'EzDeck')|Out-Null }
    }).GetNewClosure())
    # PowerShell is hosted from a protected Windows folder.  If WebView2 chooses
    # that executable folder for its default profile, it fails with 0x80070005
    # (E_ACCESSDENIED). Keep the embedded browser profile in the user's AppData.
    $webViewData=Join-Path $env:LOCALAPPDATA 'EzDeck\WebView2'
    [IO.Directory]::CreateDirectory($webViewData) | Out-Null
    $environmentTask=[Microsoft.Web.WebView2.Core.CoreWebView2Environment]::CreateAsync($null,$webViewData,$null)
    $environment=$environmentTask.GetAwaiter().GetResult()
    $null=$script:web.EnsureCoreWebView2Async($environment)
  } else { $script:web.CoreWebView2.Navigate($url) }
  $label.Visible=$false; $open.Visible=$false; $exit.Visible=$false
  $form.ClientSize=New-Object Drawing.Size(1280,820);$form.MinimumSize=New-Object Drawing.Size(900,620);$form.FormBorderStyle='Sizable';$form.MaximizeBox=$true
  $form.Show();$form.WindowState='Normal';$form.Activate();$script:opened=$true
}
function Stop-EzDeck {
  $script:closing=$true; $timer.Stop()
  if($script:child -and -not $script:child.HasExited){try{Api '/api/windows/shutdown' 'POST' @{}|Out-Null}catch{}}
  $form.Close()
}

$form=New-Object Windows.Forms.Form
$form.Text='EzDeck'; $form.ClientSize=New-Object Drawing.Size(330,110); $form.StartPosition='CenterScreen'; $form.FormBorderStyle='FixedDialog'; $form.MaximizeBox=$false; $form.MinimizeBox=$false; $form.BackColor=[Drawing.Color]::FromArgb(25,12,7)
$label=New-Object Windows.Forms.Label
$label.Text='Iniciando EzDeck…';$label.ForeColor=[Drawing.Color]::White;$label.Location=New-Object Drawing.Point(25,22);$label.Size=New-Object Drawing.Size(280,25);$form.Controls.Add($label)
$open=New-Object Windows.Forms.Button
$open.Text='Abrir configuracao';$open.Location=New-Object Drawing.Point(25,58);$open.Size=New-Object Drawing.Size(180,32);$open.Enabled=$false;$form.Controls.Add($open)
$exit=New-Object Windows.Forms.Button
$exit.Text='Desligar';$exit.Location=New-Object Drawing.Point(214,58);$exit.Size=New-Object Drawing.Size(90,32);$form.Controls.Add($exit)
$tray=New-Object Windows.Forms.NotifyIcon
$tray.Text='EzDeck - clique duas vezes para configurar';$tray.Icon=[Drawing.SystemIcons]::Application;$tray.Visible=$true
try{$bmp=New-Object Drawing.Bitmap((Join-Path $root 'public/icon-192.png'));$h=$bmp.GetHicon();$tray.Icon=[Drawing.Icon]::FromHandle($h).Clone();$bmp.Dispose()}catch{}
$menu=New-Object Windows.Forms.ContextMenuStrip;$mOpen=$menu.Items.Add('Abrir configuracao');$mQuit=$menu.Items.Add('Desligar EzDeck');$tray.ContextMenuStrip=$menu
$open.add_Click({Open-ControlCenter});$mOpen.add_Click({Open-ControlCenter});$tray.add_DoubleClick({Open-ControlCenter});$exit.add_Click({Stop-EzDeck});$mQuit.add_Click({Stop-EzDeck})
$form.add_FormClosing({param($sender,$eventArgs) if(-not $script:closing -and $eventArgs.CloseReason -eq 'UserClosing'){$eventArgs.Cancel=$true;$form.Hide()}})

$timer=New-Object Windows.Forms.Timer;$timer.Interval=500;$tries=0
$timer.add_Tick({
  if($script:child.HasExited){$timer.Stop();$label.Text='Servidor encerrado.';return}
  $tries++
  try{
    $health=Invoke-RestMethod -Uri "$base/health" -TimeoutSec 1 -UseBasicParsing
    if($health.service -ne 'EzDeck'){throw 'Porta ocupada'}
    $info=Api '/api/windows/status'
    $label.Text='PIN '+$info.pin+'  •  '+$(if($info.address){$info.address}else{'rede local'})
    $open.Enabled=$true;$timer.Stop()
    if($OnReady){& $OnReady}else{Open-ControlCenter}
  }catch{if($tries -ge 20){$timer.Stop();$label.Text='Nao foi possivel iniciar.';[Windows.Forms.MessageBox]::Show($_.Exception.Message,'EzDeck')|Out-Null}}
})
try{
  $node=(Get-Command node -ErrorAction Stop).Source
  $probe=New-Object Net.Sockets.TcpClient;try{$probe.Connect('127.0.0.1',$Port);$busy=$true}catch{$busy=$false}finally{$probe.Dispose()}
  if($busy){throw "A porta $Port ja esta em uso. Encerre o EzDeck antigo no terminal com Ctrl+C."}
  $start=New-Object Diagnostics.ProcessStartInfo;$start.FileName=$node;$start.Arguments='"'+(Join-Path $PSScriptRoot 'host.mjs')+'"';$start.WorkingDirectory=$root;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.RedirectStandardError=$true
  $start.EnvironmentVariables['PORT']=[string]$Port;$start.EnvironmentVariables['EZDECK_HOST_TOKEN']=$script:token;$start.EnvironmentVariables['EZDECK_LAN_ADDRESS']=(Get-PrimaryLanAddress)
  $script:child=[Diagnostics.Process]::Start($start);$timer.Start();[Windows.Forms.Application]::Run($form)
}catch{[Windows.Forms.MessageBox]::Show($_.Exception.Message,'EzDeck')|Out-Null}
finally{$timer.Stop();$timer.Dispose();$tray.Visible=$false;$tray.Dispose();if($script:child){if(-not $script:child.HasExited){try{Api '/api/windows/shutdown' 'POST' @{}|Out-Null}catch{};if(-not $script:child.WaitForExit(3500)){$script:child.Kill()}};$script:child.Dispose()};$form.Dispose();$mutex.ReleaseMutex();$mutex.Dispose()}
