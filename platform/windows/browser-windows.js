// User-facing windows, shared by app discovery and focus. Chromium PWAs share
// the browser process, so their identity belongs to each window, not its PID.
export const BROWSER_WINDOWS_SCRIPT = String.raw`
if (-not ('EzDeckBrowserWindows' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public static class EzDeckBrowserWindows {
  public class Window { public long Handle; public int Pid; public string Title; public string AppUserModelId; }
  delegate bool Callback(IntPtr hwnd, IntPtr data);
  [DllImport("user32.dll")] static extern bool EnumWindows(Callback callback, IntPtr data);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd, uint command);
  [DllImport("user32.dll", EntryPoint="GetWindowLongW")] static extern int GetWindowLong(IntPtr hwnd, int index);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr hwnd, uint attribute, out uint value, uint size);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int count);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr hwnd, int mode);
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
  [StructLayout(LayoutKind.Sequential)] struct PropertyKey { public Guid Format; public uint Id; }
  [ComImport, Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface PropertyStore {
    [PreserveSig] int GetCount(out uint count);
    [PreserveSig] int GetAt(uint index, out PropertyKey key);
    [PreserveSig] int GetValue(ref PropertyKey key, IntPtr value);
    [PreserveSig] int SetValue(ref PropertyKey key, IntPtr value);
    [PreserveSig] int Commit();
  }
  [DllImport("shell32.dll")] static extern int SHGetPropertyStoreForWindow(IntPtr hwnd, ref Guid iid, out PropertyStore store);
  [DllImport("ole32.dll")] static extern int PropVariantClear(IntPtr value);
  [ComImport, Guid("A5CD92FF-29BE-454C-8D04-D82879FB3F1B"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface VirtualDesktopManager {
    [PreserveSig] int IsWindowOnCurrentVirtualDesktop(IntPtr hwnd, [MarshalAs(UnmanagedType.Bool)] out bool current);
    [PreserveSig] int GetWindowDesktopId(IntPtr hwnd, out Guid id);
    [PreserveSig] int MoveWindowToDesktop(IntPtr hwnd, ref Guid id);
  }
  public static bool IncludeCloakedWindow(uint cloaked, bool knownDesktop, bool onCurrentDesktop) {
    // An app's own hidden windows are not open apps. A real window hidden
    // only by the shell on another virtual desktop is still available.
    return cloaked == 0 || (cloaked == 2 && knownDesktop && !onCurrentDesktop);
  }
  static bool IsAppWindow(IntPtr hwnd, VirtualDesktopManager desktops) {
    if (!IsWindowVisible(hwnd)) return false;
    uint styles = unchecked((uint)GetWindowLong(hwnd, -20));
    bool appWindow = (styles & 0x00040000) != 0; // WS_EX_APPWINDOW
    if ((styles & 0x00000080) != 0) return false; // WS_EX_TOOLWINDOW
    if (!appWindow && ((styles & 0x08000000) != 0 || GetWindow(hwnd, 4) != IntPtr.Zero)) return false;
    uint cloaked;
    if (DwmGetWindowAttribute(hwnd, 14, out cloaked, 4) == 0 && cloaked != 0) {
      bool current = true;
      Guid desktop = Guid.Empty;
      bool known = desktops != null && desktops.IsWindowOnCurrentVirtualDesktop(hwnd, out current) == 0 &&
        desktops.GetWindowDesktopId(hwnd, out desktop) == 0 && desktop != Guid.Empty;
      if (!IncludeCloakedWindow(cloaked, known, current)) return false;
    }
    return true; // Normal minimized windows remain available for restore.
  }
  static string Identity(IntPtr hwnd) {
    PropertyStore store = null;
    IntPtr value = IntPtr.Zero;
    try {
      Guid iid = typeof(PropertyStore).GUID;
      if (SHGetPropertyStoreForWindow(hwnd, ref iid, out store) != 0 || store == null) return null;
      PropertyKey key = new PropertyKey { Format = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"), Id = 5 };
      value = Marshal.AllocCoTaskMem(24);
      for (int i = 0; i < 24; i++) Marshal.WriteByte(value, i, 0);
      if (store.GetValue(ref key, value) != 0 || Marshal.ReadInt16(value) != 31) return null;
      return Marshal.PtrToStringUni(Marshal.ReadIntPtr(value, 8));
    } catch { return null; }
    finally {
      if (value != IntPtr.Zero) { PropVariantClear(value); Marshal.FreeCoTaskMem(value); }
      if (store != null) Marshal.ReleaseComObject(store);
    }
  }
  public static Window[] List(int[] processIds) {
    var allowed = new HashSet<int>(processIds);
    var result = new List<Window>();
    VirtualDesktopManager desktops = null;
    try { desktops = (VirtualDesktopManager)Activator.CreateInstance(Type.GetTypeFromCLSID(new Guid("AA509086-5CA9-4C25-8F95-589D3C07B48A"))); }
    catch { /* Older Windows editions still list current desktop apps. */ }
    try {
    EnumWindows(delegate(IntPtr hwnd, IntPtr unused) {
      uint pid; GetWindowThreadProcessId(hwnd, out pid);
      if (!allowed.Contains((int)pid) || !IsAppWindow(hwnd, desktops)) return true;
      var title = new StringBuilder(1024);
      if (GetWindowText(hwnd, title, title.Capacity) == 0) return true;
      result.Add(new Window { Handle = hwnd.ToInt64(), Pid = (int)pid, Title = title.ToString(), AppUserModelId = Identity(hwnd) });
      return true;
    }, IntPtr.Zero);
    } finally { if (desktops != null) Marshal.ReleaseComObject(desktops); }
    return result.ToArray();
  }
  public static bool Focus(long handle) {
    var hwnd = new IntPtr(handle);
    if (IsIconic(hwnd)) ShowWindowAsync(hwnd, 9);
    return SetForegroundWindow(hwnd);
  }
}
'@
}
`;
