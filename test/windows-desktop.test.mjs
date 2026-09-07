import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { createCustomActions } from "../platform/windows/custom-actions.js";
import { parseShortcut, sendShortcut } from "../platform/windows/shortcuts.js";
import { runPowerShell, createWindowsIconService } from "../platform/windows/apps.js";
import { startServer } from "../server.js";

test("keyboard actions validate combinations and never interpret shell text", async () => {
  assert.deepEqual(parseShortcut("Shift+Ctrl+C"), { combo: "Ctrl+Shift+C", codes: [16,17,67] });
  for (const bad of ["Ctrl+$(calc)", "A;exit", "Ctrl+Ctrl+C", "Ctrl+", "Alt+Unknown", "Ctrl+C+V"]) assert.throws(() => parseShortcut(bad));
  let received;
  await sendShortcut("Win+Shift+S", async (script, args) => { received = args; });
  assert.deepEqual(received, ["91,16,83"]);
});

test("Windows special shortcut uses the PowerShell UInt16 type understood at runtime", async () => {
  await sendShortcut("Ctrl+Win+Left", async script => {
    assert.match(script, /\[UInt16\[\]\]/);
  });
});

test("large app pickers bound icon processes and share duplicate requests", async () => {
  const apps = Array.from({length:20}, (_,n)=>({name:`App ${n}`,path:`app-${n}.exe`}));
  let active=0, peak=0, calls=0;
  const service=createWindowsIconService({listInstalledApps:async()=>apps,convertIcon:async(path,output)=>{
    calls++; active++; peak=Math.max(peak,active);
    await new Promise(resolve=>setTimeout(resolve,10));
    await writeFile(output,Buffer.from([137,80,78,71]));
    active--;
  }});
  await Promise.all([...apps,...apps].map(app=>service.getIconPng(app.name)));
  assert.equal(calls,20);
  assert.ok(peak<=3);
});

test("PowerShell arguments preserve spaces, accents and code-like text as data", { skip: process.platform !== "win32" }, async () => {
  const args = ["C:\\Program Files\\Aplicação.exe", "$(throw 'must not run')", "a&b", "single'quote", 'double"quote'];
  const result = await runPowerShell("ConvertTo-Json -InputObject @($args) -Compress", args);
  assert.deepEqual(JSON.parse(result.stdout), args);
});

test("Windows keyboard helper compiles with the native INPUT structure size", { skip: process.platform !== "win32" }, async () => {
  await sendShortcut("Ctrl+C", async (script) => {
    const compileOnly = script.slice(0, script.lastIndexOf("[EzDeckKeyboard]::Send")) + "[Runtime.InteropServices.Marshal]::SizeOf([type][EzDeckKeyboard+INPUT])";
    const output = await runPowerShell(compileOnly);
    assert.equal(Number(output.stdout.trim()), process.arch === "x64" ? 40 : 28);
  });
});

test("custom actions persist, update in place and launch only locally registered files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "ezdeck-actions-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "actions.json");
  const calls = [];
  const custom = createCustomActions({ file, run: async (script,args) => calls.push(args) });
  const action = await custom.save({ type: "shortcut", title: "Copiar", combo: "Ctrl+C" });
  await custom.save({ type: "shortcut", title: "Copiar", combo: "Ctrl+Shift+C" });
  assert.equal((await createCustomActions({file}).list()).length, 1);
  await custom.activate(action.name);
  assert.deepEqual(calls[0], ["17,16,67"]);
  assert.equal(await custom.activate("not registered"), false);
  await assert.rejects(custom.save({type:"app",title:"Remote",path:"\\\\host\\share\\app.exe"}));
  await assert.rejects(custom.save({type:"app",title:"Bad script",path:"C:\\temp\\unsafe.ps1"}));
  if (process.platform === "win32") {
    const path = join(directory,"app with spaces.exe");
    await writeFile(path,"test fixture, never executed");
    const app = await custom.save({type:"app",title:"Local app",path});
    await custom.activate(app.name);
    assert.deepEqual(calls[1], [path]);
  }
});

