import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from '../server.js';

for(const touch of [false,true])test(`launcher ${touch?'touch':'mouse'} sends one command, shows pending and confirmation without waiting for icons`,async t=>{
  let calls=0,release;
  const gate=new Promise(resolve=>release=resolve);
  t.after(()=>release());
  const platform={appTools:{listInstalledApps:async()=>[{name:'Teste',path:'test.exe',icon:false}],listAppProcesses:async()=>[]},iconService:{getIconPng:async()=>null},actions:{activateApp:async()=>{calls++;await gate}}};
  const server=await startServer({port:0,config:{pinned:['Teste']},platform,obs:null});
  let browser;
  t.after(async()=>{await browser?.close();await server.close()});
  browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
  const page=await browser.newPage({viewport:{width:900,height:700},hasTouch:touch});
  await page.goto(`http://127.0.0.1:${server.port}/`);
  const tile=page.locator('.atile[data-name="Teste"]');await tile.waitFor();
  const before=Date.now();
  if(touch)await tile.tap();else await tile.click();
  await page.waitForFunction(()=>document.getElementById('command-notice').textContent==='Enviando…');
  assert.equal(calls,1);
  t.diagnostic(`click to server + UI observation: ${Date.now()-before} ms`);
  release();
  await page.waitForFunction(()=>document.getElementById('command-notice').textContent.includes('confirmado'));
  assert.equal(calls,1);
  assert.ok((await page.evaluate(()=>window.ezdeckLastCommand)).roundTripMs>=0);
});

test("tela de apps abertos mostra o nome legível sob cada ícone", async t => {
  const platform = {
    appTools: {
      listInstalledApps: async () => [],
      listAppProcesses: async () => [
        { name: "Google Chrome", pid: 11 },
        { name: "Configurações do Windows", pid: 12 },
        { name: "ApplicationFrameHost", pid: 13 },
        { name: "TextInputHost", pid: 14 },
        { name: "PowerToys.QuickAccess", pid: 15 },
      ],
    },
    iconService: { getIconPng: async () => null },
    actions: { activateApp: async () => {} },
  };
  const server = await startServer({ port: 0, config: { pinned: [] }, platform, obs: null });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless: true, channel: process.platform === "win32" ? "msedge" : undefined });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(() => document.querySelectorAll("#screenRecents .dcard .dname").length === 2);
  await page.waitForFunction(() => /^\d+(?:\.\d+)+$/.test(document.querySelector("#appVersion")?.textContent || ""));
  assert.deepEqual(await page.locator("#screenRecents .dcard .dname").allTextContents(), ["Google Chrome", "Configurações do Windows"]);
  await page.locator("#vdots .d").nth(1).click();
  await page.waitForFunction(() => document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
  assert.equal(await page.locator("#screenRecents .ttitle").textContent(), "Apps Abertos");
  const recentsLayout = await page.locator("#addApps").evaluate(button => {
    const box = button.getBoundingClientRect();
    return { top: box.top, right: innerWidth - box.right, inScreen: !!button.closest(".screen") };
  });
  assert.ok(recentsLayout.top < 40, "o botão + APP deve ficar no topo da tela de abertos");
  assert.ok(recentsLayout.right <= 24, "o botão + APP deve ficar alinhado à direita");
  assert.equal(recentsLayout.inScreen, false, "o botão + APP deve ser único durante a transição entre telas");
  const titleLayout = await page.locator("#screenRecents .thead").evaluate(header => {
    const title = header.querySelector(".ttitle").getBoundingClientRect();
    return { centerOffset: Math.abs((title.left + title.width / 2) - innerWidth / 2), justifyContent: getComputedStyle(header).justifyContent };
  });
  assert.ok(titleLayout.centerOffset < 1, "Apps Abertos deve permanecer centralizado");
  assert.equal(titleLayout.justifyContent, "center");
  const labelLayout = await page.locator("#screenRecents .dcard").first().evaluate(card => {
    const label = card.querySelector(".dname");
    const icon = card.querySelector(".aglass");
    return {
      labelHeight: label.getBoundingClientRect().height,
      isBelowIcon: label.getBoundingClientRect().top >= icon.getBoundingClientRect().bottom,
      clamp: getComputedStyle(label).webkitLineClamp,
    };
  });
  assert.ok(labelLayout.labelHeight > 0, "o nome deve ocupar espaço visível abaixo do ícone");
  assert.equal(labelLayout.isBelowIcon, true);
  assert.equal(labelLayout.clamp, "2", "nomes longos devem ocupar no máximo duas linhas");
  const lowerLayout = await page.locator("#screenRecents").evaluate(screen => {
    const deck = screen.querySelector("#deck").getBoundingClientRect();
    const hint = screen.querySelector(".thint").getBoundingClientRect();
    return { deckBottom: deck.bottom, hintTop: hint.top, hintBottomGap: innerHeight - hint.bottom };
  });
  assert.ok(lowerLayout.deckBottom <= lowerLayout.hintTop, "os cartões devem terminar antes da instrução");
  assert.ok(lowerLayout.hintBottomGap < 48, "a instrução deve permanecer próxima à base da tela");
  const versionLayout = await page.locator("#appVersion").evaluate(version => {
    const box = version.getBoundingClientRect();
    return { text: version.textContent, rightGap: innerWidth - box.right, bottomGap: innerHeight - box.bottom };
  });
  assert.match(versionLayout.text, /^\d+(?:\.\d+)+$/, "a versão deve mostrar somente números");
  assert.ok(versionLayout.rightGap <= 28 && versionLayout.bottomGap <= 24, "a versão deve ficar no canto inferior direito");
});

