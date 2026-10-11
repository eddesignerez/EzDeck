import { runPowerShell } from "./apps.js";
import { BROWSER_WINDOWS_SCRIPT } from "./browser-windows.js";
import { basename } from "node:path";

const FOCUS_PWA_SCRIPT = BROWSER_WINDOWS_SCRIPT + String.raw`
$id=[int]$args[0]
$identity=$args[1]
$appId=$args[2]
$window=[EzDeckBrowserWindows]::List([int[]]@($id)) | Where-Object {
  if($identity) { $_.AppUserModelId -eq $identity } else { $_.AppUserModelId -match ("\._crx_"+[regex]::Escape($appId)+"(?:\.|$)") }
} | Select-Object -First 1
if (-not $window -or -not [EzDeckBrowserWindows]::Focus($window.Handle)) { throw 'Janela PWA indisponível' }
`;
const FOCUS_BROWSER_SCRIPT = BROWSER_WINDOWS_SCRIPT + String.raw`
$window=[EzDeckBrowserWindows]::List([int[]]@([int]$args[0])) | Where-Object { $_.AppUserModelId -notmatch '\._crx_' } | Select-Object -First 1
if (-not $window -or -not [EzDeckBrowserWindows]::Focus($window.Handle)) { throw 'Janela do navegador indisponível' }
`;
const BROWSER_EXECUTABLES = new Set(["chrome.exe", "msedge.exe", "brave.exe", "chromium.exe", "vivaldi.exe", "opera.exe"]);
const OPEN_PROFILE_SCRIPT = String.raw`Start-Process -FilePath $args[0] -ArgumentList ('--profile-directory="'+$args[1]+'"')`;
const FOCUS_PROFILE_SCRIPT = BROWSER_WINDOWS_SCRIPT + String.raw`
$id=[int]$args[0]
$profile=$args[1] -replace ' ',''
$window=[EzDeckBrowserWindows]::List([int[]]@($id)) | Where-Object {
  $identity=$_.AppUserModelId
  if ($profile -eq 'Default') { $identity -match '^Chrome(?:\.UserData)?(?:\.Default)?$' }
  else { $identity -match '^Chrome\.' -and $identity.EndsWith('.'+$profile,[StringComparison]::OrdinalIgnoreCase) -and $identity -notmatch '\._crx_' }
} | Select-Object -First 1
if (-not $window -or -not [EzDeckBrowserWindows]::Focus($window.Handle)) { throw 'Janela do perfil indisponível' }
`;

const OPEN_SCRIPT = "if ($args[0] -like 'shell:AppsFolder\\*') { Start-Process -FilePath explorer.exe -ArgumentList $args[0] } else { Start-Process -FilePath $args[0] }";
const FOCUS_SCRIPT = BROWSER_WINDOWS_SCRIPT + String.raw`
$window=[EzDeckBrowserWindows]::List([int[]]@([int]$args[0])) | Select-Object -First 1
if (-not $window -or -not [EzDeckBrowserWindows]::Focus($window.Handle)) { throw 'Janela indisponível' }
`;

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

export function createWindowsActions({ listInstalledApps, run = runPowerShell } = {}) {
  if (typeof listInstalledApps !== "function") throw new Error("listInstalledApps é obrigatório no adaptador Windows");
  async function openApp(name) {
    const apps = await listInstalledApps();
    const app = apps.find(item => normalize(item.name) === normalize(name));
    if (!app) throw new Error("aplicativo não encontrado no inventário Windows");
    if (app.browserProfileDirectory) {
      if (!/^(Default|Profile \d+)$/.test(app.browserProfileDirectory)) throw new Error("Perfil inválido");
      await run(OPEN_PROFILE_SCRIPT, [app.targetPath || app.path, app.browserProfileDirectory]);
    } else await run(OPEN_SCRIPT, [app.path]);
  }
  async function focusApp(pid) {
    if (!(Number.isInteger(pid) && pid > 0)) throw new Error("PID inválido");
    await run(FOCUS_SCRIPT, [String(pid)]);
  }
  return {
    openApp,
    async activateApp({ name, pid }) {
      const app = (await listInstalledApps()).find(item => normalize(item.name) === normalize(name));
      if (Number.isInteger(pid) && pid > 0) {
        try {
          if (app?.browserProfileDirectory) await run(FOCUS_PROFILE_SCRIPT, [String(pid), app.browserProfileDirectory]);
          else if (app?.pwaAppId) await run(FOCUS_PWA_SCRIPT, [String(pid), app.appUserModelId || "", app.pwaAppId]);
          else if (app && BROWSER_EXECUTABLES.has(normalize(basename(app.targetPath || app.path)))) await run(FOCUS_BROWSER_SCRIPT, [String(pid)]);
          else await focusApp(pid);
          return;
        } catch {}
      }
      await openApp(name);
    },
    async openWebsite(url) {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("URL inválida");
      await run(OPEN_SCRIPT, [parsed.href]);
    },
  };
}
