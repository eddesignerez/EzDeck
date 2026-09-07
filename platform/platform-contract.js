import { activateApp as activateMacApp, openWebsite as openMacWebsite } from "../actions.js";
import { listAppProcesses as listMacProcesses, listInstalledApps as listMacApps, realIconService } from "../apps.js";
import { createWindowsActions } from "./windows/actions.js";
import { createWindowsApps, createWindowsIconService } from "./windows/apps.js";

/** Mantém o protocolo HTTP independente do SO que está hospedando o EzDeck. */
export function createPlatform({ platform = process.platform, windows = {} } = {}) {
  if (platform === "win32") {
    const apps = windows.apps || createWindowsApps(windows);
    return {
      appTools: apps,
      actions: windows.actions || createWindowsActions({ listInstalledApps: apps.listInstalledApps, run: windows.runPowerShell }),
      iconService: windows.iconService || createWindowsIconService({ listInstalledApps: apps.listInstalledApps, convertIcon: windows.convertIcon, runPowerShell: windows.runPowerShell }),
    };
  }
  return {
    appTools: { listAppProcesses: listMacProcesses, listInstalledApps: listMacApps },
    actions: { activateApp: activateMacApp, openWebsite: openMacWebsite },
    iconService: realIconService(),
  };
}
