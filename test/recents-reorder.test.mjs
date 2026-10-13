import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startServer } from "../server.js";

test("versão do APK aparece somente em Apps Abertos, inclusive após voltar à primeira tela", async t => {
  const server=await startServer({port:0,config:{pinned:[]},obs:null,platform:{
    appTools:{listInstalledApps:async()=>[],listAppProcesses:async()=>[{name:'Editor',pid:42}]},
    iconService:{getIconPng:async()=>null},actions:{activateApp:async()=>{}},
  }});
  const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
  t.after(async()=>{await browser.close();await server.close()});
  const page=await browser.newPage({viewport:{width:900,height:405},hasTouch:true});
  await page.addInitScript(()=>{window.EzDeckAndroid={appVersion:()=> '0.2.13',handlesUpdates:()=>true}});
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(()=>document.querySelector('#appVersion')?.textContent==='0.2.13');
  assert.equal(await page.locator('#appVersion').isVisible(),false);
  await page.locator('#vdots .d').nth(1).click();
  await page.waitForFunction(()=>document.body.classList.contains('is-recents')&&!document.body.classList.contains('swiping'));
  assert.equal(await page.locator('#appVersion').isVisible(),true);
  await page.locator('#vdots .d').nth(0).click();
  await page.waitForFunction(()=>!document.body.classList.contains('is-recents')&&!document.body.classList.contains('swiping'));
  assert.equal(await page.locator('#appVersion').isVisible(),false);
});

