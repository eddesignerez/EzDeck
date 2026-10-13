import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { BROWSER_WINDOWS_SCRIPT } from "./browser-windows.js";
import { addChromeProfileApps, listChromeProfiles, matchingChromeProfileApp } from "./browser-profiles.js";
const exec = (file, args, { input, ...options }) => new Promise((resolve, reject) => {
  const child = execFile(file, args, options, (error, stdout, stderr) => error ? reject(error) : resolve({ stdout, stderr }));
  child.stdin.on("error", () => {});
  child.stdin.end(input);
});
const SHORTCUT_EXTENSIONS = new Set([".lnk", ".appref-ms"]);
const STORE_APPS_SCRIPT = String.raw`
$packages=@{}
Get-AppxPackage|ForEach-Object{$packages[$_.PackageFamilyName]=$_.InstallLocation}
$manifests=@{}
Get-StartApps|ForEach-Object{
  $start=$_
  $iconPath=$null
  if($start.AppID -like '*!*'){
    $parts=$start.AppID -split '!',2
    $family=$parts[0]
    $identity=$parts[1]
    $location=$packages[$family]
    if($location){
      try{
        if(-not $manifests.ContainsKey($family)){$manifests[$family]=[xml](Get-Content -LiteralPath (Join-Path $location 'AppxManifest.xml') -Raw)}
        $manifest=$manifests[$family]
        $application=@($manifest.SelectNodes("//*[local-name()='Application']"))|Where-Object{$_.Id -eq $identity}|Select-Object -First 1
        $visual=$application.SelectSingleNode("./*[local-name()='VisualElements']")
        $asset=$visual.GetAttribute('Square44x44Logo')
        if(-not $asset){$asset=$visual.GetAttribute('Square150x150Logo')}
        if($asset){
          $plain=Join-Path $location ($asset -replace '/','\')
          $folder=Split-Path $plain -Parent
          $stem=[IO.Path]::GetFileNameWithoutExtension($plain)
          $candidate=Get-ChildItem -LiteralPath $folder -File -ErrorAction SilentlyContinue|Where-Object{$_.Extension -eq '.png' -and $_.BaseName -like "$stem*"}|Sort-Object @{Expression={if($_.Name -match 'targetsize-(\d+)'){100000+([int]$Matches[1]*1000)+[int]$_.Length}elseif($_.Name -match 'scale-(\d+)'){50000+([int]$Matches[1]*100)+[int]$_.Length}else{[int]$_.Length}};Descending=$true}|Select-Object -First 1
          if($candidate){$iconPath=$candidate.FullName}elseif(Test-Path -LiteralPath $plain){$iconPath=$plain}
        }
      }catch{}
    }
  }
  [pscustomobject]@{name=$start.Name;appId=$start.AppID;iconPath=$iconPath}
}|ConvertTo-Json -Compress
`;
// O nome do processo raramente é um bom rótulo para pessoas (por exemplo,
// ApplicationFrameHost). Coletamos metadados locais do executável para que a
// tela remota possa mostrar o nome do aplicativo, não uma sigla técnica.
const PROCESS_SCRIPT = BROWSER_WINDOWS_SCRIPT + String.raw`
$processes=@{}
Get-Process | ForEach-Object { $processes[[int]$_.Id]=$_ }
$metadata=@{}
$rows=@([EzDeckBrowserWindows]::List([int[]]@($processes.Keys)) | ForEach-Object {
  $window=$_
  if (-not $metadata.ContainsKey($window.Pid)) {
    $process=$processes[$window.Pid]
    $metadata[$window.Pid]=[pscustomobject]@{
      name=$process.ProcessName
      pid=$process.Id
      path=$(try { $process.Path } catch { $null })
      description=$(try { $process.MainModule.FileVersionInfo.FileDescription } catch { $null })
      product=$(try { $process.MainModule.FileVersionInfo.ProductName } catch { $null })
    }
  }
  $row=$metadata[$window.Pid]
  [pscustomobject]@{name=$row.name;pid=$row.pid;path=$row.path;title=$window.Title;description=$row.description;product=$row.product;appUserModelId=$window.AppUserModelId}
})
$rows | ConvertTo-Json -Compress`;
const MENU_SHORTCUTS_SCRIPT = String.raw`
$shell=New-Object -ComObject WScript.Shell
$explorer=New-Object -ComObject Shell.Application
@($args | ForEach-Object {
  $p=$_; $target=$p; $appId=$null; $aumid=$null; $icon=$null
  if ([IO.Path]::GetExtension($p) -eq '.lnk') {
    try {
      $shortcut=$shell.CreateShortcut($p); $target=$shortcut.TargetPath
      # Atalhos comuns também podem ter ícone próprio, separado do runtime.
      $location=$shortcut.IconLocation -replace ',\s*-?\d+$',''
      if ([IO.Path]::IsPathRooted($location) -and [IO.Path]::GetExtension($location) -eq '.ico' -and (Test-Path -LiteralPath $location -PathType Leaf)) { $icon=$location }
      if ($shortcut.Arguments -match '--app-id[=\s]+"?([a-p]{32})(?:"|\s|$)') {
        $appId=$Matches[1]
        try { $folder=$explorer.Namespace([IO.Path]::GetDirectoryName($p)); $item=$folder.ParseName([IO.Path]::GetFileName($p)); $aumid=$item.ExtendedProperty('System.AppUserModel.ID') } catch {}
      }
    } catch {}
  }
  [pscustomobject]@{path=$p;targetPath=$target;pwaAppId=$appId;appUserModelId=$aumid;iconSource=$icon}
}) | ConvertTo-Json -Compress
`;
const SHORTCUT_SCRIPT = "$shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut($args[0]); [pscustomobject]@{ target = $shortcut.TargetPath } | ConvertTo-Json -Compress";
const ICON_SCRIPT = String.raw`
Add-Type -AssemblyName System.Drawing
$source=$args[0]
$extension=[IO.Path]::GetExtension($source)
if($extension -and $extension.Equals('.png',[StringComparison]::OrdinalIgnoreCase)){
  Copy-Item -LiteralPath $source -Destination $args[1] -Force
  exit 0
}
$icon=$null
if($source -like 'shell:AppsFolder\*') {
  if(-not ('EzDeckShellIcon' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Runtime.InteropServices;
public static class EzDeckShellIcon {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  struct SHFILEINFO { public IntPtr hIcon; public int iIcon; public uint dwAttributes; [MarshalAs(UnmanagedType.ByValTStr, SizeConst=260)] public string szDisplayName; [MarshalAs(UnmanagedType.ByValTStr, SizeConst=80)] public string szTypeName; }
  [DllImport("shell32.dll", CharSet=CharSet.Unicode)] static extern int SHParseDisplayName(string name, IntPtr bind, out IntPtr pidl, uint mask, out uint attrs);
  [DllImport("shell32.dll", CharSet=CharSet.Unicode)] static extern IntPtr SHGetFileInfo(IntPtr pidl, uint attrs, out SHFILEINFO info, uint size, uint flags);
  [DllImport("user32.dll")] static extern bool DestroyIcon(IntPtr handle);
  public static Icon Get(string path) {
    IntPtr pidl; uint attrs;
    if (SHParseDisplayName(path, IntPtr.Zero, out pidl, 0, out attrs) != 0 || pidl == IntPtr.Zero) return null;
    try {
      SHFILEINFO info;
      IntPtr result=SHGetFileInfo(pidl, 0, out info, (uint)Marshal.SizeOf(typeof(SHFILEINFO)), 0x00000108);
      if(result == IntPtr.Zero || info.hIcon == IntPtr.Zero) return null;
      try { return (Icon)Icon.FromHandle(info.hIcon).Clone(); }
      finally { DestroyIcon(info.hIcon); }
    } finally { Marshal.FreeCoTaskMem(pidl); }
  }
}
'@
  }
  $icon=[EzDeckShellIcon]::Get($source)
} elseif ($extension.Equals('.ico',[StringComparison]::OrdinalIgnoreCase)) {
  $icon=New-Object System.Drawing.Icon -ArgumentList $source,([System.Drawing.Size]::new(256,256))
} else {
  $icon=[System.Drawing.Icon]::ExtractAssociatedIcon($source)
}
if($null -eq $icon){exit 1}
$bitmap=$icon.ToBitmap()
try{$bitmap.Save($args[1],[System.Drawing.Imaging.ImageFormat]::Png)}finally{$bitmap.Dispose();$icon.Dispose()}
`;

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