test("custom keyboard icon is persisted and returned for the app tile", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "ezdeck-icon-action-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const actions = createCustomActions({ file: join(directory, "actions.json") });
  const action = await actions.save({ type: "shortcut", title: "Captura", combo: "Win+Shift+S" });
  await actions.setIcon(action.name, "data:image/png;base64,iVBORw0KGgo=");
  assert.deepEqual([...await actions.getIcon(action.name)], [137,80,78,71,13,10,26,10]);
  assert.equal((await actions.inventory())[0].customIcon, true);
});

async function fixture(t, installedApps = [{name:"Calculadora",icon:false}]) {
  const directory = await mkdtemp(join(tmpdir(), "ezdeck-ui-test-"));
  const custom = createCustomActions({file:join(directory,"actions.json"),run:async()=>{}});
  let shutdown=false;
  const platform = { appTools: {listInstalledApps: async()=>installedApps,listAppProcesses:async()=>[]},actions:{activateApp:async()=>{},openWebsite:async()=>{}},iconService:{getIconPng:async()=>null} };
  const server = await startServer({port:0, dataDir:directory, config:{pinned:[]}, obs:null, platform, windowsHost:{token:"test-only-host-key-abcdefghijklmnopqrstuvwxyz",actions:custom,shutdown:()=>{shutdown=true;}}});
  t.after(async()=>{await server.close(); await rm(directory,{recursive:true,force:true});});
  return {base:`http://127.0.0.1:${server.port}`, custom, shutdown:()=>shutdown};
}

test("desktop registration and shutdown require host secret and same origin", async(t)=>{
  const {base,custom,shutdown} = await fixture(t);
  for(const path of ["actions","shutdown"]) {
    const denied = await fetch(`${base}/api/windows/${path}`,{method:"POST",body:"{}"});
    assert.equal(denied.status,403);
  }
  const headers={"x-ezdeck-host":"test-only-host-key-abcdefghijklmnopqrstuvwxyz","Content-Type":"application/json"};
  const blocked = await fetch(`${base}/api/windows/actions`,{method:"POST",headers:{...headers,Origin:"https://untrusted.example"},body:JSON.stringify({type:"shortcut",title:"No",combo:"Ctrl+C"})});
  assert.equal(blocked.status,403);
  const saved = await fetch(`${base}/api/windows/actions`,{method:"POST",headers,body:JSON.stringify({type:"shortcut",title:"Captura",combo:"Win+Shift+S"})});
  assert.equal(saved.status,200);
  assert.match(saved.headers.get("content-type"),/charset=utf-8/);
  assert.equal((await custom.list()).length,1);
  const stop=await fetch(`${base}/api/windows/shutdown`,{method:"POST",headers,body:"{}"});
  assert.equal(stop.status,200);
  assert.equal(shutdown(),true);
});

test("Windows refresh endpoint refreshes the local inventory and is host-only", async(t)=>{
  let refreshes=0;
  const directory = await mkdtemp(join(tmpdir(), "ezdeck-refresh-test-"));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const custom=createCustomActions({file:join(directory,"actions.json")});
  const platform={appTools:{listInstalledApps:async()=>[],listAppProcesses:async()=>[]},actions:{activateApp:async()=>{},openWebsite:async()=>{}},iconService:{getIconPng:async()=>null}};
  const server=await startServer({port:0,dataDir:directory,config:{pinned:[]},obs:null,platform,windowsHost:{token:"refresh-host-token-abcdefghijklmnopqrstuvwxyz",actions:custom,refreshApps:async()=>{refreshes++},shutdown:()=>{}}});
  t.after(()=>server.close());
  const base=`http://127.0.0.1:${server.port}`;
  assert.equal((await fetch(`${base}/api/windows/refresh-apps`,{method:"POST",body:"{}"})).status,403);
  assert.equal((await fetch(`${base}/api/windows/refresh-apps`,{method:"POST",headers:{"x-ezdeck-host":"refresh-host-token-abcdefghijklmnopqrstuvwxyz"},body:"{}"})).status,200);
  assert.equal(refreshes,1);
});