test("segurar por 275ms inicia o arraste; toque curto e deslize não reorganizam", async t => {
  const running = Array.from({ length:8 }, (_, i) => ({ name:`App ${i}`, pid:100 + i }));
  let calls = 0;
  const server = await startServer({ port:0, config:{ pinned:[] }, obs:null, platform:{
    appTools:{ listInstalledApps:async () => [], listAppProcesses:async () => running },
    iconService:{ getIconPng:async () => null }, actions:{ activateApp:async () => { calls++; } },
  } });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless:true, channel:process.platform === "win32" ? "msedge" : undefined });
  const page = await browser.newPage({ viewport:{ width:900, height:405 }, hasTouch:true });
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(() => document.querySelectorAll("#deck .dcard").length === 8);
  await page.locator("#vdots .d").nth(1).click();
  await page.waitForFunction(() => document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
  await page.clock.install({ time:new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  const cdp = await page.context().newCDPSession(page);
  const box = await page.locator("#deck .dcard").first().boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.width / 2;
  await page.evaluate(() => {
    document.querySelector("#deck").addEventListener("pointerdown", () => { window.testPressDelivered = true; }, { once:true });
  });
  await cdp.send("Input.dispatchTouchEvent", { type:"touchStart", touchPoints:[{ x, y }] });
  await page.waitForFunction(() => window.testPressDelivered, null, { polling:10 });
  await page.clock.runFor(274);
  assert.equal(await page.locator(".recents-drag-ghost").count(), 0);
  await page.clock.runFor(1);
  assert.equal(await page.locator(".recents-drag-ghost").count(), 1, "275ms basta para liberar o arraste");
  await cdp.send("Input.dispatchTouchEvent", { type:"touchCancel", touchPoints:[] });
  await page.locator(".recents-drag-ghost").waitFor({ state:"detached" });
  assert.equal(calls, 0);
  await page.clock.runFor(701);
  await cdp.send("Input.dispatchTouchEvent", { type:"touchStart", touchPoints:[{ x, y }] });
  await page.clock.runFor(100);
  const activated = page.waitForResponse(response => response.url().endsWith("/activate"));
  await cdp.send("Input.dispatchTouchEvent", { type:"touchEnd", touchPoints:[] });
  await activated;
  assert.equal(calls, 1, "toque curto continua abrindo o app");
  const before = await page.locator("#deck .dname").allTextContents();
  await cdp.send("Input.dispatchTouchEvent", { type:"touchStart", touchPoints:[{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type:"touchMove", touchPoints:[{ x:x - 90, y }] });
  await page.waitForFunction(() => document.querySelector("#deck").scrollLeft > 20, null, { polling:10 });
  await page.clock.runFor(400);
  assert.equal(await page.locator(".recents-drag-ghost").count(), 0, "deslizar antes do limite cancela o hold");
  await cdp.send("Input.dispatchTouchEvent", { type:"touchEnd", touchPoints:[] });
  assert.deepEqual(await page.locator("#deck .dname").allTextContents(), before);
  assert.equal(calls, 1);
});

test("Apps Abertos permite arraste por toque, mantém a ordem e não abre o app ao soltar", async t => {
  const running = [
    { name:"Google Chrome — Pessoal", displayName:"Pessoal", pid:42 },
    { name:"Google Chrome — Trabalho", displayName:"Trabalho", pid:42 },
    { name:"Editor", pid:43 }, { name:"Calculadora", pid:44 },
  ];
  let calls = 0;
  const platform = { appTools:{ listInstalledApps:async () => [], listAppProcesses:async () => running },
    iconService:{ getIconPng:async () => null }, actions:{ activateApp:async () => { calls++; } } };
  const server = await startServer({ port:0, config:{ pinned:[] }, platform, obs:null });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless:true, channel:process.platform === "win32" ? "msedge" : undefined });
  const page = await browser.newPage({ viewport:{ width:900, height:405 }, hasTouch:true });
  const showRecents = async () => {
    await page.waitForFunction(() => document.querySelectorAll("#deck .dcard").length === 4);
    await page.locator("#vdots .d").nth(1).click();
    await page.waitForFunction(() => document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
  };
  const labels = () => page.locator("#deck .dname").allTextContents();
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await showRecents();
  assert.deepEqual(await labels(), ["Pessoal", "Trabalho", "Editor", "Calculadora"]);
  const cdp = await page.context().newCDPSession(page);
  async function drag(from, to, cancel = false){
    const start = await page.locator("#deck .dcard").nth(from).boundingBox();
    const end = await page.locator("#deck .dcard").nth(to).boundingBox();
    const x = start.x + start.width / 2, y = start.y + start.width / 2;
    await cdp.send("Input.dispatchTouchEvent", { type:"touchStart", touchPoints:[{ x, y }] });
    await page.locator(".recents-drag-ghost").waitFor();
    for(let i = 1; i <= 8; i++){
      await cdp.send("Input.dispatchTouchEvent", { type:"touchMove", touchPoints:[{ x:x + (end.x + end.width / 2 - x) * i / 8, y }] });
      await page.waitForTimeout(20);
    }
    await cdp.send("Input.dispatchTouchEvent", { type:cancel ? "touchCancel" : "touchEnd", touchPoints:[] });
    await page.locator(".recents-drag-ghost").waitFor({ state:"detached" });
  }
  await drag(0, 2);
  assert.deepEqual(await labels(), ["Trabalho", "Editor", "Pessoal", "Calculadora"]);
  assert.equal(calls, 0, "arrastar não pode enviar comando de abertura");
  assert.equal(await page.evaluate(() => document.body.classList.contains("is-recents")), true);
  await page.reload(); await showRecents();
  assert.deepEqual(await labels(), ["Trabalho", "Editor", "Pessoal", "Calculadora"], "reabrir a tela preserva a ordem escolhida");
  await drag(0, 2, true);
  assert.deepEqual(await labels(), ["Trabalho", "Editor", "Pessoal", "Calculadora"], "cancelar o gesto restaura a ordem anterior");
  assert.equal(calls, 0);
  await page.locator("#deck .dcard").nth(2).press("Alt+ArrowLeft");
  assert.deepEqual(await labels(), ["Trabalho", "Pessoal", "Editor", "Calculadora"], "teclado também pode reorganizar");
  running.reverse();
  await page.reload(); await showRecents();
  assert.deepEqual(await labels(), ["Trabalho", "Pessoal", "Editor", "Calculadora"], "atualização do host não desfaz a preferência");
  await page.screenshot({ path:".test-artifacts/recents-reorder-touch.png" });
});

test("rótulos de perfis do host anterior são mostrados sem Chrome ou separadores", async t => {
  const platform = { appTools:{ listInstalledApps:async () => [], listAppProcesses:async () => [{ name:"Google Chrome — Pessoal", pid:42 }] },
    iconService:{ getIconPng:async () => null }, actions:{ activateApp:async () => {} } };
  const server = await startServer({ port:0, config:{ pinned:[] }, platform, obs:null });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless:true, channel:process.platform === "win32" ? "msedge" : undefined });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.locator("#deck .dname").waitFor({ state:"attached" });
  assert.equal(await page.locator("#deck .dname").textContent(), "Pessoal");
  assert.equal(await page.locator("#deck .dcard").getAttribute("aria-label"), "Pessoal");
});