const GENERIC_WINDOW_HOSTS = new Set([
  "applicationframehost",
  "application frame host",
  "rundll32",
  "dllhost",
]);

// Atalhos de apps/scripts diferentes podem apontar para o mesmo runtime.
// O caminho do runtime não identifica qual deles está aberto.
const SHARED_LAUNCHER_HOSTS = new Set([
  "powershell",
  "pwsh",
  "cmd",
  "wscript",
  "cscript",
  "node",
  "python",
  "pythonw",
  "explorer",
]);

// Estes processos podem ter janela, mas são infraestrutura do Windows ou de
// utilitários do sistema. Eles não representam um aplicativo que o usuário
// consiga reabrir pelo EzDeck e ainda costumam não expor um ícone próprio.
const NON_USER_FACING_PROCESS_KEYS = new Set([
  "applicationframehost",
  "phoneexperiencehost",
  "textinputhost",
  "systemsettings",
  "systemsettingsbroker",
  "powertoysquickaccess",
  "windowssoftwaredevelopmentkit",
  "searchhost",
  "shellexperiencehost",
  "startmenuexperiencehost",
  "runtimebroker",
  "backgroundtaskhost",
  "taskhostw",
]);

function cleanAppLabel(value) {
  const label = String(value || "").replace(/\s+/g, " ").trim();
  return label || null;
}

