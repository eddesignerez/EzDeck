import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { networkInterfaces } from "node:os";
import { startServer, startDiscovery } from "../server.js";
import { createPlatform } from "../platform/platform-contract.js";
import { createCustomActions } from "../platform/windows/custom-actions.js";
import { createWindowsIconService } from "../platform/windows/apps.js";
import { createCommandWorker } from '../platform/windows/command-worker.js';
import { createWindowsActions } from '../platform/windows/actions.js';
import { KEYBOARD_WARMUP } from '../platform/windows/shortcuts.js';
import { createStartup } from '../platform/windows/startup.js';

const token = process.env.EZDECK_HOST_TOKEN;
if (!token || token.length < 32) throw new Error("Inicie pela janela EzDeck.vbs ou windows/run-dev.ps1");
const directory = process.env.EZDECK_DATA_DIR || join(process.env.APPDATA, "EzDeck");
function preferredLanAddress() {
  const blocked = /(?:vEthernet|Hyper-V|WSL|Docker|ZeroTier|Tailscale|Virtual|Loopback)/i;
  const candidates = [];
  for (const [name, infos] of Object.entries(networkInterfaces())) {
    if (blocked.test(name)) continue;
    for (const info of infos || []) {
      if (info.family === "IPv4" && !info.internal) candidates.push(info.address);
    }
  }
  return candidates.find(address => /^192\.168\./.test(address)) || candidates[0] || null;
}
const address = () => process.env.EZDECK_LAN_ADDRESS || preferredLanAddress();
await mkdir(directory, { recursive: true });
const commands = createCommandWorker();
const startup = createStartup({root:join(import.meta.dirname,'..'),run:commands.run});
commands.run(KEYBOARD_WARMUP).catch(error => console.error('[commands]', error.message));
const custom = createCustomActions({ file: join(directory, "windows-actions.json"), run: commands.run });
const platform = createPlatform({ windows: { cacheFile: join(directory, "installed-apps.json") } });
platform.actions = createWindowsActions({ listInstalledApps: platform.appTools.listInstalledApps, run: commands.run });
const installed = platform.appTools.listInstalledApps;
async function withCustomIconMetadata(apps) {
  const customItems = await custom.list();
  const names = new Set(customItems.filter(item => item.icon).map(item => String(item.type === "icon" ? item.target : item.name).toLocaleLowerCase("pt-BR")));
  return apps.map(app => names.has(String(app.name).toLocaleLowerCase("pt-BR")) ? { ...app, customIcon: true } : app);
}
platform.appTools.listInstalledApps = async () => [...await withCustomIconMetadata(await installed()), ...await custom.inventory()];
const refreshInstalled = platform.appTools.refreshInstalledApps;
let appIconService;
platform.appTools.refreshInstalledApps = async () => {
  const refreshed = refreshInstalled ? await refreshInstalled() : await installed();
  appIconService?.clear();
  return [...await withCustomIconMetadata(refreshed), ...await custom.inventory()];
};
const activate = platform.actions.activateApp;
platform.actions.activateApp = async (action) => {
  if (!await custom.activate(action.name)) await activate(action);
};
appIconService = createWindowsIconService({
  listInstalledApps: platform.appTools.listInstalledApps,
  cacheDir: join(directory, "icon-cache"),
});
platform.iconService = { getIconPng: async name => (await custom.getIcon(name)) || appIconService.getIconPng(name) };
let server, discovery, stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(0), 2500);
  try { commands.close(); discovery?.close(); await server?.close(); } finally { clearTimeout(deadline); process.exit(0); }
}
server = await startServer({ platform, configFile: join(directory, "config.json"), dataDir: directory,
  windowsHost: { token, actions: custom, startup, shutdown, address, getPin: () => server?.getPin(), getPort: () => server?.port, refreshApps: () => platform.appTools.refreshInstalledApps?.() },
});
discovery = startDiscovery(3001, { portHint: server.port });
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
