import test from "node:test";
import assert from "node:assert/strict";
import { runPowerShell } from "../platform/windows/apps.js";
import { BROWSER_WINDOWS_SCRIPT } from "../platform/windows/browser-windows.js";

test("outra área virtual permanece acessível, mas janela escondida pelo app não", { skip:process.platform !== "win32" }, async () => {
  const result = JSON.parse((await runPowerShell(BROWSER_WINDOWS_SCRIPT + String.raw`
@(
  [EzDeckBrowserWindows]::IncludeCloakedWindow(0,$false,$true)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(2,$true,$false)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(2,$true,$true)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(2,$false,$false)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(1,$true,$false)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(3,$true,$false)
  [EzDeckBrowserWindows]::IncludeCloakedWindow(4,$true,$false)
) | ConvertTo-Json -Compress
`)).stdout);
  assert.deepEqual(result, [true,true,false,false,false,false,false]);
});

test("janelas de tray, ferramentas e cloaked não são apps abertos; minimizadas continuam", { skip:process.platform !== "win32" }, async () => {
  // Janelas descartáveis deste processo, sem ativação e fora da área de trabalho.
  // Não alteramos janelas nem processos de outros aplicativos durante o teste.
  const fixture = BROWSER_WINDOWS_SCRIPT + String.raw`
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class EzDeckWindowFixture {
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern IntPtr CreateWindowEx(uint ex, string cls, string name, uint style, int x, int y, int w, int h, IntPtr owner, IntPtr menu, IntPtr module, IntPtr parameter);
  [DllImport("user32.dll")] static extern bool DestroyWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr hwnd, int mode);
  [DllImport("user32.dll", EntryPoint="GetWindowLongW")] static extern int GetWindowLong(IntPtr hwnd, int index);
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd, uint command);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr hwnd, uint attribute, out uint value, uint size);
  [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd, uint attribute, ref int value, uint size);
  static List<IntPtr> handles = new List<IntPtr>();
  public static IntPtr Create(string name, uint ex, uint style, IntPtr owner) {
    IntPtr hwnd = CreateWindowEx(ex, "STATIC", "ezdeck-fixture-" + name, style, -32000, -32000, 200, 100, owner, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero);
    if (hwnd == IntPtr.Zero) throw new InvalidOperationException("fixture creation failed");
    handles.Add(hwnd); return hwnd;
  }
  public static void Setup() {
    uint passiveApp = 0x08040000; // NOACTIVATE + APPWINDOW
    uint visible = 0x10cf0000; // WS_VISIBLE + OVERLAPPEDWINDOW
    IntPtr parent = Create("visible", passiveApp, visible, IntPtr.Zero);
    Create("minimized", passiveApp, visible | 0x20000000, IntPtr.Zero);
    Create("tray-hidden", passiveApp, 0x00cf0000, IntPtr.Zero);
    Create("tool", 0x08000080, visible, IntPtr.Zero);
    Create("noactivate", 0x08000000, visible, IntPtr.Zero);
    Create("owned-popup", 0x08000000, visible, parent);
    Create("owned-appwindow", passiveApp, visible, parent);
    IntPtr cloaked = Create("cloaked", passiveApp, visible, IntPtr.Zero);
    int value = 1;
    if (DwmSetWindowAttribute(cloaked, 13, ref value, 4) != 0) throw new InvalidOperationException("fixture cloak failed");
    // Establish the visible fixture after constructing all owned companions.
    ShowWindow(parent, 8); // SW_SHOWNA, never activate the test window.
  }
  public static void Cleanup() {
    for (int i = handles.Count - 1; i >= 0; i--) DestroyWindow(handles[i]);
  }
  public static string[] States() {
    var result = new List<string>();
    foreach (IntPtr hwnd in handles) {
      uint cloaked; DwmGetWindowAttribute(hwnd, 14, out cloaked, 4);
      result.Add("visible=" + IsWindowVisible(hwnd) + ",styles=" + unchecked((uint)GetWindowLong(hwnd, -20)).ToString("X") + ",owned=" + (GetWindow(hwnd, 4) != IntPtr.Zero) + ",cloaked=" + cloaked);
    }
    return result.ToArray();
  }
}
'@
try {
  [EzDeckWindowFixture]::Setup()
  $windows=@([EzDeckBrowserWindows]::List([int[]]@($PID)))
  [pscustomobject]@{
    names=@($windows | ForEach-Object { $_.Title -replace '^ezdeck-fixture-','' })
    foreignCount=@([EzDeckBrowserWindows]::List([int[]]@(-1))).Count
    states=[EzDeckWindowFixture]::States()
  } | ConvertTo-Json -Compress
} finally { [EzDeckWindowFixture]::Cleanup() }
`;
  const result = JSON.parse((await runPowerShell(fixture)).stdout);
  assert.deepEqual(result.names.sort(), ["minimized", "owned-appwindow", "visible"], JSON.stringify(result.states));
  assert.equal(result.foreignCount, 0);
});