function runningAppKey(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "");
}

export function isUserFacingRunningApp(process) {
  return ![process?.name, process?.description, process?.product]
    .map(runningAppKey)
    .some(key => NON_USER_FACING_PROCESS_KEYS.has(key));
}

/**
 * Escolhe um nome que uma pessoa reconhece, sem depender do título de uma aba
 * quando há descrição do executável ou entrada correspondente no Menu Iniciar.
 */
export function readableRunningAppName(process, installedApps = []) {
  const identity = normalize(process?.appUserModelId);
  const pwa = identity && installedApps.find(app => app.pwaAppId && (
    app.appUserModelId ? identity === normalize(app.appUserModelId) :
      identity.includes(`._crx_${app.pwaAppId}`) && normalize(dirname(app.targetPath || "")) === normalize(dirname(process.path || ""))
  ));
  if (pwa) return pwa.name;
  const profile = matchingChromeProfileApp(process, installedApps);
  if (profile) return profile.name;
  const store = identity && installedApps.find(app => app.store && normalize(app.path) === `shell:appsfolder\\${identity}`);
  if (store) return store.name;
  const title = cleanAppLabel(process?.title);
  // Só reutilizamos um título quando ele é exatamente o nome de um app local.
  // Isso corrige descrições antigas (ChatGPT com FileDescription "Codex") sem
  // enviar títulos de documentos, abas ou conversas para o dispositivo remoto.
  const titledApp = title && installedApps.find(app => normalize(app.name) === normalize(title));
  if (titledApp) return titledApp.name;
  const processName = cleanAppLabel(process?.name);
  const isGenericHost = GENERIC_WINDOW_HOSTS.has(normalize(processName)) || SHARED_LAUNCHER_HOSTS.has(normalize(processName));
  const path = normalize(process?.path);
  const installed = !isGenericHost && path && installedApps.find(app =>
    !app.pwaAppId && !app.browserProfileDirectory && path === normalize(app.targetPath || app.path)
  );
  if (installed?.name) return String(installed.name);

  const description = cleanAppLabel(process?.description);
  const product = cleanAppLabel(process?.product);

  // Para hosts genéricos do Windows, o título da janela é a única identidade
  // visível do app hospedado (por exemplo, "Configurações").
  if (GENERIC_WINDOW_HOSTS.has(normalize(processName)) && title) return title;
  if (SHARED_LAUNCHER_HOSTS.has(normalize(processName)) && normalize(title) === "ezdeck") return "EzDeck";
  return description || product || title || processName || "Aplicativo";
}

export function defaultStartMenuDirectories(env = process.env) {
  const home = homedir();
  const programData = env.ProgramData || "C:\\ProgramData";
  const appData = env.APPDATA || join(home, "AppData", "Roaming");
  return [
    join(programData, "Microsoft", "Windows", "Start Menu", "Programs"),
    join(appData, "Microsoft", "Windows", "Start Menu", "Programs"),
  ];
}

