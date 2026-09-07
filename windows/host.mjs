import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { startServer, startDiscovery } from "../server.js";
import { createPlatform } from "../platform/platform-contract.js";
import { createCustomActions } from "../platform/windows/custom-actions.js";
import { createWindowsIconService } from "../platform/windows/apps.js";

const token = process.env.EZDECK_HOST_TOKEN;
if (!token || token.length < 32) throw new Error("Inicie pela janela EzDeck.vbs ou windows/run-dev.ps1");
const directory = process.env.EZDECK_DATA_DIR || join(process.env.APPDATA, "EzDeck");
const address = process.env.EZDECK_LAN_ADDRESS || null;
await mkdir(directory, { recursive: true });
const custom = createCustomActions({ file: join(directory, "windows-actions.json") });
const platform = createPlatform();
const installed = platform.appTools.listInstalledApps;
platform.appTools.listInstalledApps = async () => [...await installed(), ...await custom.inventory()];
const refreshInstalled = platform.appTools.refreshInstalledApps;
platform.appTools.refreshInstalledApps = async () => [
  ...(refreshInstalled ? await refreshInstalled() : await installed()),
  ...await custom.inventory(),
];
const activate = platform.actions.activateApp;
platform.actions.activateApp = async (action) => {
  if (!await custom.activate(action.name)) await activate(action);
};
const appIconService = createWindowsIconService({ listInstalledApps: platform.appTools.listInstalledApps });
platform.iconService = { getIconPng: async name => (await custom.getIcon(name)) || appIconService.getIconPng(name) };
let server, discovery, stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(0), 2500);
  try { discovery?.close(); await server?.close(); } finally { clearTimeout(deadline); process.exit(0); }
}
server = await startServer({ platform, configFile: join(directory, "config.json"), dataDir: directory,
  windowsHost: { token, actions: custom, shutdown, address, getPin: () => server?.getPin(), refreshApps: () => platform.appTools.refreshInstalledApps?.() },
});
discovery = startDiscovery(3001, { portHint: server.port });
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
