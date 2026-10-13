import test from "node:test";
import assert from "node:assert/strict";
import { createPlatform } from "../platform/platform-contract.js";
import { createWindowsApps, isUserFacingRunningApp, readableRunningAppName, scanWindowsApps, runPowerShell } from "../platform/windows/apps.js";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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

test("inventário inclui aplicativos instalados pela Microsoft Store", async () => {
  const apps = await scanWindowsApps({
    directories: ["menu"],
    findShortcuts: async () => ["menu/Chrome.lnk"],
    runPowerShell: async () => ({ stdout: JSON.stringify([{ path: "menu/Chrome.lnk", targetPath: "C:/chrome.exe" }]) }),
    listStoreApps: async () => [{ name: "Calculadora", appId: "Microsoft.WindowsCalculator_8wekyb3d8bbwe!App", iconPath: "C:/Packages/Calculator/Assets/Logo.png" }],
  });
  assert.deepEqual(apps.map(app => app.name), ["Calculadora", "Chrome"]);
  assert.equal(apps[0].path, "shell:AppsFolder\\Microsoft.WindowsCalculator_8wekyb3d8bbwe!App");
  assert.equal(apps[0].store, true);
  assert.equal(apps[0].icon, true, "apps da Store devem tentar extrair o ícone do shell");
  assert.equal(apps[0].iconSource, "C:/Packages/Calculator/Assets/Logo.png");
});

test("inventário encontra apps da Microsoft Store mesmo sem atalhos tradicionais", async () => {
  const apps = await scanWindowsApps({
    directories: ["menu-vazio"],
    findShortcuts: async () => [],
    listStoreApps: async () => [{ name: "Relógio", appId: "Microsoft.WindowsAlarms_8wekyb3d8bbwe!App" }],
  });
  assert.deepEqual(apps.map(app => app.name), ["Relógio"]);
  assert.equal(apps[0].icon, true);
});

test("PWA conserva atalho, identidade do perfil e ícone próprio no inventário", async () => {
  const installed = await scanWindowsApps({
    directories: ["menu"], findShortcuts: async () => ["menu/Keep.lnk"], listStoreApps: async () => [],
    runPowerShell: async () => ({ stdout: JSON.stringify([{ path: "menu/Keep.lnk", targetPath: "C:/Chrome/chrome_proxy.exe",
      pwaAppId: "a".repeat(32), appUserModelId: `Chrome._crx_${"a".repeat(32)}.Profile2`, iconSource: "C:/Icons/Keep.ico" }]) }),
  });
  assert.equal(installed[0].path, "menu/Keep.lnk", "abrir o atalho preserva app-id e perfil sem executar argumentos vindos da rede");
  assert.equal(installed[0].pwaAppId, "a".repeat(32));
  assert.equal(installed[0].iconSource, "C:/Icons/Keep.ico");
  const restored = createWindowsApps({ scan: async () => installed });
  assert.deepEqual(await restored.listInstalledApps(), installed, "cache deve preservar a identidade PWA");
});

test("atalho Windows comum respeita ICO próprio e ignora fonte ausente ou executável", { skip:process.platform !== "win32" }, async t => {
  const directory = await mkdtemp(join(tmpdir(), "ezdeck-native-shortcut-icons-"));
  t.after(() => rm(directory, { recursive:true, force:true }));
  const icon = fileURLToPath(new URL("../ezdeck.ico", import.meta.url));
  const shortcuts = ["EzDeck", "Ausente", "Executavel"].map(name => join(directory, `${name}.lnk`));
  await runPowerShell(String.raw`
  $shell=New-Object -ComObject WScript.Shell
  $target=Join-Path $env:WINDIR 'System32\wscript.exe'
  for($index=0;$index -lt 3;$index++) {
    $link=$shell.CreateShortcut($args[$index])
    $link.TargetPath=$target
    $link.IconLocation=@($args[3],$args[4],$target)[$index]+',0'
    $link.Save()
  }
  `, [...shortcuts, icon, join(directory, "missing.ico")]);
  const apps = await scanWindowsApps({ directories:[directory], findShortcuts:async () => shortcuts, listStoreApps:async () => [] });
  const ezdeck = apps.find(app => app.name === "EzDeck");
  assert.equal(ezdeck.iconSource, icon);
  assert.equal(ezdeck.path, shortcuts[0], "identidade de abertura continua sendo o atalho");
  assert.equal(ezdeck.pwaAppId, undefined, "não é uma PWA");
  assert.equal(apps.find(app => app.name === "Ausente").iconSource, undefined);
  assert.equal(apps.find(app => app.name === "Executavel").iconSource, undefined);
});