export async function runPowerShell(script, args = [], run = exec) {
  // -Command appends arguments to source text; paths with spaces and $ are not
  // safe there. Encode the entire wrapper and deserialize arguments as data.
  const wrapper = `$ErrorActionPreference='Stop'; [Console]::InputEncoding=New-Object System.Text.UTF8Encoding; [Console]::OutputEncoding=New-Object System.Text.UTF8Encoding; $ezArgs=ConvertFrom-Json ([Console]::In.ReadToEnd()); & { ${script} } @ezArgs`;
  return run("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(wrapper, "utf16le").toString("base64")], { input: JSON.stringify(args), windowsHide: true, timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
}

export async function findStartMenuShortcuts(directory, deps = {}, depth = 0) {
  const readDirectory = deps.readdir || readdir;
  if (depth > (deps.maxDepth ?? 5)) return [];
  let entries;
  try { entries = await readDirectory(directory, { withFileTypes: true }); } catch { return []; }
  const found = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...await findStartMenuShortcuts(fullPath, deps, depth + 1));
    } else if (SHORTCUT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      found.push(fullPath);
    }
  }
  return found;
}

export async function resolveWindowsShortcut(shortcutPath, deps = {}) {
  const result = await runPowerShell(SHORTCUT_SCRIPT, [shortcutPath], deps.runPowerShell);
  try {
    const value = JSON.parse(String(result.stdout || "{}"));
    return typeof value.target === "string" && value.target.trim() ? value.target.trim() : shortcutPath;
  } catch {
    return shortcutPath;
  }
}

export function appNameFromShortcut(shortcutPath) {
  return basename(shortcutPath, extname(shortcutPath)).replace(/\s+/g, " ").trim();
}

