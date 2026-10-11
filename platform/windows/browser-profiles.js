import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const key = value => String(value || "").trim().toLocaleLowerCase("pt-BR");
const validDirectory = value => /^(Default|Profile \d+)$/.test(value);

// Only display names and directory identifiers are retained. Never expose the
// Local State document, account details, browsing history or cookies to clients.
export async function listChromeProfiles({ env = process.env, read = readFile } = {}) {
  try {
    const file = join(env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "Google", "Chrome", "User Data", "Local State");
    const state = JSON.parse(await read(file, "utf8"));
    return Object.entries(state?.profile?.info_cache || {}).filter(([directory, profile]) => validDirectory(directory) && typeof profile?.name === "string")
      .map(([directory, profile]) => ({ directory, label: profile.name.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120) || directory }));
  } catch { return []; }
}

export function addChromeProfileApps(apps, profiles) {
  // Limit profile discovery to the installed Google Chrome, not arbitrary
  // shortcuts sharing a filename or another Chromium browser's private data.
  const browser = apps.find(app => !app.pwaAppId && /[\\/]Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/i.test(app.targetPath || app.path));
  if (!browser) return apps;
  const valid = profiles.filter(profile => validDirectory(profile.directory) && typeof profile.label === "string");
  return [...apps, ...valid.map(profile => {
    const duplicate = valid.filter(other => key(other.label) === key(profile.label)).length > 1;
    return {
      name: `${browser.name} — ${profile.label}${duplicate ? ` (${profile.directory})` : ""}`,
      displayName: profile.label,
      path: browser.targetPath || browser.path,
      targetPath: browser.targetPath || browser.path,
      icon: true,
      browserProfileDirectory: profile.directory,
    };
  })];
}

export function matchingChromeProfileApp(process, installed) {
  const identity = String(process?.appUserModelId || "");
  if (!/^Chrome(?:\.|$)/i.test(identity) || /\._crx_/i.test(identity)) return null;
  const suffix = /\.(Profile\d+|Default)$/i.exec(identity)?.[1];
  // Chrome's default profile omits its suffix. Unknown identities should not
  // accidentally acquire a default-profile name.
  const directory = suffix || (/^Chrome(?:\.UserData)?$/i.test(identity) ? "Default" : null);
  if (!directory) return null;
  return installed.find(app => app.browserProfileDirectory &&
    key(app.browserProfileDirectory.replace(/ /g, "")) === key(directory) &&
    key(app.targetPath || app.path) === key(process.path));
}
