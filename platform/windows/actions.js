import { runPowerShell } from "./apps.js";

const OPEN_SCRIPT = "if ($args[0] -like 'shell:AppsFolder\\*') { Start-Process -FilePath explorer.exe -ArgumentList $args[0] } else { Start-Process -FilePath $args[0] }";
const FOCUS_SCRIPT = "Add-Type @'\nusing System;\nusing System.Runtime.InteropServices;\npublic static class EzDeckWindow { [DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd); }\n'@; $process = Get-Process -Id ([int]$args[0]) -ErrorAction Stop; if ($process.MainWindowHandle -eq 0) { exit 1 }; if (-not [EzDeckWindow]::SetForegroundWindow($process.MainWindowHandle)) { exit 1 }";

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

export function createWindowsActions({ listInstalledApps, run = runPowerShell } = {}) {
  if (typeof listInstalledApps !== "function") throw new Error("listInstalledApps é obrigatório no adaptador Windows");
  async function openApp(name) {
    const apps = await listInstalledApps();
    const app = apps.find(item => normalize(item.name) === normalize(name));
    if (!app) throw new Error("aplicativo não encontrado no inventário Windows");
    await run(OPEN_SCRIPT, [app.path]);
  }
  async function focusApp(pid) {
    if (!(Number.isInteger(pid) && pid > 0)) throw new Error("PID inválido");
    await run(FOCUS_SCRIPT, [String(pid)]);
  }
  return {
    openApp,
    async activateApp({ name, pid }) {
      if (Number.isInteger(pid) && pid > 0) {
        try { await focusApp(pid); return; } catch {}
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