export function deduplicateWindowsApps(apps) {
  const seen = new Set();
  const result = [];
  for (const app of apps) {
    if (!app?.name || !app?.path) continue;
    const key = normalize(app.name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name: app.name, path: app.path, icon: app.icon !== false, ...(app.displayName ? { displayName: app.displayName } : {}), ...(app.targetPath ? { targetPath: app.targetPath } : {}), ...(app.iconSource ? { iconSource: app.iconSource } : {}), ...(app.store ? { store: true } : {}), ...(app.pwaAppId ? { pwaAppId: app.pwaAppId, ...(app.appUserModelId ? { appUserModelId: app.appUserModelId } : {}) } : {}), ...(app.browserProfileDirectory ? { browserProfileDirectory: app.browserProfileDirectory } : {}) });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

/**
 * Lê somente atalhos criados pelo próprio Windows/instaladores. O caminho que
 * será aberto nunca vem da rede: ele é resolvido e guardado neste inventário.
 */
export async function scanWindowsApps(deps = {}) {
  const directories = deps.directories || defaultStartMenuDirectories(deps.env);
  const discover = deps.findShortcuts || findStartMenuShortcuts;
  const resolveShortcut = deps.resolveShortcut || resolveWindowsShortcut;
  const apps = [];
  if (!deps.resolveShortcut) {
    const paths = (await Promise.all(directories.map(directory => discover(directory, deps)))).flat();
    // Resolve the complete menu in one process. Launch the .lnk itself to
    // preserve installer arguments, working directory and shell activation.
    // A resolução dos atalhos e a leitura da Microsoft Store são independentes.
    // Rodá-las em paralelo reduz visivelmente a primeira abertura do EzDeck.
    const targetsTask = (paths.length ? runPowerShell(MENU_SHORTCUTS_SCRIPT, paths, deps.runPowerShell) : Promise.resolve({ stdout: "[]" }))
      .then(output => {
        const parsed = JSON.parse(output.stdout || "[]");
        return new Map((Array.isArray(parsed) ? parsed : [parsed]).map(item => [item.path, item]));
      })
      .catch(() => new Map());
    const storeApps = [];
    const storeTask = (deps.listStoreApps
        ? deps.listStoreApps()
        : runPowerShell(STORE_APPS_SCRIPT, [], deps.runPowerShell).then(output => JSON.parse(output.stdout || "[]")))
      .catch(() => []);
    const [targets, raw] = await Promise.all([targetsTask, storeTask]);
    try {
      for (const item of (Array.isArray(raw) ? raw : [raw])) {
        if (item?.name && item?.appId) storeApps.push({ name: String(item.name), path: `shell:AppsFolder\\${item.appId}`, icon: true, ...(item.iconPath ? { iconSource: String(item.iconPath) } : {}), store: true });
      }
    } catch { /* Get-StartApps may be unavailable on older Windows editions. */ }
    const menuApps = paths.map(path => ({ name: appNameFromShortcut(path), ...targets.get(path), path }));
    // Pacotes com asset oficial vêm primeiro. Para entradas sem asset (muitos
    // programas Win32 também aparecem em Get-StartApps), o .lnk é uma fonte de
    // ícone melhor; a identidade AppsFolder fica apenas como último recurso.
    const inventory = deduplicateWindowsApps([
      ...storeApps.filter(app => app.iconSource),
      ...menuApps,
      ...storeApps.filter(app => !app.iconSource),
    ]);
    const chromeInstalled = inventory.some(app => /[\\/]Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/i.test(app.targetPath || app.path));
    const profiles = chromeInstalled ? await (deps.listChromeProfiles || (() => listChromeProfiles({ env: deps.env })))() : [];
    return deduplicateWindowsApps(addChromeProfileApps(inventory, profiles));
  }
  for (const directory of directories) {
    const shortcuts = await discover(directory, deps);
    for (const shortcut of shortcuts) {
      const name = appNameFromShortcut(shortcut);
      if (!name) continue;
      let target = shortcut;
      try { target = await resolveShortcut(shortcut, deps); } catch {}
      apps.push({ name, path: target || shortcut });
    }
  }
  return deduplicateWindowsApps(apps);
}

export function createWindowsApps(deps = {}) {
  const ttlMs = deps.ttlMs ?? 120_000;
  const scan = deps.scan || (() => scanWindowsApps(deps));
  const cacheFile = deps.cacheFile;
  const listProcesses = deps.listProcesses || (() => runPowerShell(PROCESS_SCRIPT, [], deps.runPowerShell)
    .then(result => {
      const parsed = JSON.parse(String(result.stdout || "[]"));
      const values = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      return values
        .filter(item => item && Number.isInteger(item.pid) && item.pid > 0 && item.name)
        .map(item => ({
          name: String(item.name),
          pid: item.pid,
          path: item.path || undefined,
          title: cleanAppLabel(item.title) || undefined,
          description: cleanAppLabel(item.description) || undefined,
          product: cleanAppLabel(item.product) || undefined,
          ...(item.appUserModelId ? { appUserModelId: String(item.appUserModelId) } : {}),
        }));
    })
    .catch(() => []));
  let cached = null;
  let cachedAt = 0;
  let inflight = null;
  let diskChecked = false;
  let backgroundRefresh = null;
  async function saveInventory(apps) {
    if (!cacheFile) return;
    await mkdir(dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, JSON.stringify(apps), { mode: 0o600 });
  }
  async function scanAndCache() {
    const apps = deduplicateWindowsApps(await scan());
    cached = apps;
    cachedAt = Date.now();
    await saveInventory(apps).catch(() => {});
    return apps;
  }
  function refreshInBackground() {
    if (backgroundRefresh) return;
    backgroundRefresh = scanAndCache().catch(() => {}).finally(() => { backgroundRefresh = null; });
  }
  const api = {
    async listInstalledApps() {
      const now = Date.now();
      if (cached && now - cachedAt < ttlMs) return cached;
      if (inflight) return inflight;
      // A partir da segunda execução, exibe imediatamente o último inventário
      // válido. Um novo scan ocorre em segundo plano e substitui o cache.
      if (!diskChecked && cacheFile) {
        diskChecked = true;
        try {
          const stored = JSON.parse(await readFile(cacheFile, "utf8"));
          if (Array.isArray(stored)) {
            cached = deduplicateWindowsApps(stored);
            cachedAt = now;
            refreshInBackground();
            return cached;
          }
        } catch {}
      }
      inflight = scanAndCache().finally(() => { inflight = null; });
      return inflight;
    },
    async refreshInstalledApps() {
      cached = null;
      cachedAt = 0;
      if (inflight) return inflight;
      inflight = scanAndCache().finally(() => { inflight = null; });
      return inflight;
    },
    async listAppProcesses() {
      const [processes, installed] = await Promise.all([listProcesses(), api.listInstalledApps()]);
      return processes.filter(isUserFacingRunningApp).map(item => {
        const { title, description, product, appUserModelId, ...publicProcess } = item;
        const name = readableRunningAppName(item, installed);
        const displayName = installed.find(app => app.name === name)?.displayName;
        return { ...publicProcess, name, ...(displayName ? { displayName } : {}) };
      });
    },
  };
  return api;
}

export async function convertWindowsIconToPng(sourcePath, outputPath, deps = {}) {
  await runPowerShell(ICON_SCRIPT, [sourcePath, outputPath], deps.runPowerShell);
}

export function createWindowsIconService({ listInstalledApps, listAppProcesses, convertIcon = convertWindowsIconToPng, ...deps } = {}) {
  const memory = new Map();
  const inflight = new Map();
  const waiting = [];
  let active = 0;
  const maxEntries = deps.maxEntries ?? 40;
  const cacheDirectory = deps.cacheDir;
  const cacheReady = cacheDirectory ? mkdir(cacheDirectory, { recursive: true }).catch(() => null) : Promise.resolve(null);
  async function diskCachePath(app, key) {
    if (!cacheDirectory) return null;
    const source = String(app.iconSource || app.targetPath || app.path || "");
    let version = "";
    if (!/^shell:/i.test(source)) {
      try {
        const info = await stat(source);
        version = `${Math.floor(info.mtimeMs)}:${info.size}`;
      } catch {}
    }
    const id = createHash("sha256").update(`${key}\0${source}\0${version}`).digest("hex");
    await cacheReady;
    return join(cacheDirectory, `${id}.png`);
  }
  async function extract(name, key) {
      const apps = await listInstalledApps();
      let app = apps.find(item => normalize(item.name) === key);
      // Explorer and portable apps need not have a Start Menu shortcut. Only
      // use an executable discovered locally for a user-facing open window.
      if (!app && listAppProcesses) {
        const running = await listAppProcesses();
        app = running.find(item => normalize(item.name) === key && item.path);
      }
      if (!app || !app.path || app.icon === false) return null;
      if (key === "ezdeck" && !app.iconSource) {
        // The host owns this asset. A network request cannot select a file.
        const ownIcon = join(import.meta.dirname, "..", "..", "ezdeck.ico");
        try { if ((await stat(ownIcon)).isFile()) app = { ...app, iconSource: ownIcon }; } catch {}
      }
      const cachedFile = await diskCachePath(app, key);
      // Um scan novo pode corrigir a fonte sem mudar o nome do aplicativo.
      // Não manter o ícone do runtime após descobrir o ICO do atalho.
      const source = cachedFile || String(app.iconSource || app.targetPath || app.path);
      const cached = memory.get(key);
      if (cached?.source === source) return cached.bytes;
      if (cachedFile) {
        try {
          const bytes = await readFile(cachedFile);
          memory.set(key, { source, bytes });
          return bytes;
        } catch {}
      }
      // Opening a picker can request hundreds of icons at once. Keep native
      // processes bounded so the desktop and pairing server stay responsive.
      if (active >= 3) await new Promise(resolve => waiting.push(resolve));
      else active++;
      let directory;
      try {
        directory = await mkdtemp(join(tmpdir(), "ezdeck-icon-"));
        const output = join(directory, "icon.png");
        await convertIcon(app.iconSource || app.targetPath || app.path, output, deps);
        const bytes = await readFile(output);
        if (cachedFile) await writeFile(cachedFile, bytes, { mode: 0o600 }).catch(() => {});
        memory.set(key, { source, bytes });
        while (memory.size > maxEntries) memory.delete(memory.keys().next().value);
        return bytes;
      } catch {
        return null;
      } finally {
        if (directory) await rm(directory, { recursive: true, force: true }).catch(() => {});
        const next = waiting.shift();
        if (next) next(); else active--;
      }
  }
  return {
    clear() { memory.clear(); },
    async getIconPng(name) {
      const key = normalize(name);
      if (inflight.has(key)) return inflight.get(key);
      const task = extract(name, key).finally(() => inflight.delete(key));
      inflight.set(key, task);
      return task;
    },
  };
}