test("PWAs e navegador no mesmo PID têm identidades distintas sem expor títulos privados", async () => {
  const appId = "a".repeat(32);
  const otherId = "b".repeat(32);
  const installed = [
    { name: "Keep", path: "Keep.lnk", targetPath: "C:/Chrome/chrome_proxy.exe", pwaAppId: appId, appUserModelId: `Chrome._crx_${appId}.Profile2` },
    { name: "Freepik", path: "Freepik.lnk", targetPath: "C:/Chrome/chrome_proxy.exe", pwaAppId: otherId, appUserModelId: `Chrome._crx_${otherId}.Profile2` },
    { name: "Google Chrome", path: "Chrome.lnk", targetPath: "C:/Chrome/chrome.exe" },
  ];
  const apps = createWindowsApps({ scan: async () => installed, listProcesses: async () => [
    { name: "chrome", pid: 42, path: "C:/Chrome/chrome.exe", title: "private notes", appUserModelId: installed[0].appUserModelId },
    { name: "chrome", pid: 42, path: "C:/Chrome/chrome.exe", title: "private designs", appUserModelId: installed[1].appUserModelId },
    { name: "chrome", pid: 42, path: "C:/Chrome/chrome.exe", title: "private tab", appUserModelId: "Chrome.Profile2" },
  ] });
  const running = await apps.listAppProcesses();
  assert.deepEqual(running.map(item => item.name), ["Keep", "Freepik", "Google Chrome"]);
  assert.ok(running.every(item => !item.title && !item.appUserModelId));
  assert.equal(readableRunningAppName({ path: "C:/Chrome/chrome_proxy.exe", description: "Chrome" }, installed), "Chrome", "não confundir executável compartilhado com a primeira PWA");
  assert.equal(readableRunningAppName({ path: "C:/Chrome/chrome.exe", appUserModelId: `Chrome._crx_${appId}.Default` }, installed), "Google Chrome", "não confundir perfis diferentes");
});

test("foco PWA usa identidade local do atalho e reabre o atalho se a janela não existe", async () => {
  const calls = [];
  const app = { name: "Keep", path: "C:/Menu/Keep.lnk", pwaAppId: "a".repeat(32), appUserModelId: `Chrome._crx_${"a".repeat(32)}.Profile2` };
  const actions = createWindowsActions({ listInstalledApps: async () => [app], run: async (script, args) => {
    calls.push({ script, args });
    if (args[0] === "43") throw new Error("fechada");
  } });
  await actions.activateApp({ name: "Keep", pid: 42, appUserModelId: "untrusted" });
  assert.deepEqual(calls[0].args, ["42", app.appUserModelId, app.pwaAppId]);
  assert.match(calls[0].script, /AppUserModelId/);
  await actions.activateApp({ name: "Keep", pid: 43 });
  assert.equal(calls.at(-1).args[0], app.path);
});