test("APK empacota um único botão compartilhado, versão e Apps Abertos centralizado", async () => {
  const bundled = await readFile(new URL("../android/app/src/main/assets/public/index.html", import.meta.url), "utf8");
  assert.match(bundled, /"recents\.title": "Apps Abertos"/);
  assert.equal((bundled.match(/id="addApps"/g) || []).length, 1);
  assert.doesNotMatch(bundled, /id="addAppsRecents"/);
  assert.match(bundled, /id="appVersion"/);
  assert.match(bundled, /SYSTEM_RUNNING_APP_KEYS/);
  assert.doesNotMatch(bundled, /body\.is-recents \.thead/);
  assert.match(bundled, /\.dcard \.dname\{[\s\S]*?-webkit-line-clamp: 2/);
});

test("lista longa mantém título na tela, botão livre e rolagem horizontal por toque", async t => {
  const running = Array.from({ length: 12 }, (_, i) => ({ name: `Aplicativo aberto ${i + 1}`, pid: i + 1 }));
  const platform = {
    appTools: { listInstalledApps: async () => [], listAppProcesses: async () => running },
    iconService: { getIconPng: async () => null },
    actions: { activateApp: async () => {} },
  };
  const server = await startServer({ port: 0, config: { pinned: [] }, platform, obs: null });
  let browser;
  t.after(async () => { await browser?.close(); await server.close(); });
  browser = await chromium.launch({ headless: true, channel: process.platform === "win32" ? "msedge" : undefined });
  for (const viewport of [{ width: 900, height: 405 }, { width: 405, height: 900 }, { width: 1280, height: 800 }]) {
    const page = await browser.newPage({ viewport, hasTouch: true });
    try {
      await page.goto(`http://127.0.0.1:${server.port}/`);
      await page.waitForFunction(() => document.querySelectorAll("#deck .dcard").length === 12);
      await page.locator("#vdots .d").nth(1).click();
      await page.waitForFunction(() => document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
      const layout = await page.evaluate(() => {
        const title = document.querySelector(".ttitle").getBoundingClientRect();
        const deck = document.querySelector("#deck");
        const box = deck.getBoundingClientRect();
        const button = document.querySelector("#addApps").getBoundingClientRect();
        const stage = document.querySelector(".rstage").getBoundingClientRect();
        return { centerOffset: Math.abs(title.left + title.width / 2 - innerWidth / 2),
          rowCenterOffset: Math.abs(box.top + box.height / 2 - (stage.top + stage.height / 2)),
          right: box.right, viewport: innerWidth, scrollable: deck.scrollWidth > deck.clientWidth,
          overlap: title.left < button.right && title.right > button.left && title.top < button.bottom && title.bottom > button.top,
          x: Math.round(box.left + Math.min(box.width * .8, 300)), y: Math.round(box.top + box.height / 2) };
      });
      assert.ok(layout.centerOffset < 1, `título deslocado em ${viewport.width}x${viewport.height}: ${layout.centerOffset}px`);
      assert.ok(layout.rowCenterOffset < 1, `linha precisa estar centralizada na área livre: ${layout.rowCenterOffset}px`);
      assert.ok(layout.right <= layout.viewport + 1, "barra não pode crescer além da viewport");
      assert.equal(layout.scrollable, true, "lista longa precisa manter overflow horizontal");
      assert.equal(layout.overlap, false, "botão não pode cobrir o título");
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: layout.x, y: layout.y }] });
      for (let step = 1; step <= 8; step++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: layout.x - step * 24, y: layout.y }] });
        await page.waitForTimeout(20);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForFunction(() => document.querySelector("#deck").scrollLeft > 80);
      assert.equal(await page.evaluate(() => document.body.classList.contains("is-recents")), true, "rolar a lista não deve trocar de tela");
      await page.screenshot({ path: `.test-artifacts/recents-fixed-${viewport.width}x${viewport.height}.png` });
      await page.locator("#vdots .d").nth(0).click();
      await page.waitForFunction(() => !document.body.classList.contains("is-recents") && !document.body.classList.contains("swiping"));
      const button = await page.locator("#addApps").boundingBox();
      assert.ok(button.y > viewport.height / 2, "+ APP deve manter a posição inferior na primeira tela");
      const version = await page.locator("#appVersion").boundingBox();
      assert.ok(button.y + button.height <= version.y, "o botão não deve sobrepor a versão na base da primeira tela");
      await page.screenshot({ path: `.test-artifacts/recents-regression-${viewport.width}x${viewport.height}.png` });
    } finally { await page.close(); }
  }
});
