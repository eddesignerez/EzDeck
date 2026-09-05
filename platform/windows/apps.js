import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const SHORTCUT_EXTENSIONS = new Set([".lnk", ".appref-ms"]);
const PROCESS_SCRIPT = "Get-Process | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { [pscustomobject]@{ name = $_.ProcessName; pid = $_.Id; path = $_.Path } } | ConvertTo-Json -Compress";
const SHORTCUT_SCRIPT = "$shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut($args[0]); [pscustomobject]@{ target = $shortcut.TargetPath } | ConvertTo-Json -Compress";
const ICON_SCRIPT = "Add-Type -AssemblyName System.Drawing; $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($args[0]); if ($null -eq $icon) { exit 1 }; $bitmap = $icon.ToBitmap(); try { $bitmap.Save($args[1], [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bitmap.Dispose(); $icon.Dispose() }";

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
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
  return run("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script, ...args]);
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
    result.push({ name: app.name, path: app.path, icon: true });
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
  const listProcesses = deps.listProcesses || (() => runPowerShell(PROCESS_SCRIPT, [], deps.runPowerShell)
    .then(result => {
      const parsed = JSON.parse(String(result.stdout || "[]"));
      const values = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      return values
        .filter(item => item && Number.isInteger(item.pid) && item.pid > 0 && item.name)
        .map(item => ({ name: String(item.name), pid: item.pid, path: item.path || undefined }));
    })
    .catch(() => []));
  let cached = null;
  let cachedAt = 0;
  let inflight = null;
  return {
    async listInstalledApps() {
      const now = Date.now();
      if (cached && now - cachedAt < ttlMs) return cached;
      if (inflight) return inflight;
      inflight = Promise.resolve(scan()).then(apps => {
        cached = deduplicateWindowsApps(apps);
        cachedAt = Date.now();
        inflight = null;
        return cached;
      }, error => { inflight = null; throw error; });
      return inflight;
    },
    listAppProcesses: listProcesses,
  };
}

export async function convertWindowsIconToPng(sourcePath, outputPath, deps = {}) {
  await runPowerShell(ICON_SCRIPT, [sourcePath, outputPath], deps.runPowerShell);
}

export function createWindowsIconService({ listInstalledApps, convertIcon = convertWindowsIconToPng, ...deps } = {}) {
  const memory = new Map();
  const maxEntries = deps.maxEntries ?? 40;
  return {
    async getIconPng(name) {
      const key = normalize(name);
      if (memory.has(key)) return memory.get(key);
      const apps = await listInstalledApps();
      const app = apps.find(item => normalize(item.name) === key);
      if (!app) return null;
      const directory = await mkdtemp(join(tmpdir(), "dokke-icon-"));
      const output = join(directory, "icon.png");
      try {
        await convertIcon(app.path, output, deps);
        const bytes = await readFile(output);
        memory.set(key, bytes);
        while (memory.size > maxEntries) memory.delete(memory.keys().next().value);
        return bytes;
      } catch {
        return null;
      } finally {
        await rm(directory, { recursive: true, force: true }).catch(() => {});
      }
    },
  };
}