for (const reducedMotion of ["no-preference", "reduce"]) test(`arraste não oscila entre posições com movimento ${reducedMotion}`, async t => {
  const running = ["Editor", "Calculadora", "Navegador", "Fotos"].map((name, i) => ({ name, pid:100 + i }));
  const server = await startServer({ port:0, config:{ pinned:[] }, obs:null, platform:{
    appTools:{ listInstalledApps:async () => [], listAppProcesses:async () => running },
    iconService:{ getIconPng:async () => null }, actions:{ activateApp:async () => {} },
  } });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless:true, channel:process.platform === "win32" ? "msedge" : undefined });
  const page = await browser.newPage({ viewport:{ width:900, height:405 }, hasTouch:true, reducedMotion });
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(() => document.querySelectorAll("#deck .dcard").length === 4);
  await page.locator("#vdots .d").nth(1).click();
  await page.waitForFunction(() => document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
  const first = await page.locator("#deck .dcard").nth(0).boundingBox();
  const second = await page.locator("#deck .dcard").nth(1).boundingBox();
  const x = first.x + first.width / 2, y = first.y + first.width / 2;
  const boundary = (x + second.x + second.width / 2) / 2 + 4;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type:"touchStart", touchPoints:[{ x, y }] });
  await page.locator(".recents-drag-ghost").waitFor();
  const orders = [];
  for(let i = 0; i < 24; i++){
    await cdp.send("Input.dispatchTouchEvent", { type:"touchMove", touchPoints:[{ x:boundary + (i % 2), y }] });
    orders.push(await page.locator("#deck .dname").allTextContents());
    await page.waitForTimeout(8);
  }
  assert.deepEqual(orders[0], ["Calculadora", "Editor", "Navegador", "Fotos"]);
  assert.ok(orders.every(order => JSON.stringify(order) === JSON.stringify(orders[0])), "o dedo parado não pode trocar a ordem repetidamente");
  // Trocar rapidamente de direção deve interromper o movimento existente,
  // não acumular animações concorrentes sobre o mesmo vizinho.
  for (const targetIndex of [2, 0, 3, 1]){
    const targetX = x + (second.x - first.x) * targetIndex;
    await cdp.send("Input.dispatchTouchEvent", { type:"touchMove", touchPoints:[{ x:targetX, y }] });
    // CDP confirma a injeção antes de o compositor entregar o pointermove.
    // Sincronizar pelo card que acompanha o dedo, não pelo fim da animação.
    await page.waitForFunction(expected => Math.abs(document.querySelector(".recents-drag-ghost").getBoundingClientRect().x - expected) < 1, targetX - first.width / 2);
    assert.equal(await page.locator("#deck .dname").nth(targetIndex).textContent(), "Editor");
    assert.ok(await page.evaluate(() => Array.from(document.querySelectorAll("#deck .dcard")).every(card => card.getAnimations().length <= 1)), "cada vizinho tem no máximo uma animação");
  }
  const center = x + (second.x - first.x) * .65;
  await cdp.send("Input.dispatchTouchEvent", { type:"touchMove", touchPoints:[{ x:center, y }] });
  await page.waitForFunction(expected => Math.abs(document.querySelector(".recents-drag-ghost").getBoundingClientRect().x - expected) < 1, center - first.width / 2);
  const ghost = await page.locator(".recents-drag-ghost").boundingBox();
  assert.ok(Math.abs(ghost.x + first.width / 2 - center) < 1, "o card arrastado acompanha o dedo sem atraso de animação");
  await cdp.send("Input.dispatchTouchEvent", { type:"touchEnd", touchPoints:[] });
  await page.locator(".recents-drag-ghost").waitFor({ state:"detached" });
  assert.deepEqual(await page.locator("#deck .dname").allTextContents(), ["Calculadora", "Editor", "Navegador", "Fotos"]);
});
