import test from "node:test";
import assert from "node:assert/strict";
import { addChromeProfileApps, listChromeProfiles } from "../platform/windows/browser-profiles.js";
import { createWindowsApps } from "../platform/windows/apps.js";
import { createWindowsActions } from "../platform/windows/actions.js";

const browser = { name: "Google Chrome", path: "Chrome.lnk", targetPath: "C:/Program Files/Google/Chrome/Application/chrome.exe" };
const profiles = [{ directory: "Default", label: "Pessoal" }, { directory: "Profile 2", label: "Trabalho" }];

test("perfis do Chrome retêm somente nome e diretório, não informações da conta", async () => {
  const found = await listChromeProfiles({ env: { LOCALAPPDATA: "local" }, read: async () => JSON.stringify({
    profile: { info_cache: { Default: { name: "Pessoal", user_name: "private@example.invalid", gaia_id: "private" },
      "Profile 2": { name: "Trabalho" }, "../escape": { name: "inválido" } } }, os_crypt: { encrypted_key: "private" },
  }) });
  assert.deepEqual(found, profiles);
  assert.deepEqual(await listChromeProfiles({ read: async () => { throw new Error("indisponível"); } }), []);
});

test("janelas de perfis no mesmo PID ficam separadas sem duplicar a PWA", async () => {
  const pwa = { name: "Keep", path: "Keep.lnk", pwaAppId: "a".repeat(32), appUserModelId: "Chrome._crx_keep.Profile2" };
  const apps = createWindowsApps({ scan: async () => addChromeProfileApps([browser, pwa], profiles), listProcesses: async () => [
    { name: "chrome", path: browser.targetPath, pid: 42, appUserModelId: "Chrome" },
    { name: "chrome", path: browser.targetPath, pid: 42, appUserModelId: "Chrome.UserData.Profile2" },
    { name: "chrome", path: browser.targetPath, pid: 42, appUserModelId: pwa.appUserModelId },
    { name: "chrome", path: browser.targetPath, pid: 42, appUserModelId: "Chrome.UserData.Profile99" },
  ] });
  const running = await apps.listAppProcesses();
  assert.deepEqual(running.map(app => app.name), ["Google Chrome — Pessoal", "Google Chrome — Trabalho", "Keep", "Google Chrome"]);
  assert.deepEqual(running.slice(0, 2).map(app => app.displayName), ["Pessoal", "Trabalho"]);
});

test("perfis homônimos permanecem distintos e Brave não recebe nomes do Chrome", () => {
  const found = addChromeProfileApps([browser], profiles.map(profile => ({ ...profile, label: "Mesmo nome" })));
  assert.equal(new Set(found.map(app => app.name)).size, 3);
  assert.equal(found[1].name, "Google Chrome — Mesmo nome (Default)");
  assert.equal(found[2].name, "Google Chrome — Mesmo nome (Profile 2)");
  assert.equal(found[1].displayName, "Mesmo nome");
  assert.equal(found[2].displayName, "Mesmo nome");
  const brave = [{ name: "Brave", path: "C:/Brave/brave.exe" }];
  assert.deepEqual(addChromeProfileApps(brave, profiles), brave);
});

test("foco e abertura de perfil usam apenas o diretório registrado localmente", async () => {
  const installed = addChromeProfileApps([browser], profiles);
  const name = installed[2].name;
  const calls = [];
  const actions = createWindowsActions({ listInstalledApps: async () => installed, run: async (script, args) => {
    calls.push({ script, args });
    if (args[0] === "43") throw new Error("fechada");
  } });
  await actions.activateApp({ name, pid: 42, browserProfileDirectory: "untrusted" });
  assert.deepEqual(calls[0].args, ["42", "Profile 2"]);
  assert.match(calls[0].script, /EndsWith/);
  await actions.activateApp({ name, pid: 43 });
  assert.deepEqual(calls.at(-1).args, [browser.targetPath, "Profile 2"]);
  assert.match(calls.at(-1).script, /--profile-directory/);
  await assert.rejects(() => actions.activateApp({ name: "Google Chrome — desconhecido" }));
});