test("Adicionar apps works on both companion screens and persists selection", {timeout:20000}, async(t)=>{
  const {base} = await fixture(t);
  const browser=await chromium.launch({headless:true, channel:process.platform === "win32" ? "msedge" : undefined});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1024,height:650}});
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(base);
  // Open the actual picker and pin through the same events used on Android.
  await page.locator("#addApps").click();
  await page.locator("#sheet .srow",{hasText:"Calculadora"}).click();
  await page.waitForFunction(()=>document.querySelector("#sheet .srow .pin")?.textContent.includes("✓"));
  const cfg=await (await fetch(`${base}/api/config`)).json();
  assert.deepEqual(cfg.config.pinned,["Calculadora"]);
  await page.locator("#sheet .btn").click();
  // Simulate the recents layout that previously hid the button under a screen.
  await page.evaluate(()=>document.body.classList.add("is-recents"));
  await page.locator("#addApps").click();
  await page.locator("#sheet .srow",{hasText:"Calculadora"}).click();
  await page.waitForFunction(()=>!document.querySelector("#sheet .srow .pin")?.textContent.includes("✓"));
  assert.deepEqual((await (await fetch(`${base}/api/config`)).json()).config.pinned,[]);
  await mkdir(join(import.meta.dirname,"../.test-artifacts"),{recursive:true});
  await page.screenshot({path:join(import.meta.dirname,"../.test-artifacts/companion-picker.png")});
  assert.deepEqual(errors,[]);
});

test("Windows control center uses the visual card deck and local host controls", {timeout:20000}, async(t)=>{
  const {base}=await fixture(t);
  const browser=await chromium.launch({headless:true,channel:process.platform === "win32" ? "msedge" : undefined});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1200,height:760}});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${base}/windows.html?token=test-only-host-key-abcdefghijklmnopqrstuvwxyz`);
  await page.waitForSelector(".library-card");
  assert.equal(await page.locator(".library-card").count(),1);
  assert.equal(await page.locator(".slot").count(),8, "prévia espelha uma página Android de 8 botões");
  assert.equal(await page.locator(".tile").count(),0);
  await page.locator(".library-card").hover();
  // The drop operation uses the same browser events as a human drag.
  await page.locator(".library-card").dragTo(page.locator('.slot').first());
  await page.waitForFunction(()=>document.querySelectorAll('.tile').length===1);
  const response=await (await fetch(`${base}/api/config`)).json();
  assert.deepEqual(response.config.pinned,["Calculadora"]);
  await page.screenshot({path:join(import.meta.dirname,"../.test-artifacts/windows-control-center.png")});
  assert.deepEqual(errors,[]);
});

test("card drop swaps exact positions instead of reordering by list index", {timeout:20000}, async(t)=>{
  const {base}=await fixture(t,[{name:"Calculadora",icon:false},{name:"Bloco de notas",icon:false}]);
  const browser=await chromium.launch({headless:true,channel:process.platform === "win32" ? "msedge" : undefined});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1200,height:760}});
  await page.goto(`${base}/windows.html?token=test-only-host-key-abcdefghijklmnopqrstuvwxyz`);
  await page.locator('.library-card',{hasText:'Calculadora'}).dragTo(page.locator('.slot').first());
  await fetch(`${base}/api/config/pinned`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app:'Bloco de notas'})});
  await page.reload();
  await page.waitForFunction(()=>document.querySelectorAll('.tile').length===2);
  await page.locator('.tile',{hasText:'Calculadora'}).dragTo(page.locator('.slot').nth(1));
  await page.waitForFunction(()=>[...document.querySelectorAll('.slot')].findIndex(s=>s.textContent.includes('Calculadora'))===1);
  const cfg=await (await fetch(`${base}/api/config`)).json();
  assert.equal(cfg.config.pieces.find(p=>p.name==='Calculadora').position,1);
  assert.equal(cfg.config.pieces.find(p=>p.name==='Bloco de notas').position,0);
});
