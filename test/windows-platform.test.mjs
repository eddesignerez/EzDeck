import test from "node:test";
import assert from "node:assert/strict";
import { createPlatform } from "../platform/platform-contract.js";
import { createWindowsApps, scanWindowsApps } from "../platform/windows/apps.js";
import { createWindowsActions } from "../platform/windows/actions.js";
import { startServer } from "../server.js";

test("inventário Windows resolve atalhos, ordena e remove nomes duplicados", async () => {
  const apps = await scanWindowsApps({
    directories: ["common", "user"],
    findShortcuts: async directory => directory === "common"
      ? ["common/Chrome.lnk", "common/OBS Studio.lnk"]
      : ["user/chrome.lnk", "user/Notion.lnk"],
    resolveShortcut: async shortcut => `C:/apps/${shortcut.split("/").at(-1).replace(/\.lnk$/i, ".exe")}`,
  });
  assert.deepEqual(apps.map(app => app.name), ["Chrome", "Notion", "OBS Studio"]);
  assert.equal(apps[0].path, "C:/apps/Chrome.exe");
});

test("ações Windows só abrem caminho que veio do inventário e foco cai para abertura", async () => {
  const calls = [];
  const actions = createWindowsActions({
    listInstalledApps: async () => [{ name: "Chrome", path: "C:/Program Files/Chrome/chrome.exe", icon: true }],
    run: async (script, args) => {
      calls.push({ script, args });
      if (args[0] === "19") throw new Error("janela indisponível");
    },
  });
  await actions.activateApp({ name: "Chrome", pid: 19 });
  assert.equal(calls.at(-1).args[0], "C:/Program Files/Chrome/chrome.exe");
  await assert.rejects(() => actions.activateApp({ name: "não existe", pid: null }));
});

test("adaptador Windows entrega o mesmo contrato que o servidor espera", async () => {
  const apps = createWindowsApps({
    scan: async () => [{ name: "Calculator", path: "C:/Windows/System32/calc.exe" }],
    listProcesses: async () => [{ name: "Calculator", pid: 42 }],
  });
  const platform = createPlatform({ platform: "win32", windows: { apps, actions: { activateApp: async () => {}, openWebsite: async () => {} }, iconService: { getIconPng: async () => null } } });
  assert.deepEqual(await platform.appTools.listInstalledApps(), [{ name: "Calculator", path: "C:/Windows/System32/calc.exe", icon: true }]);
  assert.deepEqual(await platform.appTools.listAppProcesses(), [{ name: "Calculator", pid: 42 }]);
});

test("servidor preserva a API do companion ao receber a plataforma Windows", async () => {
  const activated = [];
  const apps = createWindowsApps({
    scan: async () => [{ name: "Calculator", path: "C:/Windows/System32/calc.exe" }],
    listProcesses: async () => [{ name: "Calculator", pid: 42 }],
  });
  const platform = createPlatform({
    platform: "win32",
    windows: {
      apps,
      actions: { activateApp: async app => activated.push(app), openWebsite: async () => {} },
      iconService: { getIconPng: async () => null },
    },
  });
  const server = await startServer({ port: 0, config: { pinned: ["Calculator"] }, platform });
  try {
    const base = `http://127.0.0.1:${server.port}`;
    const installed = await (await fetch(`${base}/api/apps/installed`)).json();
    assert.deepEqual(installed.apps.map(app => app.name), ["Calculator"]);
    const response = await fetch(`${base}/api/apps/Calculator/activate`, { method: "POST", body: JSON.stringify({ pid: 42 }) });
    assert.equal(response.status, 200);
    assert.deepEqual(activated, [{ name: "Calculator", pid: 42 }]);
  } finally {
    await server.close();
  }
});
