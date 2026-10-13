// Bundled Windows code only. No client-supplied paths, scripts, desktop
// coordinates or HWNDs are accepted by the remote menu service.
export const NATIVE_MENU_SCRIPT = String.raw`
if (-not ('EzDeckNativeMenu' -as [type])) {
Add-Type -ReferencedAssemblies @('System.Drawing','UIAutomationClient','UIAutomationTypes','WindowsBase') -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Automation;
public static class EzDeckNativeMenu {
  [StructLayout(LayoutKind.Sequential)] struct Rect { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] struct Point { public int X, Y; }
  [StructLayout(LayoutKind.Sequential)] struct MouseInput { public int X,Y; public uint Data,Flags,Time; public UIntPtr Extra; }
  [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public MouseInput Mouse; }
  [StructLayout(LayoutKind.Sequential)] struct Input { public uint Type; public InputUnion Value; }
  delegate bool Callback(IntPtr hwnd, IntPtr data);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern IntPtr FindWindow(string cls,string name);
  [DllImport("user32.dll")] static extern bool EnumWindows(Callback callback,IntPtr data);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd,StringBuilder text,int size);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool GetCursorPos(out Point point);
  [DllImport("user32.dll")] static extern bool SetCursorPos(int x,int y);
  [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(Point point);
  [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr hwnd,uint flag);
  [DllImport("user32.dll")] static extern uint SendInput(uint count,Input[] inputs,int size);
  [DllImport("user32.dll")] static extern bool PostMessage(IntPtr hwnd,uint message,IntPtr w,IntPtr l);
  [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
  static IntPtr popup=IntPtr.Zero, previous=IntPtr.Zero;
  static int selectedPid;
  static DateTime opened;
  public class Frame { public int Width,Height; public string Png; public bool Closed; }
  static string Class(IntPtr hwnd) { var text=new StringBuilder(256); GetClassName(hwnd,text,256); return text.ToString(); }
  static bool Shell(IntPtr hwnd) {
    uint pid; GetWindowThreadProcessId(hwnd,out pid);
    try { var name=Process.GetProcessById((int)pid).ProcessName; return name=="explorer" || name=="ShellExperienceHost"; } catch { return false; }
  }
  static bool AllowedPopup(IntPtr hwnd) {
    if(hwnd==IntPtr.Zero || !IsWindowVisible(hwnd) || !Shell(hwnd)) return false;
    string cls=Class(hwnd);
    return cls=="DV2ControlHost" || cls=="Windows.UI.Core.CoreWindow" || cls=="Xaml_WindowedPopupClass" || cls=="#32768";
  }
  static bool Bounds(out Rect rect) {
    rect=new Rect();
    if(!AllowedPopup(popup) || !GetWindowRect(popup,out rect)) return false;
    int width=rect.Right-rect.Left,height=rect.Bottom-rect.Top;
    return width>=40 && width<=1000 && height>=20 && height<=1600;
  }
  static void Mouse(int x,int y,uint down,uint up) {
    Point old; GetCursorPos(out old);
    try {
      SetCursorPos(x,y);
      var events=new Input[] {
        new Input{Type=0,Value=new InputUnion{Mouse=new MouseInput{Flags=down}}},
        new Input{Type=0,Value=new InputUnion{Mouse=new MouseInput{Flags=up}}}
      };
      if(SendInput(2,events,Marshal.SizeOf(typeof(Input)))!=2) throw new InvalidOperationException("O Windows recusou o toque");
    } finally { SetCursorPos(old.X,old.Y); }
  }
  public static Frame Open(string name,string identity,int pid) {
    Close(); SetProcessDPIAware();
    if(pid<=0) throw new InvalidOperationException("Aplicativo indisponível");
    Process.GetProcessById(pid); // Never target a disappeared app.
    IntPtr tray=FindWindow("Shell_TrayWnd",null);
    if(tray==IntPtr.Zero) throw new InvalidOperationException("Barra de tarefas indisponível");
    var root=AutomationElement.FromHandle(tray);
    var buttons=root.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Button));
    var exact=new List<AutomationElement>(); var names=new List<AutomationElement>();
    foreach(AutomationElement button in buttons) {
      try {
        string id=button.Current.AutomationId??"",text=button.Current.Name??"";
        if(!String.IsNullOrEmpty(identity) && (String.Equals(id,"Appid:"+identity,StringComparison.OrdinalIgnoreCase) || String.Equals(id,identity,StringComparison.OrdinalIgnoreCase))) exact.Add(button);
        if(String.Equals(text,name,StringComparison.OrdinalIgnoreCase) || text.StartsWith(name+",",StringComparison.OrdinalIgnoreCase)) names.Add(button);
      } catch(ElementNotAvailableException) { }
    }
    var matches=exact.Count>0 ? exact : names;
    if(matches.Count!=1) throw new InvalidOperationException("Não foi possível identificar um único ícone na barra de tarefas");
    var box=matches[0].Current.BoundingRectangle;
    if(matches[0].Current.IsOffscreen || box.IsEmpty) throw new InvalidOperationException("Ícone não está visível na barra de tarefas");
    var before=new HashSet<IntPtr>(); EnumWindows(delegate(IntPtr h,IntPtr d){ if(AllowedPopup(h)) before.Add(h); return true; },IntPtr.Zero);
    previous=GetForegroundWindow(); selectedPid=pid;
    Mouse((int)(box.Left+box.Width/2),(int)(box.Top+box.Height/2),0x0008,0x0010);
    for(int n=0;n<24;n++) {
      IntPtr found=IntPtr.Zero;
      EnumWindows(delegate(IntPtr h,IntPtr d){ if(!before.Contains(h) && AllowedPopup(h)) found=h; return true; },IntPtr.Zero);
      if(found!=IntPtr.Zero) { popup=found; opened=DateTime.UtcNow; return Capture(); }
      Thread.Sleep(50);
    }
    throw new InvalidOperationException("O menu nativo não foi disponibilizado pelo Windows");
  }
  public static Frame Capture() {
    Rect box;
    if((DateTime.UtcNow-opened).TotalSeconds>60 || !Bounds(out box)) { Close(); return new Frame{Closed=true}; }
    // Do not capture a menu obscured by another window, or any full desktop.
    Point middle=new Point{X=box.Left+(box.Right-box.Left)/2,Y=box.Top+(box.Bottom-box.Top)/2};
    IntPtr hit=WindowFromPoint(middle);
    if(GetAncestor(hit,2)!=popup && hit!=popup) { Close(); return new Frame{Closed=true}; }
    using(var bitmap=new Bitmap(box.Right-box.Left,box.Bottom-box.Top,PixelFormat.Format32bppArgb)) {
      using(var graphics=Graphics.FromImage(bitmap)) graphics.CopyFromScreen(box.Left,box.Top,0,0,bitmap.Size,CopyPixelOperation.SourceCopy);
      using(var output=new MemoryStream()) {
        bitmap.Save(output,ImageFormat.Png);
        return new Frame{Width=bitmap.Width,Height=bitmap.Height,Png=Convert.ToBase64String(output.ToArray())};
      }
    }
  }
  public static Frame Tap(double x,double y) {
    Rect box;
    if(Double.IsNaN(x)||Double.IsNaN(y)||x<0||y<0||x>=1||y>=1||!Bounds(out box)) throw new InvalidOperationException("Toque inválido");
    Process.GetProcessById(selectedPid);
    int px=box.Left+(int)((box.Right-box.Left)*x),py=box.Top+(int)((box.Bottom-box.Top)*y);
    IntPtr hit=WindowFromPoint(new Point{X=px,Y=py});
    if(hit!=popup && GetAncestor(hit,2)!=popup) throw new InvalidOperationException("O menu não está mais ativo");
    Mouse(px,py,0x0002,0x0004);
    previous=IntPtr.Zero; // Preserve the focus chosen by the menu action.
    Thread.Sleep(100);
    return Capture();
  }
  public static void Close() {
    if(popup!=IntPtr.Zero && AllowedPopup(popup)) PostMessage(popup,0x001F,IntPtr.Zero,IntPtr.Zero); // WM_CANCELMODE, never global Escape.
    popup=IntPtr.Zero;
    if(previous!=IntPtr.Zero && IsWindow(previous)) SetForegroundWindow(previous);
    previous=IntPtr.Zero;
  }
}
'@
}
$op=$args[0]
switch($op) {
  'open' { [EzDeckNativeMenu]::Open($args[1],$args[2],[int]$args[3]) | ConvertTo-Json -Compress }
  'frame' { [EzDeckNativeMenu]::Capture() | ConvertTo-Json -Compress }
  'tap' { [EzDeckNativeMenu]::Tap([double]::Parse($args[1],[Globalization.CultureInfo]::InvariantCulture),[double]::Parse($args[2],[Globalization.CultureInfo]::InvariantCulture)) | ConvertTo-Json -Compress }
  'close' { [EzDeckNativeMenu]::Close(); '{"Closed":true}' }
  'ready' { '{"Ready":true}' }
  default { throw 'Operação inválida' }
}
`;