test("abrir navegador não foca uma PWA que compartilha o mesmo PID", async () => {
  let source;
  const actions = createWindowsActions({ listInstalledApps: async () => [{ name: "Chrome", path: "C:/Chrome/chrome.exe" }],
    run: async script => { source = script; } });
  await actions.activateApp({ name: "Chrome", pid: 42 });
  assert.match(source, /AppUserModelId -notmatch/);
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

test("apps abertos recebem rótulo humano, inclusive para hosts genéricos do Windows", async () => {
  const installed = [{ name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe" }];
  assert.equal(readableRunningAppName({
    name: "chrome",
    path: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    description: "chrome",
  }, installed), "Google Chrome");
  assert.equal(isUserFacingRunningApp({ name: "ApplicationFrameHost" }), false);
  assert.equal(isUserFacingRunningApp({ name: "PhoneExperienceHost" }), false);
  assert.equal(isUserFacingRunningApp({ name: "PowerToys.QuickAccess" }), false);
  assert.equal(isUserFacingRunningApp({ name: "SystemSettings" }), false);
  assert.equal(isUserFacingRunningApp({ name: "TextInputHost" }), false);
  assert.equal(readableRunningAppName({
    name: "ApplicationFrameHost",
    title: "Configurações",
    description: "Application Frame Host",
  }), "Configurações");
  assert.equal(readableRunningAppName({
    name: "Code",
    description: "Visual Studio Code",
  }), "Visual Studio Code");
});

test("apps abertos não publicam hosts técnicos do Windows e preservam metadados do app", async () => {
  const apps = createWindowsApps({
    scan: async () => [{ name: "Google Chrome", path: "C:/Apps/chrome.exe" }],
    listProcesses: async () => [
      { name: "chrome", pid: 1, path: "C:/Apps/chrome.exe", description: "Google Chrome" },
      { name: "ApplicationFrameHost", pid: 2, title: "Configurações" },
      { name: "PhoneExperienceHost", pid: 3 },
      { name: "TextInputHost", pid: 4 },
      { name: "SystemSettings", pid: 5 },
      { name: "PowerToys.QuickAccess", pid: 6 },
    ],
  });
  assert.deepEqual(await apps.listAppProcesses(), [{ name: "Google Chrome", pid: 1, path: "C:/Apps/chrome.exe" }]);
});

test("runtime compartilhado não faz a janela EzDeck parecer SkillWatch Tunnel", async () => {
  const installed = [{ name:"SkillWatch Tunnel", path:"Tunnel.lnk", targetPath:"C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe" }];
  const process = { name:"powershell", path:installed[0].targetPath, description:"Windows PowerShell", title:"EzDeck" };
  assert.equal(readableRunningAppName(process, installed), "EzDeck");
  assert.equal(readableRunningAppName({ ...process, title:"private command or file" }, installed), "Windows PowerShell", "não expor título privado de um terminal nem inventar o app que usa o runtime");
  assert.equal(readableRunningAppName({ ...process, title:"SkillWatch Tunnel" }, installed), "SkillWatch Tunnel", "a janela real do app continua identificável");
  assert.equal(readableRunningAppName({ name:"explorer", path:"C:/Windows/explorer.exe", description:"Windows Explorer", title:"private folder" }, [
    { name:"Windows Software Development Kit", path:"SDK.lnk", targetPath:"C:/Windows/explorer.exe" },
  ]), "Windows Explorer", "atalhos de pastas também não identificam o runtime compartilhado");
});

test("nome da Store prevalece sobre descrição antiga Codex sem expor conversas", async () => {
  const installed = [{ name:"ChatGPT", path:"shell:AppsFolder\\OpenAI.Codex_family!App", store:true }];
  const process = { name:"ChatGPT", pid:42, description:"Codex", title:"ChatGPT" };
  assert.equal(readableRunningAppName(process, installed), "ChatGPT");
  assert.equal(readableRunningAppName({ ...process, title:"private conversation", appUserModelId:"OpenAI.Codex_family!App" }, installed), "ChatGPT");
  const apps = createWindowsApps({ scan:async () => installed, listProcesses:async () => [process] });
  assert.deepEqual(await apps.listAppProcesses(), [{ name:"ChatGPT", pid:42 }]);
});

test("descoberta nativa verifica janelas para todos os apps, não só MainWindowHandle", async () => {
  let source;
  const apps = createWindowsApps({ scan:async () => [], runPowerShell:async (_file, args) => {
    source = Buffer.from(args.at(-1), "base64").toString("utf16le");
    return { stdout:JSON.stringify([{ name:"Editor", pid:42, path:"C:/Editor.exe", title:"private file", description:"Editor" }]) };
  } });
  assert.deepEqual(await apps.listAppProcesses(), [{ name:"Editor", pid:42, path:"C:/Editor.exe" }]);
  assert.match(source, /\[EzDeckBrowserWindows\]::List\(\[int\[\]\]@\(\$processes\.Keys\)\)/);
  assert.doesNotMatch(source, /MainWindowHandle/);
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
