import { createWindowsActions } from "./windows/actions.js";
import { createWindowsApps, createWindowsIconService } from "./windows/apps.js";

/** O EzDeck é hospedado no Windows; Android e PWA são clientes do mesmo host. */
export function createPlatform({ windows = {} } = {}) {
  const apps = windows.apps || createWindowsApps(windows);
  return {
    appTools: apps,
    actions: windows.actions || createWindowsActions({ listInstalledApps: apps.listInstalledApps, run: windows.runPowerShell }),
    iconService: windows.iconService || createWindowsIconService({ listInstalledApps: apps.listInstalledApps, convertIcon: windows.convertIcon, runPowerShell: windows.runPowerShell }),
  };
}
