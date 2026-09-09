param([string]$TestDirectory,[int]$TestPort=3169)
$env:EZDECK_DATA_DIR=$TestDirectory
. (Join-Path $PSScriptRoot '../windows/desktop.ps1') -Port $TestPort -OnReady {
  Open-ControlCenter
  # Re-entrant open used by a second tray double-click during initialization.
  Open-ControlCenter
  $script:check=New-Object Windows.Forms.Timer
  $script:check.Interval=250
  $script:check.add_Tick({
    if($script:web.CoreWebView2 -and $script:web.CoreWebView2.Source -like '*windows.html*'){
      $script:check.Stop()
      $code='window.chrome.webview.postMessage({type:"restart",port:'+($Port+1)+'})'
      $null=$script:web.CoreWebView2.ExecuteScriptAsync($code)
    }
  })
  $script:check.Start()
}
